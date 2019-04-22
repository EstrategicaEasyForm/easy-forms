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
  agendaList: any = [];
  agendasOri: any = [];
  filter: any = { dayStr: "Hoy", dayTime: new Date(), mySelf: true };

  constructor(public ordersService: OrdersService,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController) { }


  async ngOnInit() {
    const _self = this;
    const loading = await this.loadingCtrl.create({
      message: 'Por favor espere'
    });
    await loading.present();


    this.ordersService.getOrdersListStorage()
      .then((ordersList) => {
        if (ordersList) { 
          for (let order of ordersList) {
            _self.agendasOri = _self.agendasOri.concat(order.agenda);
          } 
          _self.filterItems();
          loading.dismiss();
        }
        else {
          this.getOrdersList(loading);
        }
      });
  }

  async getOrdersList(loading) {
    const _self = this;
    const onSuccess = function (ordersList) {
      loading.dismiss();
      if (ordersList) { 
        for (let order of ordersList) {
          _self.agendasOri = _self.agendasOri.concat(order.agenda);
        } 
        _self.filterItems();
      }
    }
    const onError = function (error) {
      loading.dismiss();
      this.showMessage('No se puede consultar la lista de ordenes');
      this.showMessage(error);
    }
    this.ordersService.getOrdersList(onSuccess, onError);
  }

  backDay() {
    let day: Date;
    switch (this.filter.dayStr) {
      case 'Hoy':
        this.filter.dayTime = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
        this.filter.dayStr = 'Ayer';
        break;
      case 'Mañana':
        this.filter.dayTime = new Date(Date.now());
        this.filter.dayStr = 'Hoy';
        break;
      case 'Ayer':
      default:
        day = new Date(this.filter.dayTime - 1 * 24 * 60 * 60 * 1000);
        this.filter.dayTime = day;
        this.filter.dayStr = this.formatDate(day);
        break;
    }
  }

  forwardDay() {
    let day: Date;
    switch (this.filter.dayStr) {
      case 'Hoy':
        this.filter.dayTime = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
        this.filter.dayStr = 'Mañana';
        break;
      case 'Ayer':
        this.filter.dayTime = new Date(Date.now());
        this.filter.dayStr = 'Hoy';
        break;
      case 'Mañana':
      default:
        day = new Date(this.filter.dayTime.getTime() + 1 * 24 * 60 * 60 * 1000);
        this.filter.dayTime = day;
        this.filter.dayStr = this.formatDate(day);
        break;
    }
  }

  formatDate(day: Date) {
    const yesterday = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
    const tomorrow = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
    const today = new Date(Date.now());
    if (this.truncDate(day) === this.truncDate(yesterday))
      return 'Ayer';
    if (this.truncDate(day) === this.truncDate(tomorrow))
      return 'Mañana';
    if (this.truncDate(day) === this.truncDate(today))
      return 'Hoy';

    const mount = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const date = day.getDate() < 10 ? '0' + day.getDate() : day.getDate();
    return date + ' ' + mount[day.getMonth()];
  }

  truncDate(day: Date) {
    day.setHours(0);
    day.setMinutes(0);
    day.setSeconds(0);
    day.setMilliseconds(0);
    return day.getTime();
  }

  filterItems() {
    const _self = this;
    this.agendaList = this.agendasOri.filter((agenda) => {
      const employee_id = 9;
      return agenda.start_date !== null &&
        (!_self.filter.mySelf || agenda.employee_id == employee_id)
    }); 
  }

  async showMessage(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }
}
