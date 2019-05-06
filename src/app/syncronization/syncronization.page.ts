import { Component, OnInit } from '@angular/core';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { OrdersService } from '../orders.service';
import { ViewChild } from '@angular/core';
import { NetworkNotifyBannerComponent } from '../network-notify-banner/network-notify-banner.component';
import { UsersService } from '../users.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-syncronization',
  templateUrl: './syncronization.page.html',
  styleUrls: ['./syncronization.page.scss'],
})
export class SyncronizationPage {

  loading : any;
  contentConsole : string = "";

  @ViewChild('networkNotifyBanner') public networkNotifyBanner: NetworkNotifyBannerComponent;
  constructor(
    public ordersService: OrdersService,
    public router: Router,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public userService : UsersService,
    public alertController : AlertController,
    private sanitizer : DomSanitizer) {

  }

  ionViewWillEnter() {
    this.contentConsole = "";
    this.initSync();
  }
  
  async initSync() {
    const alert = await this.alertController.create({
      header : 'Confirmación',
      message : '¿Está seguro de iniciar la sincronización de datos?',
      buttons : [
        {
          text : 'Cancelar',
          handler : () => {
            this.contentConsole = "<h4 style='color: #AFAF06'>La sincronización se ha cancelado</h4>";
          }
        },
        {
          text : 'Confirmar',
          handler : () => {
            this.syncAspiration();
          }
        }
      ],
      backdropDismiss : false
    });
    await alert.present();
  }

  async syncAspiration () {
    const _self = this;
    _self.loading = await this.loadingCtrl.create({
      message: 'Por favor espere'
    });
    await _self.loading.present();
    var countAspirations : number = 0;
    var totalAspirations : number = 0;
    var boolAspiration : boolean = false;
    var boolDetails : boolean = false;
    this.ordersService.getDetailsApiStorage().then((data) => {
      if (data) {
        data.forEach(element => {
          if (element.aspirationApi) {
            //if (element.aspiration.id == '1') {
            //  element.aspiration.stateSync = 'U';
            //  element.aspiration.comments = "Sin comentarios";
            //}
            if (element.aspirationApi.stateSync && element.aspirationApi.stateSync == 'U') {
				element.aspirationApi.user_id_updated = this.userService.getUserId();
              boolAspiration = true;
            }
            element.aspirationApi.details.forEach(detail => {
              //if (elementDetail.id == '1') {
              //  elementDetail.stateSync = 'C';
              //}
              //if (detail.id == '2') {
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
            boolDetails= false;
          }
        });
        data.forEach(element => {
          if (element.aspirationApi) {
            boolAspiration = false;
            boolDetails= false;
            //Update aspiration
            if (element.aspirationApi.stateSync && element.aspirationApi.stateSync == 'U') {
				element.aspirationApi.user_id_updated = this.userService.getUserId();
              boolAspiration = true;
            }
            //Update details from aspiration
            var details : any = {};
            var creates : any = [];
            var updates : any = [];
            element.aspirationApi.details.forEach(elementDetail => {
              if (elementDetail.stateSync && elementDetail.stateSync == 'U') {
                boolDetails = true;
                var elementUpdate : any = {};
                elementUpdate['id'] = elementDetail.id;
                elementUpdate['local_id'] = elementDetail.local_id;
                elementUpdate['donor'] = elementDetail.donor;
                elementUpdate['donor_breed'] = elementDetail.donor_breed;
                elementUpdate['arrived_time'] = elementDetail.arrived_time;
                elementUpdate['bull'] = elementDetail.bull;
                elementUpdate['bull_breed'] = elementDetail.bull_breed;
                elementUpdate['type'] = elementDetail.type;
                elementUpdate['gi'] = elementDetail.gi;
                elementUpdate['gii'] = elementDetail.gii;
                elementUpdate['giii'] = elementDetail.giii;
                elementUpdate['others'] = elementDetail.others;
                elementUpdate['user_id_updated'] = this.userService.getUserId();
                updates.push(elementUpdate);
              } 
              if (elementDetail.stateSync && elementDetail.stateSync == 'C') {
                boolDetails = true;
                var elementCreate : any = {};
                elementCreate['local_id'] = elementDetail.local_id;
                elementCreate['donor'] = elementDetail.donor;
                elementCreate['donor_breed'] = elementDetail.donor_breed;
                elementCreate['arrived_time'] = elementDetail.arrived_time;
                elementCreate['bull'] = elementDetail.bull;
                elementCreate['bull_breed'] = elementDetail.bull_breed;
                elementCreate['type'] = elementDetail.type;
                elementCreate['gi'] = elementDetail.gi;
                elementCreate['gii'] = elementDetail.gii;
                elementCreate['giii'] = elementDetail.giii;
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
              _self.contentConsole = _self.contentConsole 
                + "<h4 style='color: green'>Inicia actualización del aspirador " 
                + element.aspirationApi.aspirator + "</h4>";
              this.ordersService.updateAspiration(element.aspirationApi)
                  .subscribe(({ data }) => {
                    countAspirations = countAspirations + 1;
                    if (data.updateAspiration) {
                      _self.contentConsole = _self.contentConsole 
                        + "<h4 style='color: green'>Se actualizó correctamente el aspirador " 
                        + element.aspirationApi.aspirator + "</h4>";
                    } else {
                      _self.contentConsole = _self.contentConsole 
                        + "<h4 style='color: red'>Ocurrió un error actualizando el aspirador " 
                        + element.aspirationApi.aspirator + "</h4>";
                    }
                    if (totalAspirations == countAspirations) {
                      this.retriveAgenda();
                    }
                  });
            } else {
              if (Object.getOwnPropertyNames(details).length > 0) {
                var dataDetails : any = {};
                dataDetails['details'] = details;
                _self.contentConsole = _self.contentConsole 
                  + "<h4 style='color: green'>Inicia actualización de los detalles del aspirador " 
                  + element.aspirationApi.aspirator + "</h4>";
                this.ordersService.updateAspirationDetails(element.aspirationApi, dataDetails)
                    .subscribe(({ data }) => {
                      countAspirations = countAspirations + 1;
                      if (data.updateAspiration) {
                        _self.contentConsole = _self.contentConsole 
                          + "<h4 style='color: green'>Se actualizó correctamente los detalles del aspirador " 
                          + element.aspirationApi.aspirator + "</h4>";
                      } else {
                        _self.contentConsole = _self.contentConsole 
                          + "<h4 style='color: red'>Ocurrio un error actualizando los detalles del aspirador " 
                          + element.aspirationApi.aspirator + "</h4>";
                      }
                      if (totalAspirations == countAspirations) {
                        this.retriveAgenda();
                      }
                    });
              }
            }
          }
        });
      }
      if (totalAspirations == 0) {
        this.retriveAgenda();
      }
  });
  }

  async retriveAgenda() {
    const _self = this;
    _self.contentConsole = _self.contentConsole 
      + "<h4 style='color: green'>Inicia descarga de la agenda</h4>";
    const onSuccess = function (detailsApi) {
      _self.loading.dismiss();
      _self.ordersService.setDetailsApiStorage(detailsApi);
      //_self.router.navigate(['tabs/agenda', {
      //  message: "Sincronización realizada exitosamente!!"
      //}]);
      _self.contentConsole = _self.contentConsole + "<h4 style='color: green'>La descarga de la agenda se ejecutó correctamente</h2>";
    }
    const onError = function (error) {
      _self.loading.dismiss();
      _self.contentConsole = _self.contentConsole + "<h4 style='color: red'>La descarga de la agenda falló</h2>";
      if (typeof error === 'string') {
        _self.showMessage(error);
      }
      else _self.showMessage('No se puede consultar la lista de agendas');
    }
    this.ordersService.getDetailsApi(onSuccess, onError);
  }

  async showMessage(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }

}
