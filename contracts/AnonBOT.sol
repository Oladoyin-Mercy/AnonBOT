// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AnonBOT — On-Chain Anonymous Feedback Protocol for BOTChain
 * @notice Allows room creators to establish feedback rooms and participants to anchor
 * cryptographic verification proofs without revealing sender wallet addresses.
 * 
 * Architecture:
 * - Room Metadata & Settings are managed on-chain by the creator.
 * - Sensitive Feedback Text is stored in decentralized or designated secure storage.
 * - Feedback Verification Proof (SHA-256 payloadHash, anonymous ID, timestamp, category)
 *   is permanently recorded on BOTChain.
 */
contract AnonBOT {
    // --- Data Structures ---

    enum Category {
        General,
        Positive,
        Constructive,
        Question
    }

    struct Room {
        address creator;
        string title;
        string question;
        uint64 createdAt;
        uint64 expiresAt;
        bool isActive;
        bool allowMultiple;
        uint32 feedbackCount;
    }

    struct FeedbackRecord {
        string anonymousId;    // e.g. "ANON-7F3A91"
        bytes32 payloadHash;   // sha256(content + roomId + anonId + timestamp)
        Category category;
        uint64 timestamp;
    }

    // --- Storage ---

    // Room ID => Room Metadata
    mapping(string => Room) public rooms;
    
    // Room ID => Feedback Index => Feedback Record
    mapping(string => mapping(uint256 => FeedbackRecord)) public feedbackRecords;

    // List of room IDs created by an address
    mapping(address => string[]) private creatorRooms;

    // Total rooms count
    uint256 public totalRooms;

    // --- Events ---

    event RoomCreated(
        string indexed roomId,
        address indexed creator,
        string title,
        string question,
        uint64 createdAt,
        uint64 expiresAt,
        bool allowMultiple
    );

    event RoomStatusChanged(
        string indexed roomId,
        bool isActive
    );

    event FeedbackRecorded(
        string indexed roomId,
        string anonymousId,
        bytes32 payloadHash,
        Category category,
        uint64 timestamp,
        uint256 feedbackIndex
    );

    // --- Errors ---

    error RoomAlreadyExists(string roomId);
    error RoomNotFound(string roomId);
    error RoomClosed(string roomId);
    error RoomExpired(string roomId);
    error UnauthorizedCreator(string roomId, address caller);
    error InvalidInput();

    // --- Modifiers ---

    modifier onlyRoomCreator(string calldata roomId) {
        if (rooms[roomId].creator == address(0)) revert RoomNotFound(roomId);
        if (rooms[roomId].creator != msg.sender) revert UnauthorizedCreator(roomId, msg.sender);
        _;
    }

    // --- Core Functions ---

    /**
     * @notice Creates a new feedback room on BOTChain
     * @param roomId Unique alphanumeric slug or identifier for the room
     * @param title Title/Topic of the feedback room
     * @param question The specific question for the room
     * @param durationSeconds Expiration duration in seconds (0 for no expiration)
     * @param allowMultiple Whether the same anonymous participant can submit multiple times
     */
    function createRoom(
        string calldata roomId,
        string calldata title,
        string calldata question,
        uint64 durationSeconds,
        bool allowMultiple
    ) external {
        if (bytes(roomId).length == 0 || bytes(title).length == 0 || bytes(question).length == 0) {
            revert InvalidInput();
        }
        if (rooms[roomId].creator != address(0)) {
            revert RoomAlreadyExists(roomId);
        }

        uint64 createdAt = uint64(block.timestamp);
        uint64 expiresAt = durationSeconds > 0 ? createdAt + durationSeconds : 0;

        rooms[roomId] = Room({
            creator: msg.sender,
            title: title,
            question: question,
            createdAt: createdAt,
            expiresAt: expiresAt,
            isActive: true,
            allowMultiple: allowMultiple,
            feedbackCount: 0
        });

        creatorRooms[msg.sender].push(roomId);
        totalRooms++;

        emit RoomCreated(
            roomId,
            msg.sender,
            title,
            question,
            createdAt,
            expiresAt,
            allowMultiple
        );
    }

    /**
     * @notice Allows the creator to toggle room status (active/closed)
     * @param roomId The room identifier
     * @param isActive New status
     */
    function setRoomStatus(string calldata roomId, bool isActive) external onlyRoomCreator(roomId) {
        rooms[roomId].isActive = isActive;
        emit RoomStatusChanged(roomId, isActive);
    }

    /**
     * @notice Records an anonymous feedback proof on-chain
     * @dev Does not expose submitter wallet to the recipient
     * @param roomId Unique room identifier
     * @param anonymousId The generated per-room anonymous pseudonym (e.g. "ANON-7F3A91")
     * @param payloadHash Cryptographic SHA-256 hash of the feedback payload
     * @param category Enum indicating feedback type (General, Positive, Constructive, Question)
     */
    function recordFeedback(
        string calldata roomId,
        string calldata anonymousId,
        bytes32 payloadHash,
        Category category
    ) external returns (uint256 feedbackIndex) {
        Room storage room = rooms[roomId];
        if (room.creator == address(0)) revert RoomNotFound(roomId);
        if (!room.isActive) revert RoomClosed(roomId);
        if (room.expiresAt > 0 && block.timestamp > room.expiresAt) revert RoomExpired(roomId);
        if (bytes(anonymousId).length == 0 || payloadHash == bytes32(0)) revert InvalidInput();

        feedbackIndex = room.feedbackCount;
        uint64 timestamp = uint64(block.timestamp);

        feedbackRecords[roomId][feedbackIndex] = FeedbackRecord({
            anonymousId: anonymousId,
            payloadHash: payloadHash,
            category: category,
            timestamp: timestamp
        });

        room.feedbackCount++;

        emit FeedbackRecorded(
            roomId,
            anonymousId,
            payloadHash,
            category,
            timestamp,
            feedbackIndex
        );
    }

    // --- View Functions ---

    /**
     * @notice Retrieves room details
     */
    function getRoom(string calldata roomId) external view returns (Room memory) {
        if (rooms[roomId].creator == address(0)) revert RoomNotFound(roomId);
        return rooms[roomId];
    }

    /**
     * @notice Returns all room IDs created by an address
     */
    function getRoomsByCreator(address creator) external view returns (string[] memory) {
        return creatorRooms[creator];
    }

    /**
     * @notice Returns the total count of feedback items in a room
     */
    function getFeedbackCount(string calldata roomId) external view returns (uint32) {
        return rooms[roomId].feedbackCount;
    }

    /**
     * @notice Returns a specific feedback record verification proof
     */
    function getFeedbackRecord(
        string calldata roomId,
        uint256 index
    ) external view returns (FeedbackRecord memory) {
        if (index >= rooms[roomId].feedbackCount) revert InvalidInput();
        return feedbackRecords[roomId][index];
    }

    /**
     * @notice Verifies if a submitted hash matches the anchored on-chain record
     */
    function verifyProof(
        string calldata roomId,
        uint256 index,
        bytes32 calculatedHash
    ) external view returns (bool isValid, uint64 timestamp, string memory anonymousId) {
        if (index >= rooms[roomId].feedbackCount) return (false, 0, "");
        FeedbackRecord memory record = feedbackRecords[roomId][index];
        isValid = (record.payloadHash == calculatedHash);
        return (isValid, record.timestamp, record.anonymousId);
    }
}
