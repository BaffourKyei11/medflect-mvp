// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ConsentToken {
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
