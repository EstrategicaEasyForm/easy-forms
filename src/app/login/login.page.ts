import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NetworkNotifyBannerComponent } from '../network-notify-banner/network-notify-banner.component';
import { ViewChild } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
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

  EMAILPATTERN = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
  signinForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.pattern(this.EMAILPATTERN)]),
    password: new FormControl('', Validators.required),
  });

  // Validation error messages that will be displayed for each form field with errors.
  validation_messages = {
    'email': [
      { type: 'email', message: 'email inválido' },
      { type: 'required', message: 'Campo requerido.' }
    ],
    'password': [
      { type: 'required', message: 'Campo requerido.' }
    ]
  }

  @ViewChild(NetworkNotifyBannerComponent) public networkNotifyBanner: NetworkNotifyBannerComponent;

  constructor(public router: Router,
    public usersService: UsersService,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController) {

      this.usersService.deleteUserAuthToken();
  }

  ngOnInit() {
  }

  goToHome() {
    //continue with access to the app
    this.router.navigateByUrl('/tabs/agenda');
  }

  async onLogin(type: string, data: any) {

    if (this.signinForm.valid) {

      const loading = await this.loadingCtrl.create({
        message: 'Por favor espere'
      });
      await loading.present();

      let userAuth = { 'email': data.email, 'password': data.password };

      // Invoque the Graqhl login mutation
      this.usersService.login(userAuth)
        .subscribe(({ data }) => {
          loading.dismiss();
          if (data.login) {
			userAuth = Object.assign(userAuth,data.login);
            this.usersService.setUserAuthToken(userAuth);
            this.usersService.addUserAuthStorage(userAuth);
            this.goToHome();
          }
        }, (error) => {
          loading.dismiss();
          const next = this.showError(error);
          if (next) {

            //get user auth storage
            this.usersService.isUserAuthStorage(userAuth)
              .then((isValid: boolean) => {
                if (isValid) {
                  this.usersService.setUserAuthToken(userAuth);
                  this.goToHome();
                }
                else {
                  this.showMessage('No se puede iniciar sesion');
                }
              });
          }
        });
    }
  }

  showError(error): boolean {

    if (error.graphQLErrors) {
      for (let err of error.graphQLErrors) {
        if (err.extensions.category === 'authentication') {
          this.showMessage('Usuario o clave incorrectos');
          return false;
        }
      }
    }
    return true;
  }

  async showMessage(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }
}
