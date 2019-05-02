import { Component } from '@angular/core';
import { OrdersService } from '../orders.service';
import { ToastController, NavParams, ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment-timezone';


@Component({
  selector: 'app-aspiration-detail-modal',
  templateUrl: './aspiration-detail.modal.html',
  styleUrls: ['./aspiration.page.scss'],
})
export class AspirationDetailModal {

  // Aspiration form template
  aspiration: any;
  action: string;
  ajustList: number = 0;
  detailsList: any;
  indx: number = 0;
  dataItem: any;
  itemIndex: any;
  backButton: boolean = false;
  nextButton: boolean = false;

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
    public toastCtrl: ToastController,
    public navParams: NavParams,
    public modalCtrl: ModalController) {

	this.aspiration = this.ordersService.getDetailApiParam();
    this.detailsList = this.aspiration.details;
	for (let detail of this.detailsList){
		if(detail.arrived_time){
			let hour = 11;//detail.arrived_time;
			let minute = 30;//detail.arrived_time;
			let time = moment();
			time.set({hour:hour,minute:minute});
			detail.arrived_time = time.format();
		}
	}
    if (typeof this.navParams.data.value != 'undefined') {
      this.indx = this.navParams.data.value || 0;
      this.dataItem = this.detailsList[this.indx];
      this.action = 'update';
    }
    else {
      this.newItem();
    }
    this.dataItem.gi = this.dataItem.gi || 0;
    this.dataItem.gii = this.dataItem.gii || 0;
    this.dataItem.giii = this.dataItem.giii || 0;
    this.dataItem.others = this.dataItem.others || 0;
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

    this.ajustList = 1;
    this.action = 'new';
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
      if (this.action === 'update') {

        let list = [];
        this.dataItem.stateSync = this.dataItem.stateSync || 'U';
        for (let item of this.detailsList) {
          list.push(item.donor === this.dataItem.donor ? this.dataItem : item);
        }
        this.detailsList = list;
        this.showMessage('Registro modificado');

        if (this.indx === this.detailsList.length - 1) {
          this.newItem();
        }
        else {
          this.indx++;
          this.dataItem = this.detailsList[this.indx];
        }
      }
      //this.ionModalWillDismiss();
    }
  }

  backItem() {
    if (this.validations_form.valid) {
      if (this.action === 'new') {
        this.detailsList.push(this.dataItem);
        this.ajustList = 0;
        this.showMessage('Registro agregado');
      }
      if (this.action === 'update') {
        let list = [];
        for (let item of this.detailsList) {
          list.push(item.donor === this.dataItem.donor ? this.dataItem : item);
        }
        this.detailsList = list;
        this.showMessage('Registro modificado');
      }
      this.indx--;
      this.dataItem = this.detailsList[this.indx];
      this.action = 'update';
      //this.ionModalWillDismiss();
    }
    else {
      if (this.action === 'new') {
        this.indx--;
        this.dataItem = this.detailsList[this.indx];
        this.action = 'update';
      }
    }


  }

  validation_messages = {
    'idAnimal': [
      { type: 'required', message: 'Código requerido.' }
    ]
  };

  ionViewWillLeave() {

    if (this.validations_form.valid) {
      if (this.action === 'new') {
        this.detailsList.push(this.dataItem);
        this.ajustList = 0;
        this.showMessage('Registro agregado');
      }
      if (this.action === 'update') {
        let list = [];
        for (let item of this.detailsList) {
          list.push(item.idAnimal === this.dataItem.idAnimal ? this.dataItem : item);
        }
        this.detailsList = list;
        this.showMessage('Registro modificado');
      }
    }
  }
  ionModalWillDismiss() {
    this.modalCtrl.dismiss({
      'result': this.detailsList
    })
  }

  async showMessage(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }
}