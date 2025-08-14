// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ConsentToken {
    // Simple role model (no external deps): admin and operators
    address public admin;
    mapping(address => bool) public operators;

    struct Consent {
        address patient;
        string[] fhirResources; // E.g. ["Patient", "LabResult"]
        string[] purposes; // E.g. ["treatment", "research"]
        bool active;
        uint256 grantedAt;
        uint256 revokedAt;
    }

    mapping(uint256 => Consent) public consents;
    mapping(address => uint256[]) public patientConsents;
    uint256 public nextConsentId;

    event ConsentGranted(uint256 indexed consentId, address indexed patient, string[] fhirResources, string[] purposes);
    event ConsentUpdated(uint256 indexed consentId, string[] fhirResources, string[] purposes);
    event ConsentRevoked(uint256 indexed consentId, address indexed patient);
    event OperatorSet(address indexed operator, bool enabled);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyOperator() {
        require(operators[msg.sender] || msg.sender == admin, "Not operator");
        _;
    }

    function setOperator(address operator, bool enabled) external onlyAdmin {
        operators[operator] = enabled;
        emit OperatorSet(operator, enabled);
    }

    function grantConsent(string[] memory fhirResources, string[] memory purposes) external returns (uint256) {
        uint256 consentId = nextConsentId++;
        consents[consentId] = Consent({
            patient: msg.sender,
            fhirResources: fhirResources,
            purposes: purposes,
            active: true,
            grantedAt: block.timestamp,
            revokedAt: 0
        });
        patientConsents[msg.sender].push(consentId);
        emit ConsentGranted(consentId, msg.sender, fhirResources, purposes);
        return consentId;
    }

    // Admin/operator can grant on behalf of a patient (e.g., API wallet under hospital policy)
    function grantConsentFor(address patient, string[] memory fhirResources, string[] memory purposes) external onlyOperator returns (uint256) {
        require(patient != address(0), "Invalid patient");
        uint256 consentId = nextConsentId++;
        consents[consentId] = Consent({
            patient: patient,
            fhirResources: fhirResources,
            purposes: purposes,
            active: true,
            grantedAt: block.timestamp,
            revokedAt: 0
        });
        patientConsents[patient].push(consentId);
        emit ConsentGranted(consentId, patient, fhirResources, purposes);
        return consentId;
    }

    function updateConsent(uint256 consentId, string[] memory fhirResources, string[] memory purposes) external {
        Consent storage c = consents[consentId];
        require(c.patient == msg.sender, "Not your consent");
        require(c.active, "Consent not active");
        c.fhirResources = fhirResources;
        c.purposes = purposes;
        emit ConsentUpdated(consentId, fhirResources, purposes);
    }

    function revokeConsent(uint256 consentId) external {
        Consent storage c = consents[consentId];
        require(c.patient == msg.sender, "Not your consent");
        require(c.active, "Consent not active");
        c.active = false;
        c.revokedAt = block.timestamp;
        emit ConsentRevoked(consentId, msg.sender);
    }

    // Admin/operator can revoke any consent (policy-based revocation)
    function revokeConsentByAdmin(uint256 consentId) external onlyOperator {
        Consent storage c = consents[consentId];
        require(c.active, "Consent not active");
        c.active = false;
        c.revokedAt = block.timestamp;
        emit ConsentRevoked(consentId, c.patient);
    }

    function getConsent(uint256 consentId) external view returns (
        address, string[] memory, string[] memory, bool, uint256, uint256
    ) {
        Consent storage c = consents[consentId];
        return (c.patient, c.fhirResources, c.purposes, c.active, c.grantedAt, c.revokedAt);
    }

    function getPatientConsents(address patient) external view returns (uint256[] memory) {
        return patientConsents[patient];
    }
}
