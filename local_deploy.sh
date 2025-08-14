dfx stop
dfx start --clean --background

#create new identities
dfx identity new minter
dfx identity new archive_controller

# Set principal variables
DEFAULT=$(dfx identity get-principal --identity default)
MINTER=$(dfx identity get-principal --identity minter)
CONTROLLER=$(dfx identity get-principal --identity archive_controller)

dfx deploy ProcurePact_backend
BACKEND=$(dfx canister id ProcurePact_backend)

# Deploy the ICRC-1 ledger canister
dfx deploy icrc1_ledger_canister --argument "(variant { Init = record {
    token_symbol = \"KEST\";
    token_name = \"Tether KE\";
    minting_account = record { owner = principal \"$MINTER\" };
    transfer_fee = 10_000;
    metadata = vec {};
    feature_flags = opt record { icrc2 = true };
    initial_balances = vec {
        record { record { owner = principal \"$DEFAULT\"; }; 10_000_000_000; };
        record { record { owner = principal \"$BACKEND\"; }; 50_000_000_000; };
    };
    archive_options = record {
        num_blocks_to_archive = 1000;
        trigger_threshold = 2000;
        controller_id = principal \"$CONTROLLER\";
        cycles_for_archive_creation = opt 10000000000000;
    };
}})"

# Get the deployed ledger canister ID
LEDGER=$(dfx canister id icrc1_ledger_canister)

# Deploy the index canister, referencing the ledger canister principal
#index canister is used to query ledger transactions
dfx deploy icrc1_index_canister --argument "(opt variant { Init = record { ledger_id = principal \"$LEDGER\"; retrieve_blocks_from_ledger_interval_seconds = opt 10; } })"

# Deploy other canisters
dfx deploy escrow
dfx deploy invoice
dfx deploy credit
dfx deploy internet_identity
dfx deploy ProcurePact_frontend

#fund escrow canister with operating tokens
ESCROW=$(dfx canister id escrow)

dfx canister call ProcurePact_backend transfer "(principal \"$ESCROW\", 1000000)"