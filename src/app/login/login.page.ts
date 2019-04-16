import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NetworkNotifyBannerComponent } from '../network-notify-banner/network-notify-banner.component';
import { ViewChild } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
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
  }

  ngOnInit() {

  }

  goToHome() {
    //continue with access to the app
    this.router.navigateByUrl('/agenda');
  }

  async onLogin(type: string, data: any) {

    if (this.signinForm.valid) {

      const loading = await this.loadingCtrl.create({
        message: 'Por favor espere',
        duration: 2000
      });
      await loading.present();

      const userAuth = { 'email': data.email, 'password': data.password, 'token': null };

      this.usersService.login(userAuth)
        .subscribe(({ data }) => {
          loading.onDidDismiss();
          const token = data.login ? data.login.access_token || '' : '';
          userAuth.token = token;
          this.usersService.setToken(userAuth);
          this.goToHome();
        }, (error) => {
          loading.onDidDismiss();
          if (error.graphQLErrors[0] &&
            error.graphQLErrors[0].category === 'authentication') {
            this.showMessage('Usuario o clave incorrectos');
          }
          else {
            this.showMessage('No se puede iniciar sesion');
          }
        });
    }
  }

  async showMessage(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }
}
