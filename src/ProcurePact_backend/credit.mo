import Result "mo:base/Result";
import Float "mo:base/Float";
import Nat32 "mo:base/Nat32";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Time "mo:base/Time";
import Trie "mo:base/Trie";
import Invoice "canister:invoice";
import Ledger "canister:icrc1_ledger_canister";
import T "Types";

//handles credit transactions
persistent actor class Credit() = this {

  //stable variables to keep track of credit records
  var credit_records : Trie.Trie<Nat32, T.CreditRecord> = Trie.empty();

  //issue credit
  //🚩add validation that checks in credit_records if the invoice is paid.
  public shared func issue(contractId : Nat32) : async Result.Result<Text, Text> {
    switch (await Invoice.getInvoice(contractId)) {
      case (?invoice) {
        if (invoice.creditIssued == ?true) {
          return #err("Credit already issued");
        };
        let totalNat = Nat32.toNat(invoice.totalAmount);
        let transfer_amount_nat = Float.toInt(0.8 * Float.fromInt(totalNat));
        if (transfer_amount_nat < 0) {
          return #err("Invalid transfer amount");
        };
        // 🚩 will have to check if rounding is significant
        let transfer_amount : Nat = Int.abs(transfer_amount_nat);
        switch (await Ledger.icrc1_transfer({ amount = transfer_amount; to = { owner = invoice.issuer; subaccount = null }; memo = null; created_at_time = null; fee = null; from_subaccount = null })) {
          case (#Ok(blockIndex)) {
            let now = Time.now();
            let creditId = contractId;
            // For simplicity, use contractId as creditId. In production, use a unique generator.
            let record : T.CreditRecord = {
              creditId = creditId;
              contractId = contractId;
              issuer = invoice.issuer;
              recipient = invoice.recipient;
              amount = Nat32.fromNat(transfer_amount);
              issuedAt = now;
              collectedAt = null;
              status = #Issued;
              notes = ?("Issued 80% of invoice value. Block: " # debug_show (blockIndex));
            };
            //update records
            credit_records := Trie.put<Nat32, T.CreditRecord>(credit_records, { key = creditId; hash = Nat32.fromNat(Nat32.toNat(creditId)) }, Nat32.equal, record).0;
            return #ok("Credit issued and recorded. Block: " # debug_show (blockIndex));
          };
          case (#Err(_)) {
            return #err("Error issuing credit!");
          };
        };
      };
      case (null) {
        return #err("Invoice not found!");
      };
    };
  };

  // collection and final transfer
  public shared func collect(invoiceId : Nat32) : async Result.Result<Text, Text> {
    let creditId = invoiceId; // For simplicity, use invoiceId as creditId
    switch (Trie.get<Nat32, T.CreditRecord>(credit_records, { key = creditId; hash = Nat32.fromNat(Nat32.toNat(creditId)) }, Nat32.equal)) {
      case (?record) {
        switch (record.status) {
          case (#Issued) {
            switch (await Invoice.getInvoice(invoiceId)) {
              case (?invoice) {
                let totalNat = Nat32.toNat(invoice.totalAmount);
                //transfer remaining 20% - 3% service charge
                let transfer_amount_nat = Float.toInt(0.17 * Float.fromInt(totalNat));
                if (transfer_amount_nat < 0) {
                  return #err("Invalid transfer amount");
                };
                let transfer_amount : Nat = Int.abs(transfer_amount_nat);
                switch (await Ledger.icrc1_transfer({ amount = transfer_amount; to = { owner = invoice.issuer; subaccount = null }; memo = null; created_at_time = null; fee = null; from_subaccount = null })) {
                  case (#Ok(blockIndex)) {
                    let updated : T.CreditRecord = {
                      creditId = record.creditId;
                      contractId = record.contractId;
                      issuer = record.issuer;
                      recipient = record.recipient;
                      amount = record.amount;
                      issuedAt = record.issuedAt;
                      collectedAt = ?Time.now();
                      status = #Collected;
                      notes = ?("Collected. Final payment block: " # debug_show (blockIndex));
                    };
                    //update records
                    credit_records := Trie.put<Nat32, T.CreditRecord>(credit_records, { key = creditId; hash = Nat32.fromNat(Nat32.toNat(creditId)) }, Nat32.equal, updated).0;
                    return #ok("Final Payment successful and credit record updated.");
                  };
                  case (#Err(_)) {
                    return #err("Error making final payment!");
                  };
                };
              };
              case (null) {
                return #err("Invoice not found!");
              };
            };
          };
          case _ {
            return #err("Credit already collected or not in issued state.");
          };
        };
      };
      case null {
        return #err("Credit record not found!");
      };
    };
  };

};
