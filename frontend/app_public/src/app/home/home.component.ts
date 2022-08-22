import { Component, OnInit } from '@angular/core';
import { MetaMaskInpageProvider } from "@metamask/providers";
import Web3 from 'web3';
import {ethers} from "ethers";
import scABI from "../../assets/Abis/test.json"
declare let require: any;
import { HttpClient } from '@angular/common/http';

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
