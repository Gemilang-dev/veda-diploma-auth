import os
from dotenv import load_dotenv

# Muat variabel dari file .env
load_dotenv()

# Ambil alamat kontrak dari file .env
DIPLOMA_REGISTRY_ADDRESS = os.getenv("DIPLOMA_REGISTRY_ADDRESS")
ISSUER_REGISTRY_ADDRESS = os.getenv("ISSUER_REGISTRY_ADDRESS")


ISSUER_REGISTRY_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "issuerAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "universityId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "universityName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "IssuerAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "issuerAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "IssuerReactivated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "issuerAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "IssuerRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_issuerAddress",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_universityId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_universityName",
        "type": "string"
      }
    ],
    "name": "addIssuer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_index",
        "type": "uint256"
      }
    ],
    "name": "getIssuerByIndex",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_issuerAddress",
        "type": "address"
      }
    ],
    "name": "getIssuerInfo",
    "outputs": [
      {
        "internalType": "string",
        "name": "universityId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "universityName",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "registeredAt",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalIssuers",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_issuerAddress",
        "type": "address"
      }
    ],
    "name": "isAuthorizedIssuer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_issuerAddress",
        "type": "address"
      }
    ],
    "name": "reactivateIssuer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_issuerAddress",
        "type": "address"
      }
    ],
    "name": "removeIssuer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]


DIPLOMA_REGISTRY_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_issuerRegistryAddress",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "diplomaHash",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "revokedBy",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "DiplomaRevoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "diplomaHash",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "issuedBy",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "universityId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "studentId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "DiplomaStored",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "oldRegistry",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newRegistry",
        "type": "address"
      }
    ],
    "name": "IssuerRegistryUpdated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_diplomaHash",
        "type": "bytes32"
      }
    ],
    "name": "getDiplomaDetails",
    "outputs": [
      {
        "internalType": "string",
        "name": "universityId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "studentId",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "issuedBy",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "issuedAt",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isRevoked",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "revokedAt",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_diplomaHash",
        "type": "bytes32"
      }
    ],
    "name": "isDiplomaRevoked",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "issuerRegistry",
    "outputs": [
      {
        "internalType": "contract IIssuerRegistry",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_diplomaHash",
        "type": "bytes32"
      }
    ],
    "name": "revokeDiploma",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_diplomaHash",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "_universityId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_studentId",
        "type": "string"
      }
    ],
    "name": "storeDiplomaHash",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_newRegistryAddress",
        "type": "address"
      }
    ],
    "name": "updateIssuerRegistry",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_diplomaHash",
        "type": "bytes32"
      }
    ],
    "name": "verifyDiploma",
    "outputs": [
      {
        "internalType": "bool",
        "name": "isValid",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "isRevoked",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "issuedAt",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }

]