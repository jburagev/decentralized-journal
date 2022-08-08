import { Component, OnInit } from '@angular/core';

import { MetaMaskInpageProvider } from "@metamask/providers";
import { HttpClient } from '@angular/common/http';

interface Article {
  cid: Number;
  id: String;
  reviews: Number;
  revision: String;
  stage: String;
  submission: String;
  submittedDate: String;
  title:String;
  user: String;
}


@Component({
  selector: 'app-my-articles',
  templateUrl: './my-articles.component.html',
  styleUrls: ['./my-articles.component.css']
})
export class MyArticlesComponent implements OnInit {

  articles: Article[] = [];

  constructor(private http: HttpClient) { }

 

  ngOnInit(): void {


    this.listArticles();


    
  }

  listArticles = async (): Promise<any> => {

    const ethereum = window.ethereum as MetaMaskInpageProvider;

    if (typeof window.ethereum !== "undefined") {
      // Poveži se na MetaMask
      const racuni: any = await ethereum.request({method: "eth_requestAccounts"});

      
      
      if (racuni != null) {
        //alert(racuni[0]);
        console.log(racuni[0]);

        const input = document.getElementById('articleTitle') as HTMLInputElement | null;

        console.log(input?.value);


        this.http.get<any>('http://localhost:8080/author/' + racuni[0] + '/article').subscribe({
          next: data => {
              console.log(data)
              this.articles = data; 

          },
          error: error => {
            
              console.error('There was an error!', error);
          }
      })
        
      } 
    }


  }

}
