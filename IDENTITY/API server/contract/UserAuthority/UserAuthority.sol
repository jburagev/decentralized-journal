// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;


contract UserAuthority {

    address authority_address; // string, only journal authority can elevate user

    mapping(address => address) UsersSmartContractsAddrs;

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

    
    function setAuthority(address _authority) public onlyAuthority {
        authority_address = _authority;
    }

    function getAuthority() external view returns (address) {
        return authority_address;
    }
/*
    function getUserSmartContractAddr(address currentUser) external view returns (address){

        return UsersSmartContracts[index[currentUser]];
    }
*/
    function getUserSmartContractAddr(address userAddr) external view returns (address){

        return UsersSmartContractsAddrs[userAddr];
    }

/*
    function inArray(address who) public view returns (bool) {
        // address 0x0 is not valid if pos is 0 is not in the array
        if (who != 0x0000000000000000000000000000000000000000 && index[who] > 0) {
            return true;
        }
        return false;
    }
*/
/*
    function addUserSmartContractAddr(address userAddr) public onlyAuthority {

        if (!inArray(userAddr)) {

         UsersSmartContracts.push(userAddr);

        index[userAddr] = UsersSmartContracts.length;

            
        }
       
    }
*/
    function setUserSmartContractAddr(address userAddr,address userSmAddr) public onlyAuthority {

        UsersSmartContractsAddrs[userAddr] = userSmAddr;
       
    }

}
