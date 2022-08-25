import { Injectable } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MetaMaskInpageProvider } from "@metamask/providers";
import Web3 from 'web3';
import { ethers } from "ethers";
import testAbi from "../../assets/Abis/test.json";
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';


import detectEthereumProvider from '@metamask/detect-provider';


declare let require: any;

declare global {
  interface Window{
    //ethereum?:MetaMaskInpageProvider
  }
}



@Component({
  selector: 'app-submit-article',
  templateUrl: './submit-article.component.html',
  styleUrls: ['./submit-article.component.css']
})

@Injectable()
export class SubmitArticleComponent implements OnInit {

  constructor(private http: HttpClient) { }

  account:any = ""
  foundAccountMetamask:boolean = false
  foundAccountJournal:boolean = false
  userAuthorized:boolean = false
  userType:string = ""

  vrniUporabnika = async (): Promise<string> => {
    const ethereum = window.ethereum as MetaMaskInpageProvider;


    if (typeof window.ethereum !== "undefined") {
      // Poveži se na MetaMask
      const racuni: any = await ethereum.request({method: "eth_requestAccounts"});

      
      
      if (racuni != null) {
        //alert(racuni[0]);
        this.foundAccountMetamask = true;
        console.log(racuni[0])

          this.http.get<any>('http://localhost:8083/authorize/' + racuni[0]).subscribe({
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
                    this.userAuthorized = true;
                  }
                  if(data == 2){
                    this.userType = "Editor";
                    this.userAuthorized = true;
                  }
                  if(data == 3){
                    this.userType = "Author";
                    this.userAuthorized = true;
                  }
                }

            },
            error: error => {
              
                console.error('There was an error!', error);
            }
          })

        return racuni[0];
      } else return ""
    } else return "";
  }


  submitArticle = async (): Promise<any> => {

    const ethereum = window.ethereum as MetaMaskInpageProvider;

    if (typeof window.ethereum !== "undefined") {
      // Poveži se na MetaMask
      const racuni: any = await ethereum.request({method: "eth_requestAccounts"});

      
      
      if (racuni != null) {
        //alert(racuni[0]);
        console.log(racuni[0]);

        const input = document.getElementById('articleTitle') as HTMLInputElement | null;

        console.log(input?.value);

        const body = { title: input?.value,
                      user: racuni[0]
      
                    };

        this.http.post<any>('http://localhost:8080/metadata/new', body).subscribe({
          next: data => {
              console.log(data)
          },
          error: error => {
            
              console.error('There was an error!', error);
          }
      })
        
      } 
    }


    

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

  ngOnInit(): void {

    //this.getArticleByHash();
    this.account = this.vrniUporabnika();

  }



}
