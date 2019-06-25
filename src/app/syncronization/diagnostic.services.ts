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
          id,
          details {
            id,
            dx1
          }
        }
      }`;

    let variables = {
      "input": {
        "id": diagnostic.id
      }
    };
    if (diagnostic.stateSync === 'U' || diagnostic.stateSync === 'E') {
      variables = Object.assign(variables, {
        "input": {
          "id": diagnostic.id,
          "received_by": diagnostic.received_by,
          "technical": diagnostic.technical,
          "comments": diagnostic.comments,
          "identification_number": diagnostic.identification_number,
          "state": diagnostic.state,
          'user_id_updated': this.userService.getUserId()
        }
      });
    }
    const update = [];
    diagnostic.details.forEach(detail => {
      if (detail.stateSync === 'U' || detail.stateSync === 'C') {
        update.push({
          'id': detail.id,
          'diagnostic_id': Number(detail.diagnostic_id),
          'transfer_detail_id': Number(detail.transfer_detail_id),
          'dx1': detail.dx1,
          'user_id_updated': this.userService.getUserId()
        });
      }
    });

    const details = {
      "details": { "update": update }
    };
    variables.input = Object.assign(variables.input, details);

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