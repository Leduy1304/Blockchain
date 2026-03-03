// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VotingSystem {
    
    // --- Cấu trúc dữ liệu (Structs) ---
    struct Voter {
        uint weight;     // Trọng số vote
        bool voted;      // Đã vote chưa
        uint vote;       // Index của proposal đã vote
    }

    struct Proposal {
        string name;     // Tên ứng viên
        uint voteCount;  // Tổng vote nhận được
    }

    // --- Biến trạng thái (State Variables) ---
    address public chairperson; // Người quản trị (Chairman)
    mapping(address => Voter) public voters; // Danh sách cử tri
    Proposal[] public proposals; // Danh sách ứng viên

    // --- Constructor (Khởi tạo) ---
    // Nhận vào mảng tên ứng viên để tạo danh sách bầu cử
    constructor(string[] memory proposalNames) {
        chairperson = msg.sender;
        voters[chairperson].weight = 1; // Chairman mặc định có quyền (nếu cần)

        // Tạo danh sách ứng viên từ mảng tên đầu vào
        for (uint i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
        }
    }

    // --- Functions ---

    // Hàm Chairman cấp quyền vote cho người khác kèm theo trọng số (Weight)
    function giveRightToVote(address voter, uint weight) public {
        require(msg.sender == chairperson, "Only chairperson can give right to vote.");
        require(!voters[voter].voted, "The voter already voted.");
        require(voters[voter].weight == 0, "Voter already has voting rights.");

        voters[voter].weight = weight;
    }

    // Hàm Bỏ phiếu (Vote)
    function vote(uint proposalIndex) public {
        Voter storage sender = voters[msg.sender];

        // 1. Check quyền vote (Weight > 0)
        require(sender.weight > 0, "No right to vote");
        
        // 2. Check đã vote chưa
        require(!sender.voted, "Already voted");

        // 3. Đánh dấu đã vote
        sender.voted = true;
        sender.vote = proposalIndex;

        // 4. Cộng trọng số (Weight) vào ứng viên
        proposals[proposalIndex].voteCount += sender.weight;
    }

    // Hàm xem kết quả (Helper để dễ đọc)
    function getResults() public view returns (string[] memory, uint[] memory) {
        string[] memory names = new string[](proposals.length);
        uint[] memory counts = new uint[](proposals.length);

        for (uint i = 0; i < proposals.length; i++) {
            names[i] = proposals[i].name;
            counts[i] = proposals[i].voteCount;
        }
        return (names, counts);
    }
}