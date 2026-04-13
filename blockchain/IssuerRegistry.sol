// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IssuerRegistry
 * @notice Manages the list of universities/issuers authorized to issue diplomas
 * @dev This contract must be deployed FIRST, before the DiplomaRegistry
 * @author VEDA System
 */
contract IssuerRegistry {

    // ─────────────────────────────────────────────
    //  STATE VARIABLES
    // ─────────────────────────────────────────────

    address public owner;

    struct Issuer {
        string  universityId;   // Unique university ID (e.g., "UNIV-001")
        string  universityName; // Full university name
        bool    isActive;       // Active/inactive status
        uint256 registeredAt;   // Registration timestamp
    }

    // Mapping from wallet address to issuer data
    mapping(address => Issuer) private issuers;

    // List of all issuer addresses (for iteration purposes)
    address[] private issuerList;


    // ─────────────────────────────────────────────
    //  EVENTS
    // ─────────────────────────────────────────────

    event IssuerAdded(
        address indexed issuerAddress,
        string universityId,
        string universityName,
        uint256 timestamp
    );

    event IssuerRemoved(
        address indexed issuerAddress,
        uint256 timestamp
    );

    event IssuerReactivated(
        address indexed issuerAddress,
        uint256 timestamp
    );

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );


    // ─────────────────────────────────────────────
    //  MODIFIERS
    // ─────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "IssuerRegistry: caller is not the owner");
        _;
    }

    modifier issuerExists(address _issuer) {
        require(bytes(issuers[_issuer].universityId).length > 0, "IssuerRegistry: issuer not found");
        _;
    }


    // ─────────────────────────────────────────────
    //  CONSTRUCTOR
    // ─────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
    }


    // ─────────────────────────────────────────────
    //  WRITE FUNCTIONS (Only Owner / App Admin)
    // ─────────────────────────────────────────────

    /**
     * @notice Registers a new university as an authorized issuer
     * @param _issuerAddress Wallet address of the university
     * @param _universityId  Unique university ID
     * @param _universityName Full name of the university
     */
    function addIssuer(
        address _issuerAddress,
        string calldata _universityId,
        string calldata _universityName
    ) external onlyOwner {
        require(_issuerAddress != address(0), "IssuerRegistry: invalid address");
        require(bytes(_universityId).length > 0, "IssuerRegistry: universityId cannot be empty");
        require(bytes(_universityName).length > 0, "IssuerRegistry: universityName cannot be empty");
        require(bytes(issuers[_issuerAddress].universityId).length == 0, "IssuerRegistry: issuer already registered");

        issuers[_issuerAddress] = Issuer({
            universityId:   _universityId,
            universityName: _universityName,
            isActive:       true,
            registeredAt:   block.timestamp
        });

        issuerList.push(_issuerAddress);

        emit IssuerAdded(_issuerAddress, _universityId, _universityName, block.timestamp);
    }

    /**
     * @notice Deactivates issuer access (soft delete)
     * @param _issuerAddress Wallet address of the issuer to be deactivated
     */
    function removeIssuer(address _issuerAddress)
        external
        onlyOwner
        issuerExists(_issuerAddress)
    {
        require(issuers[_issuerAddress].isActive, "IssuerRegistry: issuer already inactive");

        issuers[_issuerAddress].isActive = false;

        emit IssuerRemoved(_issuerAddress, block.timestamp);
    }

    /**
     * @notice Reactivates a previously deactivated issuer
     * @param _issuerAddress Wallet address of the issuer
     */
    function reactivateIssuer(address _issuerAddress)
        external
        onlyOwner
        issuerExists(_issuerAddress)
    {
        require(!issuers[_issuerAddress].isActive, "IssuerRegistry: issuer already active");

        issuers[_issuerAddress].isActive = true;

        emit IssuerReactivated(_issuerAddress, block.timestamp);
    }

    /**
     * @notice Transfers contract ownership to a new owner
     * @param _newOwner Address of the new owner
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "IssuerRegistry: new owner is zero address");
        emit OwnershipTransferred(owner, _newOwner);
        owner = _newOwner;
    }


    // ─────────────────────────────────────────────
    //  READ FUNCTIONS (Public, free)
    // ─────────────────────────────────────────────

    /**
     * @notice Checks if an address belongs to an active issuer
     * @param _issuerAddress Wallet address to check
     * @return bool true if active and registered
     */
    function isAuthorizedIssuer(address _issuerAddress) external view returns (bool) {
        return issuers[_issuerAddress].isActive;
    }

    /**
     * @notice Retrieves detailed issuer information
     * @param _issuerAddress Wallet address of the issuer
     * @return universityId   Unique university ID
     * @return universityName Full name of the university
     * @return isActive       Active/inactive status of the issuer
     * @return registeredAt   Timestamp when the issuer was registered
     */
    function getIssuerInfo(address _issuerAddress)
        external
        view
        issuerExists(_issuerAddress)
        returns (
            string memory universityId,
            string memory universityName,
            bool isActive,
            uint256 registeredAt
        )
    {
        Issuer memory i = issuers[_issuerAddress];
        return (i.universityId, i.universityName, i.isActive, i.registeredAt);
    }

    /**
     * @notice Retrieves the total number of registered issuers
     * @return uint256 Total number of issuers
     */
    function getTotalIssuers() external view returns (uint256) {
        return issuerList.length;
    }

    /**
     * @notice Retrieves an issuer's address by its index in the array
     * @param _index Index in the issuerList array
     * @return address Wallet address of the issuer
     */
    function getIssuerByIndex(uint256 _index) external view returns (address) {
        require(_index < issuerList.length, "IssuerRegistry: index out of bounds");
        return issuerList[_index];
    }
}