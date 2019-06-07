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
          id,
          details {
            id,
            dx2
          }
        }
      }`;


    let variables = {
      "input": {
        "id": Number(delivery.id),
        "received_by": delivery.received_by,
        "comments": delivery.comments,
        "identification_number": delivery.identification_number,
        "state": delivery.state,
        'user_id_updated': this.userService.getUserId()
      }
    };
    const update = [];
    delivery.details.forEach(detail => {
      if (detail.stateSync === 'U' || detail.stateSync === 'C') {
        update.push({
          'id': detail.id,
          'transfer_detail_id': Number(detail.transfer_detail_id),
          'dx2': detail.dx2,
          'user_id_created': this.userService.getUserId(),
          'user_id_updated': this.userService.getUserId()
        });
      }
    });

    if (update.length > 0 || delivery.stateSync === 'U') {
      const details = {
        "details": { "update": update }
      };
      variables.input = Object.assign(variables.input, details);
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