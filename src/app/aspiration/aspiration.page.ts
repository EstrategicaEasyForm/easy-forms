import { Component, OnInit, ViewChild } from '@angular/core';
import { OrdersService } from '../orders.service';
import { LoadingController, ToastController, ModalController, AlertController, Platform } from '@ionic/angular';
import { NetworkNotifyBannerComponent } from '../network-notify-banner/network-notify-banner.component';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { SignatureDrawPadPage } from '../signature-draw-pad/signature-draw-pad.page';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import * as moment from 'moment-timezone';
import { AspirationPdfService } from './aspiration.pdf.service';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';

@Component({
  selector: 'app-aspiration',
  templateUrl: './aspiration.page.html',
  styleUrls: ['./aspiration.page.scss'],
})
export class AspirationPage implements OnInit {

  aspiration: any;
  detailApi: any;
  agendaPage: any;
  aspirationObjOri: any;
  order: any;
  agenda: any;
  signatureImage: any;
  showTakePhoto = true;
  photoImage: any;
  mbControlPanel: number = 1;
  start_date = '';

  //validations forms
  validation_form_order: FormGroup;
  validation_form_general: FormGroup;

  validation_messages = {
    'medium_opu': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'medium_lot_opu': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'aspirator': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'searcher': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'arrived_temperature_number': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'received_by': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'identification_number': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'transport_type': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'comments': [
      { type: 'required', message: 'Campo requerido.' }
    ],
	'receiver_name': [
      { type: 'required', message: 'Campo requerido.' }
    ],
  };


  @ViewChild('networkNotifyBanner') public networkNotifyBanner: NetworkNotifyBannerComponent;
  constructor(
    public ordersService: OrdersService,
    public formBuilder: FormBuilder,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public modalCtrl: ModalController,
    public location: Location,
    public router: Router,
    public alertController: AlertController,
    public camera: Camera,
    public platform: Platform,
    public aspirationPdf: AspirationPdfService,
    public screenOrientation: ScreenOrientation) {

  }

  ngOnInit() {
    const detail = this.ordersService.getDetailApiParam();
    this.aspirationObjOri = detail.aspirationApi;
    this.aspiration = Object.assign({}, this.aspirationObjOri);
    this.agendaPage = detail.agendaPage;
    this.order = detail.order;
    this.detailApi = detail.detailApi;
    this.agenda = detail.agenda;
    this.start_date = this.agenda && this.agenda.start_date ? this.agenda.start_date.substr(0, 10) : '';
    this.aspiration.date = this.start_date;
    this.aspiration.arrived_temperature = this.aspiration.arrived_temperature || '';
    this.aspiration.arrived_temperature_number = Number(this.aspiration.arrived_temperature.replace('°C', '').replace(',', '.'));

    this.validation_form_order = this.formBuilder.group({
      medium_opu: [this.aspiration.medium_opu, Validators.required],
      medium_lot_opu: [this.aspiration.medium_lot_opu, Validators.required],
      searcher: [this.aspiration.searcher, Validators.required],
      aspirator: [this.aspiration.aspirator, Validators.required]
    });

    this.validation_form_general = this.formBuilder.group({
      arrived_temperature_number: [this.aspiration.arrived_temperature_number, Validators.required,],
      transport_type: [this.aspiration.transport_type, Validators.required],
      received_by: [this.aspiration.received_by, Validators.required],
      identification_number: [this.aspiration.identification_number, Validators.required],
      comments: [this.aspiration.comments, Validators.required],
	  receiver_name: [this.aspiration.receiver_name, Validators.required],
    });

    for (let detail of this.aspiration.details) {
      if (detail.arrived_time) {
        const hour = Number(detail.arrived_time.split(':')[0]);
		const minute = Number(detail.arrived_time.split(':')[1]);
        let time = moment().set({ hour: hour, minute: minute });
        detail.ionDateTime = time.format();
        detail.arrived_time = time.format('HH:mm');
      }
      detail.gi = Number(detail.gi) || 0;
      detail.gii = Number(detail.gii) || 0;
      detail.giii = Number(detail.giii) || 0;
      detail.others = Number(detail.others) || 0;
    }
  }

  openAspirationDetail(indx) {
    this.ordersService.setDetailApiParam({
      aspiration: this.aspiration,
      detailApiId: indx,
      aspirationPage: this,
      local: this.detailApi.local
    });
    this.router.navigate(['aspiration-detail']);
  }

  reloadDetailsList(detailsList) {
    this.aspiration.details = detailsList;
  }

  async openSignatureModel() {
    const modalPage = await this.modalCtrl.create({
      component: SignatureDrawPadPage,
      cssClass: "modal-signature"
    });

    modalPage.onDidDismiss().then(({ data }) => {
      if (data) {
        this.aspiration.signatureImage = data.signatureImage;
        this.showMessage('Captura realizada exitósamente');
        this.saveAspiration();
      }
    });

    return await modalPage.present();
  }

  async openPdfViewer() {

    const loading = await this.loadingCtrl.create({
      message: 'Por favor espere'
    });
    await loading.present();

    const data = {
      aspirationApi: this.aspiration,
      order: this.order,
      local: this.detailApi.local,
      agenda: this.agenda
    };
    const options = {
      watermark: true,
      open: true
    };
    this.aspirationPdf.makePdf(data, options).then((pdf: any) => {
      loading.dismiss();
      if (pdf.status === 'error') {
        this.showMessage(pdf.error);
      }
    });
  }

  onSaveButton() {
    this.saveAspiration();
    this.showMessage('Registro modificado');
  }

  saveAspiration() {
    this.ordersService.getDetailsApiStorage().then((ordersList) => {
      if (ordersList) {
        for (let order of ordersList) {
          for (let detail of order.detailsApi) {
            if (detail.aspirationApi && detail.aspirationApi.id === this.aspiration.id) {
              this.aspiration.stateSync = 'U';
              detail.aspirationApi = this.aspiration;
            }
          }
        }
      }
      this.ordersService.setDetailsApiStorage(ordersList);
      //refresca el objeto en la ventana de agendas.
      this.agendaPage.refreshDetailsOriginal(ordersList);
    });
  }

  finalizeAspiration() {
    this.aspiration.state = 1;
    this.aspiration.stateSync = 'U';
    this.saveAspiration();
    this.showMessage('Planilla Aspiración Finalizada');
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: 'Finalizar Aspiración!',
      message: 'Confirma que desa finalizar la <strong>Aspiración</strong>!!!',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {

          }
        }, {
          text: 'Aceptar',
          handler: () => {
            this.finalizeAspiration();
          }
        }
      ]
    });

    await alert.present();
  }

  openCamera() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.PNG,
      mediaType: this.camera.MediaType.PICTURE
    };

    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      this.aspiration.photoImage = 'data:image/png;base64,' + imageData;
      this.showMessage('Captura realizada exitósamente');
      this.saveAspiration();
    }, (err) => {
      // Handle error
      if (err === 'cordova_not_available') {
        this.showMessage('No se reconoce un dispositivo de cámara');
      }
      else {
        this.showMessage(err);
      }
    });
  }

  onChangeArrivedTemperature() {
    if (this.aspiration.arrived_temperature_number || this.aspiration.arrived_temperature_number === 0) {
      this.aspiration.arrived_temperature = this.aspiration.arrived_temperature_number + "°C";
      this.aspiration.arrived_temperature = this.aspiration.arrived_temperature.replace('.', ',');
    }
    else {
      this.aspiration.arrived_temperature = "";
    }
  }

  async showMessage(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }

  async setControlPanel(mbControlPanel) {
    this.mbControlPanel = mbControlPanel;
    const loading = await this.loadingCtrl.create({
      message: 'Por favor espere',
      duration: 200
    });
    await loading.present();
  }

  ionViewWillEnter() {
    this.initOrientation();
  }

  ionViewDidLeave() {
    this.agendaPage.initOrientation();
  }

  initOrientation() {
    try {
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE_PRIMARY);
    } catch (err) {
      this.showMessage(err);
    }
  }
  
  removeDetail(index){
	if(this.aspiration.details) {
		this.aspiration.details = this.aspiration.details.filter((value, idx)=> {
			return index != idx;
		});
	}
  }
  
  resetItemDetail(detailItem, indx) {
    this.aspiration.details[indx] = detailItem;
  }
}