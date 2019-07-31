import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrdersService } from '../orders.service';
import { ToastController, AlertController } from '@ionic/angular';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import * as moment from 'moment-timezone';
import { Location } from '@angular/common';
import { TransferPage } from './transfer.page';
import { Observable } from 'apollo-link';

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
  filterReceptValue: string;
  dataItemOri: any;
  newRegistry: boolean;
  validation_form: FormGroup;
  checkRecept: boolean;
  checkInitial: boolean;
  synchronizedsListOriginal = [];
  synchronizedsList: Observable<Array<string>>;
  corpusLuteumList: any =  ['I1', 'I2', 'I3', 'D1', 'D2', 'D3'];

  validation_messages = {
    'embryo_class': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'evaluation_detail_id': [
      { type: 'required', message: 'Campo requerido.' }
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
      this.newItem(null,'','');
    }
    this.filterReceiverselect();
  }

  updateItem(detailId) {
    this.indx = detailId;
    this.dataItem = this.detailsList[this.indx];
    let receiver = this.dataItem.receiver;
    if (receiver === null && this.dataItem.discard === '1') {
      receiver = 'Descartada';
    }
    this.checkRecept = this.dataItem.evaluation_detail_id !== null;

    this.action = 'update';
    this.newRegistry = false;
    //create a copy of the object
    this.dataItemOri = Object.assign({}, this.dataItem);
    //initialize the form

    this.validation_form = this.formBuilder.group({
      embryo_class: [this.dataItem.embryo_class, Validators.required],
      checkRecept: [this.checkRecept, ''],
      filterReceptValue: [this.filterReceptValue, ''],
      corpus_luteum: [this.dataItem.corpus_luteum, Validators.required],
      local_id: [this.dataItem.local_id, Validators.required],
      transferor: [this.dataItem.transferor, Validators.required],
      comments: [this.dataItem.comments, Validators.required],
      receiver: [receiver, this.receiverInputValidator.bind(this)],
      evaluation_detail_id: [this.dataItem.evaluation_detail_id + '', this.receiverSyncValidator.bind(this)],
    });

  }

  newItem(newTransferor,localId,comments) {

    this.dataItem = {
      stateSync: 'C'
    };

    this.action = 'new';
    this.newRegistry = true;
    this.indx = this.detailsList.length;

    this.checkRecept = false;
    if (!this.validation_form) {
      this.validation_form = this.formBuilder.group({
        embryo_class: ['', Validators.required],
        receiver: ['', this.receiverInputValidator.bind(this)],
        checkRecept: [this.checkRecept],
        corpus_luteum: ['', Validators.required],
        local_id: [localId, Validators.required],
        transferor: [newTransferor || '', Validators.required],
        comments: [comments, Validators.required],
        evaluation_detail_id: ['', this.receiverSyncValidator.bind(this)],
      });
    }
    else {
      this.validation_form.reset({
        embryo_class: '',
        checkRecept: [this.checkRecept],
        receiver: '',
        corpus_luteum: '',
        local_id: localId,
        transferor: newTransferor || '',
        comments: comments,
        evaluation_detail_id: '',
      });
    }
	
	this.onChangeLocal(localId);
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
        this.newItem(this.dataItem.transferor,this.dataItem.local_id,this.dataItem.comments);
        this.dataItemOri = Object.assign({}, this.dataItem);
      }
      else if (this.action === 'update') {
        if (!this.equalsDetailsTransfer(this.dataItemOri, this.dataItem)) {
          this.saveItem();
          this.dataItemOri = Object.assign({}, this.dataItem);
        }
        if (this.indx === this.detailsList.length - 1) {
		  this.newItem(this.dataItem.transferor,this.dataItem.local_id,this.dataItem.comments);
          this.dataItemOri = Object.assign({}, this.dataItem);
        }
        else {
          this.indx++;
          const oldData = this.dataItem;
          this.dataItem = this.detailsList[this.indx];
            
		  if(!this.dataItem.transferor || this.dataItem.transferor.length === 0 ) this.dataItem.transferor = oldData.transferor;
		  if(!this.dataItem.local_id || this.dataItem.local_id === null) { 
			this.dataItem.local_id = oldData.local_id;
			this.onChangeLocal(this.dataItem.local_id);
		  }
		  if(!this.dataItem.comments || this.dataItem.comments.length === 0)  this.dataItem.comments = oldData.comments;
		  
          this.dataItemOri = Object.assign({}, this.dataItem);
        }
      }
    }
    this.checkRecept = this.dataItem.evaluation_detail_id !== null ? true : false;
    this.filterReceiverselect();
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

    this.checkRecept = this.dataItem.evaluation_detail_id !== null;
    this.filterReceiverselect();
  }

  ionViewWillLeave() {
    if (this.dataItemOri)
      if (!this.equalsDetailsTransfer(this.dataItemOri, this.dataItem)) {
        this.dataItem = this.dataItemOri;
      }
  }

  //CHANGE
  equalsDetailsTransfer(dataObjOri: any, dataItem: any): boolean {
	if(dataObjOri===null || dataObjOri===undefined ) return true;
    return
	  dataObjOri.receiver === dataItem.receiver &&
      dataObjOri.evaluation_detail_id === dataItem.evaluation_detail_id &&
      dataObjOri.corpus_luteum === dataItem.corpus_luteum &&
      dataObjOri.local_id === dataItem.local_id &&
      dataObjOri.transferor === dataItem.transferor &&
      dataObjOri.comments === dataItem.comments;
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
          break;
        }
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

  onChangeReceptSync($receptId) {
    if (this.transfer.synchronizeds) {
      for (let receptSync of this.transfer.synchronizeds) {
        if (receptSync.id === $receptId) {
          this.dataItem.receptSync = receptSync.animal_id + "-" + receptSync.chapeta;
          break;
        }
      }
    }
  }

  onChangeCheckRecept() {
    this.validation_form = this.formBuilder.group({
      embryo_class: [this.dataItem.embryo_class, Validators.required],
      receiver: [this.dataItem.receiver, this.receiverInputValidator.bind(this)],
      checkRecept: [this.checkRecept],
      filterReceptValue: [this.filterReceptValue],
      corpus_luteum: [this.dataItem.corpus_luteum, Validators.required],
      local_id: [this.dataItem.local_id, Validators.required],
      transferor: [this.dataItem.transferor, Validators.required],
      comments: [this.dataItem.comments, Validators.required],
      evaluation_detail_id: [this.dataItem.evaluation_detail_id + '', this.receiverSyncValidator.bind(this)],
    });
  }

  receiverSyncValidator(fc: FormControl) {
    if (this.checkRecept) {
      if (!fc.value || fc.value === '')
        return ({ required: true });
      else return (null);
    }
    else {
      return (null);
    }
  }

  receiverInputValidator(fc: FormControl) {
    if (this.checkRecept) {
      return (null);
    }
    else {
      if (!fc.value || fc.value === '')
        return ({ required: true });
      else return (null);
    }
  }

  filterReceiverselect() {
    const newList = [];
    let mbIsAssigned: boolean;
    for (let item of this.transfer.synchronizeds) {
      mbIsAssigned = false;
      for (let detail of this.detailsList) {
        if (detail.evaluation_detail_id == item.id && detail.evaluation_detail_id !== this.dataItem.evaluation_detail_id) {
          mbIsAssigned = true;
          break;
        }
      }
      if (!mbIsAssigned) {
        newList.push(item);
      }
    }

    this.synchronizedsListOriginal = newList;
    this.synchronizedsList = Observable.of(this.synchronizedsListOriginal);
  }

  filterRecepts(filter) {
    this.synchronizedsList = Observable.of(this.synchronizedsListOriginal.filter(item => {
      return (item.animal_id + "-" + item.chapeta).includes(filter);
    }));
  }

}
