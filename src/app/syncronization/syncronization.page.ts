import { Component, OnInit } from '@angular/core';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { OrdersService } from '../orders.service';
import { ViewChild } from '@angular/core';
import { NetworkNotifyBannerComponent } from '../network-notify-banner/network-notify-banner.component';
import { UsersService } from '../users.service';
import { DomSanitizer } from '@angular/platform-browser';
import { AspirationService } from './aspiration.services';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-syncronization',
  templateUrl: './syncronization.page.html',
  styleUrls: ['./syncronization.page.scss'],
})
export class SyncronizationPage {

  loading: any;
  contentConsole: string = "";
  registries: any = [];

  @ViewChild('networkNotifyBanner') public networkNotifyBanner: NetworkNotifyBannerComponent;
  constructor(
    public ordersService: OrdersService,
    public router: Router,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public userService: UsersService,
    public alertController: AlertController,
    private sanitizer: DomSanitizer,
    private aspirationService: AspirationService) {}

  ionViewWillEnter() {
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
            this.registries.push({
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
    var countAspirations: number = 0;
    var totalAspirations: number = 0;
    var boolAspiration: boolean = false;
    var boolDetails: boolean = false;
    this.ordersService.getDetailsApiStorage().then((orders) => {
      if (orders) {

        orders.forEach(order => {
          order.detailsApi.forEach(element => {
            if (element.aspirationApi) {
              //if (element.aspirationApi.id == '31') {
              //  element.aspirationApi.stateSync = 'U';
              //  element.aspirationApi.comments = "Sin comentarios";
              //}
              if (element.aspirationApi.stateSync && element.aspirationApi.stateSync == 'U') {
                boolAspiration = true;
              }
              element.aspirationApi.details.forEach(detail => {
                //if (detail.id == '495') {
                //  detail.stateSync = 'U';
                //  detail.donor = "NN";
                //}
                if (detail.stateSync && (detail.stateSync == 'C' || detail.stateSync == 'U')) {
                  boolDetails = true;
                }
              });
              if (boolAspiration == true || boolDetails == true) {
                totalAspirations = totalAspirations + 1;
              }
              boolAspiration = false;
              boolDetails = false;
            }
          });
        });
        orders.forEach(order => {
          order.detailsApi.forEach(element => {
            if (element.aspirationApi) {
              //Update aspiration
              if (element.aspirationApi.stateSync && element.aspirationApi.stateSync == 'U') {
                element.aspirationApi.user_id_updated = this.userService.getUserId();
                boolAspiration = true;
              }
              //Update details from aspiration
              var details: any = {};
              var creates: any = [];
              var updates: any = [];
              element.aspirationApi.details.forEach(elementDetail => {
                if (elementDetail.stateSync && elementDetail.stateSync == 'U') {
                  boolDetails = true;
                  var elementUpdate: any = {};
                  elementUpdate['id'] = elementDetail.id;
                  elementUpdate['local_id'] = elementDetail.local_id;
                  elementUpdate['donor'] = elementDetail.donor;
                  elementUpdate['donor_breed'] = elementDetail.donor_breed;
                  elementUpdate['arrived_time'] = elementDetail.arrived_time;
                  elementUpdate['bull'] = elementDetail.bull;
                  elementUpdate['bull_breed'] = elementDetail.bull_breed;
                  elementUpdate['type'] = elementDetail.type;
                  elementUpdate['gi'] = elementDetail.gi;
                  elementUpdate['gss'] = elementDetail.gss;
                  elementUpdate['gssi'] = elementDetail.gssi;
                  elementUpdate['others'] = elementDetail.others;
                  elementUpdate['user_id_updated'] = this.userService.getUserId();
                  updates.push(elementUpdate);
                }
                if (elementDetail.stateSync && elementDetail.stateSync == 'C') {
                  boolDetails = true;
                  var elementCreate: any = {};
                  elementCreate['local_id'] = elementDetail.local_id;
                  elementCreate['donor'] = elementDetail.donor;
                  elementCreate['donor_breed'] = elementDetail.donor_breed;
                  elementCreate['arrived_time'] = elementDetail.arrived_time;
                  elementCreate['bull'] = elementDetail.bull;
                  elementCreate['bull_breed'] = elementDetail.bull_breed;
                  elementCreate['type'] = elementDetail.type;
                  elementCreate['gi'] = elementDetail.gi;
                  elementCreate['gss'] = elementDetail.gss;
                  elementCreate['gssi'] = elementDetail.gssi;
                  elementCreate['others'] = elementDetail.others;
                  elementCreate['user_id_updated'] = this.userService.getUserId();
                  elementCreate['user_id_created'] = this.userService.getUserId();
                  creates.push(elementCreate);
                }
              });
              if (creates.length > 0) {
                details['create'] = creates;
              }
              if (updates.length > 0) {
                details['update'] = updates;
              }
              if (boolAspiration == true && boolDetails == false) {
                element.aspirationApi.user_id_updated = this.userService.getUserId();
                  this.registries.push({
                    type:'info',
                    message:"Inicia actualización de la aspiración con orden " + order.id,
                    time:moment().format('HH:mm:ss')
                  });

                  this.aspirationService.updateOnlyAspiration(element.aspirationApi)
                  .subscribe(({ data }) => {
                    countAspirations = countAspirations + 1;
                    if (data.updateAspiration) {
                        this.registries.push({
                          type:'info',
                          message:"Se actualizó correctamente la aspiración con orden " + order.id,
                          time:moment().format('HH:mm:ss')
                        });
                    } else {
                      this.registries.push({
                        type:'error',
                        message:"Ocurrió un error actualizando la aspiración con orden " + order.id,
                        time:moment().format('HH:mm:ss')
                      });
                    }
                    if (totalAspirations == countAspirations) {
                      this.retriveAgenda();
                    }
                  });
              } else if (boolAspiration == false && boolDetails == true) {
                element.aspirationApi.user_id_updated = this.userService.getUserId();
                var dataDetails: any = {};
                dataDetails['details'] = details;
                  this.registries.push({
                    type:'info',
                    message:"Inicia actualización de los detalles de la aspiración con orden " + order.id,
                    time:moment().format('HH:mm:ss')
                  });

                this.aspirationService.updateAspirationDetails(element.aspirationApi, dataDetails)
                  .subscribe(({ data }) => {
                    countAspirations = countAspirations + 1;
                    if (data.updateAspiration) {
                      this.registries.push({
                        type:'info',
                        message:"Se actualizó correctamente los detalles de la aspiración con orden " + order.id,
                        time:moment().format('HH:mm:ss')
                      });
                    } else {
                      this.registries.push({
                        type:'error',
                        message:"Ocurrio un error actualizando los detalles de la aspiración con orden " + order.id,
                        time:moment().format('HH:mm:ss')
                      });
                    }
                    if (totalAspirations == countAspirations) {
                      this.retriveAgenda();
                    }
                  });
              } else if (boolAspiration == true && boolDetails == true) {
                element.aspirationApi.user_id_updated = this.userService.getUserId();
                var dataDetails: any = {};
                dataDetails['details'] = details;
                this.registries.push({
                  type:'info',
                  message:"Inicia actualización de toda la aspiración con orden " + order.id,
                  time:moment().format('HH:mm:ss')
                });

                this.aspirationService.updateAllAspiration(element.aspirationApi, dataDetails)
                  .subscribe(({ data }) => {
                    countAspirations = countAspirations + 1;
                    if (data.updateAspiration) {
                      this.registries.push({
                        type:'info',
                        message:"Se actualizó correctamente toda la aspiración con orden " + order.id,
                        time:moment().format('HH:mm:ss')
                      });
                    } else {
                      this.registries.push({
                        type:'error',
                        message:"Ocurrio un error actualizando toda la aspiración con orden " + order.id,
                        time:moment().format('HH:mm:ss')
                      });
                    }
                    if (totalAspirations == countAspirations) {
                      this.retriveAgenda();
                    }
                  });
              }
              boolAspiration = false;
              boolDetails = false;
            }
          });
        });
      }
      if (totalAspirations == 0) {
        this.retriveAgenda();
      }
    });
  }

  async retriveAgenda() {
      this.registries.push({
        type : 'info',
        message : "Inicia descarga de la agenda",
        time : moment().format('HH:mm:ss')
      });

    this.ordersService.getDetailsApiQuery().then(detailsApi => {
      this.loading.dismiss();
      this.ordersService.setDetailsApiStorage(detailsApi);
      //_self.router.navigate(['tabs/agenda', {
      //  message: "Sincronización realizada exitosamente!!"
      //}]);
      this.registries.push({
        type : 'info',
        message : "La descarga de la agenda se ejecutó correctamente",
        time : moment().format('HH:mm:ss'),
        show : false,
        details : [
          "Se ejecuta correctamente la descarga de la agenda",
          "Se ejecuta correctamente la descarga de la agenda 2"
        ]
      });
    }).catch(error => {
      this.loading.dismiss();
      this.registries.push({
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
