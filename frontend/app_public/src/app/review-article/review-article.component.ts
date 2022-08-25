import { Component, Injectable, OnInit } from '@angular/core';
import { MetaMaskInpageProvider } from "@metamask/providers";

import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-review-article',
  templateUrl: './review-article.component.html',
  styleUrls: ['./review-article.component.css']
})

@Injectable()
export class ReviewArticleComponent implements OnInit {
  articleSelected: boolean = false;
  selectedAlreadyReviewedArticle:boolean = false;

  account:any = ""
  foundAccountMetamask:boolean = false
  foundAccountJournal:boolean = false
  userAuthorized:boolean = false
  userType:string = ""

  constructor(private http: HttpClient) { }

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

            },
            error: error => {
              
                console.error('There was an error!', error);
            }
          })

        return racuni[0];
      } else return ""
    } else return "";
  }

  
  test(id: number){
    console.log(id)
    this.articleSelected = true;
    if (id==4)
      this.selectedAlreadyReviewedArticle = true;
  }

  reset(){
    this.articleSelected = false;
    this.selectedAlreadyReviewedArticle = false;
  }

  ngOnInit(): void {
    this.account = this.vrniUporabnika();
  }

}
