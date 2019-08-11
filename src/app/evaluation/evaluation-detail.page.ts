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
    'attendant': [
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
      const local_id = dataParam.local ? dataParam.local.id : '';
      this.newItem(local_id,'','','','');
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
        attendant: [this.dataItem.attendant, Validators.required],
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
        attendant: this.dataItem.attendant,
        local_id: this.dataItem.local_id,
        diagnostic: this.dataItem.diagnostic,
        other_procedures: this.dataItem.other_procedures,
        comments: this.dataItem.comments
      });
    }
  }

  newItem(local_id,attendant,diagnostic,other_procedures,comments) {

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
        attendant: [attendant, Validators.required],
        diagnostic: [diagnostic],
        other_procedures: [other_procedures, Validators.required],
        comments: [comments, Validators.required]
      });
      this.dataItem.local_id = local_id;
      this.onChangeLocal(local_id);
    }
    else {
      this.validation_form.reset({
        animal_id: '',
        chapeta: '',
        fit: '',
        synchronized: '',
        attendant: attendant,
        local_id: local_id,
        diagnostic: diagnostic,
        other_procedures: other_procedures,
        comments: comments
      });
      this.dataItem.local_id = local_id;
      this.onChangeLocal(local_id);
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
        this.newItem(this.dataItem.local_id,this.dataItem.attendant,this.dataItem.diagnostic,this.dataItem.other_procedures,this.dataItem.comments);
        this.dataItemOri = Object.assign({}, this.dataItem);
      }
      else if (this.action === 'update') {
        if (!this.equalsDetailsEvaluation(this.dataItemOri, this.dataItem)) {
          this.saveItem();
          this.dataItemOri = Object.assign({}, this.dataItem);
        }
        if (this.indx === this.detailsList.length - 1) {
          this.newItem(this.dataItem.local_id,this.dataItem.attendant,this.dataItem.diagnostic,this.dataItem.other_procedures,this.dataItem.comments);
          this.dataItemOri = Object.assign({}, this.dataItem);
        }
        else {
          this.indx++;
          this.dataItem = this.detailsList[this.indx];
          this.dataItem.fit = this.dataItem.fit;
          this.dataItem.synchronized = this.dataItem.synchronized;
          this.dataItem.local_id = this.dataItem.local_id;
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
      this.dataItem.fit = this.dataItem.fit;
      this.dataItem.synchronized = this.dataItem.synchronized;
      this.dataItem.local_id = this.dataItem.local_id;
      this.dataItemOri = Object.assign({}, this.dataItem);
      this.action = 'update';
      this.newRegistry = false;
    }
    else if (this.action === 'new') {
      this.indx--;
      this.dataItem = this.detailsList[this.indx];
      this.dataItem.fit = this.dataItem.fit;
      this.dataItem.synchronized = this.dataItem.synchronized;
      this.dataItem.local_id = this.dataItem.local_id;
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
	if(dataObjOri===null || dataObjOri===undefined ) return true;
    return dataObjOri.animal_id === dataItem.animal_id &&
      dataObjOri.chapeta === dataItem.chapeta &&
      Number(dataObjOri.fit) === Number(dataItem.fit) &&
      Number(dataObjOri.synchronized) === Number(dataItem.synchronized) &&
      Number(dataObjOri.local_id) === Number(dataItem.local_id) &&
      dataObjOri.attendant === dataItem.attendant &&
      dataObjOri.diagnostic === dataItem.diagnostic &&
      dataObjOri.other_procedures === dataItem.other_procedures &&
      dataObjOri.comments === dataItem.comments;
  }

  ngOnDestroy(): void {
    const dataObjOri = this.detailsList[this.indx];
    if (dataObjOri) {
      if (!this.equalsDetailsEvaluation(dataObjOri, this.dataItem)) {
        //TODO: confirmation to exit
		this.evaluationPage.resetItemDetail(this.dataItemOri, this.indx);
      }
    }
  }

  onChangeLocal($localId) {
    if (this.evaluation.locals) {
      for (let local of this.evaluation.locals) {
        if (local.id == $localId) {
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
} 