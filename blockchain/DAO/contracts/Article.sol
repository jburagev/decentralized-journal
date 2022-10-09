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

    enum ArticleStatus { NONE, VOTING, PUBLISHED,REJECTED}
    
    string ipfsHash;
    string cloudId;
    ArticleStatus status;

    uint256 submissionTime;
    uint256 publishonTime;

    enum EditorDecision {NONE,ACCEPT,REJECT}
    mapping(address => EditorDecision) votes;
    address []  votesAdresses;
    uint [] votesMatrix;

    uint32 collateralTotal;
    mapping(address => uint256) requestTimes;
    mapping(address => uint32) collateralAmounts;
    mapping(address => bool) votingRights;



    // events triggered by specific actions (article submitted, accepted/rejected)
    event ArticleSubmitted(string articleId, string articleIpfsHash);


    constructor() {
        authorAddress = msg.sender;
        status = ArticleStatus.VOTING;

    }

    // functions

    function vote(string memory decison) public{

        require(
            getUserRole(msg.sender) == JournalDID.Journal_usertype.EDITOR,
            "You must be a editor to vote for an acceptance of an article."
        );

        require(
           votes[msg.sender] == EditorDecision.NONE,
            "You already casted a vote for this article"
        );

        require(
            votesMatrix.length < REQUIRED_VOTES,
            "Article has been voted. You cannot sumbit the voting anymore."
        );

        
        
        if(keccak256(bytes(decison))  == keccak256(bytes("ACCEPT"))){
 
            votes[msg.sender] = EditorDecision.ACCEPT;
            votesAdresses.push(msg.sender);
            votesMatrix.push(1);

        }

        if(keccak256(bytes(decison))  == keccak256(bytes("REJECT"))){
            votes[msg.sender] = EditorDecision.REJECT;
            votesAdresses.push(msg.sender);
            votesMatrix.push(0);

        }

        if (votesMatrix.length == REQUIRED_VOTES) {
            makeDecision();
        }
            

    }

    function makeDecision() internal {

        uint votesSum = 0;

        for(uint i=0; i<votesMatrix.length; i++){
               votesSum = votesSum + votesMatrix[i];
        }

        //potential issue if required_votes is changed to 4 or 6 or so on
        if((votesSum / votesMatrix.length) * 100 > 50){
            status = ArticleStatus.PUBLISHED;
        }else{
             status = ArticleStatus.REJECTED;
        }

    }

     function getUserRole(address userAddress) public view returns (JournalDID.Journal_usertype) {

         UserAuthority userAuth = UserAuthority(authtoritySMadress);

         address userDID = userAuth.getUserSmartContractAddr(userAddress);

         JournalDID userDIDSmartContract = JournalDID(userDID);
    

        return userDIDSmartContract.getType();
    }


    function getVotes() public view returns (uint [] memory) {

        
/*
        for(uint i=0; i<votesAdresses.length; i++){
            if(votes[votesAdresses[i]] == EditorDecision.ACCEPT){
                votesReturn[i] = 1;
            }else{
                 votesReturn[i] = 0;
            }
            
        }
*/
        return votesMatrix;
    }

    function getVoteByAddress() public view returns (EditorDecision) {

        return votes[msg.sender];
    }

}