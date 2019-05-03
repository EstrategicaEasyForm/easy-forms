import { Component, OnInit } from '@angular/core';
import { OrdersService } from '../orders.service';
import { ViewChild } from '@angular/core';
import { LoadingController, ToastController, ModalController } from '@ionic/angular';
import { NetworkNotifyBannerComponent } from '../network-notify-banner/network-notify-banner.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SignatureDrawPadPage } from '../signature-draw-pad/signature-draw-pad.page';
import { Router } from '@angular/router';

@Component({
  selector: 'app-aspiration',
  templateUrl: './aspiration.page.html',
  styleUrls: ['./aspiration.page.scss'],
})
export class AspirationPage implements OnInit {

  aspiration: any;
  order: any;
  agenda: any;
  signatureImage: any;

  // Aspiration form template
  action: string;
  ajustList: number = 0;
  dataItem: any;
  itemIndex: any;
  backButton: boolean = false;
  nextButton: boolean = false;
  indx: number = 0;


  //detail fields
  item: any = {};
  donor: string;
  donor_breed: string;
  local: any;
  type: any;
  arrived_time: string;
  bull: string;
  bull_breed: string;
  gi: number;
  gii: number;
  giii: number;
  others: number;

  //validations_form = new FormGroup({
  validations_form = this.formBuilder.group({
    donor: ['', Validators.required],
    arrived_temperature: ['', Validators.required],
    donor_breed: ['', Validators.required],
    local: ['', Validators.required],
    type: ['', Validators.required],
    arrived_time: ['', Validators.required],
    bull: ['', Validators.required],
    bull_breed: ['', Validators.required],
    gi: ['', Validators.required],
    gii: ['', Validators.required],
    giii: ['', Validators.required],
    others: ['', Validators.required]
  });

  @ViewChild('networkNotifyBanner') public networkNotifyBanner: NetworkNotifyBannerComponent;
  constructor(
    public ordersService: OrdersService,
    public formBuilder: FormBuilder,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public modalCtrl: ModalController,
    public router: Router) {
  }

  ngOnInit() {
    const detail = this.ordersService.getDetailApiParam();
    this.aspiration = detail.aspiration;
    this.order = detail.order;
    this.agenda = detail.agendas ? detail.agendas[0] : {};
  }

  // convenience getter for easy access to form fields
  get f() { return this.validations_form.controls; }

  newItem() {
    this.dataItem = {
      idAnimal: '',
      chapeta: '',
      diagnostico: '',
      apta: true,
      sincronizada: true,
      encargado: '',
      observaciones: ''
    };
    this.ajustList = 1;
    this.action === 'new';
    this.indx = this.order.itemList.length;

    this.validations_form.reset({
      idAnimal: '',
      chapeta: '',
      diagnostico: '',
      apta: '',
      sincronizada: '',
      encargado: '',
      observaciones: ''
    });
  }

  nextItem() {
    if (this.validations_form.valid) {
      if (this.action === 'new') {
        this.order.itemList.push(this.dataItem);
        this.showMessage('Registro agregado');
        this.newItem();
      }
      if (this.action === 'update') {
        let list = [];
        for (let item of this.order.itemList) {
          list.push(item.idAnimal === this.dataItem.idAnimal ? this.dataItem : item);
        }
        this.order.itemList = list;
        this.showMessage('Registro modificado');

        if (this.indx === this.order.itemList.length - 1) {
          this.newItem();
        }
        else {
          this.indx++;
          this.dataItem = this.order.itemList[this.indx];
        }
      }

      //this.parentPage.refresItemList(this.order);
    }
  }

  backItem() {
    if (this.validations_form.valid) {
      if (this.action === 'new') {
        this.order.itemList.push(this.dataItem);
        this.ajustList = 0;
        this.showMessage('Registro agregado');
      }
      if (this.action === 'update') {
        let list = [];
        for (let item of this.order.itemList) {
          list.push(item.idAnimal === this.dataItem.idAnimal ? this.dataItem : item);
        }
        this.order.itemList = list;

        this.showMessage('Registro modificado');
      }

      //this.parentPage.refresItemList(this.order);
    }

    this.indx--;
    this.dataItem = this.order.itemList[this.indx];
    this.action = 'update';
  }

  validation_messages = {
    'idAnimal': [
      { type: 'required', message: 'Código requerido.' }
    ]
  };

  ionViewWillLeave() {

    if (this.validations_form.valid) {
      if (this.action === 'new') {
        this.order.itemList.push(this.dataItem);
        this.ajustList = 0;
        this.showMessage('Registro agregado');
      }
      if (this.action === 'update') {
        let list = [];
        for (let item of this.order.itemList) {
          list.push(item.idAnimal === this.dataItem.idAnimal ? this.dataItem : item);
        }
        this.order.itemList = list;
        this.showMessage('Registro modificado');
      }
    }

    // this.parentPage.refresItemList(this.order);
  }

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
      component: SignatureDrawPadPage
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

  async showMessage(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }
}