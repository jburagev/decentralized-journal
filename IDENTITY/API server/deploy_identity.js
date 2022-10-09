import { ethers } from 'ethers';
import { cyrb53 } from "./verify_identity.js";
import Web3 from 'web3';
import fs from 'fs';
import CONFIG from './config.js';
const web3 = new Web3(Web3.givenProvider || "HTTP://127.0.0.1:7545");
var authority_address = CONFIG.authority;

var default_user_data = {
    reader: [], //list of comments, saved articles...
    reviewer: [], // list of reviewed articles
    editor: [], //reputation
    author: [], // list of authored articles
};

var Journal_usertype = [ "READER", "REVIEWER", "EDITOR", "AUTHOR" ];

// add to list like: default_user_data.reader.push("<ipfs address>");
// convert to string before default_user_data = JSON.stringify(default_user_data);
//.parse for reverse

const provider = new ethers.providers.Web3Provider(web3.currentProvider);

export async function create(provider_name, wallet_pk, verifier = authority_address) {
    //https://dev.to/yosi/deploy-a-smart-contract-with-ethersjs-28no
    //const provider = new ethers.providers.InfuraProvider(provider_name, CONFIG.api_key);

    const provider = new ethers.providers.Web3Provider(web3.currentProvider);
    //const provider = ethers.providers.getDefaultProvider('rinkeby');
    var new_account = await web3.eth.accounts.create();
    console.log(new_account);
    console.log(wallet_pk);
    const wallet = new ethers.Wallet(wallet_pk, provider);
    const account = wallet.connect(provider);

    let rawdata = fs.readFileSync('./contract/JournalDID.json');
    let contractJson = JSON.parse(rawdata.toString()); 
    
    const factory = new ethers.ContractFactory(contractJson.abi, contractJson.data.bytecode.object, account)
    /* this was used for Rinkeby network via metamask
    const price = ethers.utils.formatUnits(await provider.getGasPrice(), 'gwei')
    const options = {gasLimit: 10000000, gasPrice: ethers.utils.parseUnits(price, 'gwei')}

    */
    //this is used for Ganache local
    const options = {gasLimit: 6721975, gasPrice: ethers.utils.parseUnits("1", 'gwei')}
    
    const user = await factory.deploy(options)
    await user.deployed()

    await user.setHash(cyrb53(String(new_account.privateKey)));
    await user.setAuthority(verifier);
    
    console.log("User contract deployed at: " + user.address);
    console.log("User address: " + new_account.address);
    fs.appendFileSync('created_accounts.txt', `${new Date().getTime()}: {contract: ${user.address}, account_password: ${new_account.privateKey}} \n`);

    update_UserAuthority_SmartContract_onCreate(user.address,"95a61e540fc42d7db8631b11451659a42098311309166ce5ad4aa0e5f11ab7b4",CONFIG.default_provider,new_account.address);

    return {"user_password": new_account.privateKey, "contract_address": user.address};
};


export async function read(contract, provider_name) {
    let rawdata = fs.readFileSync('./contract/JournalDID.json');
    let contractJson = JSON.parse(rawdata.toString()); 
    //var user = await getContractAt("JournalDID", String(contract));
    const provider = new ethers.providers.Web3Provider(web3.currentProvider);
    
    //var user = new ethers.Contract(contract, contractJson.abi, new ethers.providers.InfuraProvider(provider_name, CONFIG.api_key));
    var user = new ethers.Contract(contract, contractJson.abi, provider);
    
    var owner = await user.getOwner();
    var hash = await user.getHash();
    var type = await user.getType();
    var authority = await user.getAuthority();
    var user_data = await user.getUserData();
    user_data = JSON.parse(user_data);
    return {"owner": owner, "hash": hash, "type": Journal_usertype[type], "authority": authority, "user_data": user_data}
}

export async function getAllUsers() {
    let rawdataAuthority = fs.readFileSync('./contract/UserAuthority/UserAuthority.json');
    let contractAuthorityJson = JSON.parse(rawdataAuthority.toString()); 

    

    var authorityContract = new ethers.Contract(CONFIG.authority_SmartContract, contractAuthorityJson.abi, provider);

    var users = [];

    var usersSize = await authorityContract.usersSize();

      for(var i = 0; i < usersSize; i++) {

        var userAdress = await authorityContract.users(i);
        

        var userDidAdress = await authorityContract.getUserSmartContractAddr(userAdress);

        console.log(userDidAdress);

        let rawdata = fs.readFileSync('./contract/JournalDID.json');
        let contractJson = JSON.parse(rawdata.toString()); 
        var user = new ethers.Contract(userDidAdress, contractJson.abi, provider);

        var userType = await user.getType();

    
        users.push({"userAddres": userAdress.toLowerCase(), "userType":userType});
      }
    
    return users
}

export async function authorizeUser(userAdress) {
    let rawdataAuthority = fs.readFileSync('./contract/UserAuthority/UserAuthority.json');
    let contractAuthorityJson = JSON.parse(rawdataAuthority.toString()); 

    //var authorityContract = new ethers.Contract(CONFIG.authority_SmartContract, contractAuthorityJson.abi, new ethers.providers.InfuraProvider(CONFIG.default_provider, CONFIG.api_key));
    const provider = new ethers.providers.Web3Provider(web3.currentProvider);
    var authorityContract = new ethers.Contract(CONFIG.authority_SmartContract, contractAuthorityJson.abi, provider);
    
    var userDidAdress = await authorityContract.getUserSmartContractAddr(userAdress);

    if(userDidAdress != "0x0000000000000000000000000000000000000000"){

        let rawdataDid = fs.readFileSync('./contract/JournalDID.json');
        let contractDIDJson = JSON.parse(rawdataDid.toString()); 

        var user = new ethers.Contract(userDidAdress, contractDIDJson.abi, provider);

        var userType = await user.getType();
        console.log("User type" + userType);

        return userType;

    }else{

        return "User DID adress is not found";
    }


}

export async function vote(articleId,decision) {
    
    let rawdataAuthority = fs.readFileSync('./contract/ArticleAuthority/ArticlesAuthority.json');
    let contractAuthorityJson = JSON.parse(rawdataAuthority.toString()); 

    //var authorityContract = new ethers.Contract(CONFIG.authority_SmartContract, contractAuthorityJson.abi, new ethers.providers.InfuraProvider(CONFIG.default_provider, CONFIG.api_key));
    const provider = new ethers.providers.Web3Provider(web3.currentProvider);
    var authorityContract = new ethers.Contract(CONFIG.articlesAuthority_SmartContract, contractAuthorityJson.abi, provider);
    
    var articleDIDAdress = await authorityContract.getArticleSmartContractAddr(articleId);

    if(articleDIDAdress != "0x0000000000000000000000000000000000000000"){

        let rawdataDid = fs.readFileSync('./contract/Article.json');

        console.log(articleDIDAdress);
        let contractDIDJson = JSON.parse(rawdataDid.toString()); 

        var article = new ethers.Contract(userDidAdress, contractDIDJson.abi, provider);

        await article.vote(decision);
        //console.log("User type" + userType);

        //return userType;

        return (await article.getVotes())

    }else{

        return "Article DID adress is not found";
    }


}

export async function update_authority_values(userAdress, wallet_pk, provider_name, new_data) {
    //const provider = new ethers.providers.InfuraProvider(provider_name, CONFIG.api_key);
    const provider = new ethers.providers.Web3Provider(web3.currentProvider);
    const wallet = new ethers.Wallet(wallet_pk, provider);
    const account = wallet.connect(provider);
    let rawdata = fs.readFileSync('./contract/JournalDID.json');
    let contractJson = JSON.parse(rawdata.toString());

    let rawdataAuthority = fs.readFileSync('./contract/UserAuthority/UserAuthority.json');
    let contractAuthorityJson = JSON.parse(rawdataAuthority.toString()); 

    var authorityContract = new ethers.Contract(CONFIG.authority_SmartContract, contractAuthorityJson.abi, provider);

    var userDidAdress = await authorityContract.getUserSmartContractAddr(userAdress); 

    var user = new ethers.Contract(userDidAdress, contractJson.abi, account);
    var test = await user.getType()
    console.log("user type" + test);
    console.log(CONFIG.authority_SmartContract);
    console.log(userDidAdress);
    try {
        if (new_data.authority_address) {
            console.log("updating auth address");
            await user.setAuthority(String(new_data.authority_address));
        }
        if (new_data.type) {
            // TO DO When updating user type cannot be updated right away because of the smart contract interaction need to fix
            console.log("updating user type");
            if (new_data.type == 1) await user.setReviewerType();
            else if (new_data.type == 2) await user.setEditorType();
            else if (new_data.type == 3) await user.setAuthorType();
            else console.log("invalid type parameter value");
        }
        
        if (new_data.user_data) {
            console.log("updating user data");
            await user.setUserData(JSON.stringify(new_data.user_data));
        }

        return true;
    } catch (e) {
        console.log(e.message)
        return false;
    }
    
}

export async function update_UserAuthority_SmartContract_onCreate(contract, wallet_pk, provider_name, userAddr) {

    //const provider = new ethers.providers.InfuraProvider(provider_name, CONFIG.api_key);

    const provider = new ethers.providers.Web3Provider(web3.currentProvider);

    const wallet = new ethers.Wallet(wallet_pk, provider);
    const account = wallet.connect(provider);
    let rawdata = fs.readFileSync('./contract/UserAuthority/UserAuthority.json');
    let contractJson = JSON.parse(rawdata.toString()); 


    var authContract = new ethers.Contract(CONFIG.authority_SmartContract, contractJson.abi, account);
    
    try {
       
            console.log("updating user auth smart contract with user address and SM");

            await authContract.setUserSmartContractAddr(userAddr,contract);

            let rawdata = fs.readFileSync('./contract/JournalDID.json');
            let contractJson = JSON.parse(rawdata.toString()); 
            
            const UserDID = new ethers.Contract(contract,contractJson.abi,account)

            await UserDID.setAuthority(CONFIG.authority);

            return {"info": "User succefsully added to authority Smart contract!"};
       
    } catch (e) {
        console.log(e.message)
        return {"info": "error while adding to Authority smart conctract!"};
    }
    
}


export async function update_ArticleAuthority_SmartContract_onCreate(articleId,contract) {
    //const provider = new ethers.providers.InfuraProvider(CONFIG.default_provider, CONFIG.api_key);
    const wallet = new ethers.Wallet(CONFIG.wallet_pk, provider);
    const account = wallet.connect(provider);
    let rawdata = fs.readFileSync('./contract/ArticleAuthority/ArticlesAuthority.json');
    let contractJson = JSON.parse(rawdata.toString()); 


    var authContract = new ethers.Contract(CONFIG.articlesAuthority_SmartContract, contractJson.abi, account);
    
    try {
       
            console.log("updating Articles auth smart contract with article address and SM");

            await authContract.setArticleSmartContractAddr(articleId,contract);

            let rawdata = fs.readFileSync('./contract/Article.json');
            let contractJson = JSON.parse(rawdata.toString()); 

            console.log("Updated Articles smart contract");
            
            const ArticleSmartContract = new ethers.Contract(contract,contractJson.abi,account)

            await ArticleSmartContract.setCloudId(articleId);

            return {"info": "Article succefsully added to authority Smart contract!"};
       
    } catch (e) {
        console.log(e.message)
        return {"info": "error while adding Article to Authority smart conctract!"};
    }

}

export async function update_owner_values(contract, wallet_pk, provider_name, new_data) {
    //const provider = new ethers.providers.InfuraProvider(provider_name, CONFIG.api_key);
    const wallet = new ethers.Wallet(wallet_pk, provider);
    const account = wallet.connect(provider);
    let rawdata = fs.readFileSync('./contract/JournalDID.json');
    let contractJson = JSON.parse(rawdata.toString()); 
    var user = new ethers.Contract(contract, contractJson.abi, account);
    
    try {
        if (new_data.new_user) {
            console.log("updating user", new_data.new_user.user_address, new_data.new_user.privateKey)
            var data = await user.changeOwner(String(new_data.new_user.user_address), cyrb53(String(new_data.new_user.private_key)));
            console.log(data.hash)
        }
        return true;
    } catch (e) {
        console.log(e.message)
        return false;
    }
}

export async function delete_user(contract, wallet_pk, provider_name) {
    //const provider = new ethers.providers.InfuraProvider(provider_name, CONFIG.api_key);
    const wallet = new ethers.Wallet(wallet_pk, provider);
    const account = wallet.connect(provider);
    let rawdata = fs.readFileSync('./contract/JournalDID.json');
    let contractJson = JSON.parse(rawdata.toString()); 
    var user = new ethers.Contract(contract, contractJson.abi, account);
    try {
        var data = await user.changeOwner(String("0x0000000000000000000000000000000000000000"), "0");
        console.log(data.hash)
        return true;
    } catch (e) {
        console.log(e.message)
        return false;
    }
}

