import T "Types";
import Nat32 "mo:base/Nat32";
import Trie "mo:base/Trie";
import Result "mo:base/Result";
import Time "mo:base/Time";
import List "mo:base/List";

actor class Invoice() = this {
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
};
