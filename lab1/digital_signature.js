const crypto = require("crypto");
const fs = require("fs");

console.log("=== THỰC HÀNH: CHỮ KÝ SỐ & XÁC THỰC ===\n");

// Bước 1: Tạo cặp khóa
console.log("BƯỚC 1: TẠO CẶP KHÓA RSA\n");

const {generateKeyPairSync} = crypto;

const {publicKey, privateKey} = generateKeyPairSync('rsa',
    {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    }
);

console.log('Public Key (có thể chia sẻ): ');
console.log(publicKey);

console.log('Private Key (không được chia sẻ): ');
console.log(privateKey);

// Bước 2: Tạo chữ ký cho một thông điệp
const message = "Tôi, Lê Duy, chuyển 36 BTC cho Kiệt và Thiện";

const signer = crypto.createSign('sha256');
signer.update(message);
const signature  = signer.sign(privateKey, 'hex');

console.log('Thông điệp: '+message);
console.log('Chữ ký: '+signature);

// Bước 3: Xác minh chữ ký
console.log("\nBƯỚC 3: XÁC MINH CHỮ KÝ (phía người nhận)");

const verifier = crypto.createVerify('sha256');
verifier.update(message);
const isValid = verifier.verify(publicKey, signature, 'hex');
console.log('Thông điệp: '+message);
console.log('Kết quả xác minh: '+ ((isValid)?'Hợp lệ':'Không hợp lệ'));

// Bước 4: Thử giả mạo thông điệp
console.log('\nBƯỚC 4: THỬ GIẢ MẠO THÔNG ĐIỆP');
const fakeMessage =  "Tôi, Lê Duy, chuyển 36 BTC cho Kiệt và Thiện";
const verifierF = crypto.createVerify('sha256');
verifierF.update(fakeMessage);
const isValidF = verifierF.verify(publicKey, signature, 'hex');
console.log('Thông điệp: '+fakeMessage);
console.log('Kết quả xác minh: '+ ((isValidF)?'Hợp lệ':'Không hợp lệ'));

// Bước 5: Thử ký bằng khóa sai
console.log('\nBƯỚC 5: TRY VERIFY VỚI KHÓA CÔNG KHAI SAI');

const { publicKey: publicKey2 } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
    }
});

const verifierWrongKey = crypto.createVerify('sha256');
verifierWrongKey.update(message);
const isWrongKeyValid = verifierWrongKey.verify(publicKey2, signature, 'hex');

console.log('Public key khác: ' + publicKey2);
console.log('Thông điệp: '+fakeMessage);
console.log('Kết quả xác minh: '+ ((isWrongKeyValid)?'Hợp lệ':'Không hợp lệ'));