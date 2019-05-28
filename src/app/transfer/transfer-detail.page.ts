import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrdersService } from '../orders.service';
import { ToastController, AlertController } from '@ionic/angular';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import * as moment from 'moment-timezone';
import { Location } from '@angular/common';
import { TransferPage } from './transfer.page';

@Component({
  selector: 'app-transfer-detail',
  templateUrl: './transfer-detail.page.html',
  styleUrls: ['./transfer-detail.page.scss'],
})
export class TransferDetailPage implements OnInit, OnDestroy {

  // Aspiration form template
  transferPage: TransferPage;
  transfer: any;
  indx: number;
  action: string;
  detailsList: any;
  dataItem: any;
  dataItemOri: any;
  newRegistry: boolean;
  validation_form: FormGroup;
  checkRecept: boolean;

  validation_messages = {
    'donor_breed': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'local_id': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'type': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'arrived_time': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'receiver_name': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'gi': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'gii': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'giii': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'others': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'recept': [
      { type: 'required', message: 'Campo requerido.' }
    ]
  };

  constructor(
    public ordersService: OrdersService,
    public formBuilder: FormBuilder,
    public toastCtrl: ToastController,
    public location: Location,
    public alertController: AlertController) { }

  ngOnInit() {
    const dataParam = this.ordersService.getDetailApiParam();
    const detailApiId = dataParam.detailApiId;
    this.transferPage = dataParam.transferPage;
    this.transfer = this.transferPage.transfer;
    this.detailsList = this.transferPage.transfer.details;
    this.checkRecept = true;

    if (detailApiId >= 0) {
      this.updateItem(detailApiId);
    }
    else {
      this.newItem();
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
        donor_breed: [this.dataItem.donor_breed, Validators.required],
        local_id: [this.dataItem.local_id, Validators.required],
        corpus_luteum: [this.dataItem.corpus_luteum, Validators.required],
        arrived_time: [this.dataItem.ionDateTime, Validators.required],
        bull: [this.dataItem.bull],
        bull_breed: [this.dataItem.bull_breed],
        gi: [this.dataItem.gi, Validators.required],
        gii: [this.dataItem.gii, Validators.required],
        giii: [this.dataItem.giii, Validators.required],
        others: [this.dataItem.others, Validators.required],
        recept: []
      });
    }
    else {
      this.validation_form.reset({
        donor: this.dataItem.donor,
        donor_breed: this.dataItem.donor_breed,
        local_id: this.dataItem.local_id,
        type: this.dataItem.type,
        arrived_time: this.dataItem.arrived_time,
        bull: this.dataItem.bull,
        bull_breed: this.dataItem.bull_breed,
        gi: this.dataItem.gi,
        gii: this.dataItem.gii,
        giii: this.dataItem.giii,
        others: this.dataItem.others
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
        donor: ['', Validators.required],
        donor_breed: ['', Validators.required],
        local_id: ['', Validators.required],
        type: ['', Validators.required],
        arrived_time: ['', Validators.required],
        bull: [''],
        bull_breed: [''],
        gi: ['', Validators.required],
        gii: ['', Validators.required],
        giii: ['', Validators.required],
        others: ['', Validators.required]
      });
    }
    else {
      this.validation_form.reset({
        donor: '',
        donor_breed: '',
        local_id: '',
        type: '',
        arrived_time: '',
        bull: '',
        bull_breed: '',
        gi: '',
        gii: '',
        giii: '',
        others: ''
      });
    }
  }

  saveItem() {
    if (this.action === 'update') {
      this.dataItem.stateSync = this.dataItem.stateSync || 'U';
      this.transferPage.saveTransfer();
      this.showMessage('Registro modificado');
    }
    else if (this.action === 'new') {
      this.dataItem.id = new Date().getTime();
      this.detailsList.push(this.dataItem);
      this.transferPage.saveTransfer();
      this.showMessage('Registro agregado');
    }

    this.action = 'update';
    this.newRegistry = false;
    this.dataItemOri = Object.assign({}, this.dataItem);
  }

  nextItemButton() {
    if (this.validation_form.valid) {
      if (this.action === 'new') {
        this.saveItem();
        this.newItem();
        this.dataItemOri = Object.assign({}, this.dataItem);
      }
      else if (this.action === 'update') {
        if (!this.equalsDetailsTransfer(this.dataItemOri, this.dataItem)) {
          this.saveItem();
          this.dataItemOri = Object.assign({}, this.dataItem);
        }
        if (this.indx === this.detailsList.length - 1) {
          this.newItem();
          this.dataItemOri = Object.assign({}, this.dataItem);
        }
        else {
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
      if (!this.equalsDetailsTransfer(this.dataItemOri, this.dataItem)) {
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
      if (!this.equalsDetailsTransfer(this.dataItemOri, this.dataItem)) {
        this.dataItem = this.dataItemOri;
      }
  }

  //CHANGE
  equalsDetailsTransfer(dataObjOri: any, dataItem: any) {
    return dataObjOri.donor === dataItem.donor &&
      dataObjOri.donor_breed === dataItem.donor_breed &&
      dataObjOri.local_id === dataItem.local_id &&
      dataObjOri.type === dataItem.type &&
      dataObjOri.arrived_time === dataItem.arrived_time &&
      dataObjOri.bull === dataItem.bull &&
      dataObjOri.bull_breed === dataItem.bull_breed &&
      dataObjOri.gi === dataItem.gi &&
      dataObjOri.gii === dataItem.gii &&
      dataObjOri.giii === dataItem.giii &&
      dataObjOri.others === dataItem.others;
  }

  ngOnDestroy() {
    const dataObjOri = this.detailsList[this.indx];
    if (dataObjOri) {
      if (!this.equalsDetailsTransfer(dataObjOri, this.dataItem)) {
        //TODO: confirmation to exit
      }
    }
  }

  onChangeDatetime($datetime) {
    this.dataItem.arrived_time = moment($datetime).format('hh:mmA');
  }

  onChangeLocal($localId) {
    if (this.transfer.locals) {
      for (let local of this.transfer.locals) {
        if (local.id === $localId) {
          this.dataItem.local = local;
        }
      }
    }
  }

  closeDetail() {
    this.location.back();
  }

  checkValue(isChecked: any) {
    this.checkRecept = !this.checkRecept;
  }

  async showMessage(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }

}
