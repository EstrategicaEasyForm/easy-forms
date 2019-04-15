import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NetworkNotifyBannerComponent } from '../network-notify-banner/network-notify-banner.component';
import { ViewChild } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  email: any;
  password: any;
  showFingerPrint = false;
  @ViewChild(NetworkNotifyBannerComponent) public networkNotifyBanner: NetworkNotifyBannerComponent;

  constructor(public router: Router,
    public usersService: UsersService,
    public loadingCtrl: LoadingController) {

  }

  ngOnInit() {

  }

  goToHome() {
    //continue with access to the app
    this.router.navigateByUrl('/agenda');
  }

  onLogin(type: string, data: any) {
    let userAuth = { 'email': this.email, 'password': this.password, 'token': null };
    const loadingOptions = {
      message: 'Por favor espere'
    };

    const loading = this.loadingCtrl.create(loadingOptions);

    if(type==='FingerPrint'){
      userAuth = { 'email': data.email, 'password': data.password, 'token': null };
    }
    
    this.usersService.login(userAuth)
    .subscribe(({ data }) => {
      const token = data.login ? data.login.access_token || '' : '';
      userAuth.token = token;
      this.usersService.setToken(userAuth);
      this.goToHome();
    }, (error) => {
      console.log('there was an error sending the query', error);
    });
    
    //await loading.dismiss();
  }

}
