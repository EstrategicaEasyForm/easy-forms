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
import { DiagnosticPdfService } from './diagnostic.pdf.service';

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

  //validations forms
  validation_form_general: FormGroup;

  validation_messages = {
    'received_by': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'identification_number': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'dx1': [
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
    public diagnosticPdf: DiagnosticPdfService) {

  }

  ngOnInit() {

    const detail = this.ordersService.getDetailApiParam();
    this.diagnosticObjOri = detail.diagnosticApi;
    this.diagnostic = Object.assign({}, this.diagnosticObjOri);
    this.agendaPage = detail.agendaPage;
    this.order = detail.order;
    this.detailApi = detail.detailApi;
    this.agenda = detail.agenda;

    let detailsTmp;

    //Si el objeto details es diferente al objeto detailsDiagnostic se rearma la lista para incluir todos los detalles de detailsDiagnostic.
    if (this.diagnostic.details.length !== this.diagnostic.detailsDiagnostic.length) {
      const newDetails = [];
      for (let dtDiag of this.diagnostic.detailsDiagnostic) {
        detailsTmp = null;
        for (let details of this.diagnostic.details) {
          if (dtDiag.transfer_detail_id == details.transfer_detail_id) {
            detailsTmp = details;
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
      received_by: [this.diagnostic.received_by, Validators.required],
      identification_number: [this.diagnostic.identification_number, Validators.required],
      comments: [this.diagnostic.comments, Validators.required]
    });
  }

  openDiagnosticDetail(indx) {
    this.ordersService.setDetailApiParam({
      diagnostic: this.diagnostic,
      detailApiId: indx,
      diagnosticPage: this
    });
    this.router.navigate(['diagnostic-detail']);
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

  openPdfViewer() {
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
    this.ordersService.getDetailsApiStorage().then((detailsApi) => {
      if (detailsApi) {
        for (let detail of detailsApi) {
          if (detail.diagnosticApi && detail.diagnosticApi.id === this.diagnostic.id) {
            this.diagnostic.stateSync = 'U';
            detail.diagnosticApi = this.diagnostic;
          }
        }
        this.ordersService.setDetailsApiStorage(detailsApi);
        this.detailApi.diagnosticApi = this.diagnostic;
        this.showMessage('Planilla Diagnóstico Finalizada');
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

  onChangeArrivedTemperature() {
    if (this.diagnostic.arrived_temperature_number || this.diagnostic.arrived_temperature_number === 0) {
      this.diagnostic.arrived_temperature = this.diagnostic.arrived_temperature_number + "°C";
      this.diagnostic.arrived_temperature = this.diagnostic.arrived_temperature.replace('.', ',');
    }
    else {
      this.diagnostic.arrived_temperature = "";
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