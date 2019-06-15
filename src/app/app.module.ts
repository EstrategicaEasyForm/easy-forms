import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
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
import { AspirationDetailPageModule } from './aspiration/aspiration-detail.module';
import { EvaluationDetailPageModule } from './evaluation/evaluation-detail.module';
import { Camera } from '@ionic-native/camera/ngx';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [SignatureDrawPadPage],
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
    AspirationDetailPageModule,
    EvaluationDetailPageModule,
    IonicStorageModule.forRoot()],
  providers: [
    StatusBar,
    SplashScreen,
    Network,
    NetworkNotifyService,
    Camera,
	File,
    FileOpener,
	ScreenOrientation,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() { }
}
