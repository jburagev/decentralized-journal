// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;


contract UserAuthority {

    address authority_address; // string, only journal authority can elevate user

    mapping(address => address) UsersSmartContractsAddrs;


    address [] public users;

    //mapping(address => uint) index;
    //address[] UsersAdresses;

    modifier onlyAuthority(){
        // default (unset) address type is 0x0
        if (authority_address == address(0) || msg.sender == authority_address ) _;
    }

    constructor(address authority) {
        authority_address = authority;
        //UsersSmartContracts.push(0x0000000000000000000000000000000000000000);
    }

    function usersSize() public view returns (uint) {
        return users.length;
    }
    
    function setAuthority(address _authority) public onlyAuthority {
        authority_address = _authority;
    }

    function getAuthority() external view returns (address) {
        return authority_address;
    }

    function getUserSmartContractAddr(address userAddr) external view returns (address){

        return UsersSmartContractsAddrs[userAddr];
    }


    function setUserSmartContractAddr(address userAddr,address userSmAddr) public onlyAuthority {

        UsersSmartContractsAddrs[userAddr] = userSmAddr;
        users.push(userAddr);
       
    }


    function deleteUserContractAddr(address userAddr) public onlyAuthority {

        //need to add if condition in case is not authority to return error
        UsersSmartContractsAddrs[userAddr] = 0x0000000000000000000000000000000000000000;
       
    }

}
