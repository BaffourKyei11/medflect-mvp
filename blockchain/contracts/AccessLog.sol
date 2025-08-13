// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AccessLog {
    struct LogEntry {
        uint256 consentId;
        address actor;
        bytes32 actionHash; // hash of action details (off-chain reference)
        string actionType; // e.g. "read", "write", "ai_inference"
        uint256 timestamp;
    }

    LogEntry[] public logs;

    event AccessLogged(uint256 indexed logId, uint256 indexed consentId, address indexed actor, bytes32 actionHash, string actionType, uint256 timestamp);

    function logAccess(uint256 consentId, bytes32 actionHash, string calldata actionType) external returns (uint256) {
        logs.push(LogEntry({
            consentId: consentId,
            actor: msg.sender,
            actionHash: actionHash,
            actionType: actionType,
            timestamp: block.timestamp
        }));
        uint256 logId = logs.length - 1;
        emit AccessLogged(logId, consentId, msg.sender, actionHash, actionType, block.timestamp);
        return logId;
    }

    function getLog(uint256 logId) external view returns (uint256, address, bytes32, string memory, uint256) {
        LogEntry storage l = logs[logId];
        return (l.consentId, l.actor, l.actionHash, l.actionType, l.timestamp);
    }

    function getLogsCount() external view returns (uint256) {
        return logs.length;
    }
}
