// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ImageStorage {
    struct Record {
        string cid1;
        string cid2;
        bytes32 imageHash;
        address owner;
        uint256 timestamp;
    }

    uint256 public nextRecordId = 1;

    mapping(uint256 => Record) public records;

    event RecordStored(
        uint256 indexed recordId,
        string cid1,
        string cid2,
        bytes32 imageHash,
        address owner,
        uint256 timestamp
    );

    function storeRecord(
        string calldata cid1,
        string calldata cid2,
        bytes32 imageHash
    ) external returns (uint256) {
        require(bytes(cid1).length > 0, "cid1 empty");
        require(bytes(cid2).length > 0, "cid2 empty");
        require(imageHash != bytes32(0), "invalid hash");

        uint256 recordId = nextRecordId++;

        records[recordId] = Record({
            cid1: cid1,
            cid2: cid2,
            imageHash: imageHash,
            owner: msg.sender,
            timestamp: block.timestamp
        });

        emit RecordStored(
            recordId,
            cid1,
            cid2,
            imageHash,
            msg.sender,
            block.timestamp
        );

        return recordId;
    }

    function getRecord(
        uint256 recordId
    )
        external
        view
        returns (
            string memory cid1,
            string memory cid2,
            bytes32 imageHash,
            address owner,
            uint256 timestamp
        )
    {
        Record memory r = records[recordId];
        return (r.cid1, r.cid2, r.imageHash, r.owner, r.timestamp);
    }
}
