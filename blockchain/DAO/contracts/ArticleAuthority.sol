//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;


contract ArticlesAuthority {

    address authority_address; // string, only journal authority can elevate user

    mapping(string => address) ArticlesSmartContractsAddrs;

    string [] public articles;

    modifier onlyAuthority(){
        // default (unset) address type is 0x0
        if (authority_address == address(0) || msg.sender == authority_address ) _;
    }


    constructor(address authority) {
        authority_address = authority;
    }

    function usersSize() public view returns (uint) {
        return articles.length;
    }

    // functions

    function articlesSize() public view returns (uint) {
        return articles.length;
    }

    function setAuthority(address _authority) public onlyAuthority {
        authority_address = _authority;
    }

     function getAuthority() external view returns (address) {
        return authority_address;
    }

    function getArticleSmartContractAddr(string memory articleId) external view returns (address){

        return ArticlesSmartContractsAddrs[articleId];
    }

    function deleteArticleContractAddr(string memory articleId) public onlyAuthority {

        //need to add if condition in case is not authority to return error
        ArticlesSmartContractsAddrs[articleId] = 0x0000000000000000000000000000000000000000;
       
    }

    function setArticleSmartContractAddr(string memory articleId,address articleSmAddr) public onlyAuthority {

        ArticlesSmartContractsAddrs[articleId] = articleSmAddr;
        articles.push(articleId);
       
    }

}