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
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';

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
  syncronizedSucess: boolean;

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
    public deliveryService: DeliveryService,
	public apollo: Apollo) {

    this.eventCtrl.subscribe('graphql:error', (elementPush) => {
      this.writeLog(elementPush);
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
              time: moment().format('HH:mm A')
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
    this.validateUserToken().then((res) => {
      if(res)
      this.presentAlert();
    });
  }

  async initSync() {
    //Clear console
    this.logs = [];
	this.syncronizedSucess = false;

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
    
    let updateWorkSheetFunction;
    if (type.id === this.ordersService.templates[0].id) updateWorkSheetFunction = this.evaluationService.updateEvaluation(detailApi.evaluationApi);
    if (type.id === this.ordersService.templates[1].id) updateWorkSheetFunction = this.aspirationService.updateAspiration(detailApi.aspirationApi);
    if (type.id === this.ordersService.templates[2].id) updateWorkSheetFunction = this.transferService.updateTransfer(detailApi.transferApi);
    if (type.id === this.ordersService.templates[3].id) updateWorkSheetFunction = this.diagnosticService.updateDiagnostic(detailApi.diagnosticApi);
    if (type.id === this.ordersService.templates[4].id) updateWorkSheetFunction = this.sexageService.updateSexage(detailApi.sexageApi);
    if (type.id === this.ordersService.templates[5].id) updateWorkSheetFunction = this.deliveryService.updateDelivery(detailApi.deliveryApi);

    updateWorkSheetFunction.then((response: any) => {
	  
      if (response.status === 'error') {
        workSheet.stateErrorSync = 'Error sincronizando la planilla';
        this.writeLog({
          type: 'error',
          message: 'Error sincronizando la planilla ' + type.name + '. Orden de producción #' + order.id,
          details: [
            response.error
          ],
          time: moment().format('HH:mm A'),
          show: false,
        });
		this.finishSync(response.error);
      }
	  //If Template State is Finalize
	  else if(workSheet.state == "1") {
		  
		  this.enableEvent(detailApi, workSheet, type).then((res: any) => {
			if (res.status === 'error') {
				workSheet.stateErrorSync = 'Error finalizando la planilla ';
				
				this.writeLog({
				  type: 'error',
				  message: 'Error sincronizando la planilla ' + type.name + '. Orden de producción #' + order.id,
				  details: [
				    'No se puede invocar el servicio para la finalizacion de la planilla',	
					res.error
				  ],
				  time: moment().format('HH:mm A'),
				  show: false,
				});
				
				this.finishSync(res.error);
			}
			else {
				this.sendEmail.makePdf(order, detailApi, workSheet, type, response).then((pdf) => {
					//reponse pdf Make
					if (pdf.status === 'error') {
					  
					  const errorMessage = typeof pdf.error === 'string' ? pdf.error : JSON.stringify(pdf.error);
					  workSheet.stateErrorSync = 'Error generando el pdf';
					  this.writeLog({
						type: 'error',
						message: 'Error generando el archivo pdf: ' + pdf.filename,
						details: [
						  errorMessage
						],
						time: moment().format('HH:mm A'),
						show: false,
					  });
					  this.finishSync(errorMessage);
					}
					else if (pdf.status === 'success') {
					  
					  this.sendEmail.makeEmail(order, detailApi, workSheet, type, response, pdf).then((resp: any) => {
						//response Send Email
						if (resp.status === 'success') {
						  
						  //response mutation services
						  if (response.status === 'success') {
							this.writeLog({
							  type: 'info',
							  message: 'La planilla de ' + type.name + ' fué actualizada correctamente para la orden de producción #' + order.id,
							  details: [
								"Correo automático enviado a " + order.client.bussiness_name,
								"Email: " + order.client.email,
								"Archivo adjunto " + pdf.filename
							  ],
							  time: moment().format('HH:mm A'),
							  show: false,
							});
							this.finishSync(null);
						  }
						  else {
							  this.writeLog({
							  type: 'error',
							  message: 'Error sincronizando la planilla de ' + type.name + ' para la orden de producción #' + order.id,
							  details: [
								response.error
							  ],
							  time: moment().format('HH:mm A'),
							  show: false,
							});
							this.finishSync(response.error);
						  }
						  
						}
						else {
						  workSheet.stateErrorSync = 'Error enviando el correo';
						  this.writeLog({
							type: 'error',
							message: "Error enviando correo automático a @" + order.client.bussiness_name,
							details: [
							  'No es posible enviar el correo electrónico', 
							  resp.error
							],
							time: moment().format('HH:mm A'),
							show: false,
						  });
						  this.finishSync(resp.error);
						}
					  })
					}
				  });
				}
		  });
	  }
	  else {
		  this.finishSync(null);
	  }
    });
  }

  finishSync(error) {
    this.totalWorkSheets--;
    if (error) this.totalError++;

    if (this.totalWorkSheets <= 0) {
		this.syncronizedSucess = this.totalError === 0;
        this.retriveAgenda(); 
    }
  }

  async retriveAgenda() {
    
    this.ordersService.getDetailsApiQuery().then(detailsApi => {
		
      this.loading.dismiss();
	  
      if(this.orderStorage)
      detailsApi = this.diff(this.orderStorage,detailsApi);
      
	  
	  if(this.syncronizedSucess)
      this.writeLog({
          type: 'info',
          message: 'La sincronización ha finalizado exitósamente',
          time: moment().format('HH:mm A')
      });
	  else 
	  this.writeLog({
        type: 'info',
        message: "La agenda se ha actualizó correctamente",
        time: moment().format('HH:mm A')
      });
	  
      this.ordersService.setDetailsApiStorage(detailsApi);
      this.eventCtrl.publish('sync:finish');

    }).catch(error => {
      this.loading.dismiss();
	  if(this.syncronizedSucess)
      this.writeLog({
          type: 'info',
          message: 'La sincronización ha finalizado exitósamente',
          time: moment().format('HH:mm A')
      });
      this.writeLog({
        type: 'error',
        message: "Se ha generado un error realizando la descarga de la agenda",
        details: [
		  'No se puede consultar el servicio de Ordenes',  
          error
        ],
        show: false,
        time: moment().format('HH:mm A')
      });
      if (typeof error === 'string') {
        this.showMessage(error);
      }
      else this.showMessage('No se puede consultar el servicio de ordenes');
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
                    message: "Error invocando el servicio",
                    details: [
                      "Usuario o clave incorrectos",
                      "Por favor cierre e inicie nuevamente sesión"
                    ],
                    time: moment().format('HH:mm A'),
                    show: false,
                  });
                  resolve(false);
                }
              }
            }
			else {
			  this.writeLog({
                type: 'error',
                message: "No se puede acceder al servidor",
                details: [
                  "Comprueba tu conexión a Internet!!, Reinicia los routers, modems y dispositivos de red que estés usando",
                  JSON.stringify(error),
                ],
                show: false,
                time: moment().format('hh:mm A')
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
  
  enableEvent(detailApi, workSheet, type) {
    const enableEventMutation = gql`
      mutation enableEvent($input: EnableEventInput!){
        enableEvent (input: $input) {
          eventCreate
		  state
        }
      }`;

    let variables = {
      "input": {
        "order_detail_id": detailApi.id,
		"event_id": type.id,
      }
    };
	
	if(type.id === '1' || type.id === '4' || type.id === '5' || type.id === '6' ) {
		return new Promise(resolve => {
		  this.apollo.mutate({
			mutation: enableEventMutation,
			variables: Object.assign({ "input": {} }, variables)
		  }).subscribe(({ data }) => {
			resolve({ status: 'success', data: data });
		  }, (error) => {
			resolve({ status: 'error', error: error });
		  });
		});
	}
	else {
		return new Promise(resolve => {
		  resolve({ status: 'success'});
		});
	}
  }
}
