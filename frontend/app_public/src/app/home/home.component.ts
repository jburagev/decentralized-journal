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

  constructor(private http: HttpClient) { }
  foundAccountMetamask:boolean = false
  foundAccountJournal:boolean = false
  creatingUser:boolean = false
  createdUserInfo:string = ""
  account:any = ""

  
  
  
  web3 = new Web3("https://rinkeby.infura.io/v3/");

  vrniUporabnika = async (): Promise<string> => {
    const ethereum = window.ethereum as MetaMaskInpageProvider;


    if (typeof window.ethereum !== "undefined") {
      // Poveži se na MetaMask
      const racuni: any = await ethereum.request({method: "eth_requestAccounts"});

      
      
      if (racuni != null) {
        //alert(racuni[0]);
        this.foundAccountMetamask = true;
        console.log(racuni[0])



        return racuni[0];
      } else return ""
    } else return "";
  }

  
  createUser = async (): Promise<string> => {

    this.creatingUser = true
    

    const provider = new ethers.providers.Web3Provider(window.ethereum as any);
    
    await provider.send("eth_requestAccounts", []);
    
    const signer = provider.getSigner();

    const factory = new ContractFactory(JournalDIDAbi.abi, JournalDIDAbi.data.bytecode.object, signer);

    const price = ethers.utils.formatUnits(await provider.getGasPrice(), 'gwei')
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
  }

}
