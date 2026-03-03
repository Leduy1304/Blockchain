// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Import contract NFT vừa tạo
import "./SimpleNFT.sol";

contract NFTMarketplace {
    SimpleNFT public nftContract;

    // Struct lưu thông tin món hàng đang bán
    struct Listing {
        address seller;
        uint price;
        bool active;
    }

    mapping(uint => Listing) public listings;

    // Sự kiện khi có người mua thành công
    event ItemBought(uint indexed tokenId, address seller, address buyer, uint price);

    constructor(address _nftContractAddress) {
        nftContract = SimpleNFT(_nftContractAddress);
    }

    // HÀM 1: Đăng bán (List)
    function listNFT(uint tokenId, uint price) public {
        require(nftContract.ownerOf(tokenId) == msg.sender, "You are not the owner");
        require(price > 0, "Price must be > 0");

        // Phải approve (ủy quyền) cho Marketplace trước khi gọi hàm này
        // (Sẽ hướng dẫn ở bước thao tác)
        
        // Chuyển NFT từ ví người bán vào ví của Contract Marketplace
        nftContract.transferFrom(msg.sender, address(this), tokenId);

        listings[tokenId] = Listing({
            seller: msg.sender,
            price: price,
            active: true
        });
    }

    // HÀM 2: Mua hàng (Buy) - Tính cả Royalty
    function buyNFT(uint tokenId) public payable {
        Listing storage listing = listings[tokenId];
        require(listing.active, "Item is not for sale");
        require(msg.value >= listing.price, "Not enough ETH sent");

        address seller = listing.seller;
        address creator = nftContract.creators(tokenId);
        uint price = listing.price;

        // Tính toán Royalty (5% cho Creator)
        uint royalty = (price * 5) / 100;
        uint amountToSeller = price - royalty;

        // 1. Chuyển Royalty cho Creator
        payable(creator).transfer(royalty);

        // 2. Chuyển phần còn lại cho Seller
        payable(seller).transfer(amountToSeller);

        // 3. Chuyển NFT từ Contract Marketplace cho Buyer
        nftContract.transferFrom(address(this), msg.sender, tokenId);

        // 4. Tắt trạng thái bán (hoặc xóa listing)
        listings[tokenId].active = false;

        emit ItemBought(tokenId, seller, msg.sender, price);
    }
}