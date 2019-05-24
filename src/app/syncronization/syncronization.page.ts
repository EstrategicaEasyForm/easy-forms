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
import { SendEmailService } from './send-email.services';

@Component({
  selector: 'app-syncronization',
  templateUrl: './syncronization.page.html',
  styleUrls: ['./syncronization.page.scss'],
})
export class SyncronizationPage {

  templates = [
    {
      "id": "1",
      "name": "Evaluación de Receptoras",
      "tag": "evaluationApi"
    },
    {
      "id": "2",
      "name": "Aspiración Folicular",
      "tag": "aspirationApi"
    },
    {
      "id": "4",
      "name": "Transferencia de Embrión",
      "tag": "transferApi"
    },
    {
      "id": "5",
      "name": "Diagnóstico",
      "tag": "diagnosticApi"
    },
    {
      "id": "6",
      "name": "Sexaje",
      "tag": "sexageApi"
    },
    {
      "id": "7",
      "name": "Entrega",
      "tag": "deliveryApi"
    }
  ];

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
    public sendEmail: SendEmailService) {

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
                if (infoSync) {
                  this.totalTemplates++;
                  this.updateWorkSheet(order, detailApi, detailApi.aspirationApi, this.templates[1]);
                }
              }
            });
          });
        }
        if (this.totalTemplates === 0) {
          this.finishSync();
        }
      });
  }

  isSyncronized(workSheet: any): boolean {
    if (workSheet === null) return false;
    if (workSheet.stateSync === 'U') return true;
    workSheet.details.forEach(detail => {
      if (detail.stateSync === 'U') {
        return true;
      }
      else if (detail.stateSync === 'C') {
        return true;
      }
    });
    return false;
  }

  updateWorkSheet(order, detailApi, workSheet, type) {
    this.logs.push({
      type: 'info',
      message: "Inicia actualización de " + type.name + ". Orden de producción No " + order.id,
      time: moment().format('HH:mm:ss')
    });

    this.aspirationService.updateAspiration(order, detailApi, detailApi.aspirationApi)
      .then((response: any) => {
        if (response.status === 'error') {
          this.logs.push({
            type: 'error',
            message: response.error,
            time: moment().format('HH:mm:ss')
          });
          this.logs.push({
            type: 'error',
            message: 'Error sincronizando el servicio de ' + type.name + '. Orden de producción No ' + order.id,
            time: moment().format('HH:mm:ss')
          });
        }
        else if (response.status === 'success') {
          this.logs.push({
            type: 'success',
            message: 'Datos de ' + type.name + ' actualizados correctamente para la orden de producción No ' + order.id,
            time: moment().format('HH:mm:ss')
          });
        }

        this.sendEmail.makePdf(order, detailApi, workSheet, type, response).then((pdf) => {
          if (pdf.status === 'error') {
            this.logs.push({
              type: 'error',
              message: 'Error generando el archivo pdf ' + pdf.filename,
              time: moment().format('HH:mm:ss')
            });
          }
          else if (pdf.status === 'success') {
            this.sendEmail.makeEmail(order, detailApi, workSheet, type, response, pdf).then((resp: any) => {
              if (resp.status === 'success') {
                this.logs.push({
                  type: 'info',
                  message: "Correo automático enviado exitosamente para la orden " + order.id,
                  details: [
                    "Adjunto enviado archivo " + pdf.dataDirectory + pdf.filename
                  ],
                  time: moment().format('HH:mm:ss')
                });
              }
              else {
                this.logs.push({
                  type: 'error',
                  message: resp.error,
                  time: moment().format('HH:mm:ss')
                });
              }
            })
          }
          this.finishSync();
        });
      });
  }

  finishSync() {
    this.totalTemplates--;
    if (this.totalTemplates <= 0) {
      this.logs.push({
        type: 'info',
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
}
