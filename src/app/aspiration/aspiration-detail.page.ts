import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrdersService } from '../orders.service';
import { ToastController } from '@ionic/angular';
import { FormBuilder, Validators } from '@angular/forms';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-aspiration-detail-page',
  templateUrl: './aspiration-detail.page.html',
  styleUrls: ['./aspiration.page.scss'],
})
export class AspirationDetailPage implements OnInit, OnDestroy {

  // Aspiration form template
  aspiration: any;
  action: string;
  detailsList: any;
  indx: number = 0;
  dataItem: any;
  itemIndex: any;
  backButton: boolean = false;
  nextButton: boolean = false;

  newRegistry: boolean = true;
  parentPage: any;

  //validations_form = new FormGroup({
  validations_form = this.formBuilder.group({
    donor: ['', Validators.required],
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

  constructor(
    public ordersService: OrdersService,
    public formBuilder: FormBuilder,
    public toastCtrl: ToastController) {

  }

  ngOnInit() {

    const dataParam = this.ordersService.getDetailApiParam();
    const detailApiId = dataParam.detailApiId;
    this.parentPage = dataParam.parentPage;
    this.aspiration = dataParam.aspiration;
    this.detailsList = this.aspiration.details;

    for (let detail of this.detailsList) {
      if (detail.arrived_time) {
        const minute = Number(detail.arrived_time.split(':')[1].substr(0,2));
        const pm = detail.arrived_time.split(':')[1].substr(2,2) === 'PM' ? 12 : 0;
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

    if (typeof detailApiId !== 'undefined') {
      this.indx = detailApiId || 0;
      this.dataItem = Object.assign({}, this.detailsList[this.indx]);
      this.action = 'update';
      this.newRegistry = false;
    }
    else {
      this.newItem();
      this.action = 'new';
      this.newRegistry = true;
    }
  }

  newItem() {
    this.dataItem = {
      donor: '',
      donor_breed: '',
      local: '',
      type: '',
      arrived_time: '',
      bull: '',
      bull_breed: '',
      gi: '',
      gii: '',
      giii: '',
      others: '',
      stateSync: 'N'
    };

    this.action = 'new';
    this.newRegistry = true;
    this.indx = this.detailsList.length;

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
        this.detailsList.push(this.dataItem);
        this.showMessage('Registro agregado');
        this.newItem();
      }
      else if (this.action === 'update') {

        const dataObjOri = this.detailsList[this.indx];

        if (!this.equalsDetailsAspiration(dataObjOri, this.dataItem)) {
          let list = [];
          this.dataItem.stateSync = this.dataItem.stateSync || 'U';
          for (let item of this.detailsList) {
            list.push(item.id === this.dataItem.id ? this.dataItem : item);
          }
          this.detailsList = list;
          this.showMessage('Registro modificado');
        }

        if (this.indx === this.detailsList.length - 1) {
          this.newItem();
        }
        else {
          this.indx++;
          this.dataItem = Object.assign({}, this.detailsList[this.indx]);
        }
      }
      //this.ionModalWillDismiss();
    }
  }

  backItem() {
    if (this.validations_form.valid) {
      if (this.action === 'new') {
        this.detailsList.push(this.dataItem);
        this.showMessage('Registro agregado');
      }
      else if (this.action === 'update') {

        const dataObjOri = this.detailsList[this.indx];
        if (!this.equalsDetailsAspiration(dataObjOri, this.dataItem)) {
          let list = [];
          this.dataItem.stateSync = this.dataItem.stateSync || 'U';
          for (let item of this.detailsList) {
            list.push(item.id === this.dataItem.id ? this.dataItem : item);
          }
          this.detailsList = list;
          this.showMessage('Registro modificado');
        }
      }
      this.indx--;
      this.dataItem = this.detailsList[this.indx];
      this.action = 'update';
      this.newRegistry = false;
    }
    else if (this.action === 'new') {
      this.indx--;
      this.dataItem = this.detailsList[this.indx];
      this.action = 'update';
      this.newRegistry = false;
    }
  }


  equalsDetailsAspiration(dataObjOri: any, dataItem: any) {

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

  validation_messages = {
    'idAnimal': [
      { type: 'required', message: 'Código requerido.' }
    ]
  };

  ionViewWillLeave() {

    if (this.validations_form.valid) {
      const dataObjOri = this.detailsList[this.indx];
      if (!this.equalsDetailsAspiration(dataObjOri, this.dataItem)) {
        if (this.action === 'new') {
          this.detailsList.push(this.dataItem);
          this.showMessage('Registro agregado');
        }
        if (this.action === 'update') {
          let list = [];
          this.dataItem.stateSync = this.dataItem.stateSync || 'U';
          for (let item of this.detailsList) {
            list.push(item.id === this.dataItem.id ? this.dataItem : item);
          }
          this.detailsList = list;
          this.showMessage('Registro modificado');
        }
      }
    }
  }

  ngOnDestroy(): void {
    this.parentPage.reloadDetailsList(this.detailsList);
  }

  onChangeDatetime($datetime) {
    this.dataItem.arrived_time = moment($datetime).format('hh:mmA');
  }

  async showMessage(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }
}