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
import { DiagnosticPdfService } from './diagnostic.pdf.service';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';

@Component({
  selector: 'app-diagnostic',
  templateUrl: './diagnostic.page.html',
  styleUrls: ['./diagnostic.page.scss'],
})
export class DiagnosticPage implements OnInit {

  diagnostic: any;
  detailApi: any;
  agendaPage: any;
  diagnosticObjOri: any;
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
    public diagnosticPdf: DiagnosticPdfService,
    public screenOrientation: ScreenOrientation) {

  }

  ngOnInit() {

    const detail = this.ordersService.getDetailApiParam();
    this.diagnosticObjOri = detail.diagnosticApi;
    this.diagnostic = Object.assign({}, this.diagnosticObjOri);
    this.agendaPage = detail.agendaPage;
    this.order = detail.order;
    this.detailApi = detail.detailApi;
    this.agenda = detail.agenda;
    this.start_date = this.agenda ? this.agenda.start_date.substr(0, 10) : '';
    this.diagnostic.date = this.start_date;
    let detailsTmp;

    //Si el objeto details es diferente al objeto detailsDiagnostic se rearma la lista para incluir todos los detalles de detailsDiagnostic.
    if (this.diagnostic.details && (this.diagnostic.details.length === 0 || !this.diagnostic.details[0].transferData)) {
      const newDetails = [];
      if (this.diagnostic.detailsDiagnostic)
        for (let dtDiag of this.diagnostic.detailsDiagnostic) {
          detailsTmp = null;
          for (let details of this.diagnostic.details) {
            if (dtDiag.transfer_detail_id == details.transfer_detail_id) {
              detailsTmp = details;
              break;
            }
          }
          if (detailsTmp) {
            newDetails.push({
              "id": detailsTmp.id,
              "diagnostic_id": this.diagnostic.id,
              "transfer_detail_id": detailsTmp.transfer_detail_id,
              "dx1": detailsTmp.dx1,
              "transferData": dtDiag
            });
          }
          else {
            newDetails.push({
              "id": -1,
              "diagnostic_id": this.diagnostic.id,
              "transfer_detail_id": dtDiag.transfer_detail_id,
              "dx1": "",
              "transferData": dtDiag
            });
          }
        }
      //se modifica la lista
      this.diagnostic.details = newDetails;
    }

    this.validation_form_general = this.formBuilder.group({
      technical: [this.diagnostic.technical, Validators.required],
      received_by: [this.diagnostic.received_by, Validators.required],
      identification_number: [this.diagnostic.identification_number, Validators.required],
      comments: [this.diagnostic.comments, Validators.required]
    });
  }

  reloadDetailsList(detailsList) {
    this.diagnostic.details = detailsList;
  }

  async openSignatureModel() {
    const modalPage = await this.modalCtrl.create({
      component: SignatureDrawPadPage,
      cssClass: "modal-signature"
    });

    modalPage.onDidDismiss().then(({ data }) => {
      if (data) {
        this.diagnostic.signatureImage = data.signatureImage;
        this.showMessage('Captura realizada exitósamente');
        this.saveDiagnostic();
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
      diagnosticApi: this.diagnostic,
      order: this.order,
      local: this.detailApi.local
    };
    const options = {
      watermark: true,
      open: true
    };
    this.diagnosticPdf.makePdf(data, options).then((pdf: any) => {
      loading.dismiss();
      if (pdf.status === 'error') {
        this.showMessage(pdf.error);
      }
    });
  }

  onSaveButton() {
    this.saveDiagnostic();
    this.showMessage('Registro modificado');
  }

  saveDiagnostic() {
    this.ordersService.getDetailsApiStorage().then((ordersList) => {
      if (ordersList) {
        for (let order of ordersList) {
          for (let detail of order.detailsApi) {
            if (detail.diagnosticApi && detail.diagnosticApi.id === this.diagnostic.id) {
              this.diagnostic.stateSync = 'U';
              detail.diagnosticApi = this.diagnostic;
            }
          }
        }
      }
      this.ordersService.setDetailsApiStorage(ordersList);
      //refresca el objeto en la ventana de agendas.
      this.agendaPage.refreshDetailsOriginal(ordersList);
    });
  }

  finalizeDiagnostic() {
    this.diagnostic.state = 1;
    this.diagnostic.stateSync = 'U';
    this.saveDiagnostic();
    this.showMessage('Planilla Diagnóstico Finalizada');
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: 'Finalizar Diagnóstico!',
      message: 'Confirma que desa finalizar la planilla de <strong>Diagnóstico</strong>!!!',
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
            this.finalizeDiagnostic();
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
      this.diagnostic.photoImage = 'data:image/png;base64,' + imageData;
      this.showMessage('Captura realizada exitósamente');
      this.saveDiagnostic();
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

  onChangeDx1(item: any, value: any, detailList: IonList) {
    item.dx1 = value;
    item.stateSync = 'U';
    this.saveDiagnostic();
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
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE_PRIMARY);
    } catch (err) {
      this.showMessage(err);
    }
  }

}