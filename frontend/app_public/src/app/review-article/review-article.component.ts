import { Component, Injectable, OnInit } from '@angular/core';
import { MetaMaskInpageProvider } from "@metamask/providers";

import { saveAs } from 'file-saver';

import { HttpClient } from '@angular/common/http';
import { ArticlesComponent } from '../articles/articles.component';



interface Article {
  cid: String;
  id: String;
  reviews: String;
  revision: String;
  stage: String;
  submission: String;
  submittedDate: String;
  title:String;
  user: String;
}



/*
class Article {
  cid: String;
  id: String;
  reviews: String;
  revision: String;
  stage: String;
  submission: String;
  submittedDate: String;
  title:String;
  user: String;
 
  constructor(cid: String, id: String,reviews: String, revision: String, stage:String,submission:String,submittedDate:String,title:String,user:String) {
    this.cid = cid;
    this.id = id;
    this.reviews = reviews;
    this.revision = revision;
    this.stage = stage;
    this.submission = submission;
    this.submittedDate = submittedDate;
    this.title = title;
    this.user = user;

  }

  public setcid(cid:String){

    return this.cid = cid;
  }


}
*/


@Component({
  selector: 'app-review-article',
  templateUrl: './review-article.component.html',
  styleUrls: ['./review-article.component.css']
})

@Injectable()
export class ReviewArticleComponent implements OnInit {
  articleSelected: boolean = false;
  articleForReviewSelected: boolean = false;

  selectedAlreadyReviewedArticle:boolean = false;

  selectedArticle : any = {
    cid: "",
    id: "",
    reviews: "",
    revision: "",
    stage: "",
    submission: "",
    submittedDate: "",
    title: "",
    user: ""
  };

  account:any = ""
  foundAccountMetamask:boolean = false
  foundAccountJournal:boolean = false
  userAuthorized:boolean = false
  userType:string = ""
  showUserInfo:boolean = false
  reviewSubmittedSuccess = false
  reviewSubmittedFail:boolean = false


  submittedArticles: Article[] = [];

  reviewedArticles: Article[] = [];

  ethereum = window.ethereum as MetaMaskInpageProvider;

  constructor(private http: HttpClient) { }

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
                    this.userAuthorized = false;
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


  getSizeSubmittedArticles(){

    return this.submittedArticles.length;
  }

  getSizeReviewedArticles(){

    return this.reviewedArticles.length;
  }
  
  test(id: String){
    console.log(id)
    this.articleSelected = true;
    //if (id==4)
    //  this.selectedAlreadyReviewedArticle = true;
  }

  selectedArticleForReview = async (id: String): Promise<any> => {
    console.log(id)
    this.articleSelected = true;
    this.articleForReviewSelected = true;

    const ethereum = window.ethereum as MetaMaskInpageProvider;

    if (typeof window.ethereum !== "undefined") {
      // Poveži se na MetaMask
      const racuni: any = await ethereum.request({method: "eth_requestAccounts"});

      
      
      if (racuni != null) {
        //alert(racuni[0]);

        
        this.http.get<Article>('http://localhost:8080/metadata/' + id).subscribe({
          next: data => {
             // console.log(data)
          
            //let jsonObj = JSON.parse(data.toString());
            this.selectedArticle = data;

            this.selectedArticle.submittedDate = (new Date(this.selectedArticle.submittedDate)).toLocaleDateString('en-US');

            console.log(this.articleSelected);

          },
          error: error => {
            
              console.error('There was an error!', error);
          }
        });
        
      } 
    }

    //if (id==4)
    //  this.selectedAlreadyReviewedArticle = true;
  }


  downloadArticle = async (id: String): Promise<any> => {

    const requestOptions: Object = {
      /* other options here */
      responseType: 'arraybuffer'
    }
    
    this.http.get<any>('http://localhost:8080/files/submission/' + id,requestOptions).subscribe({
          next: data => {
            
            let blob = new Blob([data], {'type': "application/octet-stream"});
            saveAs(blob, id + ".pdf");

          },
          error: error => {
            
              console.error('There was an error downloading article!', error);
          }
        });

  }

  submitReview = async (id: string): Promise<any> => {

    this.reviewSubmittedSuccess = false;

    if (typeof window.ethereum !== "undefined") {
      // Poveži se na MetaMask
      const racuni: any = await this.ethereum.request({method: "eth_requestAccounts"});

      
      
      if (racuni != null) {
        //alert(racuni[0]);
  

          const { utils } = require('ethers');

        console.log(utils.getAddress(racuni[0]));


          const input = document.getElementById('reviewText') as HTMLInputElement | null;

          console.log(input?.value);

          const body = { text: input?.value,
                        user: racuni[0]
        
                      };

         await this.http.post<any>('http://localhost:8080/review/' + id, body).subscribe({
            next: data => {
                console.log(data)
                //window.location.href = '/articles';

                this.reviewSubmittedSuccess = true
                this.reviewSubmittedFail = false

                document.getElementById(id)?.remove();

                this.listArticlesUnderReview();
                this.listArticlesSubmitted();
            
            },
            error: error => {
              this.reviewSubmittedSuccess = false
              this.reviewSubmittedFail = true
                console.error('There was an error!', error);
            }
        })
        

      }
    }

  }

  reset(){
    this.articleSelected = false;
    this.selectedAlreadyReviewedArticle = false;
  }

  ngOnInit(): void {
    this.account = this.vrniUporabnika();

    this.ethereum.on('accountsChanged',  (accounts) => {
      console.log('accountsChanges', accounts);
      location.reload();
    });

    this.listArticlesUnderReview();
    this.listArticlesSubmitted();
  }

  listArticlesUnderReview = async (): Promise<any> => {

    const ethereum = window.ethereum as MetaMaskInpageProvider;

    if (typeof window.ethereum !== "undefined") {
      // Poveži se na MetaMask
      const racuni: any = await ethereum.request({method: "eth_requestAccounts"});

      
      
      if (racuni != null) {
        //alert(racuni[0]);

        const { utils } = require('ethers');

        console.log(utils.getAddress(racuni[0]));

        this.http.get<any>('http://localhost:8080/metadata').subscribe({
          next: data => {
              console.log(data)
              
              var filteredArray = data.filter(function (article:any) {

                if(article.reviews){
                    return article.reviews.some(function (dptAccess:any) {
                      return dptAccess.user === racuni[0]
                  });
                }
            });

              console.log(this.getSizeSubmittedArticles());
              this.reviewedArticles = filteredArray;

             

          },
          error: error => {
            
              console.error('There was an error!', error);
          }
        });
        
      } 
    }


  }

  listArticlesSubmitted = async (): Promise<any> => {

    const ethereum = window.ethereum as MetaMaskInpageProvider;

    if (typeof window.ethereum !== "undefined") {
      // Poveži se na MetaMask
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

                  
                      if(article.reviews.length < 3){
                        return article.reviews.some(function (dptAccess:any) {
                          return dptAccess.user != racuni[0]
                        });
                      }else{
                        return false
                      }
                  
                }else{
                  return true;
                }
            });
            
              this.submittedArticles = filteredArray;

          },
          error: error => {
            
              console.error('There was an error!', error);
          }
        });
        
      } 
    }


  }


}
