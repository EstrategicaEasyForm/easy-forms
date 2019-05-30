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
import { SexagePdfService } from './sexage.pdf.service';

@Component({
  selector: 'app-sexage',
  templateUrl: './sexage.page.html',
  styleUrls: ['./sexage.page.scss'],
})
export class SexagePage implements OnInit {

  sexage: any;
  detailApi: any;
  agendaPage: any;
  sexageObjOri: any;
  order: any;
  agenda: any;
  signatureImage: any;
  showTakePhoto = true;
  photoImage: any;
  mbControlPanel: number = 1;

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
    'receiver_name': [
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
    ]
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
    public sexagePdf: SexagePdfService) {

  }

  ngOnInit() {

    const detail = this.ordersService.getDetailApiParam();
    this.sexageObjOri = detail.sexageApi;
    this.sexage = Object.assign({}, this.sexageObjOri);
    this.agendaPage = detail.agendaPage;
    this.order = detail.order;
    this.detailApi = detail.detailApi;
    this.agenda = detail.agenda;
    this.sexage.arrived_temperature = this.sexage.arrived_temperature || '';
    this.sexage.arrived_temperature_number = Number(this.sexage.arrived_temperature.replace('°C', '').replace(',', '.'));

    this.validation_form_order = this.formBuilder.group({
      medium_opu: [this.sexage.medium_opu, Validators.required],
      medium_lot_opu: [this.sexage.medium_lot_opu, Validators.required],
      searcher: [this.sexage.searcher, Validators.required],
      aspirator: [this.sexage.aspirator, Validators.required],
    });

    this.validation_form_general = this.formBuilder.group({
      arrived_temperature_number: [this.sexage.arrived_temperature_number, Validators.required,],
      transport_type: [this.sexage.transport_type, Validators.required],
      receiver_name: [this.sexage.receiver_name, Validators.required],
      identification_number: [this.sexage.identification_number, Validators.required],
      comments: [this.sexage.comments, Validators.required]
    });

    for (let detail of this.sexage.details) {
      if (detail.arrived_time) {
        const minute = Number(detail.arrived_time.split(':')[1].substr(0, 2));
        const pm = detail.arrived_time.split(':')[1].substr(2, 2) === 'PM' ? 12 : 0;
        const hour = Number(detail.arrived_time.split(':')[0]) + pm;
        let time = moment().set({ hour: hour, minute: minute });
        detail.ionDateTime = time.format();
        detail.arrived_time = time.format('hh:mmA');
      }
      detail.gi = Number(detail.gi) || 0;
      detail.gii = Number(detail.gii) || 0;
      detail.giii = Number(detail.giii) || 0;
      detail.others = Number(detail.others) || 0;
    }
  }

  openSexageDetail(indx) {
    this.ordersService.setDetailApiParam({
      sexage: this.sexage,
      detailApiId: indx,
      sexagePage: this
    });
    this.router.navigate(['sexage-detail']);
  }

  reloadDetailsList(detailsList) {
    this.sexage.details = detailsList;
  }

  async openSignatureModel() {
    const modalPage = await this.modalCtrl.create({
      component: SignatureDrawPadPage,
      cssClass: "modal-signature"
    });

    modalPage.onDidDismiss().then(({ data }) => {
      if (data) {
        this.sexage.signatureImage = data.signatureImage;
        this.showMessage('Captura realizada exitósamente');
        this.saveSexage();
      }
    });

    return await modalPage.present();
  }

  openPdfViewer() {
    const data = {
      sexageApi: this.sexage,
      order: this.order,
      local: this.detailApi.local
    };
	
	const options = {
      watermark: true,
      open: true
    };
    this.sexagePdf.makePdf(data, options).then((pdf: any) => {
      if (pdf.status === 'error') {
        this.showMessage(pdf.error);
      }
    });
  }

  onSaveButton() {
    this.saveSexage();
    this.showMessage('Registro modificado');
  }

  saveSexage() {
    this.ordersService.getDetailsApiStorage().then((ordersList) => {
      if (ordersList) {
        for (let order of ordersList) {
          for (let detail of order.detailsApi) {
            if (detail.sexageApi && detail.sexageApi.id === this.sexage.id) {
              this.sexage.stateSync = 'U';
              detail.sexageApi = this.sexage;
            }
          }
        }
      }
      this.ordersService.setDetailsApiStorage(ordersList);
      //refresca el objeto en la ventana de agendas.
      this.agendaPage.refreshDetailsOriginal(ordersList);
    });
  }

  finalizeSexage() {
    this.sexage.state = 1;
    this.ordersService.getDetailsApiStorage().then((detailsApi) => {
      if (detailsApi) {
        for (let detail of detailsApi) {
          if (detail.sexageApi && detail.sexageApi.id === this.sexage.id) {
            this.sexage.stateSync = 'U';
            detail.sexageApi = this.sexage;
          }
        }
        this.ordersService.setDetailsApiStorage(detailsApi);
        this.detailApi.sexageApi = this.sexage;
        this.showMessage('Aspiración Finalizada');
        this.location.back();
      }
    });
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: 'Finalizar Aspiración!',
      message: 'Confirma que desa finalizar <strong>la aspiración</strong>!!!',
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
            this.finalizeSexage();
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
      this.sexage.photoImage = 'data:image/png;base64,' + imageData;
      this.showMessage('Captura realizada exitósamente');
      this.saveSexage();
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
    if (this.sexage.arrived_temperature_number || this.sexage.arrived_temperature_number === 0) {
      this.sexage.arrived_temperature = this.sexage.arrived_temperature_number + "°C";
      this.sexage.arrived_temperature = this.sexage.arrived_temperature.replace('.', ',');
    }
    else {
      this.sexage.arrived_temperature = "";
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

}