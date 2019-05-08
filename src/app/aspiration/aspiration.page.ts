import { Component, OnInit, ViewChild} from '@angular/core';
import { OrdersService } from '../orders.service';
import { LoadingController, ToastController, ModalController, AlertController, Platform } from '@ionic/angular';
import { NetworkNotifyBannerComponent } from '../network-notify-banner/network-notify-banner.component';
import { FormBuilder, Validators } from '@angular/forms';
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
  parent: any;
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
    this.aspirationObjOri = detail.aspirationApi;
    this.aspiration = Object.assign({}, this.aspirationObjOri);

    this.parent = detail.parent;
    this.order = detail.order;
    this.detailItem = detail.detailItem;
    this.agenda = detail.agenda;
    if (cordova && typeof cordova !== 'undefined') {
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

  onSave() {
    this.saveAspiration();
    this.showMessage('Registro modificado');
  }
  
  saveAspiration() {
      this.ordersService.getDetailsApiStorage().then((orders) => {
        if (orders)
        for(let order of orders) {
          for (let detail of order.detailsApi) {
            if (detail.aspirationApi && detail.aspirationApi.id === this.aspiration.id) {
              this.aspiration.stateSync = 'U';
              detail.aspirationApi = this.aspiration;
            }
          }
        }
        this.ordersService.setDetailsApiStorage(orders);
        this.detailItem.detailObjApi = this.aspiration;
        
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

  async showMessage(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }
}