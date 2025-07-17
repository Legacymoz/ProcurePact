import Trie "mo:base/Trie";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import List "mo:base/List";
import Nat32 "mo:base/Nat32";
import Time "mo:base/Time";
import Debug "mo:base/Debug";
import Nat "mo:base/Nat";
import Bool "mo:base/Bool";

actor class CLM() = {

  type Key<K> = Trie.Key<K>;

  type User = {
    name : Text;
    email : Text;
    phone : Text;
    address : Text;
    bio : Text;
    createdAt : Int; // Timestamp of when the user was created
    updatedAt : Int; // Timestamp of the last update to the user profile
    contracts : List.List<Nat32>;
  };

  type ConnectionStatus = {
    #RequestSent;
    #Accepted;
    #Rejected;
    #Invited;
  };

  type Party = {
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

  type Item = {
    name : Text;
    description : Text;
    unit_price : Nat32;
    quantity : Nat32;
  };

  type Notification = {
    date : Int;
    message : Text;
  };

  type DeliveryNote = {
    date : Int;
    description : Text; //description of the delivery
    items : List.List<Item>; //items delivered
  };

  type PaymentTerm = {
    #OnDelivery;
    #Periodic;
    #FixedDate;
  };

  type Contract = {
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

  type ContractStatus = {
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

  stable var users : Trie.Trie<Principal, User> = Trie.empty(); //application users
  stable var contracts : Trie.Trie<Nat32, Contract> = Trie.empty(); // all contracts
  stable var nextContractId : Nat32 = 1; // to keep track of the next contract ID

  func key(p : Principal) : Key<Principal> {
    { hash = Principal.hash p; key = p };
  };

  // Adjacency list for user-user connections: principal -> list of connected principals
  stable var connections : Trie.Trie<Principal, Trie.Trie<Principal, ConnectionStatus>> = Trie.empty();

  //add user
  public shared ({ caller }) func addUser(name : Text, email : Text, phone : Text, address : Text, bio : Text) : async Result.Result<Text, Text> {
    if (Trie.get(users, key(caller), Principal.equal) != null) {
      return #err("User already exists.");
    };

    let now = Time.now();
    let newUser : User = {
      name = name;
      email = email;
      phone = phone;
      address = address;
      bio = bio;
      createdAt = now;
      updatedAt = now; // assume creation time is also update time
      contracts = List.nil<Nat32>();
    };
    users := Trie.put(users, key(caller), Principal.equal, newUser).0;
    return #ok("User added successfully.");
  };
  //get user
  public shared func getUser(principal : Principal) : async ?User {
    return Trie.get(users, key(principal), Principal.equal);
  };
  //update user
  public shared ({ caller }) func updateUser(name : Text, email : Text, phone : Text, address : Text, bio : Text) : async Result.Result<Text, Text> {
    switch (Trie.get(users, key(caller), Principal.equal)) {
      case (?user) {
        let now = Time.now();
        let updatedUser : User = {
          name = name;
          email = email;
          phone = phone;
          address = address;
          bio = bio;
          createdAt = user.createdAt;
          updatedAt = now;
          contracts = user.contracts;
        };
        users := Trie.put(users, key(caller), Principal.equal, updatedUser).0;
        return #ok("User updated successfully!");
      };
      case (null) {
        #err("User doesn't exist!");
      };
    };
  };

  //get contracts summary for user
  // get contracts summary for user
  public shared func getContracts(principal : Principal) : async Result.Result<[{ contractId : Nat32; name : Text; description : Text; createdAt : Int; updatedAt : Int }], Text> {
    switch (Trie.get(users, key(principal), Principal.equal)) {
      case (?user) {
        let summaries = List.foldLeft<Nat32, List.List<{ contractId : Nat32; name : Text; description : Text; createdAt : Int; updatedAt : Int }>>(
          user.contracts,
          List.nil<{ contractId : Nat32; name : Text; description : Text; createdAt : Int; updatedAt : Int }>(),
          func(acc, cId) {
            switch (Trie.get(contracts, { hash = cId; key = cId }, Nat32.equal)) {
              case (?contract) {
                List.push(
                  {
                    contractId = cId;
                    name = contract.name;
                    description = contract.description;
                    createdAt = contract.createdAt;
                    updatedAt = contract.updatedAt;
                  },
                  acc,
                );
              };
              case null {
                acc;
              };
            };
          },
        );
        return #ok(List.toArray(List.reverse(summaries)));
      };
      case (null) {
        return #err("User not found.");
      };
    };
  };

  //get full single contract details
  // get full single contract details
  public shared func getContractDetails(contractId : Nat32) : async Result.Result<Contract, Text> {
    switch (Trie.get(contracts, { hash = contractId; key = contractId }, Nat32.equal)) {
      case (?contract) {
        return #ok(contract);
      };
      case null {
        return #err("Contract not found.");
      };
    };
  };

  /*connection functions:
  requestConnection: request a connection to another user✅
  acceptConnectionRequest: accept a connection request from another user✅
  rejectConnectionRequest: reject a connection request from another user
  cancelConnectionRequest: cancel a connection request sent to another user
  removeConnection: remove a connection with another user
  checkConnection: check if a mutual accepted connection exists between two users
  getConnections: get all connections for a user
  */
  public shared ({ caller }) func requestConnection(to : Principal) : async Result.Result<Text, Text> {
    if (caller == to) {
      return #err("Cannot connect to yourself");
    };
    //get callers connections
    //can only request if 'to' doesn't have a connection with caller
    switch (Trie.get(connections, key(caller), Principal.equal)) {
      case (?userConnections) {
        // Check if 'to' is already connected
        switch (Trie.get(userConnections, key(to), Principal.equal)) {
          case (?_status) {
            // If a connection exists, return an error
            return #err("Connection already exists with this user");
          };
          case (null) {
            // No connection exists, proceed to request
            let newStatus = Trie.put(userConnections, key(to), Principal.equal, #RequestSent).0;
            connections := Trie.put(connections, key(caller), Principal.equal, newStatus).0;
            //update 'to' user's connections
            switch (Trie.get(connections, key(to), Principal.equal)) {
              case (?toConnections) {
                // Update 'to' user's connections with the new request
                let updatedToConnections = Trie.put(toConnections, key(caller), Principal.equal, #Invited).0;
                connections := Trie.put(connections, key(to), Principal.equal, updatedToConnections).0;
              };
              // If 'to' has no connections yet, create a new entry
              case (null) {
                // No connections for 'to', create a new entry
                let newConnections = Trie.put(Trie.empty<Principal, ConnectionStatus>(), key(caller), Principal.equal, #Invited).0;
                connections := Trie.put(connections, key(to), Principal.equal, newConnections).0;
              };
            };
            return #ok("Connection request sent to " # debug_show (to));
          };
        };
      };
      // If caller has no connections yet, create a new entry
      case (null) {
        // No connections for caller, create a new entry
        let newConnections = Trie.put(Trie.empty<Principal, ConnectionStatus>(), key(to), Principal.equal, #RequestSent).0;
        connections := Trie.put(connections, key(caller), Principal.equal, newConnections).0;
        // Also update 'to' user's connections
        let newToConnections = Trie.put(Trie.empty<Principal, ConnectionStatus>(), key(caller), Principal.equal, #Invited).0;
        connections := Trie.put(connections, key(to), Principal.equal, newToConnections).0;
        return #ok("Connection request sent to " # debug_show (to));
      };
    };

  };
  public shared ({ caller }) func acceptConnectionRequest(from : Principal) : async Result.Result<Text, Text> {
    if (caller == from) {
      return #err("Cannot accept connection request from yourself");
    };

    // 1. Check that caller has an invitation from `from`
    switch (Trie.get(connections, key(caller), Principal.equal)) {
      case (?userConnections) {
        switch (Trie.get(userConnections, key(from), Principal.equal)) {
          case (?status) {
            if (status == #Invited) {
              // 2. Update caller's view
              let updatedUserConnections = Trie.put(userConnections, key(from), Principal.equal, #Accepted).0;
              connections := Trie.put(connections, key(caller), Principal.equal, updatedUserConnections).0;

              // 3. Update sender's view if it exists
              switch (Trie.get(connections, key(from), Principal.equal)) {
                case (?fromConnections) {
                  let updatedFromConnections = Trie.put(fromConnections, key(caller), Principal.equal, #Accepted).0;
                  connections := Trie.put(connections, key(from), Principal.equal, updatedFromConnections).0;
                };
                case (null) {
                  // recover by setting back connection
                  let newMap = Trie.put(Trie.empty<Principal, ConnectionStatus>(), key(caller), Principal.equal, #Accepted).0;
                  connections := Trie.put(connections, key(from), Principal.equal, newMap).0;
                };
              };

              return #ok("Connection accepted.");
            } else {
              return #err("No pending invitation from " # debug_show (from));
            };
          };
          case (null) {
            return #err("No invitation found from " # debug_show (from));
          };
        };
      };
      case (null) { return #err("You have no connection requests.") };
    };
  };

  // Other connection functions would be implemented similarly...
  /*contract functions:
  create contract✅
  invite parties to contract✅
  accept invitation to contract✅
  decline invitation
  */

  //helper functions
  func updateUserContracts(user : User, contractId : Nat32) : User {
    if (List.some<Nat32>(user.contracts, func(cId : Nat32) : Bool { cId == contractId })) {
      return user;
    };
    {
      name = user.name;
      email = user.email;
      phone = user.phone;
      address = user.address;
      bio = user.bio;
      createdAt = user.createdAt;
      updatedAt = Time.now(); // assume update time here
      contracts = List.push(contractId, user.contracts);
    };
  };

  func updateContractParties(c : Contract, updatedParties : Trie.Trie<Principal, Party>) : Contract {
    {
      name = c.name;
      description = c.description;
      createdAt = c.createdAt;
      updatedAt = Time.now();
      createdBy = c.createdBy;
      status = c.status;
      completionDate = c.completionDate;
      expiresAt = c.expiresAt;
      parties = updatedParties;
      pricing = c.pricing;
      paymentTerm = c.paymentTerm;
      value = c.value;
      deliveryNote = c.deliveryNote;
    };
  };

  public shared ({ caller }) func createContract(name : Text, description : Text, role : Text) : async Result.Result<Text, Text> {
    let contractId = nextContractId;
    let now = Time.now();

    //check if user exists
    switch (Trie.get(users, key(caller), Principal.equal)) {
      case (?user) {

        let party : Party = {
          status = #Accepted;
          role = switch (role) {
            case ("Buyer") #Buyer;
            case ("Supplier") #Supplier;
            case ("ThirdParty") #ThirdParty;
            case (_) {
              return #err("Invalid role provided. Must be 'Buyer', 'Supplier', or 'ThirdParty'.");
            };
          };
        };
        // User exists, proceed to create contract
        let newContract : Contract = {
          name = name;
          description = description;
          createdAt = now;
          updatedAt = now;
          createdBy = caller;
          status = #Draft;
          completionDate = null;
          expiresAt = null;
          pricing = List.nil<Item>();
          value = 0;
          paymentTerm = null;
          parties = Trie.put(Trie.empty<Principal, Party>(), key(caller), Principal.equal, party).0;
          deliveryNote = null;
        };

        // Use helper to update user contracts
        let updatedUser : User = updateUserContracts(user, contractId);

        users := Trie.put(users, key(caller), Principal.equal, updatedUser).0;
        contracts := Trie.put(contracts, { hash = contractId; key = contractId }, Nat32.equal, newContract).0;
        nextContractId += 1; // Increment the contract ID for the next contract
        return #ok("Contract created with ID: " # debug_show (contractId));
      };
      case (null) {
        return #err("User doesn't exist!");
      };
    };
  };

  public shared ({ caller }) func acceptContractInvitation(contractId : Nat32) : async Result.Result<Text, Text> {
    // Check if the user is invited to the contract
    switch (Trie.get(contracts, { hash = contractId; key = contractId }, Nat32.equal)) {
      case (?contract) {
        // Check if the caller is invited
        switch (Trie.get(contract.parties, key(caller), Principal.equal)) {
          case (?party) {
            if (party.status == #Invited) {
              // Update party status to Accepted
              let updatedParty : Party = {
                status = #Accepted;
                role = party.role; // keep classification same
              };
              let updatedParties = Trie.put(contract.parties, key(caller), Principal.equal, updatedParty).0;
              // Use helper to update contract parties
              let updatedContract = updateContractParties(contract, updatedParties);

              contracts := Trie.put(contracts, { hash = contractId; key = contractId }, Nat32.equal, updatedContract).0;

              // Update user's contracts
              switch (Trie.get(users, key(caller), Principal.equal)) {
                case (?user) {
                  let updatedUser : User = updateUserContracts(user, contractId);
                  users := Trie.put(users, key(caller), Principal.equal, updatedUser).0;
                };
                case null {
                  return #err("User not found.");
                };
              };

              return #ok("Contract invitation accepted.");
            } else {
              return #err("You are not invited to this contract.");
            };
          };
          case null {
            return #err("You are not invited to this contract.");
          };
        };
      };
      case null {
        return #err("Contract not found.");
      };
    };
  };

  //Editing contract
  public shared ({ caller }) func invitePartiesToContract(contractId : Nat32, parties : [{ id : Principal; role : Text }]) : async Result.Result<Text, Text> {
    // Check if contract exists
    switch (Trie.get(contracts, { hash = contractId; key = contractId }, Nat32.equal)) {
      case (?contract) {
        // Only the creator can invite parties
        if (contract.createdBy != caller) {
          return #err("Only the contract creator can invite parties.");
        };

        var updatedParties = contract.parties;
        var invitedCount : Nat = 0;

        label inviteLoop for (p in parties.vals()) {
          // Check if invitee exists
          switch (Trie.get(users, key(p.id), Principal.equal)) {
            case (null) {
              // Skip if user does not exist
              continue inviteLoop;
            };
            case (?invitee) {
              // Check if party already exists
              switch (Trie.get(updatedParties, key(p.id), Principal.equal)) {
                case (?_) {
                  // Already invited, skip
                  continue inviteLoop;
                };
                case null {
                  // Add party with status Invited
                  let invitedParty : Party = {
                    status = #Invited;
                    role = switch (p.role) {
                      case ("Buyer") #Buyer;
                      case ("Supplier") #Supplier;
                      case ("ThirdParty") #ThirdParty;
                      case (_) #ThirdParty;
                    };
                  };
                  updatedParties := Trie.put(updatedParties, key(p.id), Principal.equal, invitedParty).0;

                  // Update invitee's contracts
                  let updatedInvitee : User = updateUserContracts(invitee, contractId);
                  users := Trie.put(users, key(p.id), Principal.equal, updatedInvitee).0;

                  invitedCount += 1;
                };
              };
            };
          };
        };

        // Use helper to update contract parties
        let updatedContract = updateContractParties(contract, updatedParties);
        contracts := Trie.put(contracts, { hash = contractId; key = contractId }, Nat32.equal, updatedContract).0;

        if (invitedCount == 0) {
          return #err("No new parties were invited (they may already be invited or not exist).");
        } else {
          return #ok("Invited " # Nat.toText(invitedCount) # " parties to contract.");
        };
      };
      case null {
        return #err("Contract not found.");
      };
    };
  };

  public shared ({ caller }) func updateContractStatus(contractId : Nat32, updatedStatus : Text) : async Result.Result<Text, Text> {
    let contractOpt = Trie.find(contracts, { hash = contractId; key = contractId }, Nat32.equal);
    switch (contractOpt) {
      case (?contract) {
        /*if (contract.createdBy != caller) {
          return #err("Only the contract creator can update the status.");
        };*/
        let newStatus = switch (updatedStatus) {
          case ("Draft") #Draft;
          case ("Approved") #Approved;
          case ("Signed") #Signed;
          case ("Active") #Active;
          case ("Renewed") #Renewed;
          case ("Terminated") #Terminated;
          case ("Expired") #Expired;
          case ("Complete") #Complete;
          case ("Disputed") #Disputed;
          case ("DeliveryConfirmed") #DeliveryConfirmed;
          case ("DeliveryNoteSubmitted") #DeliveryNoteSubmitted;
          case (_) { return #err("Invalid status provided.") };
        };
        let updatedContract : Contract = {
          name = contract.name;
          description = contract.description;
          createdAt = contract.createdAt;
          updatedAt = Time.now();
          createdBy = contract.createdBy;
          status = newStatus;
          completionDate = contract.completionDate;
          expiresAt = contract.expiresAt;
          parties = contract.parties; // keep parties same
          pricing = contract.pricing;
          value = contract.value;
          paymentTerm = contract.paymentTerm;
          deliveryNote = contract.deliveryNote;
        };
        contracts := Trie.put(contracts, { hash = contractId; key = contractId }, Nat32.equal, updatedContract).0;
        return #ok("Contract status updated to " # updatedStatus);
      };
      case null {
        return #err("Contract not found.");
      };
    };
  };

  public shared func updateContractValue(contractId : Nat32) : async Result.Result<Nat32, Text> {
    switch (Trie.get(contracts, { hash = contractId; key = contractId }, Nat32.equal)) {
      case (?contract) {
        let total = List.foldLeft<Item, Nat32>(
          contract.pricing,
          0,
          func(acc, item) {
            acc + (item.unit_price * item.quantity);
          },
        );

        // Update the contract with the new value
        let updatedContract : Contract = {
          name = contract.name;
          description = contract.description;
          createdAt = contract.createdAt;
          updatedAt = Time.now();
          createdBy = contract.createdBy;
          status = contract.status;
          completionDate = contract.completionDate;
          expiresAt = contract.expiresAt;
          parties = contract.parties;
          pricing = contract.pricing;
          paymentTerm = contract.paymentTerm;
          value = total;
          deliveryNote = contract.deliveryNote;
        };
        contracts := Trie.put(contracts, { hash = contractId; key = contractId }, Nat32.equal, updatedContract).0;

        return #ok(total);
      };
      case null {
        return #err("Contract not found.");
      };
    };
  };

  public shared ({ caller }) func updateExpiryDate(contractId : Nat32, newExpiry : Int) : async Result.Result<Text, Text> {
    switch (Trie.get(contracts, { hash = contractId; key = contractId }, Nat32.equal)) {
      case (?contract) {
        // Only the contract creator can update expiry date
        if (contract.createdBy != caller) {
          return #err("Only the contract creator can update the expiry date.");
        };
        let updatedContract : Contract = {
          name = contract.name;
          description = contract.description;
          createdAt = contract.createdAt;
          updatedAt = Time.now();
          createdBy = contract.createdBy;
          status = contract.status;
          completionDate = contract.completionDate;
          expiresAt = ?newExpiry;
          parties = contract.parties;
          pricing = contract.pricing;
          value = contract.value;
          paymentTerm = contract.paymentTerm;
          deliveryNote = contract.deliveryNote;
        };
        contracts := Trie.put(contracts, { hash = contractId; key = contractId }, Nat32.equal, updatedContract).0;
        return #ok("Expiry date updated.");
      };
      case null {
        return #err("Contract not found.");
      };
    };
  };

  //adds goods/services to the contract
  public shared func addItems(contractId : Nat32, items : [Item]) : async Result.Result<Text, Text> {
    switch (Trie.get(contracts, { hash = contractId; key = contractId }, Nat32.equal)) {
      case (?contract) {
        var updatedPricing = List.nil<Item>();
        //create linked list from items array
        for (item in items.vals()) {
          updatedPricing := List.push<Item>(item, updatedPricing);
        };

        let updatedContract : Contract = {
          name = contract.name;
          description = contract.description;
          createdAt = contract.createdAt;
          updatedAt = Time.now();
          createdBy = contract.createdBy;
          status = contract.status;
          completionDate = contract.completionDate;
          expiresAt = contract.expiresAt;
          parties = contract.parties;
          pricing = updatedPricing;
          value = 0; // Temporary value; will be updated by calculateContractValue
          paymentTerm = contract.paymentTerm;
          deliveryNote = contract.deliveryNote;
        };
        contracts := Trie.put(contracts, { hash = contractId; key = contractId }, Nat32.equal, updatedContract).0;

        // Now update value
        let _ = await updateContractValue(contractId);

        return #ok("Item added to contract.");
      };
      case null {
        return #err("Contract not found.");
      };
    };
  };

  public shared func updatePayementTerms(contractId : Nat32, term : PaymentTerm) : async Result.Result<Text, Text> {
    switch (Trie.get(contracts, { hash = contractId; key = contractId }, Nat32.equal)) {
      case (?contract) {
        let updatedContract : Contract = {
          name = contract.name;
          description = contract.description;
          createdAt = contract.createdAt;
          updatedAt = Time.now();
          createdBy = contract.createdBy;
          status = contract.status;
          completionDate = contract.completionDate;
          expiresAt = contract.expiresAt;
          parties = contract.parties;
          pricing = contract.pricing;
          value = contract.value;
          paymentTerm = ?term;
          deliveryNote = contract.deliveryNote;
        };
        contracts := Trie.put(contracts, { hash = contractId; key = contractId }, Nat32.equal, updatedContract).0;
        return #ok("Payment terms updated.");
      };
      case null {
        return #err("Contract not found.");
      };
    };
  };

  // Add a signature for a party to a contract
  public shared ({ caller }) func addSignature(contractId : Nat32) : async Result.Result<Text, Text> {
    switch (Trie.get(contracts, { hash = contractId; key = contractId }, Nat32.equal)) {
      case (?contract) {
        // Check if caller is a party to the contract
        switch (Trie.get(contract.parties, key(caller), Principal.equal)) {
          case (?party) {
            // Only parties with Accepted status can sign
            switch (party.status) {
              case (#Accepted) {
                let updatedParty : Party = {
                  status = #Signatory;
                  role = party.role;
                };
                let updatedParties = Trie.put(contract.parties, key(caller), Principal.equal, updatedParty).0;

                // Check if all parties have signed after this signature
                var allSigned = true;
                label checkLoop for ((_, p) in Trie.iter(updatedParties)) {
                  switch (p.status) {
                    case (#Signatory) {};
                    case _ { allSigned := false; break checkLoop };
                  };
                };

                // Update contract status if all have signed
                let newStatus = if (allSigned) #Active else contract.status;
                let updatedContract : Contract = {
                  name = contract.name;
                  description = contract.description;
                  createdAt = contract.createdAt;
                  updatedAt = Time.now();
                  createdBy = contract.createdBy;
                  status = newStatus;
                  completionDate = contract.completionDate;
                  expiresAt = contract.expiresAt;
                  parties = updatedParties;
                  pricing = contract.pricing;
                  value = contract.value;
                  paymentTerm = contract.paymentTerm;
                  deliveryNote = contract.deliveryNote;
                };
                contracts := Trie.put(contracts, { hash = contractId; key = contractId }, Nat32.equal, updatedContract).0;

                if (allSigned) {
                  return #ok("Signature added. All parties have signed. Contract is now active.");
                } else {
                  return #ok("Signature added to contract.");
                };
              };
              case (#Signatory) {
                return #err("You have already signed this contract.");
              };
              case _ {
                return #err("You must accept the invitation before signing.");
              };
            };
          };
          case null {
            return #err("You are not a party to this contract.");
          };
        };
      };
      case null {
        return #err("Contract not found.");
      };
    };
  };

  //add delivery note. Can only happen to an active contract, changes the status to deliveryNoteSubmitted

  //🚩 will be modified in future to allow partial performance
  public shared ({ caller }) func addDeliveryNote(contractId : Nat32, description : Text) : async Result.Result<Text, Text> {
    //add note
    let contractOpt = Trie.find(
      contracts,
      {
        hash = contractId;
        key = contractId;
      },
      Nat32.equal,
    );

    switch (contractOpt) {
      case (null) {
        return #err("Contract Not found!");
      };
      case (?contract) {
        let now = Time.now();
        if (contract.status != #Active) {
          return #err("Contract not in the correct state");
        };
        let newNote : DeliveryNote = {
          date = now;
          description = description;
          items = contract.pricing;
        };

        let updatedContract : Contract = {
          name = contract.name;
          description = contract.description;
          createdAt = contract.createdAt;
          updatedAt = now;
          createdBy = contract.createdBy;
          status = contract.status;
          completionDate = contract.completionDate;
          expiresAt = contract.expiresAt;
          parties = contract.parties;
          pricing = contract.pricing;
          value = contract.value;
          paymentTerm = contract.paymentTerm;
          deliveryNote = ?newNote;
        };

        contracts := Trie.put(contracts, { hash = contractId; key = contractId }, Nat32.equal, updatedContract).0;
        //update contracts

        return #ok("Delivery Note added!");
      };
    };
  };

  public shared ({ caller }) func confirmDelivery(contractId : Nat32) : async Result.Result<Text, Text> {
    let contractOpt = Trie.find(
      contracts,
      {
        hash = contractId;
        key = contractId;
      },
      Nat32.equal,
    );

    switch (contractOpt) {
      case (null) {
        return #err("Contract Not found!");
      };
      case (?contract) {
        //🚩add validation to check if caller is buyer
        if (contract.status != #DeliveryNoteSubmitted) {
          return #err("Contract not in correct state!");
        };
        let updatedContract : Contract = {
          name = contract.name;
          description = contract.description;
          createdAt = contract.createdAt;
          updatedAt = Time.now();
          createdBy = contract.createdBy;
          status = #DeliveryConfirmed;
          completionDate = contract.completionDate;
          expiresAt = contract.expiresAt;
          parties = contract.parties;
          pricing = contract.pricing;
          value = contract.value;
          paymentTerm = contract.paymentTerm;
          deliveryNote = contract.deliveryNote;
        };
        contracts := Trie.put(contracts, { hash = contractId; key = contractId }, Nat32.equal, updatedContract).0;
        return #ok("Delivery Confirmed");
      };
    };
  };
  /*
  1. Transfer tokens to escrow
  4. Complete deal
  5. Terminate contract
  6. Dispute contract
  7. Resolve dispute
  8. Release funds
  9. Refund
  */
};
