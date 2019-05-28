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

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.page.html',
  styleUrls: ['./transfer.page.scss'],
})
export class TransferPage implements OnInit {

  transfer: any;
  transferApi: any;
  agendaPage: any;
  transferObjOri: any;
  order: any;
  agenda: any;
  signatureImage: any;
  showTakePhoto = true;
  photoImage: any;
  mbControlPanel: number = 1;

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
    public platform: Platform) { }

  ngOnInit() {
    const detail = this.ordersService.getDetailApiParam();
    this.transferObjOri = detail.transferApi;
    this.transfer = Object.assign({}, this.transferObjOri);
    this.agendaPage = detail.agendaPage;
    this.order = detail.order;
    this.transferApi = detail.detailApi;
    console.log(this.transfer.details);
    this.agenda = detail.agenda;

    this.validation_form_order = this.formBuilder.group({});

    // this.validation_form_general = this.formBuilder.group({
    //   arrived_temperature_number: [this.aspiration.arrived_temperature_number, Validators.required,],
    //   transport_type: [this.aspiration.transport_type, Validators.required],
    //   receiver_name: [this.aspiration.receiver_name, Validators.required],
    //   identification_number: [this.aspiration.identification_number, Validators.required],
    //   comments: [this.aspiration.comments, Validators.required]
    // });

    // for (let detail of this.aspiration.details) {
    //   if (detail.arrived_time) {
    //     const minute = Number(detail.arrived_time.split(':')[1].substr(0, 2));
    //     const pm = detail.arrived_time.split(':')[1].substr(2, 2) === 'PM' ? 12 : 0;
    //     const hour = Number(detail.arrived_time.split(':')[0]) + pm;
    //     let time = moment().set({ hour: hour, minute: minute });
    //     detail.ionDateTime = time.format();
    //     detail.arrived_time = time.format('hh:mmA');
    //   }
    //   detail.gi = Number(detail.gi) || 0;
    //   detail.gii = Number(detail.gii) || 0;
    //   detail.giii = Number(detail.giii) || 0;
    //   detail.others = Number(detail.others) || 0;
    // }
  }

  openTransferDetail(indx) {
    this.ordersService.setDetailApiParam({
      transfer: this.transfer,
      detailApiId: indx,
      transferPage: this
    });
    this.router.navigate(['transfer-detail']);
  }

  reloadDetailsList(detailsList) {
    this.transfer.details = detailsList;
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
    this.ordersService.getDetailsApiStorage().then((detailsApi) => {
      if (detailsApi) {
        for (let detail of detailsApi) {
          if (detail.transferApi && detail.transferApi.id === this.transfer.id) {
            this.transfer.stateSync = 'U';
            detail.transferApi = this.transfer;
          }
        }
        this.ordersService.setDetailsApiStorage(detailsApi);
        this.transferApi.aspirationApi = this.transfer;
        this.showMessage('Aspiración Finalizada');
        this.location.back();
      }
    });
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: 'Finalizar Transferencia!',
      message: 'Confirma que desa finalizar <strong>la transferencia</strong>!!!',
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

}
