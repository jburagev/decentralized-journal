import { Component, OnInit } from '@angular/core';
import { MetaMaskInpageProvider } from "@metamask/providers";
import Web3 from 'web3';
import {ContractFactory, ethers} from "ethers";
import JournalDIDAbi from "../../assets/Abis/JournalDID.json"
declare let require: any;
import { HttpClient } from '@angular/common/http';
import {AppSettings} from '../appSettings';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})


export class HomeComponent implements OnInit {

  constructor(private http: HttpClient) { 
    
  }
  foundAccountMetamask:boolean = false
  foundAccountJournal:boolean = false
  creatingUser:boolean = false
  createdUserInfo:string = ""
  account:any = ""
  userType:string = ""
  showUserInfo:boolean = false

  provider = new ethers.providers.Web3Provider(window.ethereum as any);

  ethereum = window.ethereum as MetaMaskInpageProvider;
  
  
  
  web3 = new Web3("https://rinkeby.infura.io/v3/");

  vrniUporabnika = async (): Promise<string> => {
    //const ethereum = window.ethereum as MetaMaskInpageProvider;


    if (typeof window.ethereum !== "undefined") {
      // Poveži se na MetaMask
      const racuni: any = await this.ethereum.request({method: "eth_requestAccounts"});

      
      

      if (racuni != null) {
        //alert(racuni[0]);
        this.foundAccountMetamask = true;
        

      await this.http.get<any>('http://localhost:8083/authorize/' + racuni[0]).subscribe({
            next: data => {
                console.log(data);
                if(data != 0 && data != 1 && data != 2 && data != 3){
                  this.foundAccountJournal = false;
                  
                }else{
                  this.foundAccountJournal = true;
                  if(data == 0){
                    this.userType = "Reader";
                  }
                  if(data == 1){
                    this.userType = "Reviewer";
                  }
                  if(data == 2){
                    this.userType = "Editor";
                  }
                  if(data == 3){
                    this.userType = "Author";
                  }
                }

                console.log("User type" + data)

                this.showUserInfo = true;
            },
            error: error => {
              
                console.error('There was an error!', error);
            }
          })
        
        

        return racuni[0];

      } else return ""
    } else return "";
  }

  set setUserTypeValue(userType: string){
    this.userType = userType;
  }
  
  createUser = async (): Promise<string> => {

    this.creatingUser = true
    
    await this.provider.send("eth_requestAccounts", []);
    
    const signer = this.provider.getSigner();

    const factory = new ContractFactory(JournalDIDAbi.abi, JournalDIDAbi.data.bytecode.object, signer);

    const price = ethers.utils.formatUnits(await this.provider.getGasPrice(), 'gwei')
    const options = {gasLimit: 10000000, gasPrice: ethers.utils.parseUnits(price, 'gwei')}

    const contract = await factory.deploy(options);

    contract.deployTransaction

    await contract.deployTransaction.wait();

    //await contract?.setAuthority(AppSettings.AUTHORITY_CONTRACT);

    this.creatingUser = false;

    console.log("User contract deployed at: " + contract.address);
    //console.log("User address: " + new_account.address);

    this.createdUserInfo = "User Smart contract adress: " + contract.address;

    console.log(this.account);
    const headers = { 'Content-type': 'application/json', 'Cache-Control': 'no-cache' };
    const body = { "userSmartContract": contract.address,
    "userWalletAdress": this.account.__zone_symbol__value };
    this.http.post<any>('http://localhost:8083/create', body, { headers }).subscribe({
      next: data => {
        console.log(data); 
        this.creatingUser = false;
        //this.createdUserInfo = "User Smart contract adress: " + data.contract_address + " User Password: " + data.user_password;

      },
      error: error => {
        
          console.error('There was an error!', error);
      }
        
    });


    return ""
  }


  createUserIM = async (): Promise<string> => {

    this.creatingUser = true

    const headers = { 'Content-type': 'application/json', 'Cache-Control': 'no-cache' };
    const body = { "wallet_pk": "95a61e540fc42d7db8631b11451659a42098311309166ce5ad4aa0e5f11ab7b4",
    "provider": "rinkeby" };
    this.http.post<any>('http://localhost:8080/userManagment/create', body, { headers }).subscribe({
      next: data => {
        console.log(data); 
        this.creatingUser = false;
        this.createdUserInfo = "User Smart contract adress: " + data.contract_address + " User Password: " + data.user_password;

      },
      error: error => {
        
          console.error('There was an error!', error);
      }
        
    });

    return ""
  }


  ngOnInit(): void {
    this.account = this.vrniUporabnika();

    this.ethereum.on('accountsChanged',  (accounts) => {
      console.log('accountsChanges', accounts);
      location.reload();
    });

    
  }

}
