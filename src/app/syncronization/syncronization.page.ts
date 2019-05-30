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
import { TransferService } from './transfer.services';
import { DiagnosticService } from './diagnostic.services';
import { EvaluationService } from './evaluation.services';
import { DeliveryService } from './delivery.services';
import { SexageService } from './sexage.services';

@Component({
  selector: 'app-syncronization',
  templateUrl: './syncronization.page.html',
  styleUrls: ['./syncronization.page.scss'],
})
export class SyncronizationPage {

  loading: any;
  logs = [];
  totalWorkSheets = 0;

  @ViewChild('networkNotifyBanner') public networkNotifyBanner: NetworkNotifyBannerComponent;
  constructor(
    public ordersService: OrdersService,
    public router: Router,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public userService: UsersService,
    public alertController: AlertController,
    public eventCtrl: Events,
    public evaluationService: EvaluationService,
    public aspirationService: AspirationService,
    public transferService: TransferService,
    public sendEmail: SendEmailService,
    public diagnosticService: DiagnosticService,
    public sexageService: SexageService,
    public deliveryService: DeliveryService) {

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
        this.totalWorkSheets = 0;
        if (orders) {
          orders.forEach(order => {
            order.detailsApi.forEach(detailApi => {

              //Api evaluation template
              if (detailApi.evaluationApi) {
                const isSync = this.isSyncronized(detailApi.evaluationApi);
                if (isSync) {
                  this.totalWorkSheets++;
                  this.updateWorkSheet(order, detailApi, detailApi.evaluationApi, this.ordersService.templates[0]);
                }
              }
              //Api aspiration template
              if (detailApi.aspirationApi) {
                const isSync = this.isSyncronized(detailApi.aspirationApi);
                if (isSync) {
                  this.totalWorkSheets++;
                  this.updateWorkSheet(order, detailApi, detailApi.aspirationApi, this.ordersService.templates[1]);
                }
              }
              //Api transfer template
              if (detailApi.transferApi) {
                const isSync = this.isSyncronized(detailApi.transferApi);
                if (isSync) {
                  this.totalWorkSheets++;
                  this.updateWorkSheet(order, detailApi, detailApi.transferApi, this.ordersService.templates[2]);
                }
              }
			  //Api diagnostic template
              if (detailApi.diagnosticApi) {
                const isSync = this.isSyncronized(detailApi.diagnosticApi);
                if (isSync) {
                  this.totalWorkSheets++;
                  this.updateWorkSheet(order, detailApi, detailApi.diagnosticApi, this.ordersService.templates[3]);
                }
              }
			  //Api sexage template
              if (detailApi.sexageApi) {
                const isSync = this.isSyncronized(detailApi.sexageApi);
                if (isSync) {
                  this.totalWorkSheets++;
                  this.updateWorkSheet(order, detailApi, detailApi.sexageApi, this.ordersService.templates[4]);
                }
              }
			  //Api delivery template
              if (detailApi.deliveryApi) {
                const isSync = this.isSyncronized(detailApi.deliveryApi);
                if (isSync) {
                  this.totalWorkSheets++;
                  this.updateWorkSheet(order, detailApi, detailApi.deliveryApi, this.ordersService.templates[5]);
                }
              }
            });
          });
        }
        if (this.totalWorkSheets === 0) {
          this.finishSync();
        }
      });
  }

  isSyncronized(workSheet: any): boolean {
    if (workSheet === null) return false;
    if (workSheet.stateSync === 'U') return true;
	if(workSheet.details)
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
      message: "Inicia actualización de la planilla " + type.name + ". Orden de producción No " + order.id,
      time: moment().format('HH:mm:ss')
    });

    let updateWorkSheetFunction;
    if(type.id==="1") updateWorkSheetFunction = this.evaluationService.updateEvaluation(detailApi.evaluationApi);
    if(type.id==="2") updateWorkSheetFunction = this.aspirationService.updateAspiration(detailApi.aspirationApi);
    if(type.id==="3") updateWorkSheetFunction = this.transferService.updateTransfer(detailApi.transferApi);
    if(type.id==="4") updateWorkSheetFunction = this.diagnosticService.updateDiagnostic(detailApi.diagnosticApi);
    if(type.id==="5") updateWorkSheetFunction = this.sexageService.updateSexage(detailApi.sexageApi);
    if(type.id==="6") updateWorkSheetFunction = this.deliveryService.updateDelivery(detailApi.deliveryApi);
      
    updateWorkSheetFunction.then((response: any) => {
        if (response.status === 'error') {
          this.logs.push({
            type: 'error',
            message: response.error,
            time: moment().format('HH:mm:ss')
          });
          this.logs.push({
            type: 'error',
            message: 'Error sincronizando la planilla ' + type.name + '. Orden de producción No ' + order.id,
            time: moment().format('HH:mm:ss')
          });
        }
        else if (response.status === 'success') {
          this.logs.push({
            type: 'success',
            message: 'La planilla ' + type.name + ' fué actualizada correctamente para la orden de producción No ' + order.id,
            time: moment().format('HH:mm:ss')
          });
        }

        this.sendEmail.makePdf(order, detailApi, workSheet, type, response).then((pdf) => {
          if (pdf.status === 'error') {
            const errorMessage = typeof pdf.error === 'string' ? pdf.error : JSON.stringify(pdf.error);
            this.logs.push({
              type: 'error',
              message: 'Error generando el archivo pdf: ' + pdf.filename,
              details: [
                errorMessage
              ],
              time: moment().format('HH:mm:ss')
            });
          }
          else if (pdf.status === 'success') {
            //State for Finalize
            //if(detailApi.state === "1") {
              this.logs.push({
                type: 'info',
                message: 'Inicia envío de correo para la planilla ' + type.name,
                details: [
                  "Archivo adjunto " + pdf.filename,
                  "Directorio: " + pdf.dataDirectory
                ],
                time: moment().format('HH:mm:ss')
              });
              this.sendEmail.makeEmail(order, detailApi, workSheet, type, response, pdf).then((resp: any) => {
                if (resp.status === 'success') {
                  this.logs.push({
                    type: 'info',
                    message: "Correo automático enviado a @nnn",
                    details: [
                      resp.message
                    ],
                    time: moment().format('HH:mm:ss')
                  });
                }
                else {
                  this.logs.push({
                    type: 'error',
                    message:"Error enviando correo automático",
                    details: [
                      resp.error
                    ],
                    time: moment().format('HH:mm:ss')
                  });
                }
              })
            //}
          }
          this.finishSync();
        });
      });
  }

  finishSync() {
    this.totalWorkSheets--;
    if (this.totalWorkSheets <= 0) {
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
