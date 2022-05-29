// SPDX-License-Identifier: MIT

pragma solidity >= 0.8.12;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@manifoldxyz/royalty-registry-solidity/contracts/specs/IEIP2981.sol";
import "@manifoldxyz/libraries-solidity/contracts/access/AdminControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


contract Gravity is ERC1155, AdminControl {
    
    mapping(address => bool) public _tokenClaimed;

    string[] private _uris;
    string private _name = "Gravity";

    uint256 public _ashPrice = 100*10**18; //100 A
    uint256 private _royaltyAmount; //in % 

    address public _ashContract = 0x4392329a8565E81E3C041034feAC84616fe9A722;
    // address public _ashContract = 0x64D91f12Ece7362F91A6f8E7940Cd55F05060b92;
    address private _royalties_recipient;
    address private _signer;

    bool public _mintOpened = false;

    
    constructor () ERC1155("") {
        _royalties_recipient = payable(msg.sender);
        _royaltyAmount = 10;
    } 

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC1155, AdminControl)
        returns (bool)
    {
        return
        AdminControl.supportsInterface(interfaceId) ||
        ERC1155.supportsInterface(interfaceId) ||
        interfaceId == type(IEIP2981).interfaceId ||
        super.supportsInterface(interfaceId);
    }

    function mintAllowed(uint8 v, bytes32 r, bytes32 s)internal view returns(bool){
        return(
            _signer ==
                ecrecover(
                    keccak256(
                        abi.encodePacked(
                            "\x19Ethereum Signed Message:\n32",
                            keccak256(
                                abi.encodePacked(
                                    msg.sender,
                                    address(this),
                                    _mintOpened,
                                    !_tokenClaimed[msg.sender]
                                )
                            )
                        )
                    )
                , v, r, s)
        );
    }

    function setSigner (address signer) external adminRequired{
        _signer = signer;
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function publicMint(
        address account,
        uint256 tokenId,
        uint8 v,
        bytes32 r, 
        bytes32 s
    ) external {
        require(mintAllowed( v, r, s), "Mint not allowed");
        IERC20(_ashContract).transferFrom(msg.sender, _royalties_recipient, _ashPrice);
        _mintBatch(account ,tokenId ,1 ,"0x00");
        _tokenClaimed[account] = true;
    }

    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts
    )external adminRequired{
        _mintBatch(to, ids, amounts, "0x0");
    }

    function toggleMintState()external adminRequired{
        _mintOpened = !_mintOpened;
    }

    function setURI(
        string[] calldata updatedURI
    ) external adminRequired{
        delete  _uris;
        _uris = updatedURI;
    }

    function addURI(
        string newURI
    ) external adminRequired{
        _uris.push(newURI);
    }

    function uri(uint256 tokenId) public view virtual override returns (string memory) {
        return _uris[tokenId];
    }

    function burn(uint256 tokenId, uint256 quantity) external {
        _burn(msg.sender, tokenId, quantity);
    }

    function burnBatch(
        uint256[] memory ids,
        uint256[] memory amounts
    )external{
        _burnBatch(msg.sender, ids, amounts);
    }

    function setRoyalties(address payable _recipient, uint256 _royaltyPerCent) external adminRequired {
        _royalties_recipient = _recipient;
        _royaltyAmount = _royaltyPerCent;
    }

    function royaltyInfo(uint256 salePrice) external view returns (address, uint256) {
        if(_royalties_recipient != address(0)){
            return (_royalties_recipient, (salePrice * _royaltyAmount) / 100 );
        }
        return (address(0), 0);
    }

    function withdraw(address recipient) external adminRequired {
        payable(recipient).transfer(address(this).balance);
    }

}
