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
import { EvaluationPdfService } from './evaluation.pdf.service';

@Component({
  selector: 'app-evaluation',
  templateUrl: './evaluation.page.html',
  styleUrls: ['./evaluation.page.scss'],
})
export class EvaluationPage implements OnInit {

  evaluation: any;
  detailApi: any;
  agendaPage: any;
  evaluationObjOri: any;
  order: any;
  agenda: any;
  signatureImage: any;
  showTakePhoto = true;
  photoImage: any;
  mbControlPanel: number = 1;

  validation_form_order: FormGroup;
  validation_form_general: FormGroup;


  validation_messages = {
    'evaluator': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'comments': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'received_by': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'identification_number': [
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
    public evaluationPdf: EvaluationPdfService) {
  }

  ngOnInit() {

    const detail = this.ordersService.getDetailApiParam();
    this.evaluationObjOri = detail.evaluationApi;
    this.evaluation = Object.assign({}, this.evaluationObjOri);
    this.agendaPage = detail.agendaPage;
    this.order = detail.order;
    this.detailApi = detail.detailApi;
    this.agenda = detail.agenda;

    this.validation_form_order = this.formBuilder.group({
    });

    this.validation_form_general = this.formBuilder.group({
      //evaluator: [this.evaluation.attendant, Validators.required],
      received_by: [this.evaluation.received_by, Validators.required],
      identification_number: [this.evaluation.identification_number, Validators.required],
      comments: [this.evaluation.comments, Validators.required]
    });


    //for (let detail of this.evaluation.details) {
    //  if (detail.date) {
    //    const minute = Number(detail.date.split(':')[1].substr(0, 2));
    //    const pm = detail.date.split(':')[1].substr(2, 2) === 'PM' ? 12 : 0;
    //    const hour = Number(detail.date.split(':')[0]) + pm;
    //    let time = moment().set({ hour: hour, minute: minute });
    //    detail.ionDateTime = time.format();
    //    detail.date = time.format('hh:mmA');
    //  }
    //  detail.gi = Number(detail.gi) || 0;
    //  detail.gii = Number(detail.gii) || 0;
    // detail.giii = Number(detail.giii) || 0;
    //  detail.others = Number(detail.others) || 0;
    //}

  }

  openEvaluationDetail(indx) {
    this.ordersService.setDetailApiParam({
      evaluation: this.evaluation,
      detailApiId: indx,
      evaluationPage: this
    });
    this.router.navigate(['evaluation-detail']);
  }

  reloadDetailsList(detailsList) {
    this.evaluation.details = detailsList;
  }

  async openSignatureModel() {
    const modalPage = await this.modalCtrl.create({
      component: SignatureDrawPadPage,
      cssClass: "modal-signature"
    });

    modalPage.onDidDismiss().then(({ data }) => {
      if (data) {
        this.evaluation.signatureImage = data.signatureImage;
        this.showMessage('Captura realizada exitósamente');
        this.saveEvaluation();
      }
    });

    return await modalPage.present();
  }


  openPdfViewer() {
    const data = {
      evaluationApi: this.evaluation,
      order: this.order,
      local: this.detailApi.local
    };
    const options = {
      watermark: true,
      open: true
    };
    this.evaluationPdf.makePdf(data, options).then((pdf: any) => {
      if (pdf.status === 'error') {
        this.showMessage(pdf.error);
      }
    });
  }

  onSaveButton() {
    this.saveEvaluation();
    this.showMessage('Registro modificado');
  }

  saveEvaluation() {
    this.ordersService.getDetailsApiStorage().then((ordersList) => {
      if (ordersList) {
        for (let order of ordersList) {
          for (let detail of order.detailsApi) {
            if (detail.evaluationApi && detail.evaluationApi.id === this.evaluation.id) {
              this.evaluation.stateSync = 'U';
              detail.evaluationApi = this.evaluation;
            }
          }
        }
      }
      this.ordersService.setDetailsApiStorage(ordersList);
      this.detailApi.detailObjApi = this.evaluation;
      this.agendaPage.refreshDetailsOriginal(ordersList);
    });
  }

  finalizeevaluation() {
    this.evaluation.state = 1;
    this.ordersService.getDetailsApiStorage().then((detailsApi) => {
      if (detailsApi) {
        for (let detail of detailsApi) {
          if (detail.evaluationApi && detail.evaluationApi.id === this.evaluation.id) {
            this.evaluation.stateSync = 'U';
            detail.evaluationApi = this.evaluation;
          }
        }
        this.ordersService.setDetailsApiStorage(detailsApi);
        this.detailApi.evaluationApi = this.evaluation;
        this.showMessage('Evaluación Finalizada');
        this.location.back();
      }
    });
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: 'Finalizar Evaluación!',
      message: 'Confirma que desa finalizar <strong>la Evaluación</strong>!!!',
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
            this.finalizeevaluation();
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
      this.evaluation.photoImage = 'data:image/png;base64,' + imageData;
      this.showMessage('Captura realizada exitósamente');
      this.saveEvaluation();
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

  onChangeLocal($localId) {
    if (this.evaluation.locals) {
      for (let local of this.evaluation.locals) {
        if (local.id === $localId) {
          this.detailApi.local = local;
        }
      }
    }
  }
}
