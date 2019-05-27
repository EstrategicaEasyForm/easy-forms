import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { UsersService } from '../users.service';
import * as moment from 'moment-timezone';
import { Events, Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class SexageService {

  generatePDFs: any = [];

  constructor(private apollo: Apollo,
    public userService: UsersService,
    public event: Events,
    private platform: Platform) { }

  updateSexage(sexage: any) {
    const sexageMutation = gql`
      mutation updateSexage($input: UpdateSexageInput!){
        updateSexage(input: $input) {
          id
        }
      }`;

    let variables = {
      "input": {
        "id": sexage.id
      }
    };
    if (sexage.stateSync === 'U') {
      variables = Object.assign(variables, {
        "input": {
          "id": sexage.id,
          "arrived_temperature": sexage.arrived_temperature,
          "aspirator": sexage.aspirator,
          "comments": sexage.comments,
          //"date": sexage.date,
          "identification_number": sexage.identification_number,
          "medium_lot_miv": sexage.medium_lot_miv,
          "medium_lot_opu": sexage.medium_lot_opu,
          "medium_opu": sexage.medium_opu,
          "received_by": sexage.received_by,
          "receiver_name": sexage.receiver_name,
          "searcher": sexage.searcher,
          "state": sexage.state,
          "synchronized_receivers": sexage.synchronized_receivers,
          "transport_type": sexage.transport_type,
          "user_id_updated": this.userService.getUserId()
        }
      });
    }
    const create = [];
    const update = [];
    sexage.details.forEach(detail => {
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
          'local_id': sexage.local_id,
          'donor': sexage.donor,
          'donor_breed': sexage.donor_breed,
          'arrived_time': sexage.arrived_time,
          'bull': sexage.bull,
          'bull_breed': sexage.bull_breed,
          'type': sexage.type,
          'gi': sexage.gi,
          'gss': sexage.gss,
          'gssi': sexage.gssi,
          'others': sexage.others,
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
    else if (sexage.stateSync !== 'U') {
      //Si no se reflejan cambios en el elemento o sus detalles, se resuelve la promesa
      return new Promise(resolve => {
        resolve({ status: 'no_change' });
      });
    }

    //se resuelve la promesa despues de obtener respuesta de la mutacion
    return new Promise(resolve => {
      this.apollo.mutate({
        mutation: sexageMutation,
        variables: Object.assign({ "input": {} }, variables)
      }).subscribe(({ data }) => {
        resolve({ status: 'success', data: data });
      }, (error) => {
        resolve({ status: 'error', error: error });
      });
    });
  }
}