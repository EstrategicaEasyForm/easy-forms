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
      mutation transferUpdate($input: UpdateTransferInput!){
        updateTransfer(input: $input) {
          id
        }
      }`;

    let variables = {
      "input": {
        "id": transfer.id
      }
    };
    if (transfer.stateSync === 'U' || transfer.stateSync === 'E') {
      variables = Object.assign(variables, {
        "input": {
          "id": transfer.id,
          "comments": transfer.comments,
          "identification_number": transfer.identification_number,
          "received_by": transfer.received_by,
          'user_id_updated': this.userService.getUserId(),
          "state": transfer.state
        }
      });
    }
    const create = [];
    const update = [];
    if (transfer.details_view)
      transfer.details_view.forEach(detail => {
        if (detail.stateSync === 'U') {
          update.push({
            'id': detail.id,
            'comments': detail.comments,
            'corpus_luteum': detail.corpus_luteum,
            'discard': detail.discard == "1",
			'local_id': detail.local_id,
            'evaluation_detail_id': detail.evaluation_detail_id,
            'receiver': detail.evaluation_detail_id ? null : detail.receiver,
            'transferor': detail.transferor,
            'user_id_updated': this.userService.getUserId()
          });
        }
        else if (detail.stateSync === 'C') {
          create.push({
            'id': detail.id,
            'comments': detail.comments,
            'corpus_luteum': detail.corpus_luteum,
            'discard': detail.discard == "1",
			'local_id': detail.local_id,
            'evaluation_detail_id': detail.evaluation_detail_id,
            'receiver': detail.evaluation_detail_id ? null : detail.receiver,
            'transferor': detail.transferor,
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