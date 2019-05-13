import { Component, OnInit } from '@angular/core';
import { LoadingController, ToastController, IonContent, Events } from '@ionic/angular';
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

  detailsApi: any = [];
  detailsApiOriginal: any = [];
  userId: any;
  filter: any;
  templates = [];
  newAgenda: boolean = false;
  @ViewChild('networkNotifyBanner') public networkNotifyBanner: NetworkNotifyBannerComponent;
  @ViewChild('ion-content') public ionContent: IonContent;

  constructor(
    public ordersService: OrdersService,
    public router: Router,
    public usersService: UsersService,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public events: Events) {

    this.initFilters();
    this.events.subscribe('sync:finish', (registry) => {
      this.newAgenda = true;
    });
  }

  async ngOnInit() {
    this.usersService.getUserAuthToken().then((userAuth) => {
      this.userId = "" + userAuth.id_user;
      this.retriveDetailsApi();
    });
  }

  async retriveDetailsApi() {
    const loading = await this.loadingCtrl.create({
      message: 'Por favor espere'
    });
    await loading.present();

    this.ordersService.getDetailsApiStorage()
      .then((ordersList) => {
        if (ordersList) {
          loading.dismiss();
          this.detailsApiOriginal = this.setTemplateToDetail(ordersList);
          this.initFilters();
        }
        else {
          this.ordersService.getDetailsApiQuery().then((data: any) => {
            loading.dismiss();
            this.ordersService.setDetailsApiStorage(data);
            this.detailsApiOriginal = this.setTemplateToDetail(data);
            this.initFilters();
          }).catch(error => {
            loading.dismiss();
            if (typeof error === 'string') {
              this.showMessage(error);
            }
            else this.showMessage('No se puede consultar la lista de agendas');
          });
        }
      });
  }

  setTemplateToDetail(ordersList) {
    let detailsList = [];
    for (let order of ordersList) {
      for (let detailApi of order.detailsApi) {
        //Evaluation Template API
        if (detailApi.evaluationApi) {
          this.retriveDetailOrder(this.templates[0], detailApi.evaluationApi, order, detailsList, detailApi.local);
        }
        //Aspiration Template API
        if (detailApi.aspirationApi) {
          this.retriveDetailOrder(this.templates[1], detailApi.aspirationApi, order, detailsList, detailApi.local);
        }
        //Transfer Template API
        if (detailApi.transferApi) {
          this.retriveDetailOrder(this.templates[2], detailApi.transferApi, order, detailsList, detailApi.local);
        }
        if (detailApi.diagnosticApi) {
          this.retriveDetailOrder(this.templates[3], detailApi.diagnosticApi, order, detailsList, detailApi.local);
        }
        if (detailApi.sexageApi) {
          this.retriveDetailOrder(this.templates[4], detailApi.sexageApi, order, detailsList, detailApi.local);
        }
        if (detailApi.deliveryApi) {
          this.retriveDetailOrder(this.templates[5], detailApi.deliveryApi, order, detailsList, detailApi.local);
        }
      }
    }
    return detailsList;
  }
  retriveDetailOrder(templateType: any, detailObjApitemplate: any, order: any, detailsList: any, local: any) {
    const agendas = this.getAgendasDetail(order.agenda, templateType, local);
    let detailObj: any;
    if (agendas.length > 0) {
      for (let agenda of agendas) {
        detailObj = Object.assign({}, detailObjApitemplate);
        detailObj.order = order;
        detailObj.agenda = agenda;
        detailObj.local = local;
        detailObj.comments = agenda.observation || detailObj.comments || order.observation;
        detailObj.templateType = templateType;
        detailObj.detailObjApi = detailObjApitemplate;
        detailsList.push(detailObj);
      }
    }
    else {
      detailObj = Object.assign({}, detailObjApitemplate);
      detailObj.order = order;
      detailObj.templateType = templateType;
      detailObj.local = local;
      detailObj.comments = detailObj.comments || order.observation;
      detailObj.detailObjApi = detailObjApitemplate;
      detailsList.push(detailObj);
    }
  }
  getAgendasDetail(agendas: any, templateType: any, local: any): any {
    const agendaList = [];
    for (let agenda of agendas) {
      if (agenda.event.id === templateType.id && local.name === agenda.name_local) {
        agendaList.push(agenda)
      }
    }
    return agendaList;
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
    this.onItemFilter();
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
    this.onItemFilter();
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

  async onItemFilter() {
    const loading = await this.loadingCtrl.create({
      message: 'Por favor espere',
      duration: 100
    });
    await loading.present();

    this.filterItems();
  }

  async onResetFilter() {
    const loading = await this.loadingCtrl.create({
      message: 'Por favor espere',
      duration: 100
    });
    await loading.present();

    this.filterItems();
  }

  filterItems() {
    this.detailsApi = this.detailsApiOriginal.filter((detailApi) => {
      return this.filterOrderId(detailApi.order) &&
        this.filterDateTime(detailApi.agenda) &&
        this.filterEmployer(detailApi.agenda) &&
        this.filterTemplate(detailApi.templateType)
    });
  }

  filterOrderId(order) {
    if (!this.filter.orderId) return true;
    return order.id === this.filter.orderId
  }

  filterEmployer(agenda) {
    if (!this.filter.mySelf) return true;
    if (agenda && agenda.employee_id == this.userId) {
      return true;
    };
    return false;
  }

  //start_date: fecha de la agenda de la orden en formato "YYYY-MM-DD"
  filterDateTime(agenda) {
    if (this.filter.allDays) return true;
    if (!agenda) return false;
    let dateStr: string = typeof this.filter.datetime === 'string' ? this.filter.datetime : this.filter.datetime.toISOString();
    if (dateStr.length === 0) {
      dateStr = new Date().toISOString();
    }
    if (agenda && dateStr.split('T')[0] === agenda.start_date.split(" ")[0]) {
      return true;
    }
    return false;
  }

  filterTemplate(templateType) {
    if (this.filter.allTemplates) return true;
    for (let template of this.templates) {
      if (template.check && template.id === templateType.id)
        return true;
    }
    return false;
  }

  initFilters() {

    this.templates = [
      {
        "id": "1",
        "name": "Evaluación Receptoras",
        "icon": ['fas', 'search'],
        "style": { 'color': "yellow" },
        "check": true,
        "color": "yellow"
      },
      {
        "id": "2",
        "name": "Aspiración Folicular",
        "icon": ['fas', 'eye-dropper'],
        "style": { 'color': "blue" },
        "check": true
      },
      {
        "id": "4",
        "name": "Transferencia Embrión",
        "icon": ['fas', 'magic'],
        "style": { 'color': "red" },
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
        "name": "Sexaje",
        "icon": ['fas', 'random'],
        "style": "color: red;",
        "check": true
      },
      {
        "id": "7",
        "name": "Entrega",
        "icon": ['fas', 'stethoscope'],
        "style": "color: blue;",
        "check": true
      }
    ];

    this.filter = {
      allDays: true,
      dayStr: "Hoy",
      datetime: moment().format(),
      mySelf: false,
      toggle: false,
      allTemplates: true,
      orderId: null
    };
    this.filterItems();
  }

  updateDateTime() {
    const datetime = moment(this.filter.datetime);
    this.filter.dayStr = this.formatFilterDate(datetime);
    this.onItemFilter();
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

    if (detailApi.templateType)
      switch (detailApi.templateType.id) {
        case "1":
          this.ordersService.setDetailApiParam(detailApi);
          this.router.navigate(['evaluation']);
          break;
        case "2":
          this.ordersService.setDetailApiParam({
            aspirationApi: detailApi.detailObjApi,
            agendaPage: this,
            detailItem: detailApi,
            order: detailApi.order,
            agenda: detailApi.agenda
          });
          this.router.navigate(['aspiration']);
          break;
        case "3":
          this.ordersService.setDetailApiParam(detailApi);
          this.router.navigate(['production']);
          break;
      }
    await this.wait(1000);
    loading.dismiss();
  }

  detailApiRefresh(detailsApi) {
    this.detailsApiOriginal = detailsApi;
    this.filterItems();
  }

  ionViewWillEnter() {
    if (this.newAgenda) {
      //let reload the ordersList data after sync finish event
      this.retriveDetailsApi();
      this.newAgenda = false;
    }
  }

  refreshDetailsOriginal(ordersList) {
    this.detailsApiOriginal = this.setTemplateToDetail(ordersList);
    this.filterItems();
  }

  async wait(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

}
