import { Component, OnInit } from '@angular/core';
import { MetaMaskInpageProvider } from "@metamask/providers";
import Web3 from 'web3';
import {ethers} from "ethers";
import scABI from "../../assets/Abis/test.json"
declare let require: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})


export class HomeComponent implements OnInit {

  constructor() { }
  foundAccount:boolean = false
  account:any = ""
  
  
  web3 = new Web3("https://rinkeby.infura.io/v3/");

  vrniUporabnika = async (): Promise<string> => {
    const ethereum = window.ethereum as MetaMaskInpageProvider;


    if (typeof window.ethereum !== "undefined") {
      // Poveži se na MetaMask
      const racuni: any = await ethereum.request({method: "eth_requestAccounts"});

      
      
      if (racuni != null) {
        //alert(racuni[0]);
        this.foundAccount = true;
        console.log(racuni[0])
        return racuni[0];
      } else return ""
    } else return "";
  }

  ngOnInit(): void {
    this.account = this.vrniUporabnika();
  }

}
