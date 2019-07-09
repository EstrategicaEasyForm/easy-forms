import { Component, OnInit, ViewChild } from '@angular/core';
import { OrdersService } from '../orders.service';
import { LoadingController, ToastController, ModalController, AlertController, Platform, IonList, IonButton } from '@ionic/angular';
import { NetworkNotifyBannerComponent } from '../network-notify-banner/network-notify-banner.component';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { SignatureDrawPadPage } from '../signature-draw-pad/signature-draw-pad.page';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import * as moment from 'moment-timezone';
import { DeliveryPdfService } from './delivery.pdf.service';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';

@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.page.html',
  styleUrls: ['./delivery.page.scss'],
})
export class DeliveryPage implements OnInit {

  delivery: any;
  detailApi: any;
  agendaPage: any;
  deliveryObjOri: any;
  order: any;
  agenda: any;
  signatureImage: any;
  showTakePhoto = true;
  photoImage: any;
  mbControlPanel: number = 1;
  start_date = '';

  //validations forms
  validation_form_general: FormGroup;

  validation_messages = {
    'technical': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'received_by': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'identification_number': [
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
    public deliveryPdf: DeliveryPdfService,
    public screenOrientation: ScreenOrientation) {

  }

  ngOnInit() {

    const detail = this.ordersService.getDetailApiParam();
    this.deliveryObjOri = detail.deliveryApi;
    this.delivery = Object.assign({}, this.deliveryObjOri);
    this.delivery.apply_delivery = this.delivery.apply_delivery || {};
    this.agendaPage = detail.agendaPage;
    this.order = detail.order;
    this.detailApi = detail.detailApi;
    this.agenda = detail.agenda;
	this.start_date = this.agenda && this.agenda.all_day === '1' ? this.agenda.start_date.substr(0,10) : this.agenda.start_date;

    let detailsTmp;

    //Si el objeto details es diferente al objeto detailsDelivery se rearma la lista para incluir todos los detalles de detailsDelivery.
    if (this.delivery.details && ( this.delivery.details.length === 0 || !this.delivery.details[0].transferData )) {
      const newDetails = [];
	  if(this.delivery.detailsDelivery)
      for (let dtDiag of this.delivery.detailsDelivery) {
        detailsTmp = null;
        for (let details of this.delivery.details) {
          if (dtDiag.sexage_detail_id == details.sexage_detail_id) {
            detailsTmp = details;
			break;
          }
        }
        if (detailsTmp) {
          newDetails.push({
            "id": detailsTmp.id,
            "transfer_detail_id": detailsTmp.transfer_detail_id,
            "dx2": detailsTmp.dx2,
            "transferData": dtDiag
          });
        }
        else {
          newDetails.push({
            "id": -1,
            "transfer_detail_id": dtDiag.transfer_detail_id,
            "sex": dtDiag.sex,
            "dx1": dtDiag.dx1,
		      	"dx2": dtDiag.dx2,
            "transferData": dtDiag
          });
        }
      }
      //se modifica la lista
      this.delivery.details = newDetails;
    }

    this.validation_form_general = this.formBuilder.group({
      technical : [this.delivery.technical, Validators.required],
      received_by: [this.delivery.received_by, Validators.required],
      identification_number: [this.delivery.identification_number, Validators.required],
      comments: [this.delivery.comments, Validators.required]
    });
  }

  reloadDetailsList(detailsList) {
    this.delivery.details = detailsList;
  }

  async openSignatureModel() {
    const modalPage = await this.modalCtrl.create({
      component: SignatureDrawPadPage,
      cssClass: "modal-signature"
    });

    modalPage.onDidDismiss().then(({ data }) => {
      if (data) {
        this.delivery.signatureImage = data.signatureImage;
        this.showMessage('Captura realizada exitósamente');
        this.saveDelivery();
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
      deliveryApi: this.delivery,
      order: this.order,
      local: this.detailApi.local
    };
    const options = {
      watermark: true,
      open: true
    };
    this.deliveryPdf.makePdf(data, options).then((pdf: any) => {
	  loading.dismiss();	
	  if (pdf.status === 'error') {
        this.showMessage(pdf.error);
      }
    });
  }

  onSaveButton() {
    this.saveDelivery();
    this.showMessage('Registro modificado');
  }

  saveDelivery() {
    this.ordersService.getDetailsApiStorage().then((ordersList) => {
      if (ordersList) {
        for (let order of ordersList) {
          for (let detail of order.detailsApi) {
            if (detail.deliveryApi && detail.deliveryApi.id === this.delivery.id) {
              this.delivery.stateSync = 'U';
              detail.deliveryApi = this.delivery;
            }
          }
        }
      }
      this.ordersService.setDetailsApiStorage(ordersList);
      //refresca el objeto en la ventana de agendas.
      this.agendaPage.refreshDetailsOriginal(ordersList);
    });
  }

  finalizeDelivery() {
    this.delivery.state = 1;
	this.delivery.stateSync = 'U';
	this.saveDelivery();
	this.showMessage('Planilla Entrega Finalizada');
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: 'Finalizar Entrega!',
      message: 'Confirma que desa finalizar la planilla de <strong>Entrega</strong>!!!',
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
            this.finalizeDelivery();
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
      this.delivery.photoImage = 'data:image/png;base64,' + imageData;
      this.showMessage('Captura realizada exitósamente');
      this.saveDelivery();
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

  async setControlPanel(mbControlPanel) {
    this.mbControlPanel = mbControlPanel;
    const loading = await this.loadingCtrl.create({
      message: 'Por favor espere',
      duration: 200
    });
    await loading.present();
  }

  onChangeDx2(item: any, value: any, detailList: IonList) {
    item.dx2 = value;
    item.stateSync = 'U';
    this.saveDelivery();
    detailList.closeSlidingItems();
    this.showMessage('Registro modificado');
  }

  ionViewWillEnter() {
      this.initOrientation();
  }

  ionViewDidLeave() {
    this.agendaPage.initOrientation();
  }

  initOrientation() {
    try {  
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);	
    } catch(err) {
      this.showMessage(err);
    }
  }
}