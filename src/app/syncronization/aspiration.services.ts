import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { UsersService } from '../users.service';
import * as moment from 'moment-timezone';
import { Events, Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AspirationService {

  generatePDFs: any = [];

  constructor(private apollo: Apollo,
    public userService: UsersService,
    public event: Events,
    private platform: Platform) { }

  updateAspiration(aspiration: any) {
    const aspirationMutation = gql`
      mutation updateAspiration($input: UpdateAspirationInput!){
        updateAspiration(input: $input) {
          id
        }
      }`;

    let variables = {
      "input": {
        "id": aspiration.id
      }
    };
    if (aspiration.stateSync === 'U' || aspiration.stateSync === 'E') {
      variables = Object.assign(variables, {
        "input": {
          "id": aspiration.id,
          "arrived_temperature": aspiration.arrived_temperature,
          "aspirator": aspiration.aspirator,
          "comments": aspiration.comments,
          "date": aspiration.date || "",
          "identification_number": aspiration.identification_number,
          //"medium_lot_miv": aspiration.medium_lot_miv,
          "medium_lot_opu": aspiration.medium_lot_opu,
          "medium_opu": aspiration.medium_opu,
          "received_by": aspiration.received_by,
          //"receiver_name": aspiration.receiver_name,
          "searcher": aspiration.searcher,
          "state": aspiration.state,
          "transport_type": aspiration.transport_type,
          "user_id_updated": this.userService.getUserId()
        }
      });
    }
    const create = [];
    const update = [];
    aspiration.details.forEach(detail => {
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
          'gii': detail.gii,
          'giii': detail.giii,
          'others': detail.others,
          'user_id_updated': this.userService.getUserId()
        });
      }
      else if (detail.stateSync === 'C') {
        create.push({
          'local_id': detail.local_id,
          'donor': detail.donor,
          'donor_breed': detail.donor_breed,
          'arrived_time': detail.arrived_time,
          'bull': detail.bull,
          'bull_breed': detail.bull_breed,
          'type': detail.type,
          'gi': detail.gi,
          'gii': detail.gii,
          'giii': detail.giii,
          'others': detail.others,
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
        mutation: aspirationMutation,
        variables: Object.assign({ "input": {} }, variables)
      }).subscribe(({ data }) => {
        resolve({ status: 'success', data: data });
      }, (error) => {
        resolve({ status: 'error', error: error });
      });
    });

  }
}