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
import { TransferPdfService } from './transfer.pdf.service';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.page.html',
  styleUrls: ['./transfer.page.scss'],
})
export class TransferPage implements OnInit {

  transfer: any;
  detailApi: any;
  agendaPage: any;
  transferObjOri: any;
  order: any;
  agenda: any;
  signatureImage: any;
  showTakePhoto = true;
  photoImage: any;
  mbControlPanel: number = 1;
  start_date = '';

  validation_messages = {
    'received_by': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'identification_number': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'technical': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'comments': [
      { type: 'required', message: 'Campo requerido.' }
    ]
  };

  //validations forms
  validation_form_order: FormGroup;
  validation_form_general: FormGroup;

  @ViewChild('networkNotifyBanner') public networkNotifyBanner: NetworkNotifyBannerComponent;
  constructor(public ordersService: OrdersService,
    public formBuilder: FormBuilder,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public modalCtrl: ModalController,
    public location: Location,
    public router: Router,
    public alertController: AlertController,
    public camera: Camera,
    public platform: Platform,
    public transferPdf: TransferPdfService,
    public screenOrientation: ScreenOrientation) { }

  ngOnInit() {
    const detail = this.ordersService.getDetailApiParam();
    this.transferObjOri = detail.transferApi;
    this.transfer = Object.assign({}, this.transferObjOri);
    this.agendaPage = detail.agendaPage;
    this.detailApi = detail.detailApi;
    this.order = detail.order;
    this.agenda = detail.agenda;
    this.start_date = this.agenda && this.agenda.all_day === '1' ? this.agenda.start_date.substr(0, 10) : this.agenda.start_date;
    this.transfer.date = this.start_date || '';
    this.validation_form_order = this.formBuilder.group({});
    if (!this.transfer.technical || this.transfer.technical.length === 0)
      this.transfer.technical = this.transfer.details_view && this.transfer.details_view[0] ? this.transfer.details_view[0].technical : '';

    if (this.transfer.synchronizeds) {
      for (let detailItem of this.transfer.details_view) {
        if (detailItem.evaluation_detail_id)
          for (let receptSync of this.transfer.synchronizeds) {
            receptSync.id += '';
            if (receptSync.id === detailItem.evaluation_detail_id) {
              detailItem.receptSync = receptSync.animal_id + "-" + receptSync.chapeta;
              break;
            }
          }
      }
    }
    this.validation_form_general = this.formBuilder.group({
      received_by: [this.transfer.received_by, Validators.required],
      identification_number: [this.transfer.identification_number, Validators.required],
      technical: [this.transfer.technical, Validators.required],
      comments: [this.transfer.comments, Validators.required]
    });
  }

  openTransferDetail(indx) {
    this.ordersService.setDetailApiParam({
      transfer: this.transfer,
      detailApiId: indx,
      transferPage: this
    });
    this.router.navigate(['transfer-detail']);
  }

  async presentAlertConfirmDiscard(indx, detailList: IonList) {
    const detail = this.transfer.details_view[indx];

    if (detail.discard === '1') {
      detail.discard = '0';
      detail.stateSync = 'U';
      detailList.closeSlidingItems();
      this.saveTransfer();
    }
    else {
      const alert = await this.alertController.create({
        header: 'Descartar Detalle!',
        message: '¿Confirma que desea descartar el detalle?',
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
              detail.discard = '1';
              detail.stateSync = 'U';
              detail.evaluation_detail_id = null;
              detailList.closeSlidingItems();
              this.saveTransfer();
            }
          }
        ]
      });

      await alert.present();
    }
  }

  reloadDetailsList(detailsList) {
    this.transfer.details = detailsList;
  }

  async openSignatureModel() {
    const modalPage = await this.modalCtrl.create({
      component: SignatureDrawPadPage,
      cssClass: "modal-signature"
    });

    modalPage.onDidDismiss().then(({ data }) => {
      if (data) {
        this.transfer.signatureImage = data.signatureImage;
        this.showMessage('Captura realizada exitósamente');
        this.saveTransfer();
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
      transferApi: this.transfer,
      order: this.order,
      local: this.detailApi.local
    };
    const options = {
      watermark: true,
      open: true
    };
    this.transferPdf.makePdf(data, options).then((pdf: any) => {
      loading.dismiss();
      if (pdf.status === 'error') {
        this.showMessage(pdf.error);
      }
    });
  }

  onSaveButton() {
    this.saveTransfer();
    this.showMessage('Registro modificado');
  }

  saveTransfer() {
    this.ordersService.getDetailsApiStorage().then((ordersList) => {
      if (ordersList) {
        for (let order of ordersList) {
          for (let detail of order.detailsApi) {
            if (detail.transferApi && detail.transferApi.id === this.transfer.id) {
              this.transfer.stateSync = 'U';
              detail.transferApi = this.transfer;
              for (let i = 1; i < detail.transferApi.details_view.length; i++) {
                detail.transferApi.details_view[i].bull_breed = detail.transferApi.details_view[0].bull_breed;
              }
            }
          }
        }
      }
      this.ordersService.setDetailsApiStorage(ordersList);
      //refresca el objeto en la ventana de agendas.
      this.agendaPage.refreshDetailsOriginal(ordersList);
    });
  }

  finalizeTransfer() {
    this.transfer.state = 1;
    this.transfer.stateSync = 'U';
    this.saveTransfer();
    this.showMessage('Planilla de Transferencia Finalizada');
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: 'Finalizar Transferencia!',
      message: 'Confirma que desea finalizar la planilla de <strong>Transferencia</strong>!!!',
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
            this.finalizeTransfer();
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
      this.transfer.photoImage = 'data:image/png;base64,' + imageData;
      this.showMessage('Captura realizada exitósamente');
      this.saveTransfer();
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

  resetItemDetail(detailItem, indx) {
    this.transfer.details_view[indx] = detailItem;
  }

}
