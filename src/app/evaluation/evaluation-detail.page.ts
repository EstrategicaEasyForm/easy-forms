import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrdersService } from '../orders.service';
import { ToastController, AlertController } from '@ionic/angular';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import * as moment from 'moment-timezone';
import { Location } from '@angular/common';
import { EvaluationPage } from './evaluation.page';

@Component({
  selector: 'app-evaluation-detail-page',
  templateUrl: './evaluation-detail.page.html',
  styleUrls: ['./evaluation-detail.page.scss'],
})
export class EvaluationDetailPage implements OnInit, OnDestroy {

  // Evaluation form template
  evaluationPage: EvaluationPage;
  evaluation: any;
  indx: number;
  action: string;
  detailsList: any;
  dataItem: any;
  dataItemOri: any;
  newRegistry: boolean;
  validation_form: FormGroup;

  validation_messages = {
    'animal_id': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'chapeta': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'fit': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'synchronized': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'local_id': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'diagnostic': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'comments': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'other_procedures': [
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
    const detailApiId = dataParam.detailApiId;
    this.evaluationPage = dataParam.evaluationPage;
    this.evaluation = this.evaluationPage.evaluation;
    this.detailsList = this.evaluationPage.evaluation.details;

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
        animal_id: [this.dataItem.animal_id, Validators.required],
        chapeta: [this.dataItem.chapeta, Validators.required],
        fit: [this.dataItem.fit, Validators.required],
        synchronized: [this.dataItem.synchronized, Validators.required],
        local_id: [this.dataItem.local_id, Validators.required],
        diagnostic: [this.dataItem.diagnostic],
        other_procedures: [this.dataItem.other_procedures],
        comments: [this.dataItem.comments]
      });
    }
    else {
      this.validation_form.reset({
        animal_id: this.dataItem.animal_id,
        chapeta: this.dataItem.chapeta,
        fit: this.dataItem.fit,
        synchronized: this.dataItem.synchronized,
        local_id: this.dataItem.local_id,
        diagnostic: this.dataItem.diagnostic,
        other_procedures: this.dataItem.other_procedures,
        comments: this.dataItem.comments
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
        animal_id: ['', Validators.required],
        chapeta: ['', Validators.required],
        fit: ['', Validators.required],
        synchronized: ['', Validators.required],
        local_id: ['', Validators.required],
        diagnostic: [''],
        other_procedures: ['', Validators.required],
        comments: ['', Validators.required]
      });
    }
    else {
      this.validation_form.reset({
        animal_id: '',
        chapeta: '',
        fit: '',
        synchronized: '',
        local_id: '',
        diagnostic: '',
        other_procedures: '',
        comments: ''
      });
    }
  }

  saveItem() {
    if (this.action === 'update') {
      this.dataItem.stateSync = this.dataItem.stateSync || 'U';
      this.evaluationPage.saveEvaluation();
      this.showMessage('Registro modificado');
    }
    else if (this.action === 'new') {
      this.dataItem.id = new Date().getTime();
      this.detailsList.push(this.dataItem);
      this.evaluationPage.saveEvaluation();
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
        if (!this.equalsDetailsEvaluation(this.dataItemOri, this.dataItem)) {
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
      if (!this.equalsDetailsEvaluation(this.dataItemOri, this.dataItem)) {
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
      if (!this.equalsDetailsEvaluation(this.dataItemOri, this.dataItem)) {
        this.dataItem = this.dataItemOri;
      }
  }

  equalsDetailsEvaluation(dataObjOri: any, dataItem: any) {
    return dataObjOri.animal_id === dataItem.animal_id &&
      dataObjOri.chapeta === dataItem.chapeta &&
      dataObjOri.fit === dataItem.fit &&
      dataObjOri.synchronized === dataItem.synchronized &&
      dataObjOri.local_id === dataItem.local_id &&
      dataObjOri.diagnostic === dataItem.diagnostic &&
      dataObjOri.other_procedures === dataItem.other_procedures &&
      dataObjOri.comments === dataItem.comments;
  }

  ngOnDestroy(): void {
    const dataObjOri = this.detailsList[this.indx];
    if (dataObjOri) {
      if (!this.equalsDetailsEvaluation(dataObjOri, this.dataItem)) {
        //TODO: confirmation to exit
      }
    }
  }

  onChangeDatetime($datetime) {
    this.dataItem.arrived_time = moment($datetime).format('hh:mmA');
  }

  onChangeLocal($localId) {
    if (this.evaluation.locals) {
      for (let local of this.evaluation.locals) {
        if (local.id === $localId) {
          this.dataItem.local = local;
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
}