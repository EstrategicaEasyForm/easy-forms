import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrdersService } from '../orders.service';
import { ToastController, AlertController } from '@ionic/angular';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import * as moment from 'moment-timezone';
import { Location } from '@angular/common';
import { SexagePage } from './sexage.page';

@Component({
  selector: 'app-sexage-detail-page',
  templateUrl: './sexage-detail.page.html',
  styleUrls: ['./sexage-detail.page.scss'],
})
export class SexageDetailPage implements OnInit, OnDestroy {

  // Sexage form template
  sexagePage: SexagePage;
  sexage: any;
  indx: number;
  action: string;
  detailsList: any;
  dataItem: any;
  dataItemOri: any;
  newRegistry: boolean;
  validation_form: FormGroup;

  validation_messages = {
    'dx1': [
      { type: 'required', message: 'Campo requerido.' }
    ]
  };

  constructor(
    public ordersService: OrdersService,
    public formBuilder: FormBuilder,
    public toastCtrl: ToastController,
    public location: Location,
    public alertController: AlertController, ) {

  }

  ngOnInit() {

    const dataParam = this.ordersService.getDetailApiParam();
    let detailApiId = dataParam.detailApiId;
    this.sexagePage = dataParam.sexagePage;
    this.sexage = this.sexagePage.sexage;
    this.detailsList = this.sexagePage.sexage.details;

    if (detailApiId >= 0) {
      this.updateItem(detailApiId);
    }
    else {
	  detailApiId = 0;
      this.updateItem(detailApiId);
    }
  }

  updateItem(detailId) {
    this.indx = detailId;
    this.dataItem = this.detailsList[this.indx];
    this.action = 'update';
    this.newRegistry = false;
    //create a copy of the object
    this.dataItemOri = Object.assign({}, this.dataItem);
    //initialize the form
    if (!this.validation_form) {
      this.validation_form = this.formBuilder.group({
        sex: [this.dataItem.sex, Validators.required]
      });
    }
    else {
      this.validation_form.reset({
        sex: this.dataItem.sex
      });
    }
  }

  newItem() {

    this.dataItem = {
      stateSync: 'C'
    };

    this.action = 'new';
    this.newRegistry = true;
    this.indx = this.detailsList.length;

    if (!this.validation_form) {
      this.validation_form = this.formBuilder.group({
        sex: ['', Validators.required]
      });
    }
    else {
      this.validation_form.reset({
        sex: ''
      });
    }
  }

  saveItem() {
    if (this.action === 'update') {
      this.dataItem.stateSync = this.dataItem.stateSync || 'U';
      this.sexagePage.saveSexage();
      this.showMessage('Registro modificado');
    }
    else if (this.action === 'new') {
      this.dataItem.id = new Date().getTime();
      this.detailsList.push(this.dataItem);
      this.sexagePage.saveSexage();
      this.showMessage('Registro agregado');
    }

    this.action = 'update';
    this.newRegistry = false;
    this.dataItemOri = Object.assign({}, this.dataItem);
  }

  nextItemButton() {
    if (this.validation_form.valid) {
      if (this.action === 'update') {
        if (!this.equalsDetailsSexage(this.dataItemOri, this.dataItem)) {
          this.saveItem();
          this.dataItemOri = Object.assign({}, this.dataItem);
        }
        if (this.indx < this.detailsList.length - 1) {
          this.indx++;
          this.dataItem = this.detailsList[this.indx];
          this.dataItemOri = Object.assign({}, this.dataItem);
        }
      }
    }
  }

  backItemButton() {
    if (this.indx === 0) return;
    if (this.validation_form.valid) {
      if (!this.equalsDetailsSexage(this.dataItemOri, this.dataItem)) {
        this.saveItem();
      }
      this.indx--;
      this.dataItem = this.detailsList[this.indx];
      this.dataItemOri = Object.assign({}, this.dataItem);
      this.action = 'update';
      this.newRegistry = false;
    }
    else if (this.action === 'new') {
      this.indx--;
      this.dataItem = this.detailsList[this.indx];
      this.dataItemOri = Object.assign({}, this.dataItem);
      this.action = 'update';
      this.newRegistry = false;
    }
  }

  ionViewWillLeave() {
    if (this.dataItemOri)
      if (!this.equalsDetailsSexage(this.dataItemOri, this.dataItem)) {
        this.dataItem = this.dataItemOri;
      }
  }

  equalsDetailsSexage(dataObjOri: any, dataItem: any) {
    return dataObjOri.sex === dataItem.sex;
  }

  ngOnDestroy(): void {
    const dataObjOri = this.detailsList[this.indx];
    if (dataObjOri) {
      if (!this.equalsDetailsSexage(dataObjOri, this.dataItem)) {
        //TODO: confirmation to exit
      }
    }
  }

  closeDetail() {
    this.location.back();
  }

  async showMessage(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }
}