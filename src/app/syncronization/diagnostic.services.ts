import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { UsersService } from '../users.service';
import * as moment from 'moment-timezone';
import { Events, Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class DiagnosticService {

  generatePDFs: any = [];

  constructor(private apollo: Apollo,
    public userService: UsersService,
    public event: Events,
    private platform: Platform) { }

  updateDiagnostic(diagnostic: any) {
    const diagnosticMutation = gql`
      mutation updateDiagnostic($input: UpdateDiagnosticInput!){
        updateDiagnostic(input: $input) {
          id
        }
      }`;

    let variables = {
      "input": {
        "id": diagnostic.id
      }
    };
    if (diagnostic.stateSync === 'U') {
      variables = Object.assign(variables, {
        "input": {
          "id": diagnostic.id,
          "received_by": diagnostic.received_by,
          "comments": diagnostic.comments,
          "identification_number": diagnostic.identification_number,
          "state": diagnostic.state
        }
      });
    }
    const create = [];
    const update = [];
    diagnostic.details.forEach(detail => {
      if (detail.stateSync === 'U') {
        update.push({
          'id': detail.id,
          'dx1': detail.dx1,
          //'user_id_updated': this.userService.getUserId()
        });
      }
      else if (detail.stateSync === 'C') {
        update.push({
          'dx1': diagnostic.dx1,
          'diagnostic_id': diagnostic.diagnostic_id,
          'transfer_detail_id': diagnostic.transfer_detail_id,
          //'user_id_updated': this.userService.getUserId(),
          //'user_id_created': this.userService.getUserId(),
        });
      }
    });

    if (create.length > 0 || update.length > 0) {
      let details = { "details": {} };
      if (create.length > 0) details = Object.assign(details, { "create": create });
      if (update.length > 0) details = Object.assign(details, { "update": update });
      variables = Object.assign(variables, details);
    }
    else if (diagnostic.stateSync !== 'U') {
      //Si no se reflejan cambios en el elemento o sus detalles, se resuelve la promesa
      return new Promise(resolve => {
        resolve({ status: 'no_change' });
      });
    }

    //se resuelve la promesa despues de obtener respuesta de la mutacion
    return new Promise(resolve => {
      this.apollo.mutate({
        mutation: diagnosticMutation,
        variables: Object.assign({ "input": {} }, variables)
      }).subscribe(({ data }) => {
        resolve({ status: 'success', data: data });
      }, (error) => {
        resolve({ status: 'error', error: error });
      });
    });
  }
}