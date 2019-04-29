import { Component, OnInit } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import { NavigationExtras, Router } from '@angular/router';
import { OrdersService } from '../orders.service';
import { UsersService } from '../users.service';
import { ViewChild } from '@angular/core';
import { NetworkNotifyBannerComponent } from '../network-notify-banner/network-notify-banner.component';
import { AlertOptions, AlertButton } from '@ionic/core';

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.page.html',
  styleUrls: ['./agenda.page.scss'],
})
export class AgendaPage implements OnInit {

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

  }

  ngOnInit() {
    const _self = this;
    this.usersService.getUserAuthToken().then((userAuth) => {
      _self.userId = "" + userAuth.id_user;
      _self.retriveAgenda();
    });
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
        this.filter.dayStr = this.formatFilterDate(day);
        break;
    }
    this.filterItems();
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
        this.filter.dayStr = this.formatFilterDate(day);
        break;
    }
    this.filterItems();
  }

  formatFilterDate(day: Date) {
    const yesterday = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
    const tomorrow = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
    const today = new Date(Date.now());

    if (day.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0])
      return 'Ayer';
    if (day.toISOString().split('T')[0] === tomorrow.toISOString().split('T')[0])
      return 'Mañana';
    if (day.toISOString().split('T')[0] === today.toISOString().split('T')[0])
      return 'Hoy';

    const mount = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const date = day.getDate() < 10 ? '0' + day.getDate() : day.getDate();
    return date + ' ' + mount[day.getMonth()];
  }

  filterItems() {
    const _self = this;
    this.detailsApi = this.detailsApiOriginal.filter((detailApi) => {

      return _self.filterCalendar(detailApi.agendas) &&
      _self.filterEmployer(detailApi.agendas)
    });
  }
  

  filterEmployer(agendas) {
    if (!this.filter.mySelf) return true;
    for (let agenda of agendas) {
      if (agenda.employee_id == this.userId) {
        return true;
      };
    }
    return false;
  }
  
  //start_date: fecha de la agenda de la orden en formato "YYYY-MM-DD"
  filterCalendar(agendas) {
    if (!this.filter.mySelf) return true;
    for (let agenda of agendas) {
      if (agenda && this.filter.dayTime.toISOString().split('T')[0] === agenda.start_date.split(" ")[0])
        return true;
    }
    return false;
  }

  async showMessage(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }

  goToTemplate(detailApi) {
    if (detailApi.event)
      switch (detailApi.event.id) {
        case "1":
          this.ordersService.setDetailApiParam(detailApi);
          this.router.navigate(['evaluation', {
            detailApiId: detailApi.id
          }]);
          break;
        case "2":
          this.ordersService.setDetailApiParam(detailApi);
          this.router.navigate(['aspiration']);
          break;
        case "3":
          this.ordersService.setDetailApiParam(detailApi);
          this.router.navigate(['production', {
            detailApiId: detailApi.id
          }]);
          break;
      }
  }

}
