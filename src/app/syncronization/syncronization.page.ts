import { Component, OnInit } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { OrdersService } from '../orders.service';
import { ViewChild } from '@angular/core';
import { NetworkNotifyBannerComponent } from '../network-notify-banner/network-notify-banner.component';

@Component({
  selector: 'app-syncronization',
  templateUrl: './syncronization.page.html',
  styleUrls: ['./syncronization.page.scss'],
})
export class SyncronizationPage {

  @ViewChild('networkNotifyBanner') public networkNotifyBanner: NetworkNotifyBannerComponent;
  constructor(
    public ordersService: OrdersService,
    public router: Router,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController) {

  }

  ionViewWillEnter() {
    this.ordersService.getDetailsApiStorage().then((data) => {
      if (data) {
        console.log(data);
        data.forEach(element => {
          if (element.aspiration) {
            //Update aspiration
            if (element.aspiration.id == '1') {
              element.aspiration.stateSync = 'U';
            }
            if (element.aspiration.stateSync && element.aspiration.stateSync == 'U') {
              this.ordersService.updateAspiration(element.aspiration)
                  .subscribe(({ data }) => {
                    if (data.updateAspiration) {
                      console.log(data.updateAspiration);
                    }
                  });
            }
            //Update details from aspiration
            var details : any = {};
            var creates : any = [];
            var updates : any = [];
            element.aspiration.details.forEach(elementDetail => {
              if (elementDetail.id == '1') {
                elementDetail.stateSync = 'C';
              }
              if (elementDetail.id == '2') {
                elementDetail.stateSync = 'U';
              }
              if (elementDetail.stateSync && elementDetail.stateSync == 'U') {
                var elementUpdate : any = {};
                elementUpdate['id'] = elementDetail.id;
                //elementUpdate['aspiration_id'] = elementDetail.aspiration_id;
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
                elementUpdate['user_id_updated'] = "";
                updates.push(elementUpdate);
              } 
              if (elementDetail.stateSync && elementDetail.stateSync == 'C') {
                var elementCreate : any = {};
                elementCreate['local_id'] = elementDetail.local_id;
                //elementCreate['aspiration_id'] = elementDetail.aspiration_id;
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
                //elementCreate['local'] = elementDetail.local;
                creates.push(elementCreate);
              }
            });
            if (creates.length > 0) {
              details['create'] = creates;
            }
            if (updates.length > 0) {
              details['update'] = updates;
            }
            if (Object.getOwnPropertyNames(details).length > 0) {
              console.log(details);
              var dataDetails : any = {};
              dataDetails['id'] = element.aspiration.id;
              dataDetails['details'] = details;
              this.ordersService.updateAspirationDetails(dataDetails)
                  .subscribe(({ data }) => {
                    console.log("Update detail " + data);
                  });
            }
          }
        });
      }
      this.retriveAgenda();
    });
  }

  async retriveAgenda() {
    const _self = this;
    const loading = await this.loadingCtrl.create({
      message: 'Por favor espere'
    });
    await loading.present();

    const onSuccess = function (detailsApi) {
      loading.dismiss();
      _self.ordersService.setDetailsApiStorage(detailsApi);
      _self.router.navigate(['tabs/agenda', {
        message: "Sincronización realizada exitosamente!!"
      }]);
    }
    const onError = function (error) {
      loading.dismiss();
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
