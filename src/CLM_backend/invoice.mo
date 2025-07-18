import T "Types";
import Nat32 "mo:base/Nat32";
import Trie "mo:base/Trie";
import Result "mo:base/Result";
import Time "mo:base/Time";
import List "mo:base/List";
import Ledger "canister:icrc1_ledger_canister";

actor class Invoice() = this {
    //🚩 add featureOverdue penalty calculation
    //calculated via system heartbeat

    stable var nextInvoiceId : Nat32 = 1;
    stable var invoices : Trie.Trie<Nat32, T.Invoice> = Trie.empty();

    func calculateTotalAmount(items : List.List<T.Item>) : Nat32 {
        let total = List.foldLeft<T.Item, Nat32>(
            items,
            0,
            func(acc, item) {
                acc + (item.unit_price * item.quantity);
            },
        );
        return total;
    };

    public shared func createInvoice(args : T.CreateInvoiceArgs) : async Result.Result<Nat32, Text> {
        let invoiceId = nextInvoiceId;
        let now = Time.now();
        try {
            let invoice : T.Invoice = {
                contractId = args.contractId;
                issuer = args.issuer;
                recipient = args.recipient;
                schedule = switch (args.schedule) {
                    case (#DueDate(dueDate)) {
                        #DueDate(dueDate);
                    };
                    case (#PaymentPeriod(period)) {
                        #PaymentPeriod(period);
                    };
                };
                items = args.items;
                totalAmount = calculateTotalAmount(args.items);
                status = #Pending;
                createdAt = now;
                updatedAt = now;
                notes = args.notes;
            };
            invoices := Trie.put(invoices, { hash = invoiceId; key = invoiceId }, Nat32.equal, invoice).0;
            #ok(invoiceId);
        } catch (err : Error) {
            return #err("Failed to create invoice");
        };
    };

    public shared func getInvoice(invoiceId : Nat32) : async Result.Result<T.Invoice, Text> {
        switch (Trie.get(invoices, { key = invoiceId; hash = invoiceId }, Nat32.equal)) {
            case (?invoice) {
                #ok(invoice);
            };
            case (null) {
                #err("Invoice not found");
            };
        };
    };

    public func getBalance(userId : Principal) : async Nat {
        let balance = await Ledger.icrc1_balance_of({
            owner = userId;
            subaccount = null;
        });
        return balance;
    };

    public shared ({ caller }) func transfer(invoiceId : Nat32) : async Result.Result<Text, Text> {
        switch (Trie.get(invoices, { key = invoiceId; hash = invoiceId }, Nat32.equal)) {
            case (?invoice) {
                //check if caller is the issuer
                if (caller != invoice.issuer) {
                    return #err("Not permitted!");
                };
                //verify recipient balance is in range
                //consider transfer fees
                let issuerBal = await getBalance(invoice.issuer);
                if (issuerBal < Nat32.toNat(invoice.totalAmount)) {
                    return #err("Insufficient Balance");
                };
                //transfer
                let transferResult = await Ledger.icrc1_transfer({
                    amount = Nat32.toNat(invoice.totalAmount);
                    to = { owner = invoice.recipient; subaccount = null };
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
                        // Update the invoice status to Transferred
                        let updatedInvoice : T.Invoice = {
                            contractId = invoice.contractId;
                            issuer = invoice.issuer;
                            recipient = invoice.recipient;
                            schedule = invoice.schedule;
                            items = invoice.items;
                            totalAmount = invoice.totalAmount;
                            status = #Paid;
                            createdAt = invoice.createdAt;
                            updatedAt = Time.now();
                            notes = invoice.notes;
                        };
                        invoices := Trie.put(invoices, { key = invoiceId; hash = invoiceId }, Nat32.equal, updatedInvoice).0;
                        #ok("Transferred: " #debug_show (blockIndex));
                    };
                };
            };
            case (null) {
                #err("Invoice not found");
            };
        };
    };
};
