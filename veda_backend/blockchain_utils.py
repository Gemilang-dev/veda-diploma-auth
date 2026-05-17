import os
import json
from web3 import Web3
from dotenv import load_dotenv
from contracts import ISSUER_REGISTRY_ABI, ISSUER_REGISTRY_ADDRESS

load_dotenv()

ALCHEMY_URL = os.getenv("ALCHEMY_SEPOLIA_URL")
ADMIN_PRIVATE_KEY = os.getenv("METAMASK_PRIVATE_KEY")

if not ALCHEMY_URL:
    raise ValueError("ALCHEMY_SEPOLIA_URL not found in .env")

w3 = Web3(Web3.HTTPProvider(ALCHEMY_URL))

def register_issuer_on_blockchain(issuer_address, university_id, university_name):
    """
    Registers a new issuer in the Smart Contract.
    This function signs and sends a transaction using the Admin Private Key.
    """
    if not ADMIN_PRIVATE_KEY:
        raise ValueError("METAMASK_PRIVATE_KEY (Admin Key) not found in .env")

    # 1. Setup Admin Account
    admin_account = w3.eth.account.from_key(ADMIN_PRIVATE_KEY)
    admin_address = admin_account.address

    # 2. Setup Contract
    contract = w3.eth.contract(
        address=Web3.to_checksum_address(ISSUER_REGISTRY_ADDRESS), 
        abi=ISSUER_REGISTRY_ABI
    )

    # 3. Build Transaction
    print(f"🔗 [Blockchain] Registering {university_name} ({issuer_address})...")
    
    nonce = w3.eth.get_transaction_count(admin_address)
    
    # Estimate gas for the call
    transaction = contract.functions.addIssuer(
        Web3.to_checksum_address(issuer_address),
        university_id,
        university_name
    ).build_transaction({
        'chainId': 11155111, # Sepolia
        'gas': 300000,       # Initial gas limit, will be updated by estimate
        'gasPrice': w3.eth.gas_price,
        'nonce': nonce,
    })

    # 4. Sign and Send
    signed_tx = w3.eth.account.sign_transaction(transaction, ADMIN_PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    
    print(f"✅ [Blockchain] Transaction sent! Hash: {tx_hash.hex()}")
    
    # 5. Wait for Receipt (Optional, but good for confirmation)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    print(f"🧾 [Blockchain] Transaction confirmed in block {receipt.blockNumber}")
    
    return tx_hash.hex()
