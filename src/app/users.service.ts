import { Injectable } from '@angular/core';

import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';
import { Storage } from '@ionic/storage';


@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private apollo: Apollo,
    private storage: Storage) { }

  // Login function for graphql service
  login(userAuth: any) {
    const loginMutation = gql`
      mutation login($data: LoginInput!){
        login(data:$data){
          access_token
        }
      }
      `;
    return this.apollo.mutate({
      mutation: loginMutation,
      variables: {
        "data": {
          "username": userAuth.email,
          "password": userAuth.password
        }
      }
    });
  }

  // function for local storage userAuthToken
  setToken(userAuth: any) {
    this.storage.set('userAuthToken', userAuth.token);
  }

  deleteToken(userAuth: any) {
    this.storage.remove('userAuthToken');
  }

  getToken() {
    return this.storage.get('userAuthToken');
  }
}
