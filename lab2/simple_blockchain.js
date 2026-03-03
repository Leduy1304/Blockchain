
const crypto = require("crypto");

// =====================================
// LOP HASH (Ham tien ich)
// =====================================
function calculateHash(data) {
    return crypto.createHash("sha256")
        .update(JSON.stringify(data))
        .digest("hex");
}

// =====================================
// LOP BLOCK (Khoi blockchain)
// =====================================
class Block {
    constructor(index, timestamp, transactions, previousHash) {
        this.index = index;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.nonce = 0; // Number used once - su dung trong Proof of Work
        this.hash = this.calculateHash();
    }

    // Tinh hash cua block hien tai
    calculateHash() {
        const blockData = {
            index: this.index,
            timestamp: this.timestamp,
            transactions: this.transactions,
            previousHash: this.previousHash,
            nonce: this.nonce
        };
        return calculateHash(blockData);
    }

    // Chung minh cong viec (PoW - Proof of Work)
    // Tim nonce sao cho hash bat dau voi so luong so 0 bang difficulty
    mineBlock(difficulty) {
        const target = "0".repeat(difficulty);
        console.log(`⛏️  Mining block #${this.index} ...`);

        const startTime = Date.now();

        while (!this.hash.startsWith(target)) {
            this.nonce++;
            this.hash = this.calculateHash();

            // In tien do moi 50000 lan thu
            if (this.nonce % 50000 === 0) {
                process.stdout.write(`\r Tried: ${this.nonce} nonces`);
            }
        }

        const endTime = Date.now();
        const timeTaken = endTime - startTime;

        console.log(`\n✅ Block #${this.index} mined!`);
        console.log(`   Nonce: ${this.nonce}`);
        console.log(`   Hash: ${this.hash}`);
        console.log(`   Time: ${timeTaken}ms\n`);
    }
}

// =====================================
// LOP BLOCKCHAIN (Chuoi khoi)
// =====================================
class Blockchain {
    constructor(difficulty = 2) {
        this.chain = [];
        this.difficulty = difficulty;

        // Tao Genesis Block (khoi dau tien)
        console.log("Creating Genesis Block ...\n");
        const genesisBlock = new Block(
            0,
            new Date("2024-01-01").toISOString(),
            ["Genesis Block - khoi dau blockchain"],
            "0"
        );
        genesisBlock.mineBlock(this.difficulty);
        this.chain.push(genesisBlock);
    }

    // Lay block cuoi cung trong chain
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    // Them block moi vao blockchain
    addBlock(transactions) {
        const newBlock = new Block(
            this.chain.length,
            new Date().toISOString(),
            transactions,
            this.getLatestBlock().hash
        );
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
        return newBlock;
    }

    // Kiem tra blockchain co hop le hay khong?
    isChainValid() {
        console.log("\n--- VALIDATING BLOCKCHAIN ---\n");

        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            // Kiem tra hash cua block hien tai
            const recalculatedHash = currentBlock.calculateHash();
            if (currentBlock.hash !== recalculatedHash) {
                console.log(`❌ Block #${i}: Hash khong hop le`);
                console.log(`   Expected: ${recalculatedHash}`);
                console.log(`   Got:      ${currentBlock.hash}`);
                return false;
            }

            // Kiem tra previousHash tro toi block truoc
            if (currentBlock.previousHash !== previousBlock.hash) {
                console.log(`❌ Block #${i}: Previous hash khong hop le`);
                console.log(`   Expected: ${previousBlock.hash}`);
                console.log(`   Got:      ${currentBlock.previousHash}`);
                return false;
            }

            console.log(`✔ Block #${i}: valid`);
        }

        console.log("\n=== Blockchain hoan toan hop le ===\n");
        return true;
    }

    // Hien thi blockchain
    displayChain() {
        console.log("\n" + "=".repeat(80));
        console.log("BLOCKCHAIN CHAIN");
        console.log("=".repeat(80) + "\n");

        this.chain.forEach((block, idx) => {
            console.log(`🔹 Block #${block.index}`);
            console.log(`   Timestamp: ${block.timestamp}`);
            console.log(`   Transactions: ${block.transactions.length}`);

            if (block.transactions.length > 0) {
                block.transactions.slice(0, 2).forEach(tx => {
                    console.log(`     ${tx}`);
                });
                if (block.transactions.length > 2) {
                    console.log(`     ... (${block.transactions.length - 2} more)`);
                }
            }

            console.log(`   Previous Hash: ${block.previousHash}...`);
            console.log(`   Hash:          ${block.hash}...`);
            console.log(`   Nonce:         ${block.nonce}`);
            console.log("");
        });

        console.log("=".repeat(80) + "\n");
    }
}

// =====================================
// THUC HANH BLOCKCHAIN
// =====================================
console.log("=".repeat(100));
console.log("XÂY DỰNG BLOCKCHAIN CƠ BẢN CÙNG DUYLE");
console.log("=".repeat(100) + "\n");

const blockchain = new Blockchain(2); // difficulty = 2

// Them block 1
console.log("THEM BLOCK 1");
blockchain.addBlock([
    "TX1: DUY -> A: 10 BTC",
    "TX2: DUNG -> C: 5 BTC"
]);

// Them block 2
console.log("THEM BLOCK 2");
blockchain.addBlock([
    "TX3: THIEN -> KIET: 7 BTC",
    "TX4: HUNG -> THINH: 3 BTC",
    "TX5: NHAN -> HUY: 2 BTC"
]);

// Them block 3
console.log("THEM BLOCK 3");
blockchain.addBlock([
    "TX6: ANHBATOCOM -> MESSI: 8 BTC"
]);

// Hien thi blockchain
blockchain.displayChain();

// Kiem tra tinh hop le
blockchain.isChainValid();

// =====================================
// CO TINH GIA MAO NOI DUNG
// =====================================
console.log("THU GIA MAO NOI DUNG");
console.log("Buoc 1: Sua transaction trong block #1\n");

console.log(blockchain.chain[1].transactions[0]);
blockchain.chain[1].transactions[0] =
    blockchain.chain[1].transactions[0] + "AAAA";
console.log(blockchain.chain[1].transactions[0]);

console.log("\nBuoc 2: Kiem tra blockchain lai\n");
const isValid = blockchain.isChainValid();

if (!isValid) {
    console.log("✔ ĐÃ PHÁT HIỆN THÀNH CÔNG SỰ THAY ĐỔI !");
    console.log("✔ Blockchain BẢO VỆ DỮ LIỆU KHỎI THAY ĐỔI KHÔNG ĐƯỢC PHÉP!\n");
}
/*
Câu 6: Merkle Tree có lợi ích gì so với việc hash toàn bộ dữ liệu cùng lúc?
Merkle Tree cho phép xác minh nhanh, 
tiết kiệm tài nguyên và đảm bảo toàn vẹn dữ liệu mà không cần xử lý toàn bộ dữ liệu mỗi lần.
Vd: 
Tx1 = "A chuyển B 10k"
Tx2 = "B chuyển C 5k"
Tx3 = "C chuyển D 2k"
Tx4 = "D chuyển A 1k"

Kết quả hash:
H1 = hash(Tx1)
H2 = hash(Tx2)
H3 = hash(Tx3)
H4 = hash(Tx4)

H12 = hash(H1 + H2)
H34 = hash(H3 + H4)

Merkle Root = hash(H12 + H34)

Câu 7: Nonce là gì? Tại sao cần Nonce?
Trong blockchain, Nonce là con số mà thợ đào (miner) thử đi thử lại để tìm ra hash thỏa điều kiện (ví dụ: bắt đầu bằng nhiều số 0).

Vì hash không thể đoán trước. Hàm hash (như SHA-256):
+ Không thể “tính ngược”
+ Chỉ có cách thử – sai (brute force)
-> Nonce là biến số duy nhất có thể thay đổi để tạo ra hash mới.
Vd: 
Data = "Block 100 | Tx list | Previous Hash"
hash(Data + Nonce)
Hash phải bắt đầu bằng "0000"

Câu 8: Khi bạn sửa một block trong blockchain, điểu gì sẻ xảy ra?
Hash của block đó thay đổi ngay lập tức. Block chứa:
+ Dữ liệu
+ Previous Hash
+ Nonce
Chỉ cần sửa 1 ký tự dữ liệu
->  Hash của block bị đổi hoàn toàn.

Câu 9: blockchain khác gì so với database truyền thống về tính bảo mật?
Blockchain bảo mật bằng toán học & mạng lưới, database bảo mật bằng quyền quản trị. 
Blockchain không thay thế hoàn toàn database:
+ Chậm
+ Tốn tài nguyên
+ Không phù hợp CRUD thường xuyên
Dùng khi:
+ Cần chống sửa dữ liệu
+ Không tin cậy bên trung gian

Câu 10: Nêu 3 ứng dụng thực tế của Blockchain ( ngoài tiền tệ điện tử) mà bạn biết hoặc tìm hiểu được?
- Chuỗi cung ứng: truy xuất dữ liệu - chống hàng giả.
- Vé điện tử: Đi xem phim, xem các concert.
- Bản quyền nội dung mạng: âm nhạc, hình ảnh.



*/