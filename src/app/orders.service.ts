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
        order_detail_id
        received_by
        identification_number
        comments
        details {
          id
          sexage_id
          diagnostic_detail_id
          sex
        }
      }
      deliveryApi {
        id
        order_detail_id
        received_by
        identification_number
        comments
        state
        date
        details {
          id
          delivery_id
          sexage_detail_id
          dx2
        }
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
}`;

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  constructor(
    private apollo: Apollo,
    private storage: Storage) { }

  getDetailsApiQuery() {
    return new Promise((resolve, reject) => {
      try {
        this.apollo
          .watchQuery({
            query: OrdersQuery,
            errorPolicy: 'all'
          })
          .valueChanges
          .subscribe(({ data }: any) => {
            if (data.orders) {
              resolve(data.orders);
            }
            else {
              reject(data.errors || "Error consultando el servicio");
            }
          });
      } catch (e) {
        reject(e);
      }
    });
  }

  /* Order Storage */
  getDetailsApiStorage() {
    return this.storage.get('detailsApi');
  }

  setDetailsApiStorage(detailsApi) {
    return this.storage.set('detailsApi', detailsApi);
  }

  /* Detail Api Param */

  dataParam: any;

  setDetailApiParam(dataParam) {
    this.dataParam = dataParam;
  }

  getDetailApiParam() {
    return this.dataParam;
  }

}
