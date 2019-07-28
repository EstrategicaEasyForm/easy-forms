import { Component, OnInit } from '@angular/core';
import { LoadingController, ToastController, IonContent, Events } from '@ionic/angular';
import { Router } from '@angular/router';
import { OrdersService } from '../orders.service';
import { UsersService } from '../users.service';
import { ViewChild } from '@angular/core';
import { NetworkNotifyBannerComponent } from '../network-notify-banner/network-notify-banner.component';
import * as moment from 'moment-timezone';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';

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
  newAgenda: boolean = false;
  templates: any;
  @ViewChild('networkNotifyBanner') public networkNotifyBanner: NetworkNotifyBannerComponent;
  @ViewChild('ion-content') public ionContent: IonContent;
  loading: any;

  constructor(
    public ordersService: OrdersService,
    public router: Router,
    public usersService: UsersService,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public events: Events,
	public screenOrientation: ScreenOrientation) {
		
	usersService.setDataParamAgenda(this);

    this.initFilters();

    this.events.subscribe('sync:finish', (registry) => {
      this.newAgenda = true;
    });
	
	this.events.subscribe('graphql:error', (elementPush) => {
      this.showMessage(elementPush.message);
      if(this.loading) this.loading.dismiss();
    });
  }

  async ngOnInit() {
    this.usersService.getUserAuthToken().then((userAuth) => {
      this.userId = "" + userAuth.id_user;
      this.retriveDetailsApi();
    });
  }

  async retriveDetailsApi() {
    this.loading = await this.loadingCtrl.create({
      message: 'Por favor espere'
    });
    await this.loading.present();

    this.ordersService.getDetailsApiStorage()
      .then((ordersList) => {
        if (ordersList) {
          this.loading.dismiss();
          this.setTemplateToDetail(ordersList);
          this.filterItems();
        }
        else {
          this.ordersService.getDetailsApiQuery().then((data: any) => {
            this.loading.dismiss();
            this.ordersService.setDetailsApiStorage(data);
            this.setTemplateToDetail(data);
            this.filterItems();
          }).catch(error => {
            this.loading.dismiss();
            if (typeof error === 'string') {
              this.showMessage(error);
            }
            else this.showMessage('No se puede consultar la lista de agendas');
          });
        }
      });
  }

  setTemplateToDetail(ordersList) {

    this.detailsApiOriginal = [];
    let newDetailApi: any;
    for (let order of ordersList) {
      for (let detailApi of order.detailsApi) {
        //Evaluation Template API
        if (detailApi.evaluationApi) {
          this.newDetailApiCard(order, detailApi, detailApi.evaluationApi, this.ordersService.templates[0]);
        }
        //Aspiration Template API
        if (detailApi.aspirationApi) {
          this.newDetailApiCard(order, detailApi, detailApi.aspirationApi, this.ordersService.templates[1]);
        }
        //Transfer Template API
        if (detailApi.transferApi) {
          this.newDetailApiCard(order, detailApi, detailApi.transferApi, this.ordersService.templates[2]);
        }
        //DiagnosticApi Template API
        if (detailApi.diagnosticApi) {
          this.newDetailApiCard(order, detailApi, detailApi.diagnosticApi, this.ordersService.templates[3]);
        }
        //SexageApi Template API
        if (detailApi.sexageApi) {
          this.newDetailApiCard(order, detailApi, detailApi.sexageApi, this.ordersService.templates[4]);
        }
        //DeliveryApi Template API
        if (detailApi.deliveryApi) {
          this.newDetailApiCard(order, detailApi, detailApi.deliveryApi, this.ordersService.templates[5]);
        }
      }
    }
  }

  newDetailApiCard(order: any, detailApi: any, worksheet: any, type: any) {
    const newDetailApi = {
      id: detailApi.id,
      type: type,
      order: order,
      local: detailApi.local,
      employees: [],
	  employeesNames: '',
      agenda: {},
      comments: ''
    }
    newDetailApi[type.tag] = worksheet;
    const employees = [];
	let employee: string;
    for (let agenda of order.agenda) {
      if (agenda.event.id === newDetailApi.type.id && newDetailApi.local.name === agenda.name_local) {
		  
		if(agenda.user) {
			employee = agenda.user.name;
			employees.push(agenda.user);
		}
		else if(agenda.other_user) {
			employee = agenda.other_user.name;
		}
		else {
			employee = '';
		}
		
		if(newDetailApi.employeesNames.length > 0 ) newDetailApi.employeesNames += ',';
		newDetailApi.employeesNames += employee;
      }
    }
    newDetailApi.employees = employees;
	
    let mbAdding = false;
    for (let agenda of order.agenda) {
      if (agenda.event.id === newDetailApi.type.id && newDetailApi.local.name === agenda.name_local) {
        const mbDuplicated = this.detailsApiOriginal.filter((detail) => {
          if (detail.id === detailApi.id && detail.agenda && detail.agenda.start_date === agenda.start_date) {
            detail.comments += agenda.observation;
            return true;
          }
          return false;
        });
        if (mbDuplicated.length === 0) {
          newDetailApi.agenda = agenda;
          newDetailApi.comments = agenda.observation || '';
          mbAdding = true;
          this.detailsApiOriginal.push(newDetailApi);
        }
      }
    }
    if (!mbAdding) {
      this.detailsApiOriginal.push(newDetailApi);
    }
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
    this.loading = await this.loadingCtrl.create({
      message: 'Por favor espere',
      duration: 100
    });
    await this.loading.present();

    this.filterItems();
  }

  async onResetFilter() {
    this.loading = await this.loadingCtrl.create({
      message: 'Por favor espere',
      duration: 100
    });
    await this.loading.present();

    this.initFilters();
    this.filterItems();
  }

  filterItems() {
    this.detailsApi = this.detailsApiOriginal.filter((detailApi) => {
      return this.filterOrderId(detailApi.order) &&
        this.filterDateTime(detailApi.agenda) &&
        this.filterEmployer(detailApi.employees) &&
        this.filterTemplate(detailApi.type)
    });
  }

  filterOrderId(order) {
    if (!this.filter.orderId) return true;
    return order.id === this.filter.orderId
  }

  filterEmployer(employees) {
    if (!this.filter.mySelf) return true;
    for (let employ of employees) {
      if (employ && employ.id === this.userId) {
        return true;
      }
    }
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
    if (agenda.start_date)
      if (agenda && dateStr.split('T')[0] === agenda.start_date.split(" ")[0]) {
        return true;
      }
    return false;
  }

  filterTemplate(type) {
    for (let template of this.templates) {
      if (template['check'] && template.id === type.id)
        return true;
    }
    return false;
  }

  initFilters() {
    this.templates = this.ordersService.templates;
    for (let template of this.templates) {
      template['check'] = true;
    }

    this.filter = {
      allDays: true,
      dayStr: "Hoy",
      datetime: moment().format(),
      mySelf: false,
      allTemplates: true,
      orderId: null
    };
    for (let template of this.templates) {
      template['check'] = this.filter.allTemplates;
    }
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

  onChangeFilter() {
    for (let template of this.templates) {
      template['check'] = this.filter.allTemplates;
    }
    this.onItemFilter();
  }

  async goToTemplate(detailApi) {
    this.loading = await this.loadingCtrl.create({
      message: 'Por favor espere'
    });
    await this.loading.present();

    if (detailApi.type)
      switch (detailApi.type.id) {
        case "1":
          this.ordersService.setDetailApiParam({
            evaluationApi: detailApi.evaluationApi,
            agendaPage: this,
            detailApi: detailApi,
            order: detailApi.order,
            agenda: detailApi.agenda
          });
          this.router.navigate(['evaluation']);
          break;
        case "2":
          this.ordersService.setDetailApiParam({
            aspirationApi: detailApi.aspirationApi,
            agendaPage: this,
            detailApi: detailApi,
            order: detailApi.order,
            agenda: detailApi.agenda
          });
          this.router.navigate(['aspiration']);
          break;
        case "4":
        this.ordersService.setDetailApiParam({
          transferApi: detailApi.transferApi,
          agendaPage: this,
          detailApi: detailApi,
          order: detailApi.order,
          agenda: detailApi.agenda
        });
        this.router.navigate(['transfer']);
        break;
        case "5": 
        this.ordersService.setDetailApiParam({
          diagnosticApi: detailApi.diagnosticApi,
          agendaPage: this,
          detailApi: detailApi,
          order: detailApi.order,
          agenda: detailApi.agenda
        });
        this.router.navigate(['diagnostic']);
        break;
        case "6": 
        this.ordersService.setDetailApiParam({
          sexageApi: detailApi.sexageApi,
          agendaPage: this,
          detailApi: detailApi,
          order: detailApi.order,
          agenda: detailApi.agenda
        });
        this.router.navigate(['sexage']);
        break;
        case "7": 
        this.ordersService.setDetailApiParam({
          deliveryApi: detailApi.deliveryApi,
          agendaPage: this,
          detailApi: detailApi,
          order: detailApi.order,
          agenda: detailApi.agenda
        });
        this.router.navigate(['delivery']);
        break;
      }
    await this.wait(500);
    this.loading.dismiss();
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
    this.setTemplateToDetail(ordersList);
    this.filterItems();
  }

  async wait(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

  ionViewDidEnter() {
    this.initOrientation();
  }

  initOrientation() {
    try {  
      //this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);	
      // allow user rotate
      this.screenOrientation.unlock();
    } catch(err) {
      this.showMessage(err);
    }
  }
  
  clearAgenda() {
	this.detailsApi = [];
	this.detailsApiOriginal = [];
	this.onResetFilter();
  }

}
