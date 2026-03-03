// SPDX-License-Identifier: MIT
// Giấy phép mã nguồn mở MIT: Cho phép bất kỳ ai sử dụng, sao chép, sửa đổi đoạn mã này miễn phí.
// Thẻ này là bắt buộc để trình biên dịch Solidity hiểu được quyền sử dụng của file.

pragma solidity ^0.8.0;
// Khai báo phiên bản trình biên dịch Solidity.
// ^0.8.0 có nghĩa là code này chạy được trên phiên bản từ 0.8.0 trở lên.

contract Crowdfunding {
    // KHAI BÁO BIẾN TRẠNG THÁI (STATE VARIABLES)
    // Các biến này được lưu trữ vĩnh viễn trên Blockchain. Tốn phí gas để thay đổi chúng.

    address public owner;
    // Lưu địa chỉ ví Ethereum của người tạo ra hợp đồng (Chủ dự án).
    // 'public' cho phép bất kỳ ai (hoặc các hợp đồng khác) có thể đọc được biến này.

    uint public goal;
    // Lưu mục tiêu số tiền cần gọi vốn (tính theo đơn vị nhỏ nhất là Wei).
    // Ví dụ: 1 ETH = 1,000,000,000,000,000,000 Wei.

    uint public deadline;
    // Lưu thời điểm kết thúc chiến dịch (tính bằng Timestamp - số giây tính từ năm 1970).

    uint public totalRaised;
    // Lưu tổng số tiền đã được quyên góp thành công đến thời điểm hiện tại.

    bool public withdrawn;
    // Biến logic (true/false) để kiểm tra xem chủ dự án đã rút tiền chưa.
    // Tránh việc chủ dự án rút tiền nhiều lần.

    // MAPPING (BẢN ĐỒ) - Lưu trữ dữ liệu dạng Key-Value (Khóa - Giá trị)
    mapping(address => uint) public contributions;
    // Lưu trữ số tiền MỖI người dùng đã đóng góp.
    // Key: address (địa chỉ ví của người góp).
    // Value: uint (số tiền người đó đã góp).

    // EVENTS (SỰ KIỆN)
    // Sự kiện dùng để ghi log vào Blockchain. Các ứng dụng bên ngoài (như website) 
    // có thể "lắng nghe" sự kiện này để cập nhật giao diện ngay lập tức mà không cần hỏi liên tục.

    event ContributionReceived(address contributor, uint amount);
    // Sự kiện phát ra khi có ai đó góp tiền thành công. Ghi lại ai góp và góp bao nhiêu.

    event FundsWithdrawn(address owner, uint amount);
    // Sự kiện phát ra khi chủ dự án rút tiền thành công.

    event RefundIssued(address contributor, uint amount);
    // Sự kiện phát ra khi hoàn tiền cho nhà đầu tư (khi dự án thất bại).

    // CONSTRUCTOR (HÀM KHỞI TẠO)
    // Hàm này chỉ chạy MỘT LẦN DUY NHẤT ngay khi hợp đồng được triển khai (Deploy).
    constructor(uint _goal, uint _duration) {
        owner = msg.sender; // Gán người đang gọi hàm deploy (msg.sender) làm chủ dự án (owner).
        goal = _goal;       // Lưu mục tiêu tiền vào biến 'goal'.

        // Tính thời gian kết thúc: Thời gian hiện tại của khối (block.timestamp) + thời gian chạy (_duration tính bằng giây).
        deadline = block.timestamp + _duration; 

        withdrawn = false;   // Khởi tạo trạng thái là chưa rút tiền.
    }

    // HÀM ĐÓNG GÓP TIỀN (CONTRIBUTE)
    // 'public': Ai cũng có thể gọi hàm này.
    // 'payable': Từ khóa quan trọng! Cho phép hàm này nhận ETH khi được gọi.
    function contribute() public payable {
        // require: Điều kiện bắt buộc. Nếu sai => hàm dừng lại, hoàn tác mọi thay đổi và trả về lỗi.
        require(block.timestamp < deadline, "Campaign ended"); // Kiểm tra: Chưa hết hạn mới được góp.
        require(msg.value > 0, "Must send ETH"); // Kiểm tra: Phải gửi đi kèm số ETH > 0 (msg.value là số tiền gửi).

        // Cộng số tiền vừa gửi vào tổng số tiền của người gửi trong Mapping.
        contributions[msg.sender] += msg.value;
        
        // Cộng vào tổng quỹ chung của dự án.
        totalRaised += msg.value;

        // Phát ra sự kiện để thế giới bên ngoài biết vừa có một giao dịch góp tiền.
        emit ContributionReceived(msg.sender, msg.value);
    }

    // HÀM RÚT TIỀN (WITHDRAW)
    // Chỉ chủ dự án gọi được hàm này khi chiến dịch thành công.
    function withdrawFunds() public {
        require(msg.sender == owner, "Only owner"); // Chỉ chủ dự án (owner) mới được gọi.
        require(block.timestamp >= deadline, "Not ended"); // Phải đã hết hạn (deadline) mới được rút.
        require(totalRaised >= goal, "Goal not met"); // Phải đạt mục tiêu gọi vốn mới được rút.
        require(!withdrawn, "Already withdrawn"); // Chưa được rút lần nào trước đó.

        // Đánh dấu là đã rút tiền rồi (ngăn chặn rút lần 2).
        withdrawn = true;

        // THỰC HIỆN CHUYỂN TIỀN (LOW-LEVEL CALL)
        // Gọi hàm 'call' của địa chỉ owner để chuyển ETH cho họ.
        // value: totalRaised -> Chuyển toàn bộ số tiền trong quỹ.
        // "" -> Dữ liệu đi kèm (không có).
        (bool success, ) = owner.call{value: totalRaised}("");
        
        // Kiểm tra xem việc chuyển tiền có thành công không. Nếu thất bại -> báo lỗi và hoàn tác.
        require(success, "Transfer failed");

        // Ghi log sự kiện rút tiền.
        emit FundsWithdrawn(owner, totalRaised);
    }

    // HÀM HOÀN TIỀN (REFUND)
    // Dành cho nhà đầu tư khi dự án thất bại (hết hạn mà không đạt mục tiêu).
    function refund() public {
        require(block.timestamp >= deadline, "Not ended"); // Đã hết hạn.
        require(totalRaised < goal, "Goal was met"); // Không đạt mục tiêu (thất bại).
        require(contributions[msg.sender] > 0, "No contribution"); // Người gọi hàm phải có đóng góp tiền trước đó.

        // Lưu số tiền cần hoàn lại vào biến tạm.
        uint amount = contributions[msg.sender];
        
        // Set số tiền đã đóng góp của người đó về 0 để họ không thể rút 2 lần (Re-entrancy attack protection cơ bản).
        contributions[msg.sender] = 0;

        // Chuyển tiền lại cho người yêu cầu hoàn tiền (msg.sender).
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Refund failed");

        // Ghi log sự kiện hoàn tiền.
        emit RefundIssued(msg.sender, amount);
    }


    // HÀM XEM THỜI GIAN CÒN LẠI (GET TIME LEFT)
    // 'view': Hàm chỉ đọc dữ liệu, không sửa đổi gì nên không tốn gas (hoặc tốn rất ít).
    function getTimeLeft() public view returns (uint) {
        if (block.timestamp >= deadline) {
            return 0; // Nếu đã hết hạn -> trả về 0.
        }
        // Trừ thời gian kết thúc cho thời gian hiện tại.
        return deadline - block.timestamp; 
    }


    // HÀM XEM TIẾN ĐỘ (GET PROGRESS)
    function getProgress() public view returns (uint) {
        // Công thức tính phần trăm: (Tổng tiền hiện tại * 100) / Mục tiêu.
        // Lưu ý: Solidity làm toán với số nguyên, nên phép chia sẽ bỏ phần thập phân.
        return (totalRaised * 100) / goal;
    }
}
