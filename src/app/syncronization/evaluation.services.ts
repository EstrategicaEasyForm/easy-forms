import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { UsersService } from '../users.service';
import * as moment from 'moment-timezone';
import { Events, Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {

  generatePDFs: any = [];

  constructor(private apollo: Apollo,
    public userService: UsersService,
    public event: Events,
    private platform: Platform) { }

  updateEvaluation(evaluation: any) {
    const evaluationMutation = gql`
      mutation updateEvaluation($input: UpdateEvaluationInput!){
        updateEvaluation(input: $input) {
          id
        }
      }`;

    let variables = {
      "input": {
        "id": evaluation.id
      }
    };
    if (evaluation.stateSync === 'U') {
      variables = Object.assign(variables, {
        "input": {
          "id": evaluation.id,
          "arrived_temperature": evaluation.arrived_temperature,
          "aspirator": evaluation.aspirator,
          "comments": evaluation.comments,
          //"date": evaluation.date,
          "identification_number": evaluation.identification_number,
          "medium_lot_miv": evaluation.medium_lot_miv,
          "medium_lot_opu": evaluation.medium_lot_opu,
          "medium_opu": evaluation.medium_opu,
          "received_by": evaluation.received_by,
          "receiver_name": evaluation.receiver_name,
          "searcher": evaluation.searcher,
          "state": evaluation.state,
          "synchronized_receivers": evaluation.synchronized_receivers,
          "transport_type": evaluation.transport_type,
          "user_id_updated": this.userService.getUserId()
        }
      });
    }
    const create = [];
    const update = [];
    evaluation.details.forEach(detail => {
      if (detail.stateSync === 'U') {
        update.push({
          'id': detail.id,
          'local_id': detail.local_id,
          'donor': detail.donor,
          'donor_breed': detail.donor_breed,
          'arrived_time': detail.arrived_time,
          'bull': detail.bull,
          'bull_breed': detail.bull_breed,
          'type': detail.type,
          'gi': detail.gi,
          'gss': detail.gss,
          'gssi': detail.gssi,
          'others': detail.others,
          'user_id_updated': this.userService.getUserId()
        });
      }
      else if (detail.stateSync === 'C') {
        create.push({
          'local_id': evaluation.local_id,
          'donor': evaluation.donor,
          'donor_breed': evaluation.donor_breed,
          'arrived_time': evaluation.arrived_time,
          'bull': evaluation.bull,
          'bull_breed': evaluation.bull_breed,
          'type': evaluation.type,
          'gi': evaluation.gi,
          'gss': evaluation.gss,
          'gssi': evaluation.gssi,
          'others': evaluation.others,
          'user_id_updated': this.userService.getUserId(),
          'user_id_created': this.userService.getUserId(),
        });
      }
    });

    if (create.length > 0 || update.length > 0) {
      let details = { "details": {} };
      if (create.length > 0) details = Object.assign(details, { "create": create });
      if (update.length > 0) details = Object.assign(details, { "update": update });
      variables = Object.assign(variables, details);
    }
    else if (evaluation.stateSync !== 'U') {
      //Si no se reflejan cambios en el elemento o sus detalles, se resuelve la promesa
      return new Promise(resolve => {
        resolve({ status: 'no_change' });
      });
    }

    //se resuelve la promesa despues de obtener respuesta de la mutacion
    return new Promise(resolve => {
      this.apollo.mutate({
        mutation: evaluationMutation,
        variables: Object.assign({ "input": {} }, variables)
      }).subscribe(({ data }) => {
        resolve({ status: 'success', data: data });
      }, (error) => {
        resolve({ status: 'error', error: error });
      });
    });
  }
}