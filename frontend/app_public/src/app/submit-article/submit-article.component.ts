import { Injectable } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MetaMaskInpageProvider } from "@metamask/providers";
import Web3 from 'web3';
import {ContractFactory, ethers} from "ethers";
import testAbi from "../../assets/Abis/test.json";
import ArticleAbi from "../../assets/Abis/Article.json"
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
  showUserInfo:boolean = false

  fileName:string = "";

  upload$:any;

  provider = new ethers.providers.Web3Provider(window.ethereum as any);


  articleSubmittedSuccess:boolean = false
  articleSubmittedFail:boolean = false

  ethereum = window.ethereum as MetaMaskInpageProvider;

  vrniUporabnika = async (): Promise<string> => {


    if (typeof window.ethereum !== "undefined") {
      // Poveži se na MetaMask
      const racuni: any = await this.ethereum.request({method: "eth_requestAccounts"});

      
      
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
                    this.userAuthorized = false;
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

  onFileSelected = async (event:any): Promise<any> => {

    const file:File = event.target.files[0];

    console.log(event.target.files)

    if (file) {

        this.fileName = file.name;

        const formData = new FormData();

        formData.append("thumbnail", file);

        this.upload$ = (metadataId:string) => this.http.post<any>("http://localhost:8080/files/submission/" + metadataId, formData).subscribe({
          next: data => {
              console.log(data)
             
             
          },
          error: error => {
     
              console.error('There was an error!', error);
          }
      });

        //upload$.subscribe();
    }

  }


  submitArticle = async (): Promise<any> => {

    this.articleSubmittedSuccess = false
    
    if (typeof window.ethereum !== "undefined") {
      // Poveži se na MetaMask
      const racuni: any = await this.ethereum.request({method: "eth_requestAccounts"});

      
      
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
              //window.location.href = '/articles';
              this.articleSubmittedSuccess = true

              this.upload$(data['metadataId']);

              this.deployArticleSmartContract(data['metadataId']);
              
             
             
          },
          error: error => {
            this.articleSubmittedSuccess = false
            this.articleSubmittedFail = true
              console.error('There was an error!', error);
          }
      })
        
      } 
    }


    

  }

  deployArticleSmartContract = async (articleId:any): Promise<any> => {

              await this.provider.send("eth_requestAccounts", []);
    
              const signer = this.provider.getSigner();

              const factory = new ContractFactory(ArticleAbi.abi, ArticleAbi.object, signer);

              const price = ethers.utils.formatUnits(await this.provider.getGasPrice(), 'gwei')
              const options = {gasLimit: 10000000, gasPrice: ethers.utils.parseUnits(price, 'gwei')}

              const contract = await factory.deploy(options);

              contract.deployTransaction

              await contract.deployTransaction.wait();

              //await contract.setCloudId(articleId);

              //await contract.vote('ACCEPT');

              //console.log("Votes: ");

              //console.log(contract.getVotes());

              console.log("Article contract deployed at: " + contract.address);

              console.log("Updating article athority Smart contract...");

              const headers = { 'Content-type': 'application/json', 'Cache-Control': 'no-cache' };
              const body = { "articleId": articleId ,
              "articleSmartContractAddress": contract.address };
              this.http.post<any>('http://localhost:8083/updateArticleAtuhority', body, { headers }).subscribe({
                next: data => {
                  console.log(data); 
                  //this.creatingUser = false;
                  //this.createdUserInfo = "User Smart contract adress: " + data.contract_address + " User Password: " + data.user_password;
                  console.log("Successfully updated article authority smart contract");
                },
                error: error => {
                  
                    console.error('There was an error updating article authority smart contract!', error);
                }
                  
              });

  }

  getArticleByHash = async (): Promise<any> => {

    if (typeof window.ethereum !== "undefined") {
 
      const racuni: any = await this.ethereum.request({method: "eth_requestAccounts"});

     if (this.provider) {
      console.log(this.provider); // Initialize your app
      
      const signer = this.provider.getSigner(); 

      const smartcont : any = new ethers.Contract("0xe02f26Aa4C8E871B86509D75775df1882F383B6D",testAbi,signer);

      const test = await smartcont.submittedArticles("jovs333");

      const test1 = await smartcont.articlesSize();

      const articles:Array<string> = [];


      for(var i = 0; i < parseInt(test1); i++) {
        articles.push(await smartcont.articles(i));
      }

      console.log(articles);



      ////////////////////////

    } else {
      console.log('Please install MetaMask!');
    }

  }

  }

  ngOnInit(): void {

    //this.getArticleByHash();
    this.account = this.vrniUporabnika();

    this.ethereum.on('accountsChanged',  (accounts) => {
      console.log('accountsChanges', accounts);
      location.reload();
    });

  }



}
