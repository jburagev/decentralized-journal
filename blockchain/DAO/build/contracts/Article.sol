//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./Journal_DID.sol";

import "./UserAuthority.sol";

contract Article {

    uint constant REQUIRED_VOTES = 3;
    uint constant VOTING_PERIOD_DURATION = 45 days;

    // address of the user (could be a reviewer/editor/...)
    address public authorAddress;

    address authtoritySMadress = 0x2c6398652F40970e1897B07F472684c4B431ec6f;

    enum ArticleStatus { none, voting, revise, done}

    string ipfsHash;
    ArticleStatus status;

    uint256 submissionTime;

    enum EditorDecision {ACCEPT,REJECT}
    uint8 public voteCount;
    mapping(address => EditorDecision) votes;
    address []  votesAdresses;
    int [] votesReturn;

    uint32 collateralTotal;
    mapping(address => uint256) requestTimes;
    mapping(address => uint32) collateralAmounts;
    mapping(address => bool) votingRights;



    // events triggered by specific actions (article submitted, accepted/rejected)
    event ArticleSubmitted(string articleId, string articleIpfsHash);


    constructor() {
        authorAddress = msg.sender;

    }

    // functions

    function vote(string memory decison) public{

        require(
            getUserRole(msg.sender) == JournalDID.Journal_usertype.EDITOR,
            "You must be a editor to vote for an acceptance of an article."
        );
        
        if(keccak256(bytes(decison))  == keccak256(bytes("ACCEPT"))){
 
            votes[msg.sender] = EditorDecision.ACCEPT;
            votesAdresses.push(msg.sender);
            votesReturn.push(1);
        }

        if(keccak256(bytes(decison))  == keccak256(bytes("REJECT"))){
            votes[msg.sender] = EditorDecision.REJECT;
            votesAdresses.push(msg.sender);
            votesReturn.push(0);
        }
            

    }

     function getUserRole(address userAddress) public view returns (JournalDID.Journal_usertype) {

         UserAuthority userAuth = UserAuthority(authtoritySMadress);

         address userDID = userAuth.getUserSmartContractAddr(userAddress);

         JournalDID userDIDSmartContract = JournalDID(userDID);
    

        return userDIDSmartContract.getType();
    }


    function getVotes() public view returns (int [] memory) {

        
/*
        for(uint i=0; i<votesAdresses.length; i++){
            if(votes[votesAdresses[i]] == EditorDecision.ACCEPT){
                votesReturn[i] = 1;
            }else{
                 votesReturn[i] = 0;
            }
            
        }
*/
        return votesReturn;
    }

}