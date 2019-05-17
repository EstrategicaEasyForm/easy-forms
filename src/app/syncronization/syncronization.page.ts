import { Component, OnInit } from '@angular/core';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { OrdersService } from '../orders.service';
import { ViewChild } from '@angular/core';
import { NetworkNotifyBannerComponent } from '../network-notify-banner/network-notify-banner.component';
import { UsersService } from '../users.service';
import { AspirationService } from './aspiration.services';
import * as moment from 'moment-timezone';
import { Events, Platform } from '@ionic/angular';

@Component({
  selector: 'app-syncronization',
  templateUrl: './syncronization.page.html',
  styleUrls: ['./syncronization.page.scss'],
})
export class SyncronizationPage {

  loading: any;
  registriesApiration: any;

  @ViewChild('networkNotifyBanner') public networkNotifyBanner: NetworkNotifyBannerComponent;
  constructor(
    public ordersService: OrdersService,
    public router: Router,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public userService: UsersService,
    public alertController: AlertController,
    public eventCtrl: Events,
    private platform: Platform,
    private aspirationService: AspirationService) {
      this.eventCtrl.subscribe('publish.aspiration.log', (elementPush) => {
        this.registriesApiration.push(elementPush);
      });
    }

  ionViewWillEnter() {
    this.registriesApiration = [];
    this.initSync();
  }

  async initSync() {
    const alert = await this.alertController.create({
      header: 'Confirmación',
      message: '¿Está seguro de iniciar la sincronización de datos?',
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {
            this.registriesApiration.push({
              type:'warning',
              message:"La sincronización se ha cancelado",
              time:moment().format('HH:mm:ss')
            });
          }
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.syncAspiration();
          }
        }
      ],
      backdropDismiss: false
    });
    await alert.present();
  }

  async syncAspiration() {
    const _self = this;
    _self.loading = await this.loadingCtrl.create({
      message: 'Por favor espere'
    });
    await _self.loading.present();
    this.ordersService.getDetailsApiStorage().then((orders) => {
      var resultAspiration = this.aspirationService.processAspiration(orders);
      if (resultAspiration) {
        this.retriveAgenda();
      }
    });
  }

  async sendEmail() {
    if (this.platform.is("android")) {
      //"cordova-plugin-send-email": "git+https://github.com/EstrategicaEasyForm/cordova-plugin-send-email.git"
      const mailSettings = {
        emailFrom: "camachod@globalhitss.com",
        emailTo: "felizarazol@unal.edu.co",
        smtp: "correobog.globalhitss.com",
        smtpUserName: "camachod",
        smtpPassword: "password",
        attachments: [],
        subject: "email subject from the ionic app",
        textBody: "write something within the body of the email"
      };
      
      const success = function (message) {
        alert('sended email to ' + mailSettings.smtp);
        alert(message);
      }

      const failure = function (message) {
        alert("Error sending the email");
        alert(message);
      }
      try {
        cordova.exec(success,failure,"SMTPClient","execute",[mailSettings]);
      }
      catch(err){
        alert(err);
      };
    }
  }

  async retriveAgenda() {
      this.registriesApiration.push({
        type : 'info',
        message : "Inicia descarga de la agenda",
        time : moment().format('HH:mm:ss')
      });

    this.ordersService.getDetailsApiQuery().then(detailsApi => {
      this.loading.dismiss();
      this.ordersService.setDetailsApiStorage(detailsApi);
      this.eventCtrl.publish('sync:finish');
      //_self.router.navigate(['tabs/agenda', {
      //  message: "Sincronización realizada exitosamente!!"
      //}]);
      this.registriesApiration.push({
        type : 'info',
        message : "La descarga de la agenda se ejecutó correctamente",
        time : moment().format('HH:mm:ss'),
        show : false,
      });
    }).catch(error => {
      this.loading.dismiss();
      this.registriesApiration.push({
        type:'error',
        message:"La descarga de la agenda falló",
        show : false,
        time:moment().format('HH:mm:ss')
      });
      if (typeof error === 'string') {
        this.showMessage(error);
      }
      else this.showMessage('No se puede consultar la lista de agendas');
    });
    this.sendEmail();
  }

  async showMessage(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }

  isDeploy(registry : any) {
    return registry.show;
  }

  deploy(registry : any) {
    registry.show = !registry.show;
  }

}
