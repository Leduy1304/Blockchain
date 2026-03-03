// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Import thư viện ERC721 từ OpenZeppelin
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SimpleNFT is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // Lưu trữ địa chỉ người tạo (Creator) của từng Token ID
    mapping(uint => address) public creators;

    constructor() ERC721("MyNFT", "MNFT") {}

    // Hàm Mint (Tạo NFT)
    function mint(address to, string memory tokenURI) public returns (uint) {
        _tokenIdCounter.increment();
        uint tokenId = _tokenIdCounter.current();

        // Đúc NFT cho địa chỉ 'to'
        _safeMint(to, tokenId);
        
        // Lưu địa chỉ người tạo vào mapping
        creators[tokenId] = to;
        
        // (Tùy chọn) Lưu URI (link ảnh) - Ở đây ta dùng hàm cơ bản của ERC721 để set URI
        _setTokenURI(tokenId, tokenURI);

        return tokenId;
    }

    // Hàm helper để set URI (cho đơn giản, dùng internal của ERC721URIStorage nếu import, 
    // nhưng ở đây ta viết đơn giản hóa hoặc map riêng. Để code gọn, ta dùng mapping riêng cho URI)
    mapping(uint => string) private _tokenURIs;

    function _setTokenURI(uint tokenId, string memory _tokenURI) internal {
        require(_ownerOf(tokenId) != address(0), "URI set of nonexistent token");
        _tokenURIs[tokenId] = _tokenURI;
    }

    function tokenURI(uint tokenId) public view override returns (string memory) {
        return _tokenURIs[tokenId];
    }
}