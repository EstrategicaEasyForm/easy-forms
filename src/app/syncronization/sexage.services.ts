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
          id,
          details {
            id,
			sex
          }
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
          "received_by": sexage.received_by,
          "comments": sexage.comments,
          "identification_number": sexage.identification_number,
          "state": sexage.state,
          'user_id_updated': this.userService.getUserId()
        }
      }); 
    }
    const update = [];
    sexage.details.forEach(detail => {
      if (detail.stateSync === 'U' || detail.stateSync === 'C') {
        update.push({
          'id': detail.id,
		  'sexage_id': Number(detail.sexage_id),
          'transfer_detail_id': Number(detail.transfer_detail_id),
		  'sex': detail.sex,
          'user_id_updated': this.userService.getUserId()
        });
      }
    });

    if (update.length > 0 || sexage.stateSync === 'U') {
      const details = {
         "details" : { "update": update } 
      };
      variables.input = Object.assign(variables.input, details);
    }
    else {
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