import Trie "mo:base/Trie";
import Text "mo:base/Text";
import List "mo:base/List";

module Types {
    public type Key<K> = Trie.Key<K>;

    public type User = {
        name : Text;
        email : Text;
        phone : Text;
        address : Text;
        bio : Text;
        createdAt : Int; // Timestamp of when the user was created
        updatedAt : Int; // Timestamp of the last update to the user profile
        contracts : List.List<Nat32>;
    };

    public type ConnectionStatus = {
        #RequestSent;
        #Accepted;
        #Rejected;
        #Invited;
    };

    public type Party = {
        status : {
            #Accepted; //accepted invitation
            #Pending;
            #Rejected;
            #Invited;
            #Signatory //A party that has signed the contract
        };
        role : {
            #Buyer;
            #Supplier;
            #ThirdParty;
        };
    };

    public type Item = {
        name : Text;
        description : Text;
        unit_price : Nat32;
        quantity : Nat32;
    };

    public type Notification = {
        date : Int;
        message : Text;
    };

    public type DeliveryNote = {
        date : Int;
        description : Text; //description of the delivery
        items : List.List<Item>; //items delivered
    };

    public type PaymentTerm = {
        #OnDelivery;
        #Periodic;
        #FixedDate;
    };

    public type Contract = {
        name : Text;
        description : Text; //short description
        createdAt : Int; // timestamp of contract creation
        updatedAt : Int;
        createdBy : Principal;
        status : ContractStatus; // e.g., "draft", "active", "completed", "cancelled"
        completionDate : ?Int; // optional completion date
        expiresAt : ?Int; // optional expiration date
        parties : Trie.Trie<Principal, Party>;
        pricing : List.List<Item>;
        value : Nat32; //calculated fron the pricing
        paymentTerm : ?PaymentTerm;
        deliveryNote : ?DeliveryNote;
        //late penalty fee
        //comments
    };

    public type ContractStatus = {
        #Draft; //initial stage, edits being made
        #Approved; //awaiting signatures
        #Signed; //signatures submitted
        #DeliveryConfirmed;
        #DeliveryNoteSubmitted;
        #Complete;
        #Active;
        #Renewed;
        #Terminated;
        #Expired;
        #Disputed; //in case of a dispute
    };

    public type EscrowRecordData = {
        user : Principal;
        status : {
            #Locked;
            #Transferred;
        };
        amount : Nat32;
        recipient : Principal; // the recipient of the locked tokens
    };
};
