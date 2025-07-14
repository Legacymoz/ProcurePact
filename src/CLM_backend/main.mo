import Trie "mo:base/Trie";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import List "mo:base/List";
import Nat32 "mo:base/Nat32";
import Time "mo:base/Time";

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
      #Accepted;
      #Pending;
      #Rejected;
      #Invited;
    };
    classification : {
      #Buyer;
      #Supplier;
      #ThirdParty;
    };
  };

  type document = {

  };

  type Contract = {
    name : Text;
    description : Text;
    createdAt : Int; // timestamp of contract creation
    createdBy : Principal;
    status : ContractStatus; // e.g., "draft", "active", "completed", "cancelled"
    completionDate : ?Int; // optional completion date
    expiresAt : ?Int; // optional expiration date
    parties : Trie.Trie<Principal, Party>;
    //signatures
    //document
  };

  type ContractStatus = {
    #Draft; //initial stage
    #Review; //edits being made
    #Approved; //awaiting signatures
    #Signed; //signatures submitted
    #Active;
    #Renewed;
    #Terminated;
    #Expired;
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

  //get contracts for user
  public shared func getContracts(principal : Principal) : async Result.Result<[{ contractId : Nat32; contract : Contract }], Text> {
    switch (Trie.get(users, key(principal), Principal.equal)) {
      case (?user) {
        let contractList = List.foldLeft<Nat32, List.List<{ contractId : Nat32; contract : Contract }>>(
          user.contracts,
          List.nil<{ contractId : Nat32; contract : Contract }>(),
          
          func(acc, cId) {
            switch (Trie.get(contracts, { hash = cId; key = cId }, Nat32.equal)) {
              case (?contract) {
                List.push({ contractId = cId; contract = contract }, acc);
              };
              case null {
                acc;
              };
            };
          },
        );
        return #ok(List.toArray(List.reverse(contractList)));
      };
      case (null) {
        return #err("User not found.");
      };
    };
  };

  /*connection functions:
  requestConnection: request a connection to another user
  acceptConnectionRequest: accept a connection request from another user
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
  create contract
  invite parties to contract
  accept invitation to contract
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
      createdBy = c.createdBy;
      status = c.status;
      completionDate = c.completionDate;
      expiresAt = c.expiresAt;
      parties = updatedParties;
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
          classification = switch (role) {
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
          createdBy = caller;
          status = #Draft;
          completionDate = null;
          expiresAt = null;
          parties = Trie.put(Trie.empty<Principal, Party>(), key(caller), Principal.equal, party).0;
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

  public shared ({ caller }) func invitePartyToContract(contractId : Nat32, partyPrincipal : Principal, party : Party) : async Result.Result<Text, Text> {
    //check if invitee exists
    switch (Trie.get(users, key(partyPrincipal), Principal.equal)) {
      case (null) {
        return #err("Invitee doesn't exist!");
      };
      case (?invitee) {
        // Check if contract exists
        switch (Trie.get(contracts, { hash = contractId; key = contractId }, Nat32.equal)) {
          case (?contract) {
            // Only the creator can invite parties (or you can add more logic)
            if (contract.createdBy != caller) {
              return #err("Only the contract creator can invite parties.");
            };
            // Check if party already exists
            switch (Trie.get(contract.parties, key(partyPrincipal), Principal.equal)) {
              case (?_) {
                return #err("Party already invited to this contract.");
              };
              case null {
                // Add party with status Invited
                let invitedParty : Party = {
                  status = #Invited;
                  classification = party.classification;
                };
                let updatedParties = Trie.put(contract.parties, key(partyPrincipal), Principal.equal, invitedParty).0;
                // Use helper to update contract parties
                let updatedContract = updateContractParties(contract, updatedParties);

                contracts := Trie.put(contracts, { hash = contractId; key = contractId }, Nat32.equal, updatedContract).0;

                // Use helper to update invitee contracts
                let updatedInvitee : User = updateUserContracts(invitee, contractId);

                users := Trie.put(users, key(partyPrincipal), Principal.equal, updatedInvitee).0;
                return #ok("Party invited to contract.");
              };
            };
          };
          case null {
            return #err("Contract not found.");
          };
        };
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
                classification = party.classification; // keep classification same
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
};
