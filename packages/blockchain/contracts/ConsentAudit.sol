// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
contract ConsentAudit {
    address public admin;
    mapping(string=>mapping(string=>bool)) public consent;
    event ConsentGranted(string patientId,string dataCategory,address grantedBy);
    event ConsentRevoked(string patientId,string dataCategory,address revokedBy);
    event AccessLogged(string patientId,address actor,string dataCategory,bytes32 actionHash);
    modifier onlyAdmin(){ require(msg.sender==admin,"not admin"); _; }
    constructor(){ admin=msg.sender; }
    function grantConsent(string calldata patientId,string calldata dataCategory) external onlyAdmin { consent[patientId][dataCategory]=true; emit ConsentGranted(patientId,dataCategory,msg.sender); }
    function revokeConsent(string calldata patientId,string calldata dataCategory) external onlyAdmin { consent[patientId][dataCategory]=false; emit ConsentRevoked(patientId,dataCategory,msg.sender); }
    function checkConsent(string calldata patientId,string calldata dataCategory) external view returns(bool){ return consent[patientId][dataCategory]; }
    function logAccess(string calldata patientId,address actor,string calldata dataCategory,bytes32 actionHash) external { emit AccessLogged(patientId,actor,dataCategory,actionHash); }
}
