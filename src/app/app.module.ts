import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, RouteReuseStrategy, Routes } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { FileOpener } from '@ionic-native/file-opener/ngx';
import { File } from '@ionic-native/file/ngx';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { ApolloModule } from 'apollo-angular';
import { GraphQLModule } from './graphql.module';
import { Network } from "@ionic-native/network/ngx";
import { NetworkNotifyService } from './network-notify.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IonicStorageModule } from '@ionic/storage';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from './components.module';
import { SignatureDrawPadPage } from './signature-draw-pad/signature-draw-pad.page';
import { SignatureDrawPadPageModule } from './signature-draw-pad/signature-draw-pad.module';
import { AspirationDetailModal } from './aspiration/aspiration-detail.modal';
import { AspirationDetailModalModule } from './aspiration/aspiration-detail-modal.module';


@NgModule({
  declarations: [AppComponent],
  entryComponents: [SignatureDrawPadPage,AspirationDetailModal],
  imports: [BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    ApolloModule,
    HttpClientModule,
    GraphQLModule,
    FormsModule,
    ReactiveFormsModule,
    ComponentsModule,
    SignatureDrawPadPageModule,
    AspirationDetailModalModule,
    IonicStorageModule.forRoot()],
  providers: [
    StatusBar,
    SplashScreen,
    Network,
    NetworkNotifyService,
	File,
    FileOpener,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() { }
}
