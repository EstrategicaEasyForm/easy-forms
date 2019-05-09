import { Component, OnInit, ViewChild } from '@angular/core';
import { OrdersService } from '../orders.service';
import { LoadingController, ToastController, ModalController, AlertController, Platform } from '@ionic/angular';
import { NetworkNotifyBannerComponent } from '../network-notify-banner/network-notify-banner.component';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { SignatureDrawPadPage } from '../signature-draw-pad/signature-draw-pad.page';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { cordova } from '@ionic-native/core';

@Component({
  selector: 'app-aspiration',
  templateUrl: './aspiration.page.html',
  styleUrls: ['./aspiration.page.scss'],
})
export class AspirationPage implements OnInit {

  aspiration: any;
  detailItem: any;
  agendaPage: any;
  aspirationObjOri: any;
  order: any;
  agenda: any;
  signatureImage: any;
  showTakePhoto = false;
  photoImage: any;
  mbControlPanel: number = 1;

  // Optional parameters to pass to the swiper instance. See http://idangero.us/swiper/api/ for valid options.
  slideAspirationOpts = {
    initialSlide: 1
  };

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
    public platform: Platform) {

  }

  ngOnInit() {

    const detail = this.ordersService.getDetailApiParam();
    this.aspirationObjOri = detail.aspirationApi;
    this.aspiration = Object.assign({}, this.aspirationObjOri);
    this.agendaPage = detail.agendaPage;
    this.order = detail.order;
    this.detailItem = detail.detailItem;
    this.agenda = detail.agenda;
    this.aspiration.arrived_temperature = this.aspiration.arrived_temperature || '';
    this.aspiration.arrived_temperature_number = Number(this.aspiration.arrived_temperature.replace('°C', '').replace(',', '.'));
    if (cordova && typeof cordova !== 'undefined') {
      this.showTakePhoto = true;
    }

    this.validation_form_order = this.formBuilder.group({
      medium_opu: [this.aspiration.medium_opu, Validators.required],
      medium_lot_opu: [this.aspiration.medium_lot_opu, Validators.required],
      searcher: [this.aspiration.searcher, Validators.required],
      aspirator: [this.aspiration.aspirator, Validators.required]
    });

    this.validation_form_general = this.formBuilder.group({
      arrived_temperature_number: [this.aspiration.arrived_temperature_number, Validators.required,],
      transport_type: [this.aspiration.transport_type, Validators.required],
      receiver_name: [this.aspiration.receiver_name, Validators.required],
      identification_number: [this.aspiration.identification_number, Validators.required],
      comments: [this.aspiration.comments, Validators.required]
    });

  }

  openAspirationDetail(indx) {
    this.ordersService.setDetailApiParam({
      aspiration: this.aspiration,
      detailApiId: indx,
      aspirationPage: this
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

  openPdfViewer() {
    this.ordersService.setDetailApiParam({
      aspiration: this.aspiration,
      order: this.order
    });
    this.router.navigate(['pdf-viewer-aspiration']);
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
      this.detailItem.detailObjApi = this.aspiration;
      this.agendaPage.refreshDetailsOriginal(ordersList);
    });
  }

  finalizeAspiration() {
    this.aspiration.state = 1;
    this.ordersService.getDetailsApiStorage().then((detailsApi) => {
      if (detailsApi) {
        for (let detail of detailsApi) {
          if (detail.aspirationApi && detail.aspirationApi.id === this.aspiration.id) {
            this.aspiration.stateSync = 'U';
            detail.aspirationApi = this.aspiration;
          }
        }
        this.ordersService.setDetailsApiStorage(detailsApi);
        this.detailItem.aspirationApi = this.aspiration;
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
}