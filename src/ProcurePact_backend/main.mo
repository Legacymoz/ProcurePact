import Trie "mo:base/Trie";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import List "mo:base/List";
import Nat32 "mo:base/Nat32";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Bool "mo:base/Bool";
import Array "mo:base/Array";
import Debug "mo:base/Debug";
import T "Types";
import Escrow "canister:escrow";
import Ledger "canister:icrc1_ledger_canister";
import Invoice "canister:invoice";
import Credit "canister:credit";

persistent actor class CLM() = {

  var users : Trie.Trie<Principal, T.User> = Trie.empty(); //application users
  var contracts : Trie.Trie<Nat32, T.Contract> = Trie.empty(); // all contracts
  var nextContractId : Nat32 = 1; // to keep track of the next contract ID
  var connections : Trie.Trie<Principal, Trie.Trie<Principal, T.ConnectionStatus>> = Trie.empty(); // Adjacency list for graph that manages user connections: principal -> list of connected principals

  func key(p : Principal) : T.Key<Principal> {
    { hash = Principal.hash p; key = p };
  };

  //🚩Functions or testing purposes only
  //transfer to a particular user
  public shared ({ caller }) func transfer(acc : Principal, amount : Nat) : async Result.Result<Text, Text> {
    let transferResult = await Ledger.icrc1_transfer({
      amount = amount;
      to = { owner = acc; subaccount = null };
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
        return #ok("Tokens transferred successfully. Block index: " # debug_show (blockIndex));
      };
    };
  };
  //end of testing functions

  //add user
  public shared ({ caller }) func addUser(name : Text, email : Text, phone : Text, address : Text, bio : Text) : async Result.Result<Text, Text> {
    if (Trie.get(users, key(caller), Principal.equal) != null) {
      return #err("User already exists.");
    };
    let userConnections : Trie.Trie<Principal, T.ConnectionStatus> = Trie.empty();
    let now = Time.now();
    let newUser : T.User = {
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
    //initialize user connections
    connections := Trie.put(connections, key(caller), Principal.equal, userConnections).0;

    //🚩 for testing only
    //inittialize user with tokens
    let _ = await transfer(caller, 5000000);
    return #ok("User added successfully.");
  };
  //get user
  public shared func getUser(principal : Principal) : async ?T.User {
    return Trie.get(users, key(principal), Principal.equal);
  };
  //update user
  public shared ({ caller }) func updateUser(name : Text, email : Text, phone : Text, address : Text, bio : Text) : async Result.Result<Text, Text> {
    switch (Trie.get(users, key(caller), Principal.equal)) {
      case (?user) {
        let now = Time.now();
        let updatedUser : T.User = {
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
  public shared func getContracts(principal : Principal) : async Result.Result<[T.ContractSummary], Text> {
    switch (Trie.get(users, key(principal), Principal.equal)) {
      case (?user) {
        let summaries = List.foldLeft<Nat32, List.List<{ contractId : Nat32; name : Text; description : Text; createdBy : Principal; status : T.ContractStatus; party : T.Party; paymentTerm : ?T.PaymentTerm }>>(
          user.contracts,
          List.nil<{ contractId : Nat32; name : Text; description : Text; createdBy : Principal; status : T.ContractStatus; party : T.Party; paymentTerm : ?T.PaymentTerm }>(),
          func(acc, cId) {
            switch (Trie.get(contracts, { hash = cId; key = cId }, Nat32.equal)) {
              case (?contract) {
                switch (Trie.get(contract.parties, key(principal), Principal.equal)) {
                  case (?party) {
                    let toPush : T.ContractSummary = {
                      contractId = cId;
                      name = contract.name;
                      description = contract.description;
                      createdBy = contract.createdBy;
                      status = contract.status;
                      party = party;
                      paymentTerm = contract.paymentTerm;
                    };

                    List.push(
                      toPush,
                      acc,
                    );
                  };
                  case null {
                    acc;
                  };
                };
              };
              case null {
                acc;
              };
            };
          },
        );
        return #ok(List.toArray<{ contractId : Nat32; name : Text; description : Text; createdBy : Principal; status : T.ContractStatus; party : T.Party; paymentTerm : ?T.PaymentTerm }>(List.reverse(summaries)));
      };
      case (null) {
        return #err("User not found.");
      };
    };
  };

  //get full single contract details
  // get full single contract details
  public shared func getContractDetails(contractId : Nat32) : async Result.Result<T.ContractDetails, Text> {
    switch (Trie.get(contracts, { hash = contractId; key = contractId }, Nat32.equal)) {
      case (?contract) {
        let partiesArray = Trie.toArray<Principal, T.Party, { principal : Principal; details : T.Party }>(
          contract.parties,
          func(k, v) { { principal = k; details = v } },
        );

        let pricingArray = List.toArray<T.Item>(contract.pricing);

        let contractDetails : T.ContractDetails = {
          name = contract.name;
          description = contract.description;
          createdAt = contract.createdAt;
          updatedAt = contract.createdAt;
          createdBy = contract.createdBy;
          status = contract.status;
          completionDate = contract.completionDate;
          expiresAt = contract.expiresAt;
          parties = partiesArray;
          pricing = pricingArray;
          value = contract.value;
          paymentTerm = contract.paymentTerm;
          deliveryNote = contract.deliveryNote;
        };
        return #ok(contractDetails);
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
                let newConnections = Trie.put(Trie.empty<Principal, T.ConnectionStatus>(), key(caller), Principal.equal, #Invited).0;
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
        let newConnections = Trie.put(Trie.empty<Principal, T.ConnectionStatus>(), key(to), Principal.equal, #RequestSent).0;
        connections := Trie.put(connections, key(caller), Principal.equal, newConnections).0;
        // Also update 'to' user's connections
        let newToConnections = Trie.put(Trie.empty<Principal, T.ConnectionStatus>(), key(caller), Principal.equal, #Invited).0;
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
                  let newMap = Trie.put(Trie.empty<Principal, T.ConnectionStatus>(), key(caller), Principal.equal, #Accepted).0;
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

  public shared func getConnections(principal : Principal) : async Result.Result<[{ principal : Principal; status : T.ConnectionStatus }], Text> {
    switch (Trie.get(connections, key(principal), Principal.equal)) {
      case (null) {
        #err("User doesn't exist!");
      };
      case (?connections) {
        let connectionsArray = Trie.toArray<Principal, T.ConnectionStatus, { principal : Principal; status : T.ConnectionStatus }>(
          connections,
          func(k, v) { { principal = k; status = v } },
        );
        return #ok(connectionsArray);
      };
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
  func updateUserContracts(user : T.User, contractId : Nat32) : T.User {
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

  func updateContractParties(c : T.Contract, updatedParties : Trie.Trie<Principal, T.Party>) : T.Contract {
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

  func getPartyByRole(role : { #Buyer; #Supplier; #ThirdParty }, parties : Trie.Trie<Principal, T.Party>) : async Result.Result<[Principal], Text> {
    var resultList = List.nil<Principal>();

    let partiesArray = Trie.toArray<Principal, T.Party, { principal : Principal; role : { #Buyer; #Supplier; #ThirdParty } }>(
      parties,
      func(k, v) { { principal = k; role = v.role } },
    );

    let filteredParties = Array.filter<{ principal : Principal; role : { #Buyer; #Supplier; #ThirdParty } }>(
      partiesArray,
      func x = x.role == role,
    );

    if (filteredParties.size() == 0) {
      return #err("Not found!");
    };

    for (party in filteredParties.vals()) {
      resultList := List.push<Principal>(party.principal, resultList);
    };

    let resultArray = List.toArray<Principal>(resultList);

    return #ok(resultArray);

  };

  public shared ({ caller }) func createContract(name : Text, description : Text, role : Text) : async Result.Result<Text, Text> {
    let contractId = nextContractId;
    let now = Time.now();

    //check if user exists
    switch (Trie.get(users, key(caller), Principal.equal)) {
      case (?user) {

        let party : T.Party = {
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
        let newContract : T.Contract = {
          name = name;
          description = description;
          createdAt = now;
          updatedAt = now;
          createdBy = caller;
          status = #Draft;
          completionDate = null;
          expiresAt = null;
          pricing = List.nil<T.Item>();
          value = 0;
          paymentTerm = null;
          parties = Trie.put(Trie.empty<Principal, T.Party>(), key(caller), Principal.equal, party).0;
          deliveryNote = null;
        };

        // Use helper to update user contracts
        let updatedUser : T.User = updateUserContracts(user, contractId);

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
              let updatedParty : T.Party = {
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
                  let updatedUser : T.User = updateUserContracts(user, contractId);
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
  //🚩 need validation to ensure only one buyer and supplier can exist in a contract
  public shared ({ caller }) func invitePartiesToContract(contractId : Nat32, parties : [{ principal : Principal; role : Text }]) : async Result.Result<Text, Text> {
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
          //check if invitee is caller and skip
          if (p.principal == caller) {
            continue inviteLoop;
          };
          // Check if invitee exists
          switch (Trie.get(users, key(p.principal), Principal.equal)) {
            case (null) {
              // Skip if user does not exist
              continue inviteLoop;
            };
            case (?invitee) {
              //Check if party is a mutual connection
              switch (Trie.get(connections, key(caller), Principal.equal)) {
                case (?userConnections) {
                  switch (Trie.get(userConnections, key(p.principal), Principal.equal)) {
                    case (?status) {
                      if (status != #Accepted) {
                        return #err("You can only invite connected users. Make sure all invitations are mutuals!");
                      };
                    };
                    case null {
                      return #err("You can only invite connected users. Make sure all invitations are mutuals!");
                    };
                  };
                };
                case null {
                  return #err("You have no connections to invite parties.");
                };
              };
              // Check if party already exists
              switch (Trie.get(updatedParties, key(p.principal), Principal.equal)) {
                case (?_) {
                  // Already invited, skip
                  continue inviteLoop;
                };
                case null {
                  // Add party with status Invited
                  let invitedParty : T.Party = {
                    status = #Invited;
                    role = switch (p.role) {
                      case ("Buyer") #Buyer;
                      case ("Supplier") #Supplier;
                      case ("ThirdParty") #ThirdParty;
                      case (_) #ThirdParty;
                    };
                  };
                  updatedParties := Trie.put(updatedParties, key(p.principal), Principal.equal, invitedParty).0;

                  // Update invitee's contracts
                  let updatedInvitee : T.User = updateUserContracts(invitee, contractId);
                  users := Trie.put(users, key(p.principal), Principal.equal, updatedInvitee).0;

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
          case ("Signed") #Signed;
          case ("Active") #Active;
          case ("Renewed") #Renewed;
          case ("Terminated") #Terminated;
          case ("Expired") #Expired;
          case ("Complete") #Complete;
          case ("Disputed") #Disputed;
          case ("DeliveryConfirmed") #DeliveryConfirmed;
          case ("DeliveryNoteSubmitted") #DeliveryNoteSubmitted;
          case ("InvoiceIssued") #InvoiceIssued;
          case ("TokensLocked") #TokensLocked;
          case (_) { return #err("Invalid status provided.") };
        };
        let updatedContract : T.Contract = {
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
        let total = List.foldLeft<T.Item, Nat32>(
          contract.pricing,
          0,
          func(acc, item) {
            acc + (item.unit_price * item.quantity);
          },
        );

        // Update the contract with the new value
        let updatedContract : T.Contract = {
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
        let updatedContract : T.Contract = {
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
  public shared func addItems(contractId : Nat32, items : [T.Item]) : async Result.Result<Text, Text> {
    switch (Trie.get(contracts, { hash = contractId; key = contractId }, Nat32.equal)) {
      case (?contract) {
        var updatedPricing = List.nil<T.Item>();
        //create linked list from items array
        for (item in items.vals()) {
          updatedPricing := List.push<T.Item>(item, updatedPricing);
        };

        let updatedContract : T.Contract = {
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

  public shared func updatePayementTerms(contractId : Nat32, term : T.PaymentTerm) : async Result.Result<Text, Text> {
    switch (Trie.get(contracts, { hash = contractId; key = contractId }, Nat32.equal)) {
      case (?contract) {
        let updatedContract : T.Contract = {
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
                let updatedParty : T.Party = {
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
                let updatedContract : T.Contract = {
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

  //lock tokens
  //🚩 check possibility of automatic locking once signatures are added?
  //🚩 check if buyer is the caller
  public shared ({ caller }) func lockTokens(contractId : Nat32) : async Result.Result<Text, Text> {
    switch (Trie.get(contracts, { hash = contractId; key = contractId }, Nat32.equal)) {
      case (?contract) {
        if (contract.status != #Active) {
          return #err("Contract is not active.");
        };
        // Check if tokens are already locked
        if (contract.status == #TokensLocked) {
          return #err("Tokens are already locked for this contract.");
        };

        //change parties trie to array and filter to get supplier principal
        let partiesArray = Trie.toArray<Principal, T.Party, { principal : Principal; role : { #Buyer; #Supplier; #ThirdParty } }>(
          contract.parties,
          func(k, v) { { principal = k; role = v.role } },
        );
        //filter seller
        let filteredParties = Array.filter<{ principal : Principal; role : { #Buyer; #Supplier; #ThirdParty } }>(
          partiesArray,
          func x = x.role == #Supplier,
        );
        if (filteredParties.size() == 0) {
          Debug.print("No supplier found for contract: " # Nat32.toText(contractId));
          return #err("No supplier!");
        };

        // 🚩 need function to get seller or buyer
        for (party in filteredParties.vals()) {
          switch (await Escrow.lockTokens(caller, contractId, contract.value, party.principal)) {
            case (#ok(recordId)) {
              let _ = await updateContractStatus(contractId, "TokensLocked");
              return #ok("Tokens locked successfully: " # Nat.toText(recordId));
            };
            case (#err(message)) {
              return #err("Failed to lock tokens: " # message);
            };
          };
        };

        #ok("Success");
      };
      case null {
        return #err("Contract not found.");
      };
    };
  };

  //add delivery note. Can only happen to an active contract, changes the status to deliveryNoteSubmitted
  //get contract
  //check if delivery is confirmed
  //check payment terms
  //switch
  //🚩 will be modified in future to allow partial performance
  public shared ({ caller }) func addDeliveryNote(contractId : Nat32, description : Text) : async Result.Result<Text, Text> {
    let contractOpt = Trie.find(contracts, { hash = contractId; key = contractId }, Nat32.equal);

    switch (contractOpt) {
      case (null) {
        return #err("Contract Not found!");
      };
      case (?contract) {
        let now = Time.now();

        let expectedStatus = switch (contract.paymentTerm) {
          case (?#OnDelivery) #TokensLocked;
          case (_) #Active;
        };

        if (contract.status != expectedStatus) {
          return #err("Contract not in the correct state");
        };

        let newNote : T.DeliveryNote = {
          date = now;
          description = description;
          items = contract.pricing;
        };

        let updatedContract : T.Contract = {
          name = contract.name;
          description = contract.description;
          createdAt = contract.createdAt;
          updatedAt = now;
          createdBy = contract.createdBy;
          status = #DeliveryNoteSubmitted;
          completionDate = contract.completionDate;
          expiresAt = contract.expiresAt;
          parties = contract.parties;
          pricing = contract.pricing;
          value = contract.value;
          paymentTerm = contract.paymentTerm;
          deliveryNote = ?newNote;
        };
        contracts := Trie.put(contracts, { hash = contractId; key = contractId }, Nat32.equal, updatedContract).0;
        return #ok("Delivery Note added!");
      };
    };
  };

  public shared ({ caller }) func confirmDelivery(contractId : Nat32) : async Result.Result<Text, Text> {
    let contractOpt = Trie.find(contracts, { hash = contractId; key = contractId }, Nat32.equal);

    switch (contractOpt) {
      case (null) {
        return #err("Contract Not found!");
      };
      case (?contract) {
        //🚩add validation to check if caller is buyer
        if (contract.status != #DeliveryNoteSubmitted) {
          return #err("Contract not in correct state!");
        };

        let _ = await updateContractStatus(contractId, "DeliveryConfirmed");

        if (contract.paymentTerm == ?#OnDelivery) {
          let _ = await processPayment(contractId);
        };
        return #ok("Delivery Confirmed");
      };
    };
  };

  //processes on-delivery
  public shared func processPayment(contractId : Nat32) : async Result.Result<Text, Text> {
    switch (Trie.find(contracts, { hash = contractId; key = contractId }, Nat32.equal)) {
      case (null) {
        #err("Contract Not Found!!");
      };

      case (?contract) {
        if (contract.status != #DeliveryConfirmed) {
          return #err("Contract not in correct state for payment processing.");
        };

        if (contract.paymentTerm == ?#OnDelivery) {
          switch (await getPartyByRole(#Supplier, contract.parties)) {
            case (#err(message)) {
              return (#err(message));
            };
            case (#ok(sellerParty)) {
              switch (await Escrow.transferTokens(contractId, sellerParty[0])) {
                case (#ok(message)) {
                  let _ = await updateContractStatus(contractId, "Complete");
                  return #ok(message);
                };
                case (#err(message)) {
                  return #err("Escrow transfer failed: " # message);
                };
              };
            };
          };
        } else {
          #err("Wrong payment terms!");
        };
      };
    };
  };

  //defferred payments
  public shared ({ caller }) func createInvoice(contractId : Nat32, notes : ?Text) : async Result.Result<Nat32, Text> {
    switch (Trie.find(contracts, { hash = contractId; key = contractId }, Nat32.equal)) {
      case (?contract) {
        if (contract.status != #DeliveryConfirmed) {
          return #err("Contract not in correct state for invoice generation!");
        };

        if (contract.paymentTerm == ?#OnDelivery) {
          return #err("Invoice can only be created for deferred payment terms!");
        };

        switch (await getPartyByRole(#Supplier, contract.parties)) {
          case (#err(message)) {
            return #err(message);
          };
          case (#ok(supplierParty)) {
            if (supplierParty[0] != caller) {
              return #err("Only the supplier can create an invoice!");
            };

            switch (await getPartyByRole(#Buyer, contract.parties)) {
              case (#err(message)) {
                return #err(message);
              };
              case (#ok(buyerParty)) {
                switch (contract.paymentTerm) {
                  case (?term) {

                    let args : T.CreateInvoiceArgs = {
                      contractId = contractId;
                      issuer = caller;
                      recipient = buyerParty[0];
                      items = contract.pricing;

                      dueDate = switch term {
                        case (#Deferred d) d.due;
                        case _ 0;
                      };
                      penalty = switch term {
                        case (#Deferred d) d.penalty;
                        case _ 0;
                      };
                      notes = notes;
                    };

                    switch (await Invoice.createInvoice(args)) {
                      case (#ok(message)) {
                        let _ = await updateContractStatus(contractId, "InvoiceIssued");
                        return #ok(message);
                      };
                      case (#err(message)) {
                        return #err(message);
                      };
                    };
                  };
                  case null {
                    return #err("Payment term not set for contract!");
                  };
                };

              };
            };
          };
        };
      };
      case (null) {
        #err("Contract not found!");
      };
    };
  };

  //pay invoice lumpsum
  //invoice id corresponds to contract id
  public shared ({ caller }) func payInvoice(contractId : Nat32) : async Result.Result<Text, Text> {
    switch (Trie.find(contracts, { hash = contractId; key = contractId }, Nat32.equal)) {
      case (null) {
        #err("Contract Not Found!!");
      };
      case (?contract) {
        if (contract.status != #InvoiceIssued) {
          return #err("Contract not in correct state!");
        };

        switch (await getPartyByRole(#Buyer, contract.parties)) {
          case (#err(message)) {
            return #err(message);
          };
          case (#ok(buyerParty)) {
            if (buyerParty[0] != caller) {
              return #err("Only buyer can pay invoice");
            };
          };
        };

        // Get the invoice and check if collateralized
        let invoiceOpt = await Invoice.getInvoice(contractId);
        switch (invoiceOpt) {
          case null {
            return #err("Invoice not found");
          };
          case (?invoice) {
            if (invoice.collateralized) {
              // Transfer tokens to the credit canister principal
              let transferFromArgs : LT.TransferFromArgs = {
                from = {
                  owner = invoice.recipient;
                  subaccount = null;
                };
                memo = null;
                amount = Nat32.toNat(invoice.totalAmount);
                spender_subaccount = null;
                fee = null;
                to = { owner = Principal.fromActor(Credit); subaccount = null };
                created_at_time = null;
              };
              switch (await LT.Actor.icrc2_transfer_from(transferFromArgs)) {
                case (#Err(transferError)) {
                  return #err("Transfer to credit canister failed: " # debug_show (transferError));
                };
                case (#Ok(blockIndex)) {
                  // After payment to credit canister, collect the debt
                  let collectResult = await Credit.collect(contractId);
                  switch (collectResult) {
                    case (#ok(msg)) {
                      let _ = await updateContractStatus(contractId, "Complete");
                      return #ok("Transferred to credit canister and collected: " # debug_show (blockIndex) # ", " # msg);
                    };
                    case (#err(e)) {
                      return #err("Debt collection failed: " # e);
                    };
                  };
                };
              };
            } else {
              // Not collateralized, use the regular invoice payment logic
              switch (await Invoice.payInvoice(contractId)) {
                case (#ok(message)) {
                  let _ = await updateContractStatus(contractId, "Complete");
                  return #ok(message);
                };
                case (#err(message)) {
                  return #err(message);
                };
              };
            };
          };
        };
      };
    };
  };
  //get invoices
  public shared func getInvoices(principal : Principal) : async Result.Result<[T.Invoice], Text> {
    var invoicesList = List.nil<T.Invoice>();
    switch (await getUser(principal)) {
      case (null) {
        return #err("User not found");
      };
      case (?user) {
        let userContracts = List.toArray<Nat32>(user.contracts);
        for (contractId in userContracts.vals()) {
          switch (await Invoice.getInvoice(contractId)) {
            case (?invoice) {
              invoicesList := List.push<T.Invoice>(invoice, invoicesList);
            };
            case (null) {
              // Do nothing
            };
          };
        };
      };
    };

    let invoicesArray = List.toArray<T.Invoice>(invoicesList);
    return #ok(invoicesArray);
  };
};
