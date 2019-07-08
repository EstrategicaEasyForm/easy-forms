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
    if (evaluation.stateSync === 'U' || evaluation.stateSync === 'E') {
      variables = Object.assign(variables, {
        "input": {
          "id": evaluation.id,
          "comments": evaluation.comments,
          "identification_number": evaluation.identification_number,
          "technical": evaluation.technical,
          "received_by": evaluation.received_by,
          "state": evaluation.state,
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
          'animal_id': detail.animal_id,
          'chapeta': detail.chapeta,
          'fit': detail.fit,
          'synchronized': detail.synchronized,
          'other_procedures': detail.other_procedures,
          'comments': detail.comments,
          'attendant': detail.attendant,
          'diagnostic': detail.diagnostic,
          'user_id_updated': this.userService.getUserId()
        });
      }
      else if (detail.stateSync === 'C') {
        create.push({
          'local_id': detail.local_id,
          'animal_id': detail.animal_id,
          'chapeta': detail.chapeta,
          'fit': detail.fit,
          'synchronized': detail.synchronized,
          'attendant': detail.attendant,
          'diagnostic': detail.diagnostic,
          'other_procedures': detail.other_procedures,
          'comments': detail.comments,
          'user_id_updated': this.userService.getUserId(),
          'user_id_created': this.userService.getUserId(),
        });
      }
    });

    if (create.length > 0 || update.length > 0) {
      let details: any = {};
      if (create.length > 0) details.create = create;
      if (update.length > 0) details.update = update;
      variables.input['details'] = details;
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