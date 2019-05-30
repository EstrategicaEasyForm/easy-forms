import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { UsersService } from '../users.service';
import * as moment from 'moment-timezone';
import { Events, Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class TransferService {

  generatePDFs: any = [];

  constructor(private apollo: Apollo,
    public userService: UsersService,
    public event: Events,
    private platform: Platform) { }

    updateTransfer(transfer: any) {
    const transferMutation = gql`
      mutation updateTransfer($input: UpdateTransferInput!){
        updateTransfer(input: $input) {
          id
        }
      }`;

    let variables = {
      "input": {
        "id": transfer.id
      }
    };
    if (transfer.stateSync === 'U') {
      variables = Object.assign(variables, {
        "input": {
          "id": transfer.id,
          "arrived_temperature": transfer.arrived_temperature,
          "aspirator": transfer.aspirator,
          "comments": transfer.comments,
          //"date": transfer.date,
          "identification_number": transfer.identification_number,
          "medium_lot_miv": transfer.medium_lot_miv,
          "medium_lot_opu": transfer.medium_lot_opu,
          "medium_opu": transfer.medium_opu,
          "received_by": transfer.received_by,
          "receiver_name": transfer.receiver_name,
          "searcher": transfer.searcher,
          "state": transfer.state,
          "synchronized_receivers": transfer.synchronized_receivers,
          "transport_type": transfer.transport_type,
          "user_id_updated": this.userService.getUserId()
        }
      });
    }
    const create = [];
    const update = [];
	if(transfer.details)
    transfer.details.forEach(detail => {
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
        update.push({
          'local_id': transfer.local_id,
          'donor': transfer.donor,
          'donor_breed': transfer.donor_breed,
          'arrived_time': transfer.arrived_time,
          'bull': transfer.bull,
          'bull_breed': transfer.bull_breed,
          'type': transfer.type,
          'gi': transfer.gi,
          'gss': transfer.gss,
          'gssi': transfer.gssi,
          'others': transfer.others,
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
    else if (transfer.stateSync !== 'U') {
      //Si no se reflejan cambios en el elemento o sus detalles, se resuelve la promesa
      return new Promise(resolve => {
        resolve({ status: 'no_change' });
      });
    }

    //se resuelve la promesa despues de obtener respuesta de la mutacion
    return new Promise(resolve => {
      this.apollo.mutate({
        mutation: transferMutation,
        variables: Object.assign({ "input": {} }, variables)
      }).subscribe(({ data }) => {
        resolve({ status: 'success', data: data });
      }, (error) => {
        resolve({ status: 'error', error: error });
      });
    });
  }
}