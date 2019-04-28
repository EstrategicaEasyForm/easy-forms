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
    //this.ordersService.getDetailsApiStorage().then((data) =>{
      //if (data) {
        //data.forEach(element => {
          //console.log(element);
        //});
      //}
    //});
    this.retriveAgenda();
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
