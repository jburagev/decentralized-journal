import { Component, OnInit } from '@angular/core';
import { MetaMaskInpageProvider } from "@metamask/providers";
import { ethers } from "ethers";

@Component({
  selector: 'app-test-component',
  templateUrl: './test-component.component.html',
  styleUrls: ['./test-component.component.css']
})
export class TestComponentComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  getArticleByHash = async (): Promise<any> => {

    const ethereum = window.ethereum as MetaMaskInpageProvider;
    
    if (typeof window.ethereum !== "undefined") {
      // Poveži se na MetaMask
      

      ///////////////////////
      const racuni: any = await ethereum.request({method: "eth_requestAccounts"});


     const provider = await new ethers.providers.Web3Provider(window.ethereum);

     if (provider) {
      console.log(provider); // Initialize your app
      
      const signer = provider.getSigner(); 

      const smartcont : any = new ethers.Contract("0xCEBaC8bAbB16cD1BE0F5DD71033C3B43888F059c",testAbi,signer);

      const test = await smartcont.submittedArticles("jovs123");

      console.log(test);



      ////////////////////////

    } else {
      console.log('Please install MetaMask!');
    }

  }

  }

}
