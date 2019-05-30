import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { UsersService } from '../users.service';
import * as moment from 'moment-timezone';
import { Events, Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {

  generatePDFs: any = [];

  constructor(private apollo: Apollo,
    public userService: UsersService,
    public event: Events,
    private platform: Platform) { }

  updateDelivery(delivery: any) {
    const deliveryMutation = gql`
      mutation updateDelivery($input: UpdateDeliveryInput!){
        updateDelivery(input: $input) {
          id
        }
      }`;

    let variables = {
      "input": {
        "id": delivery.id
      }
    };
    if (delivery.stateSync === 'U') {
      variables = Object.assign(variables, {
        "input": {
          "id": delivery.id,
          "arrived_temperature": delivery.arrived_temperature,
          "aspirator": delivery.aspirator,
          "comments": delivery.comments,
          //"date": delivery.date,
          "identification_number": delivery.identification_number,
          "medium_lot_miv": delivery.medium_lot_miv,
          "medium_lot_opu": delivery.medium_lot_opu,
          "medium_opu": delivery.medium_opu,
          "received_by": delivery.received_by,
          "receiver_name": delivery.receiver_name,
          "searcher": delivery.searcher,
          "state": delivery.state,
          "synchronized_receivers": delivery.synchronized_receivers,
          "transport_type": delivery.transport_type,
          "user_id_updated": this.userService.getUserId()
        }
      });
    }
    const create = [];
    const update = [];
    delivery.details.forEach(detail => {
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
          'local_id': delivery.local_id,
          'donor': delivery.donor,
          'donor_breed': delivery.donor_breed,
          'arrived_time': delivery.arrived_time,
          'bull': delivery.bull,
          'bull_breed': delivery.bull_breed,
          'type': delivery.type,
          'gi': delivery.gi,
          'gss': delivery.gss,
          'gssi': delivery.gssi,
          'others': delivery.others,
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
    else if (delivery.stateSync !== 'U') {
      //Si no se reflejan cambios en el elemento o sus detalles, se resuelve la promesa
      return new Promise(resolve => {
        resolve({ status: 'no_change' });
      });
    }

    //se resuelve la promesa despues de obtener respuesta de la mutacion
    return new Promise(resolve => {
      this.apollo.mutate({
        mutation: deliveryMutation,
        variables: Object.assign({ "input": {} }, variables)
      }).subscribe(({ data }) => {
        resolve({ status: 'success', data: data });
      }, (error) => {
        resolve({ status: 'error', error: error });
      });
    });
  }
}