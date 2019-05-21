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
import { PdfMakeEvaluationService } from './pdf-make-evaluation.service';

@Component({
  selector: 'app-evaluation',
  templateUrl: './evaluation.page.html',
  styleUrls: ['./evaluation.page.scss'],
})
export class EvaluationPage implements OnInit {
	
  evaluation: any;
  detailItem: any;
  agendaPage: any;
  evaluationObjOri: any;
  order: any;
  agenda: any;
  signatureImage: any;
  showTakePhoto = true;
  photoImage: any;
  mbControlPanel: number = 1;

  // Optional parameters to pass to the swiper instance. See http://idangero.us/swiper/api/ for valid options.
  slideEvaluationOpts = {
    initialSlide: 1
  };
	
	validation_form_order2: FormGroup;
	//validation_form_general: FormGroup;

	validation_messages = {
    'animal_id': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'chapeta': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'evaluator': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'diagnostic': [
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
    public pdfMakeEvaluation: PdfMakeEvaluationService) { 
  }

  ngOnInit() {

    const detail = this.ordersService.getDetailApiParam();
    this.evaluationObjOri = detail.evaluationApi;
    this.evaluation = Object.assign({}, this.evaluationObjOri);
    this.agendaPage = detail.agendaPage;
    this.order = detail.order;
    this.detailItem = detail.detailItem;
    this.agenda = detail.agenda;

    this.validation_form_order2 = this.formBuilder.group({
      animal_id: [this.evaluation.animal_id, Validators.required],
      chapeta: [this.evaluation.chapeta, Validators.required],
      attendant: [this.evaluation.attendant, Validators.required],
      diagnostic: [this.evaluation.diagnostic, Validators.required]
    });

    //this.validation_form_general = this.formBuilder.group({
    //  arrived_temperature_number: [this.evaluation.arrived_temperature_number, Validators.required,],
    //  transport_type: [this.evaluation.transport_type, Validators.required],
    //  receiver_name: [this.evaluation.receiver_name, Validators.required],
    //  identification_number: [this.evaluation.identification_number, Validators.required],
    //  comments: [this.evaluation.comments, Validators.required]
    //});

    for (let detail of this.evaluation.details) {
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
  
  openevaluationDetail(indx) {
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
        this.saveevaluation();
      }
    });

    return await modalPage.present();
  }

  
  openPdfViewer() {
    const _self = this;
    this.pdfMakeEvaluation.makePdf({
      evaluation: this.evaluation,
      order: this.order,
      local: this.detailItem.local
    },function(pdfObj, error){
      if(error){
        _self.showMessage('No se puede generar el pdf ' + error);
      }
    }, { watermark: true, open: true });
  }
  
  onSaveButton() {
    this.saveevaluation();
    this.showMessage('Registro modificado');
  }
  
  saveevaluation() {
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
      this.detailItem.detailObjApi = this.evaluation;
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
        this.detailItem.evaluationApi = this.evaluation;
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
      this.saveevaluation();
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

}
