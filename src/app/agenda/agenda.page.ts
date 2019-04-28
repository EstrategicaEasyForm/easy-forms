import { Component, OnInit } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import { NavigationExtras, Router } from '@angular/router';
import { OrdersService } from '../orders.service';
import { UsersService } from '../users.service';
import { ViewChild } from '@angular/core';
import { NetworkNotifyBannerComponent } from '../network-notify-banner/network-notify-banner.component';

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.page.html',
  styleUrls: ['./agenda.page.scss'],
})
export class AgendaPage {

  orders: any;
  detailsApi: any = [];
  detailsApiOriginal: any = [];
  userId: any;
  filter: any = { dayStr: "Hoy", dayTime: new Date(), mySelf: true };
  
  @ViewChild('networkNotifyBanner') public networkNotifyBanner: NetworkNotifyBannerComponent;
  constructor(
    public ordersService: OrdersService,
    public router: Router, 
    public usersService: UsersService,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController) {
    
    const _self = this;
    this.usersService.getToken().then((authUser) => {
      _self.userId = authUser.id_user;
    });

    this.retriveAgenda();
  }

  async retriveAgenda() {
    const _self = this;
    const loading = await this.loadingCtrl.create({
      message: 'Por favor espere'
    });
    await loading.present();

    this.ordersService.getDetailsApiStorage()
      .then((detailsApi) => {
        if (detailsApi) {
          loading.dismiss();
          _self.detailsApiOriginal = detailsApi;
          _self.filterItems();
        }
        else {
          this.getDetailsApi(loading);
        }
      });
  }

  async getDetailsApi(loading) {
    const _self = this;
    const onSuccess = function (detailsApi) {
        loading.dismiss();
        _self.detailsApiOriginal = detailsApi;
        _self.ordersService.setDetailsApiStorage(detailsApi);
        _self.filterItems();
    }
    const onError = function (error) {
      loading.dismiss();
      if (typeof error === 'string') {
        this.showMessage(error);
      }
      else this.showMessage('No se puede consultar la lista de agendas');
    }
    this.ordersService.getDetailsApi(onSuccess, onError);
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
    this.detailsApi = this.detailsApiOriginal.filter((detailApi) => {
      
      return detailApi.agenda.start_date !== null &&
        (!_self.filter.mySelf || detailApi.agenda.employee_id == _self.userId)
    });
  }

  async showMessage(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }

  goToTemplate(detailApi) {
    if (detailApi.agenda && detailApi.agenda.event)
      switch (detailApi.agenda.event.id) {
        case "1":
          this.router.navigate(['evaluation', {
            detailApiId: detailApi.id
          }]);
          break;
        case "2":
          this.ordersService.setDetailApiParam(detailApi);
          this.router.navigate(['aspiration']);
          break;
        case "3":
          this.router.navigate(['production', {
            detailApiId: detailApi.id
          }]);
          break;
      }
  }

}
