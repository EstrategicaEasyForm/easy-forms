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
  totalError = 0;
  orderStorage: any;

  @ViewChild('networkNotifyBanner') public networkNotifyBanner: NetworkNotifyBannerComponent;
  constructor(
    public ordersService: OrdersService,
    public router: Router,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public usersService: UsersService,
    public alertController: AlertController,
    public eventCtrl: Events,
    public evaluationService: EvaluationService,
    public aspirationService: AspirationService,
    public transferService: TransferService,
    public sendEmail: SendEmailService,
    public diagnosticService: DiagnosticService,
    public sexageService: SexageService,
    public deliveryService: DeliveryService) {

    this.eventCtrl.subscribe('graphql:error', (elementPush) => {
      //this.writeLog(elementPush);
      if(this.loading) this.loading.dismiss();
    });

    this.eventCtrl.subscribe('sync:init', () => {
      this.ionViewWillEnter();
    }); 
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Confirmación',
      message: '¿Está seguro de iniciar la sincronización de datos?',
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {
            this.writeLog({
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

  ionViewWillEnter() {
    this.validateUserToken().then(() => {
      this.presentAlert();
    });
  }

  async initSync() {
    //Clear console
    //this.logs = [];

    const _self = this;
    _self.loading = await this.loadingCtrl.create({
      message: 'Por favor espere'
    });
    await _self.loading.present();

    this.ordersService.getDetailsApiStorage()
      .then((orders) => {
        this.orderStorage = orders;
        this.totalWorkSheets = 0;
        //set the total result of sincronization
        this.totalError = 0;

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
          this.orderStorage = null;
          this.retriveAgenda();
        }
      });
  }

  isSyncronized(workSheet: any): boolean {
    if (workSheet === null) return false;
    if (workSheet.stateSync === 'U' || workSheet.stateSync === 'E') return true;
    if (workSheet.details)
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
    this.writeLog({
      type: 'info',
      message: "Inicia actualización de la planilla " + type.name + ". Orden de producción No " + order.id,
      time: moment().format('HH:mm:ss')
    });

    let updateWorkSheetFunction;
    if (type.id === "1") updateWorkSheetFunction = this.evaluationService.updateEvaluation(detailApi.evaluationApi);
    if (type.id === "2") updateWorkSheetFunction = this.aspirationService.updateAspiration(detailApi.aspirationApi);
    if (type.id === "3") updateWorkSheetFunction = this.transferService.updateTransfer(detailApi.transferApi);
    if (type.id === "4") updateWorkSheetFunction = this.diagnosticService.updateDiagnostic(detailApi.diagnosticApi);
    if (type.id === "5") updateWorkSheetFunction = this.sexageService.updateSexage(detailApi.sexageApi);
    if (type.id === "6") updateWorkSheetFunction = this.deliveryService.updateDelivery(detailApi.deliveryApi);

    updateWorkSheetFunction.then((response: any) => {
      if (response.status === 'error') {
        
        workSheet.stateErrorSync = response.error;

        this.writeLog({
          type: 'error',
          message: 'Error sincronizando la planilla ' + type.name + '. Orden de producción No ' + order.id,
          details: [
            response.error
          ],
          time: moment().format('HH:mm:ss'),
          show: false,
        });
      }
      else if (response.status === 'success') {
        this.writeLog({
          type: 'info',
          message: 'La planilla ' + type.name + ' fué actualizada correctamente para la orden de producción No ' + order.id,
          time: moment().format('HH:mm:ss')
        });
      }

      this.sendEmail.makePdf(order, detailApi, workSheet, type, response).then((pdf) => {
        if (pdf.status === 'error') {
          const errorMessage = typeof pdf.error === 'string' ? pdf.error : JSON.stringify(pdf.error);
          this.writeLog({
            type: 'error',
            message: 'Error generando el archivo pdf: ' + pdf.filename,
            details: [
              'No se ha podido crear el archivo pdf',
			  errorMessage
            ],
            time: moment().format('HH:mm:ss'),
            show: false,
          });
          this.finishSync(null);
        }
        else if (pdf.status === 'success') {
          //State for to Finalize
          if(detailApi.state === "1") {
          this.sendEmail.makeEmail(order, detailApi, workSheet, type, response, pdf).then((resp: any) => {
            if (resp.status === 'success') {
              this.writeLog({
                type: 'info',
                message: "Correo automático enviado a @" + order.client.bussiness_name,
                details: [
                  "Archivo adjunto " + pdf.filename,
                  "Enviado a " + order.client.email
                ],
                time: moment().format('HH:mm:ss'),
                show: false,
              });
              this.finishSync(null);
            }
            else {
              this.writeLog({
                type: 'error',
                message: "Error enviando correo automático a @" + order.client.bussiness_name,
                details: [
				  'No es posible enviar el correo electrónico', 
                  resp.error
                ],
                time: moment().format('HH:mm:ss'),
                show: false,
              });
              this.finishSync(null);
            }
          })
          }
        }

      });
    });
  }

  finishSync(error) {
    this.totalWorkSheets--;
    if (error) this.totalError++;

    if (this.totalWorkSheets <= 0) {
      if (this.totalError > 0) {
        this.writeLog({
          type: 'warning',
          message: 'La sincronización ha finalizado con errores',
          time: moment().format('HH:mm:ss')
        });
      }
      else {
        this.writeLog({
          type: 'info',
          message: 'La sincronización ha finalizado exitósamente',
          time: moment().format('HH:mm:ss')
        });
      }

      this.retriveAgenda();
    }
  }

  async retriveAgenda() {
    this.writeLog({
      type: 'info',
      message: "Inicia descarga de la agenda",
      time: moment().format('HH:mm:ss')
    });

    this.ordersService.getDetailsApiQuery().then(detailsApi => {
      this.loading.dismiss();
      if(this.orderStorage)
      detailsApi = this.diff(this.orderStorage,detailsApi);
      
      this.ordersService.setDetailsApiStorage(detailsApi);
      this.eventCtrl.publish('sync:finish');

      this.writeLog({
        type: 'info',
        message: "La descarga de la agenda se ejecutó correctamente",
        time: moment().format('HH:mm:ss')
      });
    }).catch(error => {
      this.loading.dismiss();
      this.writeLog({
        type: 'error',
        message: "La descarga de la agenda falló",
        details: [
          error
        ],
        show: false,
        time: moment().format('HH:mm:ss')
      });
      if (typeof error === 'string') {
        this.showMessage(error);
      }
      else this.showMessage('No se puede consultar la lista de agendas');
    });
  }
  diff(orderStorage: any, ordersList: any) {
    function getOrder(order){
      for(let ord of ordersList) {
        if(ord.id === order.id) {
          return ord;
        }
      }
      ordersList.push(order);
      return order;
    }
    function getDetailApi(order,detail){
      for(let dtApi of order.detailsApi) {
        if(dtApi.id === detail.id) {
          return dtApi;
        }
      }
      order.detailApi.push(detail);
      return detail;
    }
    let newOrder:any;
    let newDetailApi:any;
    let newWorkSheetApi: any;
    for(let order of orderStorage) {
      for(let detail of order.detailsApi){
        for(let template of this.ordersService.templates){
          newOrder = getOrder(order);
          newDetailApi = getDetailApi(newOrder,detail);
          if(newDetailApi[template.tag]) {
            newWorkSheetApi = newDetailApi[template.tag];
			newWorkSheetApi.photoImage = detail[template.tag] ? detail[template.tag].photoImage : '';
			newWorkSheetApi.signatureImage = detail[template.tag] ? detail[template.tag].signatureImage : '';
            if(detail[template.tag] && detail[template.tag].stateErrorSync) {
              newWorkSheetApi.stateSync = 'E';
            }
          }
          else {
            if(detail[template.tag] && detail[template.tag].stateErrorSync) {
              newWorkSheetApi = detail[template.tag];
              newWorkSheetApi.stateSync = 'E';
            }
          }
        }
      }
    }
    return ordersList;
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

  async validateUserToken() {
    const loading = await this.loadingCtrl.create({
      message: 'Por favor espere'
    });
    await loading.present();

    return new Promise((resolve, reject) => {
      this.usersService.getUserAuthToken().then(userAuthStorage => {
        let userAuth = { 'email': userAuthStorage.email, 'password': userAuthStorage.password };
        this.usersService.login(userAuth)
          .subscribe(({ data }) => {
            loading.dismiss();
            userAuth = Object.assign(userAuth, data.login);
            //Setting new token authentication
            this.usersService.setUserAuthToken(userAuth);
            this.usersService.addUserAuthStorage(userAuth);
            resolve(true);

          }, (error) => {
            loading.dismiss();
            if (error.graphQLErrors) {
              for (let err of error.graphQLErrors) {
                if (err.extensions.category === 'authentication') {
                  this.showMessage('Usuario o clave incorrectos');
                  this.writeLog({
                    type: 'error',
                    message: "No se puede realizar la sincronización",
                    details: [
                      "Usuario o clave inválidos",
                      "Por favor cierre e inicie nuevamente sesión"
                    ],
                    time: moment().format('HH:mm:ss'),
                    show: false,
                  });
                  resolve(false);
                }
              }
              this.writeLog({
                type: 'error',
                message: "No se puede acceder al servidor",
                details: [
                  "Comprueba tu conexión a Internet!!, Reinicia los routers, modems y dispositivos de red que estés usando",
                  JSON.stringify(error),
                ],
                show: false,
                time: moment().format('HH:mm:ss')
              });
              resolve(false);
            }
          })
      });

    });
  }

  writeLog(elementPush) {
    this.logs = [elementPush].concat(this.logs);
  }
}
