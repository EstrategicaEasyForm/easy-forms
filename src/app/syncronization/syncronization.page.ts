import { Component, OnInit } from '@angular/core';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { OrdersService } from '../orders.service';
import { ViewChild } from '@angular/core';
import { NetworkNotifyBannerComponent } from '../network-notify-banner/network-notify-banner.component';
import { UsersService } from '../users.service';
import { AspirationService } from './aspiration.services';
import * as moment from 'moment-timezone';
import { Events } from '@ionic/angular';
import { AspirationPdfService } from '../aspiration/aspiration.pdf.service';

@Component({
  selector: 'app-syncronization',
  templateUrl: './syncronization.page.html',
  styleUrls: ['./syncronization.page.scss'],
})
export class SyncronizationPage {

  loading: any;
  logs = [];
  totalTemplates = 0;

  @ViewChild('networkNotifyBanner') public networkNotifyBanner: NetworkNotifyBannerComponent;
  constructor(
    public ordersService: OrdersService,
    public router: Router,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public userService: UsersService,
    public alertController: AlertController,
    public eventCtrl: Events,
    private aspirationService: AspirationService,
    public aspirationPdf: AspirationPdfService) {
    this.eventCtrl.subscribe('publish.aspiration.log', (elementPush) => {
      this.logs.push(elementPush);
    });
    this.eventCtrl.subscribe('graphql:error', (elementPush) => {
      this.logs.push(elementPush);
      this.loading.dismiss();
    });
  }

  async ionViewWillEnter() {
    const alert = await this.alertController.create({
      header: 'Confirmación',
      message: '¿Está seguro de iniciar la sincronización de datos?',
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {
            this.logs.push({
              type: 'warning',
              message: "La sincronización se ha cancelado",
              time: moment().format('HH:mm:ss')
            });
          }
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.initSync();
          }
        }
      ],
      backdropDismiss: false
    });
    await alert.present();
  }

  async initSync() {
    const _self = this;
    _self.loading = await this.loadingCtrl.create({
      message: 'Por favor espere'
    });
    await _self.loading.present();

    this.ordersService.getDetailsApiStorage()
      .then((orders) => {
        this.totalTemplates = 0;
        if (orders) {
          orders.forEach(order => {
            order.detailsApi.forEach(detailApi => {
              //Api aspiration template
              if (detailApi.aspirationApi) {
                const infoSync = this.isSyncronized(detailApi.aspirationApi);
                if(infoSync) {
                  this.totalTemplates ++;
                  this.updateAspiration(order, detailApi);
                }
              }
            });
          });
        }
        if(this.totalTemplates === 0){
          this.finishSync();
        }
      });
  }

  isSyncronized(workSheet: any) {
    if(workSheet.stateSync === 'U') return true;
    workSheet.details.forEach(detail => {
      if (detail.stateSync === 'U') {
        return true;
      }
      else if(detail.stateSync === 'C') {
        return true;
      }
    });
    return false;
  }

  updateAspiration(order, detailApi) {
    this.logs.push({
      type: 'info',
      message: "Inicia actualización de los detalles de la aspiración con orden " + order.id,
      time: moment().format('HH:mm:ss')
    });

    this.aspirationService.updateAspiration(order, detailApi, detailApi.aspirationApi)
      .then((data: any) => {
        if (data.status === 'error') {
          this.logs.push({
            type: 'error',
            message: data.error,
            time: moment().format('HH:mm:ss')
          });
          this.logs.push({
            type: 'error',
            message: 'Error sincronizando el servicio de aspiración para la orden de producción ' + order.id,
            time: moment().format('HH:mm:ss')
          });

          this.sendPdfEmail(order, detailApi, detailApi.aspirationApi, data.error);

        }
        else if (data.status === 'sucess') {
          this.logs.push({
            type: 'info',
            message: "Se actualizó correctamente la aspiración con orden " + order.id,
            time: moment().format('HH:mm:ss')
          });
          this.sendPdfEmail(order, detailApi, detailApi.aspirationApi, null);
        }
        this.finishSync();
      });
  }

  finishSync() {
    this.totalTemplates --;
    if(this.totalTemplates <= 0) {
      this.logs.push({
        type: 'Info',
        message: 'La sincronización ha finalizado',
        time: moment().format('HH:mm:ss')
      });
      this.retriveAgenda();
    }
  }

  async retriveAgenda() {
    this.logs.push({
      type: 'info',
      message: "Inicia descarga de la agenda",
      time: moment().format('HH:mm:ss')
    });

    this.ordersService.getDetailsApiQuery().then(detailsApi => {
      this.loading.dismiss();
      this.ordersService.setDetailsApiStorage(detailsApi);
      this.eventCtrl.publish('sync:finish');

      this.logs.push({
        type: 'info',
        message: "La descarga de la agenda se ejecutó correctamente",
        time: moment().format('HH:mm:ss'),
        show: false,
      });
    }).catch(error => {
      this.loading.dismiss();
      this.logs.push({
        type: 'error',
        message: "La descarga de la agenda falló",
        show: false,
        time: moment().format('HH:mm:ss')
      });
      if (typeof error === 'string') {
        this.showMessage(error);
      }
      else this.showMessage('No se puede consultar la lista de agendas');
    });
  }

  async showMessage(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }

  isDeploy(registry: any) {
    return registry.show;
  }

  deploy(registry: any) {
    registry.show = !registry.show;
  }

  sendPdfEmail(order, detailApi, aspiration, errorMutation) {
    const data = {
      aspiration: aspiration,
      order: order,
      local: detailApi.local
    };
    const options = {
      watermark: false,
      open: false
    };
    this.aspirationPdf.makePdf(data, options).then((pdf: any) => {
      if (pdf.status === 'error') {
        this.showMessage(pdf.error);
        this.logs.push({
          type: 'error',
          message: 'Error generando el archivo pdf ' + pdf.filename,
          time: moment().format('HH:mm:ss')
        });
      }
      else if (pdf.status === 'success') {
        this.logs.push({
          type: 'info',
          message: 'Enviando el archivo ' + pdf.filename,
          time: moment().format('HH:mm:ss')
        });
        this.sendEmail(pdf, order, detailApi, { textBody:'Error realizando la sincronizacion para la orden de trabajo ' + order.id});
      }
    });
  }

  sendEmail(pdf, order, detailApi, optionsEmail) {
    const _self = this;
    //"cordova-plugin-send-email": "git+https://github.com/EstrategicaEasyForm/cordova-plugin-send-email.git"
    const mailSettings = Object.assign({
      emailFrom: "estrategica.easy.form@gmail.com",
      smtp: "smtp.gmail.com",
      smtpUserName: "estrategica.easy.form",
      smtpPassword: "HqXR8cnnL",
      emailTo: "davithc01@gmail.com",
      emailCC: "camachod@globalhitss.com",
      attachments: [pdf],
      subject: "email subject from the ionic app",
      textBody: "write something within the body of the email"
    },optionsEmail);

    const success = function () {
      _self.logs.push({
        type: 'info',
        message: "Correo automático enviado exitosamente para la orden " + order.id,
        details: [
          "Adjunto enviado archivo " + pdf.dataDirectory + pdf.filename
        ],
        time: moment().format('HH:mm:ss')
      });
    }

    const failure = function (message) {
      _self.showMessage('Error enviando mensaje');
      _self.logs.push({
        type: 'error',
        message: message,
        time: moment().format('HH:mm:ss')
      });
      _self.logs.push({
        type: 'error',
        message: "Error enviando el correo automático para la orden " + order.id,
        time: moment().format('HH:mm:ss')
      });
    }
    try {
      cordova.exec(success, failure, "SMTPClient", "execute", [mailSettings]);
    }
    catch (err) {
      this.showMessage('Error enviando correo');
      this.logs.push({
        type: 'error',
        message: err,
        time: moment().format('HH:mm:ss')
      });
      this.logs.push({
        type: 'error',
        message: "Error enviando el correo automático para la orden " + order.id,
        time: moment().format('HH:mm:ss')
      });
    };
  }
}
