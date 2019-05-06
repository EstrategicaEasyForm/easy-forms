import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Storage } from '@ionic/storage';

const OrdersQuery = gql`
query orders {
  orders {
    id
    client_id
    project
    observation
    date
    approved
    detailsApi {
      id
      local {
        id
        name
        city
        department
      }
      apply_evaluation
      invoiced
      invoiced_event
      evaluationApi {
        id
        comments
        state
        date
        received_by
        identification_number
        locals {
          id
          name
          city
          department
        }
        details {
          id
          animal_id
          chapeta
          diagnostic
          fit
          synchronized
          other_procedures
          comments
          attendant
          local {
            id
            name
            city
            department
          }
        }
        url_signing
      }
      aspirationApi {
        id
        order_detail_id
        synchronized_receivers
        medium_lot_miv
        medium_opu
        medium_lot_opu
        aspirator
        searcher
        arrived_temperature
        receiver_name
        transport_type
        state
        date
        received_by
        identification_number
        comments
        locals {
          id
          name
          city
          department
        }
        details {
          id
          local_id 
          donor
          donor_breed
          arrived_time
          bull
          bull_breed
          type
          gi
          gii
          giii
          others
          local {
            id
            name
            city
            department
          }
        }
      }
      transferApi {
        id
        order_detail_id
        received_by
        identification_number
        comments
        state
        date
        details {
          id
          transfer_id
          production_detail_id
          evaluation_detail_id
          receiver
          embryo
          embryo_class
          corpus_luteum
          transferor
          comments
          attendant
          local_id
          local {
            id
            name
            city
            department
          }
          discard
        }
      }
      diagnosticApi {
        id
        order_detail_id
        received_by
        identification_number
        comments
        state
        date
        details {
          id
          diagnostic_id
          transfer_detail_id
          dx1
        }
      }
      sexageApi {
        id
      }
      deliveryApi {
        id
      }
    }
    agenda {
      id
      order_id
      start_date
      end_date
      all_day
      name_client
      event {
        id
        name
      }
      employee_id
      user {
        id
        name
        email
        created_at
        updated_at
      }
      other_user {
        id
        name
      }
      department {
        id
        name
      }
      municipality {
        id
        name
      }
      address
      observation
      numAgenda
      name_local
    }
    client {
      id
      identification_type_id
      documentType {
        id
        name
      }
      bussiness_name
      address
      cellphone
      email
      contact
      position
      citiesOne {
        id
        name
      }
      departmentOne {
        id
        name
      }
      quota
      payment_deadline
      locals {
        id
        name
        city
        department
      }
    }
  }
}
`;


@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  constructor(private apollo: Apollo,
    private storage: Storage) { }

    updateAspiration(data : any) {
      const aspirationMutation = gql`
        mutation updateAspiration($input: UpdateAspirationInput!){
          updateAspiration(input: $input) {
            id
          }
        }`;

        return this.apollo.mutate({
          mutation : aspirationMutation,
          variables : {
            "input" : {
              "id" : data.id,
              "arrived_temperature" : data.arrived_temperature,
              "aspirator" : data.aspirator,
              "comments" : data.comments,
              "date" : data.date,
              "identification_number" : data.identification_number,
              "medium_lot_miv" : data.medium_lot_miv,
              "medium_lot_opu" : data.medium_lot_opu,
              "medium_opu" : data.medium_opu,
              "received_by" : data.received_by,
              "receiver_name" : data.receiver_name,
              "searcher" : data.searcher,
              "state" : data.state,
              "synchronized_receivers" : data.synchronized_receivers,
              "transport_type" : data.transport_type,
			  "user_id_updated" : data.user_id_updated			  
            }
          }
        });
    }

    updateAspirationDetails(aspiration : any, data : any) {
      const aspirationMutation = gql`
      mutation updateAspiration($input: UpdateAspirationInput!){
        updateAspiration(input: $input) {
          id
        }
      }`;
      return this.apollo.mutate({
        mutation : aspirationMutation,
        variables : {
          "input" : {
            "id" : aspiration.id,
            "arrived_temperature" : aspiration.arrived_temperature,
            "aspirator" : aspiration.aspirator,
            "comments" : aspiration.comments,
            "date" : aspiration.date,
            "identification_number" : aspiration.identification_number,
            "medium_lot_miv" : aspiration.medium_lot_miv,
            "medium_lot_opu" : aspiration.medium_lot_opu,
            "medium_opu" : aspiration.medium_opu,
            "received_by" : aspiration.received_by,
            "receiver_name" : aspiration.receiver_name,
            "searcher" : aspiration.searcher,
            "state" : aspiration.state,
            "synchronized_receivers" : aspiration.synchronized_receivers,
            "transport_type" : aspiration.transport_type,
			"user_id_updated" : aspiration.user_id_updated,
            "details" : {
              "create" : data.details.create,
              "update" : data.details.update
            }
          }
        }
      });
    }

  getDetailsApi(onSuccess, onError) {

    const _self = this;
    try {
      this.apollo
        .watchQuery({
          query: OrdersQuery,
          errorPolicy: 'all'
        })
        .valueChanges

        .subscribe(({ data }: any) => {
          if (data.orders) {
            const detailsApiList = [];
            let detailObj: any;

            for (let order of data.orders) {
              for (let detailsApi of order.detailsApi) {
                for (let agenda of order.agenda) {

                  if (detailsApi.local.name === agenda.name_local) {
                    detailObj = Object.assign({}, detailsApi);
                    detailObj.order = order;
                    detailObj.agendas = [agenda];
                    detailObj.event = agenda.event;
                    if (!_self.isDetailLoader(detailsApiList, detailObj)) {
                      detailsApiList.push(detailObj);
                    }
                  }
                }
              }
            }
            onSuccess(detailsApiList);
          }
          else {
            onError("Error consultando el servicio");
            onError(data.errors);
          }
        });
    } catch (e) {
      onError(e);
    }
  }

  isDetailLoader(detailsApiList, detailObj) {
    for (let detail of detailsApiList) {
      if (detail.id === detailObj.id) {
        for (let agenda of detail.agendas) {
          if (agenda.event.id === detailObj.agendas[0].event.id &&
            agenda.name_local === detailObj.agendas[0].name_local) {
            detail.agendas = detail.agendas.concat(detailObj.agendas);
            return true;
          }
        }
      }
    }
    return false;
  }

  /* Order Storage */

  detailApi: any;

  getDetailsApiStorage() {
    return this.storage.get('detailsApi');
  }

  setDetailsApiStorage(detailsApi) {
    return this.storage.set('detailsApi', detailsApi);
  }


  setDetailApiParam(detailApi) {
    this.detailApi = detailApi;
  }

  getDetailApiParam() {
    return this.detailApi;
  }

}
