import { Component, OnInit } from '@angular/core';
import { OrdersService } from '../orders.service';
import { ViewChild } from '@angular/core';
import { LoadingController, ToastController, ModalController, AlertController, Platform } from '@ionic/angular';
import { NetworkNotifyBannerComponent } from '../network-notify-banner/network-notify-banner.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SignatureDrawPadPage } from '../signature-draw-pad/signature-draw-pad.page';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Cordova } from '@ionic-native/core';

@Component({
  selector: 'app-aspiration',
  templateUrl: './aspiration.page.html',
  styleUrls: ['./aspiration.page.scss'],
})
export class AspirationPage implements OnInit {

  aspiration: any;
  aspirationObjOri: any;
  order: any;
  agenda: any;
  signatureImage: any;
  showTakePhoto = false;
  photoImage: any;

  //validations_form = new FormGroup({
  validations_form = this.formBuilder.group({
    medium_opu: ['', Validators.required],
    medium_lot_opu: ['', Validators.required],
    searcher: ['', Validators.required],
    aspirator: ['', Validators.required]
  });

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
    this.aspirationObjOri = detail.aspiration;
    this.aspiration = Object.assign({}, detail.aspiration);
    this.order = detail.order;
    this.agenda = detail.agendas ? detail.agendas[0] : {};

    if (Cordova && typeof Cordova !== 'undefined') {
      this.showTakePhoto = true;
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.validations_form.controls; }

  validation_messages = {
    'medium_opu': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'medium_lot_opu': [
      { type: 'required', message: 'Campo requerido.' }
    ]
  };

  openAspirationDetail(indx) {
    this.ordersService.setDetailApiParam({
      aspiration: this.aspiration,
      detailApiId: indx,
      parentPage: this
    });
    this.router.navigate(['aspiration-detail']);
  }

  reloadDetailsList(detailsList) {
    this.aspiration.details = detailsList;
  }
  
  onSignatureImage() {
    event.stopPropagation();
  }

  async openSignatureModel() {
    const modalPage = await this.modalCtrl.create({
      component: SignatureDrawPadPage,
      cssClass: "modal-signature"

    });

    modalPage.onDidDismiss().then(({ data }) => {
      if (data) {
        this.aspiration.signatureImage = data.signatureImage;
        this.ordersService.updateAspiration(this.aspiration);
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

  saveAspiration() {
    if (!this.equalsAspiration(this.aspirationObjOri, this.aspiration)) {
      this.ordersService.getDetailsApiStorage().then((detailsApi) => {
        if (detailsApi)
          for (let detail of detailsApi) {
            if (detail.aspiration && detail.aspiration.id === this.aspiration.id) {
              this.aspiration.stateSync = 'U';
              detail.aspiration = this.aspiration;
            }
          }
        this.ordersService.setDetailsApiStorage(detailsApi);
        this.showMessage('Registro modificado');
      });
    }
  }

  equalsAspiration(aspirationObjOri, aspiration) {
    return aspirationObjOri.medium_opu === aspiration.medium_opu &&
      aspirationObjOri.medium_lot_opu === aspiration.medium_lot_opu &&
      aspirationObjOri.searcher === aspiration.searcher &&
      aspirationObjOri.aspirator === aspiration.aspirator;
  }

  finalizeAspiration() {
    this.aspiration.state = 2;
    this.ordersService.getDetailsApiStorage().then((detailsApi) => {
      if (detailsApi) {
        for (let detail of detailsApi) {
          if (detail.aspiration && detail.aspiration.id === this.aspiration.id) {
            this.aspiration.stateSync = 'U';
            detail.aspiration = this.aspiration;
          }
        }
        this.ordersService.setDetailsApiStorage(detailsApi);
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
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    };

    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      this.photoImage = 'data:image/jpeg;base64,' + imageData;
    }, (err) => {
      // Handle error
      this.showMessage("Ha ocurrido un error al abrir la camara");
      this.showMessage(err);
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