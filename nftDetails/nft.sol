// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';

contract Burnpfs is  ERC721URIStorage, Ownable {
    uint256 public mintPrice = 0 ether;
    uint256 public totalSupply;
    uint256 public maxSupply;
    bool public isMintEnabled;
    string private _baseContractURI = "https://peach-worldwide-trout-968.mypinata.cloud/ipfs/QmbYFe2NRcNwRaMskXPgTevSP2GnUGw7YUk13PHP2ZRdSq";
    string private _baseTokenURI = "https://example.com/";
        
    constructor(address initialOwner) payable ERC721('farcasterXarbitrum', 'FXA') Ownable(initialOwner){
        maxSupply = 2**256 - 1;
    }

    function setMintPrice(uint256 newPrice) external onlyOwner {
        require(newPrice >= 0, "Mint price cannot be negative");
        mintPrice = newPrice;
    }

    function toggleIsMintEnabled() external onlyOwner {
        isMintEnabled = !isMintEnabled;
    }

     function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }


     function setbaseURI(string memory _newBaseURI) external  onlyOwner returns (string memory) {
        return _baseContractURI = _newBaseURI;
    }
    
     function contractURI() external view returns (string memory) {
        return _baseContractURI;
    }

    function getTokenURI(uint tokenId) external view returns (string memory){
        return tokenURI(tokenId);
    }


    function setMaxSupply(uint _maxSupply) external onlyOwner {
        maxSupply = _maxSupply;
    }

    function getBaseURI() external view  onlyOwner returns (string memory)  {
        return _baseTokenURI;
    }

    function mint(string memory fid) external payable {
        require(msg.value == mintPrice, "Wrong value");   
        internalMint(msg.sender, fid);
    }
    function mintFor(address user, string memory fid) external onlyOwner {
        internalMint(user, fid);
    }

    function internalMint(address _addr, string memory fid) internal {
        require(isMintEnabled, "Mint must be enabled");
        require(balanceOf(_addr) < 1, "exceeds");
        totalSupply++;
        uint256 tokenId = totalSupply;
        _safeMint(_addr, tokenId);
        _setTokenURI(tokenId, fid);
    }

    function setTokenUri(uint tokenId, string memory fid) external onlyOwner {
        _setTokenURI(tokenId, fid);
    }


    function withdraw(address _addr) external onlyOwner(){
        uint256 balance = address(this).balance;
        payable(_addr).transfer(balance);
    }

}