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

  transferPage: TransferPage;
  transfer: any;
  indx: number;
  action: string;
  detailsList: any;
  detailApi: any;
  dataItem: any;
  dataItemOri: any;
  newRegistry: boolean;
  validation_form: FormGroup;
  checkRecept: boolean;
  checkInitial: boolean;

  validation_messages = {
    'embryo_class': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'recept': [
      //{ type: 'required', message: 'Campo requerido.' }
    ],
    'receiver': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'corpus_luteum': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'local_id': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'transferor': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'comments': [
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
    this.detailApi = dataParam.transferPage.detailApi;
    this.transferPage = dataParam.transferPage;
    this.transfer = this.transferPage.transfer;
    this.detailsList = this.transferPage.transfer.details_view;

    if (detailApiId >= 0) {
      this.updateItem(detailApiId);
    }
    else {
      this.checkRecept = true;
      this.newItem();
    }
  }

  updateItem(detailId) {
    this.indx = detailId;
    this.dataItem = this.detailsList[this.indx];
    console.log(this.dataItem);
    this.action = 'update';
    this.newRegistry = false;
    //create a copy of the object
    this.dataItemOri = Object.assign({}, this.dataItem);
    if (!this.dataItem.evaluation_detail_id || this.dataItem.evaluation_detail_id == null) {
      this.checkInitial = false;
    } else {
      this.checkInitial = true;
    }
    //initialize the form
    if (!this.validation_form) {
      this.validation_form = this.formBuilder.group({
        embryo_class: [this.dataItem.embryo_class, Validators.required],
        corpus_luteum: [this.dataItem.corpus_luteum, Validators.required],
        local_id: [this.dataItem.local_id, Validators.required],
        transferor: [this.dataItem.transferor, Validators.required],
        comments: [this.dataItem.comments, Validators.required],
        receiver: [this.dataItem.receiver, Validators.required],
        recept: [this.dataItem.evaluation_detail_id, ''],
      });
    }
    else {
      this.validation_form.reset({
        embryo_class: this.dataItem.embryo_class,
        corpus_luteum: this.dataItem.corpus_luteum,
        local_id: this.dataItem.local_id,
        transferor: this.dataItem.transferor,
        comments: this.dataItem.comments,
        receiver: this.dataItem.receiver,
        recept: this.dataItem.evaluation_detail_id
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
        embryo_class: ['', Validators.required],
        receiver: ['', Validators.required],
        corpus_luteum: ['', Validators.required],
        local_id: ['', Validators.required],
        transferor: ['', Validators.required],
        comments: ['', Validators.required],
        recept: ['', Validators.required],
      });
    }
    else {
      this.validation_form.reset({
        embryo_class: '',
        receiver: '',
        corpus_luteum: '',
        local_id: '',
        transferor: '',
        comments: '',
        recept: '',
      });
    }
  }

  saveItem() {
    if (this.checkRecept) {
      this.dataItem.receiver = null;
    } else {
      this.dataItem.evaluation_detail_id = null;
    }
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
    console.log(this.dataItemOri);
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

  checkValue() {
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
