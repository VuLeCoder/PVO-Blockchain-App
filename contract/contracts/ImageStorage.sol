// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ImageStorage {
    struct ImageRecord {
        bytes32 imageHash;
        address owner;
        uint256 timestamp;
        bool exists;
    }

    mapping(string => ImageRecord) private _records;

    event ImageStored(
        string indexed key,
        bytes32 indexed imageHash,
        address indexed owner,
        uint256 timestamp
    );

    modifier notEmpty(string calldata str) {
        require(bytes(str).length > 0, "Input string is empty");
        _;
    }

    function _generateKey(string calldata cid1, string calldata cid2) internal pure returns (string memory) {
        return string(abi.encodePacked(cid1, "_", cid2));
    }

    function storeRecord(
        string calldata cid1,
        string calldata cid2,
        bytes32 imageHash
    ) external notEmpty(cid1) notEmpty(cid2) {
        string memory key = _generateKey(cid1, cid2);
        
        require(imageHash != bytes32(0), "Hash cannot be zero");
        require(!_records[key].exists, "Record already exists on-chain");

        _records[key] = ImageRecord({
            imageHash: imageHash,
            owner: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });

        emit ImageStored(key, imageHash, msg.sender, block.timestamp);
    }

    function verifyRecord(
        string calldata cid1,
        string calldata cid2,
        bytes32 imageHash
    ) external view returns (bool) {
        string memory key = _generateKey(cid1, cid2);
        return _records[key].exists && _records[key].imageHash == imageHash;
    }

    function getRecord(
        string calldata key
    )
        external
        view
        returns (bytes32 imageHash, address owner, uint256 timestamp, bool exists)
    {
        ImageRecord storage r = _records[key];
        return (r.imageHash, r.owner, r.timestamp, r.exists);
    }
}
