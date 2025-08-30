// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MomentMint is ERC721URIStorage, Ownable {
    uint256 public nextId = 1;
    uint256 public mintPrice = 0.0005 ether;
    address public payout;

    constructor(address _payout) ERC721("BlueTubeTV Moment", "MOMENT") Ownable(msg.sender) {
        payout = _payout;
    }

    function setMintPrice(uint256 weiPrice) external onlyOwner { mintPrice = weiPrice; }
    function setPayout(address p) external onlyOwner { payout = p; }

    function mint(string memory tokenURI) external payable {
        require(msg.value >= mintPrice, "Pay mintPrice");
        uint256 id = nextId++;
        _safeMint(msg.sender, id);
        _setTokenURI(id, tokenURI);
        if (payout != address(0)) payable(payout).transfer(address(this).balance);
    }

    function ownerMint(address to, string memory tokenURI) external onlyOwner {
        uint256 id = nextId++;
        _safeMint(to, id);
        _setTokenURI(id, tokenURI);
    }
}
