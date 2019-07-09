import { Component, OnInit, ViewChild } from '@angular/core';
import { OrdersService } from '../orders.service';
import { LoadingController, ToastController, ModalController, AlertController, Platform, IonList } from '@ionic/angular';
import { NetworkNotifyBannerComponent } from '../network-notify-banner/network-notify-banner.component';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { SignatureDrawPadPage } from '../signature-draw-pad/signature-draw-pad.page';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import * as moment from 'moment-timezone';
import { SexagePdfService } from './sexage.pdf.service';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';

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
    public sexagePdf: SexagePdfService,
    public screenOrientation: ScreenOrientation) {

  }

  ngOnInit() {

    const detail = this.ordersService.getDetailApiParam();
    this.sexageObjOri = detail.sexageApi;
    this.sexage = Object.assign({}, this.sexageObjOri);
    this.sexage.apply_diagnostic = this.sexage.apply_diagnostic || {};
    this.agendaPage = detail.agendaPage;
    this.order = detail.order;
    this.detailApi = detail.detailApi;
    this.agenda = detail.agenda;
	this.start_date = this.agenda && this.agenda.all_day === '1' ? this.agenda.start_date.substr(0,10) : this.agenda.start_date;

    let detailsTmp;

    //Si el objeto details es diferente al objeto detailsSexage se rearma la lista para incluir todos los detalles de detailsSexage.
    if (this.sexage.details &&  ( this.sexage.details.length === 0  || !this.sexage.details[0].transferData )) {
      const newDetails = [];
	  if(this.sexage.detailsSexage)
      for (let dtDiag of this.sexage.detailsSexage) {
        detailsTmp = null;
        for (let details of this.sexage.details) {
          if (dtDiag.transfer_detail_id == details.transfer_detail_id) {
            detailsTmp = details;
			break;
          }
        }
        if (detailsTmp) {
          newDetails.push({
            "id": detailsTmp.id,
            "transfer_detail_id": detailsTmp.transfer_detail_id,
            "sex": detailsTmp.sex,
            "dx1": detailsTmp.dx1,
            "transferData": dtDiag
          });
        }
        else {
          newDetails.push({
            "id": -1,
            "transfer_detail_id": dtDiag.transfer_detail_id,
            "sex": dtDiag.sex,
            "dx1": dtDiag.dx1,
            "transferData": dtDiag
          });
        }
      }
      //se modifica la lista
      this.sexage.details = newDetails;
    }

    this.validation_form_general = this.formBuilder.group({
      technical : [this.sexage.technical, Validators.required],
      received_by: [this.sexage.received_by, Validators.required],
      identification_number: [this.sexage.identification_number, Validators.required],
      comments: [this.sexage.comments, Validators.required]
    });
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

  async openPdfViewer() {
	  
	const loading = await this.loadingCtrl.create({
      message: 'Por favor espere' 
    });
    await loading.present();
	
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
	  loading.dismiss();	
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
	this.sexage.stateSync = 'U';
	this.saveSexage();
	this.showMessage('Planilla Sexaje Finalizada');
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: 'Finalizar Sexaje!',
      message: 'Confirma que desa finalizar la planilla de <strong>Sexaje</strong>!!!',
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

  onChangeSex(item: any, value: any, detailList: IonList) {
    item.sex = value;
    item.stateSync = 'U';
    detailList.closeSlidingItems();
    this.saveSexage();
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
    } catch (err) {
      this.showMessage(err);
    }
  }

}