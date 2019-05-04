import { Component, OnInit } from '@angular/core';
import { LoadingController, ToastController, IonContent } from '@ionic/angular';
import { Router } from '@angular/router';
import { OrdersService } from '../orders.service';
import { UsersService } from '../users.service';
import { ViewChild } from '@angular/core';
import { NetworkNotifyBannerComponent } from '../network-notify-banner/network-notify-banner.component';
import * as moment from 'moment-timezone';

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
  filter: any;
  templates = [];
  @ViewChild('networkNotifyBanner') public networkNotifyBanner: NetworkNotifyBannerComponent;
  @ViewChild('ion-content') public ionContent: IonContent;

  constructor(
    public ordersService: OrdersService,
    public router: Router,
    public usersService: UsersService,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController) {

    this.resetFilter();
  }

  ngOnInit() {
    this.usersService.getUserAuthToken().then((userAuth) => {
      this.userId = "" + userAuth.id_user;
      this.retriveAgenda();
    });
  }

  async retriveAgenda() {
    const loading = await this.loadingCtrl.create({
      message: 'Por favor espere'
    });
    await loading.present();

    this.ordersService.getDetailsApiStorage()
      .then((detailsApi) => {
        if (detailsApi) {
          loading.dismiss();
          this.detailsApiOriginal = detailsApi;
          this.filterItems();
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
        _self.showMessage(error);
      }
      else _self.showMessage('No se puede consultar la lista de agendas');
    }
    this.ordersService.getDetailsApi(onSuccess, onError);
  }

  backDay() {
    switch (this.filter.dayStr) {
      case 'Hoy':
        this.filter.datetime = moment().add('days', -1).format();
        this.filter.dayStr = 'Ayer';
        break;
      case 'Mañana':
        this.filter.datetime = new Date(Date.now());
        this.filter.dayStr = 'Hoy';
        break;
      case 'Ayer':
      default:
        const datetime = moment(this.filter.datetime).add('days', -1);
        this.filter.datetime = datetime.format();
        this.filter.dayStr = this.formatFilterDate(datetime);
        break;
    }
    this.filterItems();
  }

  forwardDay() {
    switch (this.filter.dayStr) {
      case 'Hoy':
        this.filter.datetime = moment().add('days', 1).format();
        this.filter.dayStr = 'Mañana';
        break;
      case 'Ayer':
      this.filter.datetime = moment().format();
        this.filter.dayStr = 'Hoy';
        break;
      case 'Mañana':
      default:
        const datetime = moment(this.filter.datetime).add('days', 1);
        this.filter.datetime = datetime.format();
        this.filter.dayStr = this.formatFilterDate(datetime);
        break;
    }
    this.filterItems();
  }

  formatFilterDate(datetime) {
    const yesterday = moment().add('days', -1).format().split('T')[0];
    const tomorrow = moment().add('days', 1).format().split('T')[0];
    const today = moment().format().split('T')[0];

    if (datetime.format().split('T')[0] === yesterday)
      return 'Ayer';
    if (datetime.format().split('T')[0] === tomorrow)
      return 'Mañana';
    if (datetime.format().split('T')[0] === today)
      return 'Hoy';

    const mount = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const date = datetime.date() < 10 ? '0' + datetime.date() : datetime.date();
    return date + ' ' + mount[datetime.month()];
  }

  async filterItems() {
    const loading = await this.loadingCtrl.create({
      message: 'Por favor espere',
      duration: 100
    });
    await loading.present();

    this.detailsApi = this.detailsApiOriginal.filter((detailApi) => {

      return this.filterDateTime(detailApi.agendas) &&
        this.filterEmployer(detailApi.agendas) &&
        this.filterTemplate(detailApi.agendas)
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
  filterDateTime(agendas) {
    if (this.filter.allDays) return true;
    let dateStr: string = typeof this.filter.datetime === 'string' ? this.filter.datetime : this.filter.datetime.toISOString();
    if (dateStr.length === 0) {
      dateStr = new Date().toISOString();
    }
    for (let agenda of agendas) {
      if (agenda && dateStr.split('T')[0] === agenda.start_date.split(" ")[0])
        return true;
    }
    return false;
  }

  filterTemplate(agendas) {
    if (this.filter.allTemplates) return true;
    for (let agenda of agendas) {
      for (let template of this.templates) {
        if (template.check && template.id === agenda.event.id)
          return true;
      }
    }
    return false;
  }

  resetFilter() {

    this.templates = [
      {
        "id": "1",
        "name": "Evaluación Receptoras",
        "icon": ['fas', 'search'],
        "style": {'color': "yellow"},
        "check": true,
        "color": "yellow"
      },
      {
        "id": "2",
        "name": "Aspiración Folicular",
        "icon": ['fas', 'eye-dropper'],
        "style": {'color': "blue"},
        "check": true
      },
      {
        "id": "4",
        "name": "Transferencia Embrión",
        "icon": ['fas', 'magic'],
        "style": {'color': "red"},
        "check": true
      },
      {
        "id": "5",
        "name": "Diagnóstico",
        "icon": ['fas', 'stethoscope'],
        "style": "color: black;",
        "check": true
      },
      {
        "id": "6",
        "name": "Diagnóstico 2",
        "icon": ['fas', 'stethoscope'],
        "style": "color: blue;",
        "check": true
      },
      {
        "id": "7",
        "name": "Sexaje",
        "icon": ['fas', 'random'],
        "style": "color: red;",
        "check": true
      }
    ];

    this.filter = {
      allDays: false,
      dayStr: "Hoy",
      datetime: moment().format(),
      mySelf: false,
      toggle: false,
      allTemplates: true
    };
    this.filterItems();
  }

  updateDateTime() {
    const datetime = moment(this.filter.datetime);
    this.filter.dayStr = this.formatFilterDate(datetime);
    this.filterItems();
  }

  async showMessage(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }

  async goToTemplate(detailApi) {
    const loading = await this.loadingCtrl.create({
      message: 'Por favor espere'
    });
    await loading.present();

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
      await this.wait(1000);
      loading.dismiss();
  }

  async wait(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

}
