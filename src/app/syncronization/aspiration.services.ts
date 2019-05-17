import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { UsersService } from '../users.service';
import * as moment from 'moment-timezone';
import { Events } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AspirationService {

  generatePDFs: any = [];

  constructor(private apollo: Apollo,
    public userService : UsersService,
    public event : Events) { }

  processAspiration(orders) {
    var countAspirations: number = 0;
    var totalAspirations: number = 0;
    var boolAspiration: boolean = false;
    var boolDetails: boolean = false;
    if (orders) {
      console.log(orders);
      orders.forEach(order => {
        order.detailsApi.forEach(element => {
          if (element.aspirationApi) {
            if (element.aspirationApi.id == '31') {
              element.aspirationApi.stateSync = 'U';
              element.aspirationApi.comments = "Sin comentarios";
            }
            if (element.aspirationApi.stateSync && element.aspirationApi.stateSync == 'U') {
              boolAspiration = true;
            }
            element.aspirationApi.details.forEach(detail => {
              //if (detail.id == '495') {
              //  detail.stateSync = 'U';
              //  detail.donor = "NN";
              //}
              if (detail.stateSync && (detail.stateSync == 'C' || detail.stateSync == 'U')) {
                boolDetails = true;
              }
            });
            if (boolAspiration == true || boolDetails == true) {
              totalAspirations = totalAspirations + 1;
              this.generatePDFs.push(element.aspirationApi);
            }
            boolAspiration = false;
            boolDetails = false;
          }
        });
      });
      orders.forEach(order => {
        order.detailsApi.forEach(element => {
          if (element.aspirationApi) {
            //Update aspiration
            if (element.aspirationApi.stateSync && element.aspirationApi.stateSync == 'U') {
              element.aspirationApi.user_id_updated = this.userService.getUserId();
              boolAspiration = true;
            }
            //Update details from aspiration
            var details: any = {};
            var creates: any = [];
            var updates: any = [];
            element.aspirationApi.details.forEach(elementDetail => {
              if (elementDetail.stateSync && elementDetail.stateSync == 'U') {
                boolDetails = true;
                var elementUpdate: any = {};
                elementUpdate['id'] = elementDetail.id;
                elementUpdate['local_id'] = elementDetail.local_id;
                elementUpdate['donor'] = elementDetail.donor;
                elementUpdate['donor_breed'] = elementDetail.donor_breed;
                elementUpdate['arrived_time'] = elementDetail.arrived_time;
                elementUpdate['bull'] = elementDetail.bull;
                elementUpdate['bull_breed'] = elementDetail.bull_breed;
                elementUpdate['type'] = elementDetail.type;
                elementUpdate['gi'] = elementDetail.gi;
                elementUpdate['gss'] = elementDetail.gss;
                elementUpdate['gssi'] = elementDetail.gssi;
                elementUpdate['others'] = elementDetail.others;
                elementUpdate['user_id_updated'] = this.userService.getUserId();
                updates.push(elementUpdate);
              }
              if (elementDetail.stateSync && elementDetail.stateSync == 'C') {
                boolDetails = true;
                var elementCreate: any = {};
                elementCreate['local_id'] = elementDetail.local_id;
                elementCreate['donor'] = elementDetail.donor;
                elementCreate['donor_breed'] = elementDetail.donor_breed;
                elementCreate['arrived_time'] = elementDetail.arrived_time;
                elementCreate['bull'] = elementDetail.bull;
                elementCreate['bull_breed'] = elementDetail.bull_breed;
                elementCreate['type'] = elementDetail.type;
                elementCreate['gi'] = elementDetail.gi;
                elementCreate['gss'] = elementDetail.gss;
                elementCreate['gssi'] = elementDetail.gssi;
                elementCreate['others'] = elementDetail.others;
                elementCreate['user_id_updated'] = this.userService.getUserId();
                elementCreate['user_id_created'] = this.userService.getUserId();
                creates.push(elementCreate);
              }
            });
            if (creates.length > 0) {
              details['create'] = creates;
            }
            if (updates.length > 0) {
              details['update'] = updates;
            }
            if (boolAspiration == true && boolDetails == false) {
              element.aspirationApi.user_id_updated = this.userService.getUserId();
                this.event.publish('publish.aspiration.log', {
                  type:'info',
                  message:"Inicia actualización de la aspiración con orden " + order.id,
                  time:moment().format('HH:mm:ss')
                });

                this.updateOnlyAspiration(element.aspirationApi)
                .subscribe(({ data }) => {
                  countAspirations = countAspirations + 1;
                  if (data.updateAspiration) {
                    this.event.publish('publish.aspiration.log', {
                      type:'info',
                      message:"Se actualizó correctamente la aspiración con orden " + order.id,
                      time:moment().format('HH:mm:ss')
                    });
                  } else {
                    this.event.publish('publish.aspiration.log', {
                      type:'error',
                      message:"Ocurrió un error actualizando la aspiración con orden " + order.id,
                      time:moment().format('HH:mm:ss')
                    });
                  }
                  if (totalAspirations == countAspirations) {
                    return true;
                  }
                });
            } else if (boolAspiration == false && boolDetails == true) {
              element.aspirationApi.user_id_updated = this.userService.getUserId();
              var dataDetails: any = {};
              dataDetails['details'] = details;
              this.event.publish('publish.aspiration.log', {
                type:'info',
                message:"Inicia actualización de los detalles de la aspiración con orden " + order.id,
                time:moment().format('HH:mm:ss')
              });

              this.updateAspirationDetails(element.aspirationApi, dataDetails)
                .subscribe(({ data }) => {
                  countAspirations = countAspirations + 1;
                  if (data.updateAspiration) {
                    this.event.publish('publish.aspiration.log', {
                      type:'info',
                      message:"Se actualizó correctamente los detalles de la aspiración con orden " + order.id,
                      time:moment().format('HH:mm:ss')
                    });
                  } else {
                    this.event.publish('publish.aspiration.log', {
                      type:'error',
                      message:"Ocurrio un error actualizando los detalles de la aspiración con orden " + order.id,
                      time:moment().format('HH:mm:ss')
                    });
                  }
                  if (totalAspirations == countAspirations) {
                    return true;
                  }
                });
            } else if (boolAspiration == true && boolDetails == true) {
              element.aspirationApi.user_id_updated = this.userService.getUserId();
              var dataDetails: any = {};
              dataDetails['details'] = details;
              this.event.publish('publish.aspiration.log', {
                type:'info',
                message:"Inicia actualización de toda la aspiración con orden " + order.id,
                time:moment().format('HH:mm:ss')
              });

              this.updateAllAspiration(element.aspirationApi, dataDetails)
                .subscribe(({ data }) => {
                  countAspirations = countAspirations + 1;
                  if (data.updateAspiration) {
                    this.event.publish('publish.aspiration.log', {
                      type:'info',
                      message:"Se actualizó correctamente toda la aspiración con orden " + order.id,
                      time:moment().format('HH:mm:ss')
                    });
                  } else {
                    this.event.publish('publish.aspiration.log', {
                      type:'error',
                      message:"Ocurrio un error actualizando toda la aspiración con orden " + order.id,
                      time:moment().format('HH:mm:ss')
                    });
                  }
                  if (totalAspirations == countAspirations) {
                    return true;
                  }
                });
            }
            boolAspiration = false;
            boolDetails = false;
          }
        });
      });
    }
    if (totalAspirations == 0) {
      return true;
    }
  }

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