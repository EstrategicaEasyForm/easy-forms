import { Component, OnInit } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import { NavigationExtras, Router } from '@angular/router';
import { OrdersService } from '../orders.service';
import { faCoffee } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.page.html',
  styleUrls: ['./agenda.page.scss'],
})
export class AgendaPage {

  orders: any;
  agendaList: any = [];
  agendasOri: any = [];
  filter: any = { dayStr: "Hoy", dayTime: new Date(), mySelf: true };

  constructor(public ordersService: OrdersService,
    public router: Router,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController) {

    // Add an icon to the library for convenient access in other components
    library.add(faCoffee);
    this.retriveAgenda();
  }

  async retriveAgenda() {
    const _self = this;
    const loading = await this.loadingCtrl.create({
      message: 'Por favor espere'
    });
    await loading.present();

    this.ordersService.getAgendasListStorage()
      .then((agendasList) => {
        if (agendasList) {
          loading.dismiss();
          _self.agendasOri = agendasList;
          _self.filterItems();
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

        const agendasList = [];
        for (let order of ordersList) {
          for (let agenda of order.agenda) {
            agendasList.push(agenda);
          }
        }

        _self.agendasOri = agendasList;
        _self.ordersService.setAgendasListStorage(agendasList);
        _self.filterItems();
    }
    const onError = function (error) {
      loading.dismiss();
      if (typeof error === 'string') {
        this.showMessage(error);
      }
      else this.showMessage('No se puede consultar la lista de agendas');
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

  goToTemplate(agenda) {
    if (agenda.event)
      switch (agenda.event.id) {
        case "1":
          this.router.navigate(['evaluation', {
            evaluation: agenda.detailsApi.evaluationApi
          }]);
          break;
        case "2":
          this.router.navigate(['aspiration', {
            aspiration: agenda.detailsApi.aspiration
          }]);
          break;
        case "3":
          this.router.navigate(['production', {
            production: agenda.detailsApi.production
          }]);
          break;
      }
  }

}
