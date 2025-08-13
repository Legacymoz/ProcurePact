import T "Types";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Error "mo:base/Error";
import Trie "mo:base/Trie";
import Nat32 "mo:base/Nat32";
import Debug "mo:base/Debug";
import Ledger "canister:icrc1_ledger_canister";

actor class Escrow() = this {
    //will handle escrow functionality
    //handle onDelivery Payments
    /*
1. Lock tokens
2. Complete deal
*/

    //create storage to record locked tokens
    stable var records : Trie.Trie<Nat32, T.EscrowRecord> = Trie.empty();

    public shared func lockTokens(from : Principal, dealId : Nat32, amount : Nat32, recipient: Principal) : async Result.Result<Nat, Text> {
        try {

            Debug.print("Locking tokens for deal ID: " # debug_show(dealId) # " from: " # debug_show(from) # " amount: " # debug_show(amount) # " recipient: " # debug_show(recipient));
            
            let transferFromArgs : Ledger.TransferFromArgs = {
                from = {
                    owner = from;
                    subaccount = null;
                };
                memo = null;
                amount = Nat32.toNat(amount);
                spender_subaccount = null;
                fee = null;
                to = { owner = Principal.fromActor(this); subaccount = null };
                created_at_time = null;
            }; //get contract
            //check if delivery is confirmed
            //check payment terms
            //switch
            let transferFromResult = await Ledger.icrc2_transfer_from(transferFromArgs);
            switch (transferFromResult) {
                case (#Err(transferError)) {
                    switch (transferError) {
                        case (#BadFee(info)) {
                            return #err("Bad fee error. Expected fee: " # debug_show (info.expected_fee));
                        };
                        case (#BadBurn(info)) {
                            return #err("Bad burn error. Minimum burn amount: " # debug_show (info.min_burn_amount));
                        };
                        case (#InsufficientFunds(info)) {
                            return #err("Insufficient funds. Current balance: " # debug_show (info.balance));
                        };
                        case (#TooOld) {
                            return #err("Transaction is too old");
                        };
                        case (#CreatedInFuture(info)) {
                            return #err("Transaction created in future. Ledger time: " # debug_show (info.ledger_time));
                        };
                        case (#Duplicate(info)) {
                            return #err("Duplicate transaction. Duplicate of block: " # debug_show (info.duplicate_of));
                        };
                        case (#TemporarilyUnavailable) {
                            return #err("Service temporarily unavailable");
                        };
                        case (#GenericError(info)) {
                            return #err("Generic error. Code: " # debug_show (info.error_code) # ", Message: " # info.message);
                        };
                        case (#InsufficientAllowance(info)) {
                            return #err("Insufficient allowance. Allowance: " # debug_show (info.allowance));
                        };
                    };
                };
                case (#Ok(blockIndex)) {
                    //add record to the escrow
                    let record : T.EscrowRecord = {
                        user = from;
                        status = #Locked;
                        amount = amount;
                        recipient = recipient;
                    };
                    records := Trie.put(records, { key = dealId; hash = dealId }, Nat32.equal, record).0;
                    return #ok(blockIndex);
                    return #ok blockIndex;
                };
            };
        } catch (error : Error) {
            Debug.print(Error.message(error));
            return #err("Reject message: " # Error.message(error));

        };
    };

    public shared func transferTokens(contractId : Nat32, recipient : Principal) : async Result.Result<Text, Text> {
        switch (Trie.find(records, { key = contractId; hash = contractId }, Nat32.equal)) {
            case (?record) {
                if (record.status == #Locked) {
                    let transferResult = await Ledger.icrc1_transfer({
                        amount = Nat32.toNat(record.amount);
                        to = { owner = recipient; subaccount = null };
                        memo = null;
                        created_at_time = null;
                        fee = null;
                        from_subaccount = null;
                    });
                    switch (transferResult) {
                        case (#Err(transferError)) {
                            return #err("Transfer failed: " # debug_show (transferError));
                        };
                        case (#Ok(blockIndex)) {
                            // Update the record status to Transferred
                            let updatedRecord : T.EscrowRecord = {
                                user = record.user;
                                status = #Transferred;
                                amount = record.amount;
                                recipient = recipient;
                            };
                            records := Trie.put(records, { key = contractId; hash = contractId }, Nat32.equal, updatedRecord).0;
                            return #ok("Tokens transferred successfully. Block index: " # debug_show (blockIndex));
                        };
                    };
                } else {
                    return #err("Deal is not locked. Current status: " # debug_show (record.status));
                };
            };
            case (null) {
                return #err("No escrow record found for deal ID: " # debug_show (contractId));
            };
        };
    };

};
