// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IIssuerRegistry
 * @notice Interface for communicating with the IssuerRegistry contract
 */
interface IIssuerRegistry {
    function isAuthorizedIssuer(address _issuerAddress) external view returns (bool);
}

/**
 * @title DiplomaRegistry
 * @notice Stores and verifies diploma hashes on the blockchain
 * @dev Relies on IssuerRegistry for access control
 * @author VEDA System
 */
contract DiplomaRegistry {

    // ─────────────────────────────────────────────
    //  STATE VARIABLES
    // ─────────────────────────────────────────────

    address public owner;

    // Reference to the IssuerRegistry contract
    IIssuerRegistry public issuerRegistry;

    struct DiplomaRecord {
        bytes32 diplomaHash;     // SHA-256 hash of the diploma PDF
        address issuedBy;        // Wallet address of the issuing university
        string  universityId;    // ID of the issuing university
        string  studentId;       // Student ID (not name — for privacy purposes)
        uint256 issuedAt;        // Issuance timestamp
        bool    isRevoked;       // Revocation status
        uint256 revokedAt;       // Revocation timestamp (0 if not revoked)
    }

    // Mapping from hash to diploma record
    mapping(bytes32 => DiplomaRecord) private diplomaRecords;

    // Mapping to track if a diploma hash is already registered
    mapping(bytes32 => bool) private registeredDiplomas;


    // ─────────────────────────────────────────────
    //  EVENTS
    // ─────────────────────────────────────────────

    event DiplomaStored(
        bytes32 indexed diplomaHash,
        address indexed issuedBy,
        string  universityId,
        string  studentId,
        uint256 timestamp
    );

    event DiplomaRevoked(
        bytes32 indexed diplomaHash,
        address indexed revokedBy,
        uint256 timestamp
    );

    event IssuerRegistryUpdated(
        address indexed oldRegistry,
        address indexed newRegistry
    );


    // ─────────────────────────────────────────────
    //  MODIFIERS
    // ─────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "DiplomaRegistry: caller is not the owner");
        _;
    }

    modifier onlyAuthorizedIssuer() {
        require(
            issuerRegistry.isAuthorizedIssuer(msg.sender),
            "DiplomaRegistry: caller is not an authorized issuer"
        );
        _;
    }

    modifier diplomaExists(bytes32 _hash) {
        require(diplomaRecords[_hash].issuedAt != 0, "DiplomaRegistry: diploma not found");
        _;
    }


    // ─────────────────────────────────────────────
    //  CONSTRUCTOR
    // ─────────────────────────────────────────────

    /**
     * @param _issuerRegistryAddress Address of the deployed IssuerRegistry
     */
    constructor(address _issuerRegistryAddress) {
        require(_issuerRegistryAddress != address(0), "DiplomaRegistry: invalid registry address");
        owner = msg.sender;
        issuerRegistry = IIssuerRegistry(_issuerRegistryAddress);
    }


    // ─────────────────────────────────────────────
    //  WRITE FUNCTIONS (Only authorized issuers)
    // ─────────────────────────────────────────────

    /**
     * @notice Stores a diploma hash on the blockchain
     * @param _diplomaHash  SHA-256 hash of the diploma file (bytes32)
     * @param _universityId ID of the issuing university
     * @param _studentId    Student ID
     */
    function storeDiplomaHash(
        bytes32 _diplomaHash,
        string calldata _universityId,
        string calldata _studentId
    ) external onlyAuthorizedIssuer {
        require(_diplomaHash != bytes32(0), "DiplomaRegistry: hash cannot be zero");
        require(!registeredDiplomas[_diplomaHash], "DiplomaRegistry: diploma already registered");
        require(bytes(_universityId).length > 0, "DiplomaRegistry: universityId cannot be empty");
        require(bytes(_studentId).length > 0, "DiplomaRegistry: studentId cannot be empty");

        diplomaRecords[_diplomaHash] = DiplomaRecord({
            diplomaHash:  _diplomaHash,
            issuedBy:     msg.sender,
            universityId: _universityId,
            studentId:    _studentId,
            issuedAt:     block.timestamp,
            isRevoked:    false,
            revokedAt:    0
        });

        registeredDiplomas[_diplomaHash] = true;

        emit DiplomaStored(_diplomaHash, msg.sender, _universityId, _studentId, block.timestamp);
    }

    /**
     * @notice Revokes / deactivates a diploma
     * @param _diplomaHash The hash of the diploma to be revoked
     */
    function revokeDiploma(bytes32 _diplomaHash)
        external
        onlyAuthorizedIssuer
        diplomaExists(_diplomaHash)
    {
        DiplomaRecord storage record = diplomaRecords[_diplomaHash];

        require(!record.isRevoked, "DiplomaRegistry: diploma already revoked");
        require(
            record.issuedBy == msg.sender,
            "DiplomaRegistry: only the original issuer can revoke"
        );

        record.isRevoked  = true;
        record.revokedAt  = block.timestamp;

        emit DiplomaRevoked(_diplomaHash, msg.sender, block.timestamp);
    }

    /**
     * @notice Updates the IssuerRegistry address (if the registry contract is upgraded)
     * @param _newRegistryAddress New registry address
     */
    function updateIssuerRegistry(address _newRegistryAddress) external onlyOwner {
        require(_newRegistryAddress != address(0), "DiplomaRegistry: invalid address");
        emit IssuerRegistryUpdated(address(issuerRegistry), _newRegistryAddress);
        issuerRegistry = IIssuerRegistry(_newRegistryAddress);
    }


    // ─────────────────────────────────────────────
    //  READ FUNCTIONS (Public, free — for verifiers/HR)
    // ─────────────────────────────────────────────

    /**
     * @notice Verifies if a diploma is valid (registered and not revoked)
     * @param _diplomaHash The hash scanned from the diploma's QR Code
     * @return isValid     true if registered and not revoked
     * @return isRevoked   true if it has been revoked
     * @return issuedAt    Issuance timestamp
     */
    function verifyDiploma(bytes32 _diplomaHash)
        external
        view
        returns (
            bool isValid,
            bool isRevoked,
            uint256 issuedAt
        )
    {
        DiplomaRecord memory record = diplomaRecords[_diplomaHash];

        if (record.issuedAt == 0) {
            // Not found on the blockchain
            return (false, false, 0);
        }

        return (!record.isRevoked, record.isRevoked, record.issuedAt);
    }

    /**
     * @notice Retrieves full diploma details (for public verification portals)
     * @param _diplomaHash The diploma hash
     * @return universityId ID of the issuing university
     * @return studentId    Student ID
     * @return issuedBy     Wallet address of the issuing university
     * @return issuedAt     Issuance timestamp
     * @return isRevoked    Revocation status
     * @return revokedAt    Revocation timestamp
     */
    function getDiplomaDetails(bytes32 _diplomaHash)
        external
        view
        diplomaExists(_diplomaHash)
        returns (
            string  memory universityId,
            string  memory studentId,
            address issuedBy,
            uint256 issuedAt,
            bool    isRevoked,
            uint256 revokedAt
        )
    {
        DiplomaRecord memory r = diplomaRecords[_diplomaHash];
        return (
            r.universityId,
            r.studentId,
            r.issuedBy,
            r.issuedAt,
            r.isRevoked,
            r.revokedAt
        );
    }

    /**
     * @notice Checks if a diploma has been revoked
     * @param _diplomaHash The diploma hash
     * @return bool true if it has been revoked
     */
    function isDiplomaRevoked(bytes32 _diplomaHash)
        external
        view
        returns (bool)
    {
        return diplomaRecords[_diplomaHash].isRevoked;
    }
}