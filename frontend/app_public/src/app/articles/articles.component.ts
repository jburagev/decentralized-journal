import { Component, OnInit } from '@angular/core';
import {ContractFactory, ethers} from "ethers";
import { MetaMaskInpageProvider } from "@metamask/providers";
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
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css']
})
export class ArticlesComponent implements OnInit {

  acceptedArticles: Article[] = [];

  provider = new ethers.providers.Web3Provider(window.ethereum as any);


  constructor(private http: HttpClient) { }

  ngOnInit(): void {

    this.listArticlesAccepted();
  }

  listArticlesAccepted = async (): Promise<any> => {

    const ethereum = window.ethereum as MetaMaskInpageProvider;

    if (typeof window.ethereum !== "undefined") {
      // Poveži se na MetaMask
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
