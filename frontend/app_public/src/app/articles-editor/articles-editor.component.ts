import { Component, OnInit } from '@angular/core';
import {conditionallyCreateMapObjectLiteral} from "@angular/compiler/src/render3/view/util";
import { MetaMaskInpageProvider } from "@metamask/providers";
import ArticlesAuthorityAbi from "../../assets/Abis/ArticlesAuthority.json"
import ArticleAbi from "../../assets/Abis/Article.json"
import {ContractFactory, ethers} from "ethers";

import { HttpClient } from '@angular/common/http';
import {AppSettings} from '../appSettings';

interface Review {

  text:String;
  date:String;
  user:String
}

interface Article {
  cid: String;
  id: String;
  reviews: Review [];
  revision: String;
  stage: String;
  submission: String;
  submittedDate: String;
  title:String;
  user: String;
}



@Component({
  selector: 'app-articles-editor',
  templateUrl: './articles-editor.component.html',
  styleUrls: ['./articles-editor.component.css']
})

export class ArticlesEditorComponent implements OnInit {

  reviewedArticles: Article[] = [];

  acceptedArticles: Article[] = [];

  rejectedArticles: Article[] = [];

  provider = new ethers.providers.Web3Provider(window.ethereum as any);

  constructor(private http: HttpClient) { }

  ngOnInit(): void {

    this.listArticlesReviewed();
    this.listArticlesAccepted();
    this.listArticlesRejected();
  }

  onclick(el:any):void {
    el = el as Element
    el = el.parentElement
    console.log(el)
    if(el.children[1].style.maxHeight=="0px")
      el.children[1].style.maxHeight="500px"
    else
      el.children[1].style.maxHeight="0px"
  }

  testAsync(articleId:String):void {
    console.log("testAsync");

    const headers = { 'Content-type': 'application/json', 'Cache-Control': 'no-cache' };
    const body = { 
     };
            this.http.post<any>('http://localhost:8083/admin/decision/' + articleId + '?decision=accepted', body, { headers }).subscribe({
              next: data => {
                console.log(data); 
             
              },
              error: error => {
                
                  console.error('There was an error!', error);
              }
                
            });
  }

  /*
  checkArticleStatus = async (articleId: String): Promise<any> => {

    if (typeof window.ethereum !== "undefined") {

      const signer = this.provider.getSigner();

      const authorityContract = new ethers.Contract(AppSettings.AUTHORITY_CONTRACT, ArticlesAuthorityAbi.abi, this.provider);
    
      const articleDIDAdress = await authorityContract.getArticleSmartContractAddr(articleId);

      if(articleDIDAdress != "0x0000000000000000000000000000000000000000"){

        var article = new ethers.Contract(articleDIDAdress, ArticleAbi.abi, signer);

        let voteTransaction = await article.vote(decision);

        voteTransaction.wait();

        this.provider.waitForTransaction(voteTransaction.hash).then(async function(transaction:any) {
          //console.log('Transaction Mined: ' + transaction.hash);
          console.log('Voted succesfully!');
          console.log(await article.getVotes(options))



      });

        //return userType;

        

        return ""


      }else{

        return "Article DID adress is not found";
      }

    }

  }

*/
  vote = async (articleId: String,decision:String): Promise<any> => {


    if (typeof window.ethereum !== "undefined") {

      //await this.provider.send("eth_requestAccounts", []);
    
      const signer = this.provider.getSigner();

      const authorityContract = new ethers.Contract(AppSettings.AUTHORITY_CONTRACT, ArticlesAuthorityAbi.abi, this.provider);
    
      const articleDIDAdress = await authorityContract.getArticleSmartContractAddr(articleId);

      if(articleDIDAdress != "0x0000000000000000000000000000000000000000"){

        console.log(articleDIDAdress);
        const options = {gasLimit: 6721975, gasPrice: ethers.utils.parseUnits("1", 'gwei')}

        var article = new ethers.Contract(articleDIDAdress, ArticleAbi.abi, signer);

        let voteTransaction = await article.vote(decision);

        voteTransaction.wait();

        this.provider.waitForTransaction(voteTransaction.hash).then(async (transaction:any) => {
          //console.log('Transaction Mined: ' + transaction.hash);
          console.log('Voted succesfully!');
          const articleStatus = await article.status();

          if(articleStatus == 2){

            const headers = { 'Content-type': 'application/json', 'Cache-Control': 'no-cache' };
            
            this.http.post<any>('http://localhost:8080/admin/decision/' + articleId + '?decision=accepted', { headers }).subscribe({
              next: data => {
                console.log(data); 

                this.listArticlesReviewed();
                this.listArticlesAccepted();
                this.listArticlesRejected();

                article.setIpfsHash();
             
              },
              error: error => {
                
                  console.error('There was an error!', error);
              }
                
            });



          }

          if(articleStatus == 3){

            const headers = { 'Content-type': 'application/json', 'Cache-Control': 'no-cache' };
            
            this.http.post<any>('http://localhost:8080/admin/decision/' + articleId + '?decision=rejected', { headers }).subscribe({
              next: data => {
                console.log(data); 

                this.listArticlesReviewed();
                this.listArticlesAccepted();
                this.listArticlesRejected();
            
              },
              error: error => {
                
                  console.error('There was an error!', error);
              }
                
            });



          }


      });

        //return userType;

        

        return ""


      }else{

        return "Article DID adress is not found";
      }

      /*
      // Pove??i se na MetaMask
      const racuni: any = await ethereum.request({method: "eth_requestAccounts"});


      const requestOptions: Object = {
       
        responseType: 'arraybuffer'
      }
      
      this.http.get<any>('http://localhost:8083/vote/' + articleId + "/" + vote).subscribe({
              next: data => {
                  console.log(data);
                

              },
              error: error => {
                
                  console.error('There was an error!', error);
              }
            });
            */
    }

    

  }

  
  listArticlesReviewed = async (): Promise<any> => {

    const ethereum = window.ethereum as MetaMaskInpageProvider;

    if (typeof window.ethereum !== "undefined") {
      // Pove??i se na MetaMask
      const racuni: any = await ethereum.request({method: "eth_requestAccounts"});

      
      
      if (racuni != null) {
        //alert(racuni[0]);

        const { utils } = require('ethers');

        console.log(utils.getAddress(racuni[0]));

        this.http.get<any>('http://localhost:8080/metadata/filterByStatus/SUBMITTED').subscribe({
          next: data => {
              console.log(data)
              
              var filteredArray = data.filter(function (article:any) {

                if(article.reviews){

                  if(article.reviews.length >= 3){
                    return true;
                  }else{
                    return false;
                  }
                    
                }else{
                  return false;
                }
            });

           
             
              this.reviewedArticles = filteredArray;

              console.log(this.reviewedArticles[0].reviews[0].date)



             

          },
          error: error => {
            
              console.error('There was an error!', error);
          }
        });
        
      } 
    }


  }

  listArticlesRejected = async (): Promise<any> => {

    const ethereum = window.ethereum as MetaMaskInpageProvider;

    if (typeof window.ethereum !== "undefined") {
      // Pove??i se na MetaMask
      const racuni: any = await ethereum.request({method: "eth_requestAccounts"});

      if (racuni != null) {
        //alert(racuni[0]);

        const { utils } = require('ethers');

        console.log(utils.getAddress(racuni[0]));

        this.http.get<any>('http://localhost:8080/metadata/filterByStatus/REJECTED').subscribe({
          next: data => {
              console.log(data)
              
              this.rejectedArticles = data;


          },
          error: error => {
            
              console.error('There was an error!', error);
          }
        });
        
      } 
    }


  }

  listArticlesAccepted = async (): Promise<any> => {

    const ethereum = window.ethereum as MetaMaskInpageProvider;

    if (typeof window.ethereum !== "undefined") {
      // Pove??i se na MetaMask
      const racuni: any = await ethereum.request({method: "eth_requestAccounts"});

      if (racuni != null) {
        //alert(racuni[0]);

        const { utils } = require('ethers');

        console.log(utils.getAddress(racuni[0]));

        this.http.get<any>('http://localhost:8080/metadata/filterByStatus/ACCEPTED').subscribe({
          next: data => {
              console.log(data)
              
              this.acceptedArticles = data;


          },
          error: error => {
            
              console.error('There was an error!', error);
          }
        });
        
      } 
    }


  }

}
