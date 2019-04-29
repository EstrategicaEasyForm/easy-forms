import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';
import { Storage } from '@ionic/storage';

const templates = [
  {
    "id": "1",
    "name": "Evaluación Receptoras",
    "icon": "['fas', 'search']"
  },
  {
    "id": "2",
    "name": "Aspiración Folicular",
    "icon": "['fas', 'eye-dropper']"
  },
  {
    "id": "3",
    "name": "Orden de Producción",
    "icon": "['fas', 'arrow']"
  },
  {
    "id": "4",
    "name": "Transferencia Embrión",
    "icon": "['fas', 'magic']"
  },
  {
    "id": "5",
    "name": "Producción Embrión",
    "icon": "['fas', 'flask']"
  },
  {
    "id": "6",
    "name": "Diagnóstico",
    "icon": "['fas', 'stethoscope']"
  },
  {
    "id": "7",
    "name": "Sexaje",
    "icon": "['fas', 'random']"
  },
  {
    "id": "8",
    "name": "Entrega",
    "icon": "['fas', 'truck']"
  }
];

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
      aspiration {
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
          aspiration_id
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
      production {
        id
        order_detail_id
        pipes
        lot_oil
        opu_date
        civ_date
        civ_lot
        civ_responsible
        medium_sof_o_c4
        f1_o_c4_date
        f1_o_c4_lot
        f1_o_c4_responsible
        f2_o_c5_date
        f2_o_c5_lot
        f2_o_c5_responsible
        te_date
        te_lot
        te_responsible
        vit_o_froz_date
        vit_o_froz_lot
        vit_o_froz_responsible
        fiv_date
        fiv_lot
        fiv_responsible
        percoll_date
        percoll_lot
        percoll_responsible
        heparina_date
        heparina_lot
        heparina_responsible
        comments
        state
        date
        arrived_time
        arrived_temperature
        details {
          id
          production_id
          aspiration_detail_id
          production_summary_id
          civ
          cleavage
          prevision
          bi
          bl
          bx
          bn
          be
          vitrified
          frozen
          lost
        }
      }
      transfer {
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
      diagnostic {
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
      sexage {
        id
      }
      delivery {
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
              //"order_detail_id" : data.order_detail_id + "",
              "arrived_temperature" : data.arrived_temperature,
              "aspirator" : data.aspirator,
              "comments" : data.comments,
              "date" : data.date,
              "identification_number" : data.identification_number,
              //"locals" : data.locals,
              "medium_lot_miv" : data.medium_lot_miv,
              "medium_lot_opu" : data.medium_lot_opu,
              "medium_opu" : data.medium_opu,
              "received_by" : data.received_by,
              "received_name" : data.received_name,
              "searcher" : data.searcher,
              "state" : data.state,
              "synchronized_receivers" : data.synchronized_receivers,
              "transport_type" : data.transport_type
            }
          }
        });
    }

    updateAspirationDetails(data : any) {
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
            "details" : {
              //"create" : [data.details.create]
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
        .subscribe((data:any) => {
          if(data.data.orders) {
            const detailsApiList = [];
            for (let order of data.data.orders) {
              for (let agenda of order.agenda) {
                for(let detailsApi of order.detailsApi) {
                  //console.log(detailsApi);
                  if(detailsApi.local.name === agenda.name_local ) {
                    detailsApi.order = order;
                    detailsApi.agenda = agenda;
                    detailsApiList.push(detailsApi);
                  }
                }
              }
            }
            onSuccess(detailsApiList);
          }
          else {
            onError("Error consultando el servicio");
          }
        });
    } catch (e) {
      onError(e);
    }
  }

  /* Order Storage */

  getDetailsApiStorage() {
    return this.storage.get('detailsApi');
  }

  setDetailsApiStorage(detailsApi) {
    return this.storage.set('detailsApi',detailsApi);
  }

  detailApi: any;
  
  setDetailApiParam(detailApi) {
   this.detailApi = detailApi;
  }

  getDetailApiParam() {
    return this.detailApi;
  }

}
