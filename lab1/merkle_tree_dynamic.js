const crypto = require('crypto');

function hash(data) {
    return crypto.createHash('sha256')
        .update(data)
        .digest('hex');
}

console.log("=== THỰC HÀNH: MERKLE TREE DYNAMIC ===\n");

function buildMerkleTree(transactions) {
    console.log(`${'='.repeat(50)}`);
    console.log(`MERKLE TREE WITH ${transactions.length} TRANSACTIONS`);
    console.log(`${'='.repeat(50)}\n`);

    let level = 0;

    // Level 0: hash từng transaction
    let currentLevel = transactions.map((text, idx) => {
        const h = hash(text);                 // ✅ SỬA tx -> text
        console.log(`[Level ${level}] TX${idx + 1}: ${text}`);
        console.log(`          -> ${h}\n`);
        return h;
    });

    // Các level phía trên
    while (currentLevel.length > 1) {
        level++;
        let nextLevel = [];

        for (let i = 0; i < currentLevel.length; i += 2) {
            let left = currentLevel[i];
            let right = (i + 1 < currentLevel.length) ? currentLevel[i + 1] : left;

            let parent = hash(left + right);

            console.log(`[Level ${level}]`);
            console.log(`  ${left}`);
            console.log(`+ ${right}`);
            console.log(`= ${parent}\n`);

            nextLevel.push(parent);           // ✅ BẮT BUỘC
        }

        currentLevel = nextLevel;
    }

    console.log(`MERKLE ROOT: ${currentLevel[0]}\n`);
    return currentLevel[0];
}

// ===== TEST DATA =====
const tx_2 = [
    "TX1: Duy -> A: 10",
    "TX2: B -> C: 5"
];

const tx_4 = [
    "TX1: Duy -> Kiet 10",
    "TX2: Kiet -> Hung 5",
    "TX3: Hung -> Thien 8",
    "TX4: Thien -> Thinh 3"
];

const tx_5 = [
    "TX1: Kiet -> Duy 10",
    "TX2: Duy -> Thien 5",
    "TX3: Thien -> Thinh 8",
    "TX4: Thinh -> Hung 3",
    "TX5: Hung -> Anh 100"
];

const tx_8 = [
    "TX1: Kiet -> Duy 10",
    "TX2: Duy -> Thien 5",
    "TX3: Thien -> Thinh 8",
    "TX4: Thinh -> Hung 3",
    "TX5: Hung -> Anh 2",
    "TX6: Hung -> Anh 7",
    "TX7: Hung -> Anh 4",
    "TX8: Hung -> Anh 6"
];

// ===== RUN =====
buildMerkleTree(tx_2);
buildMerkleTree(tx_4);
buildMerkleTree(tx_5);
buildMerkleTree(tx_8);
