import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NetworkNotifyBannerComponent } from '../network-notify-banner/network-notify-banner.component';
import { ViewChild } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { UsersService } from '../users.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  email: any;
  password: any;
  showFingerPrint = false;
  
  EMAILPATTERN = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
  signinForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.pattern(this.EMAILPATTERN)]),
    password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(12)]),
  });
  
  // Validation error messages that will be displayed for each form field with errors.
  validation_messages = {
    'email': [
      { type: 'pattern', message: 'Campo requerido.' }
    ],
    'password': [
      { type: 'pattern', message: 'Campo requerido.' }
    ]
  }
  
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

  async onLogin(type: string, data: any) {
    const loading = await this.loadingCtrl.create({
      message: 'Hellooo',
      duration: 2000
    });
    await loading.present();

    if (this.signinForm.valid) {

      let userAuth = { 'email': this.email, 'password': this.password, 'token': null };

      if (type === 'FingerPrint') {
        userAuth = { 'email': data.email, 'password': data.password, 'token': null };
      }

      this.usersService.login(userAuth)
        .subscribe(({ data }) => {
          const token = data.login ? data.login.access_token || '' : '';
          userAuth.token = token;
          this.usersService.setToken(userAuth);
          this.goToHome();
          loading.onDidDismiss();
        }, (error) => {
          console.log('there was an error sending the query', error);
          loading.onDidDismiss();
        });

      //await loading.onDidDismiss();
    }
  }

}
