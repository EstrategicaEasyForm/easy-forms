import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class AspirationService {

  constructor(private apollo: Apollo) { }

  updateOnlyAspiration(data: any) {
    const aspirationMutation = gql`
      mutation updateAspiration($input: UpdateAspirationInput!){
        updateAspiration(input: $input) {
          id
        }
      }`;

    return this.apollo.mutate({
      mutation: aspirationMutation,
      variables: {
        "input": {
          "id": data.id,
          "arrived_temperature": data.arrived_temperature,
          "aspirator": data.aspirator,
          "comments": data.comments,
          "date": data.date,
          "identification_number": data.identification_number,
          "medium_lot_miv": data.medium_lot_miv,
          "medium_lot_opu": data.medium_lot_opu,
          "medium_opu": data.medium_opu,
          "received_by": data.received_by,
          "receiver_name": data.receiver_name,
          "searcher": data.searcher,
          "state": data.state,
          "synchronized_receivers": data.synchronized_receivers,
          "transport_type": data.transport_type,
          "user_id_updated": data.user_id_updated
        }
      }
    });
  }

  updateAllAspiration(aspiration: any, data: any) {
    const aspirationMutation = gql`
    mutation updateAspiration($input: UpdateAspirationInput!){
      updateAspiration(input: $input) {
        id
      }
    }`;
    return this.apollo.mutate({
      mutation: aspirationMutation,
      variables: {
        "input": {
          "id": aspiration.id,
          "arrived_temperature": aspiration.arrived_temperature,
          "aspirator": aspiration.aspirator,
          "comments": aspiration.comments,
          "date": aspiration.date,
          "identification_number": aspiration.identification_number,
          "medium_lot_miv": aspiration.medium_lot_miv,
          "medium_lot_opu": aspiration.medium_lot_opu,
          "medium_opu": aspiration.medium_opu,
          "received_by": aspiration.received_by,
          "receiver_name": aspiration.receiver_name,
          "searcher": aspiration.searcher,
          "state": aspiration.state,
          "synchronized_receivers": aspiration.synchronized_receivers,
          "transport_type": aspiration.transport_type,
          "user_id_updated": aspiration.user_id_updated,
          "details": {
            "create": data.details.create,
            "update": data.details.update
          }
        }
      }
    });
  }

  updateAspirationDetails(aspiration: any, data: any) {
    const aspirationMutation = gql`
    mutation updateAspiration($input: UpdateAspirationInput!){
      updateAspiration(input: $input) {
        id
      }
    }`;
    return this.apollo.mutate({
      mutation: aspirationMutation,
      variables: {
        "input": {
          "id": aspiration.id,
          "user_id_updated": aspiration.user_id_updated,
          "details": {
            "create": data.details.create,
            "update": data.details.update
          }
        }
      }
    });
  }
}