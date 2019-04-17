import { Component, OnInit } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import { OrdersService } from '../orders.service';

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.page.html',
  styleUrls: ['./agenda.page.scss'],
})
export class AgendaPage implements OnInit {

  orders: any;

  constructor(public ordersService: OrdersService,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController) { }


  ngOnInit() {
    const _self = this;
    this.ordersService.getOrdersListStorage()
      .then((ordersList) => {
        if (ordersList) {
          _self.orders = ordersList;
        }
        else {
          this.getOrdersList();
        }
      });
  }

  getOrdersList() {
    const _self = this;
    const onSuccess = function (ordersList) {
      if (ordersList) {
        _self.orders = ordersList;
      }
    }
    const onError = function (error) {
      this.showMessage('No se puede consultar la lista de ordenes');
    }
    this.ordersService.getOrdersList(onSuccess, onError);
  }

  async showMessage(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }

}
