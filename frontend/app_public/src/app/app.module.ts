import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { TemplateComponent } from './template/template.component';
import { MyArticlesComponent } from './my-articles/my-articles.component';
import { AppUsmerjanjeModule } from './app-routing/app-routing.module';
import { SubmitArticleComponent } from './submit-article/submit-article.component';
import { ReviewArticleComponent } from './review-article/review-article.component';
import { HomeComponent } from './home/home.component';
import { NftsComponent } from './nfts/nfts.component';
import { ArticlesComponent } from './articles/articles.component';
import { ArticlesEditorComponent } from './articles-editor/articles-editor.component';
import { TestComponentComponent } from './test-component/test-component.component';

@NgModule({
  declarations: [
    AppComponent,
    TemplateComponent,
    MyArticlesComponent,
    SubmitArticleComponent,
    ReviewArticleComponent,
    HomeComponent,
    NftsComponent,
    ArticlesComponent,
    ArticlesEditorComponent,
    TestComponentComponent
  ],
  imports: [
    BrowserModule,
    AppUsmerjanjeModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [TemplateComponent]
})
export class AppModule { }
