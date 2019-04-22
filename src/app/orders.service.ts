import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';
import { Storage } from '@ionic/storage';

const OrdersQuery = gql`
query orders{
  orders {
    id
    agenda {
      id
      start_date
      end_date
      all_day
      name_client
      event_id
      event {
        id
        name
      }
      employee_id
      order_id
      address
      observation
      numAgenda
    }
    client_id
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
      citiesOne{
        id
        name
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

  getOrdersList(onSuccess, onError) {

    let orders: Observable<any>;

    try {
      orders = this.apollo
        .watchQuery({
          query: OrdersQuery,
          errorPolicy: 'all'
        })
        .valueChanges.pipe(map((response: any) => {
          if (response.errors) {
            onError(response.errors[0].message);
          } else {
            onSuccess(response.data.orders);
          }
        }
        ));
      orders.subscribe(data => {
        // Handle the data from the API
        onSuccess(data);
      });
    } catch (e) {
      console.log(e);
      onError(e);
    }

  }

  

  /* Order Storage */
 
  getOrdersListStorage() {
    return this.storage.get('ordersList');
  }
}
