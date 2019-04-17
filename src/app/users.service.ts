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

  /* Login function for graphql service */

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

  /* Token Authentication Storage */

  setToken(userAuth: any) {
    this.storage.set('userAuthToken', userAuth.token);
  }

  deleteToken(userAuth: any) {
    this.storage.remove('userAuthToken');
  }

  getToken() {
    return this.storage.get('userAuthToken');
  }

  /* Users list authentication Storage */

  addUserAuthStorage(userAuth) {

    //retrive users authentication list and replace current user if exists
    this.storage.get('users-auth-list').then((usersAuth) => {
      usersAuth = usersAuth ? usersAuth.filter((dataAuth) => {
        return userAuth.email !== dataAuth.email;
      }) : [];

      //save user authentication list
      usersAuth.push(userAuth);
      this.storage.set('users-auth-list', usersAuth);
    });
  }

  //return true if user auth data match in the user auth list
  isUserAuthStorage(userAuth) {
    return new Promise(resolve => {
      this.storage.get('users-auth-list').then((usersAuthList) => {
        usersAuthList = usersAuthList ? usersAuthList.filter((dataAuth) => {
          return userAuth.email === dataAuth.email && userAuth.password === dataAuth.password;
        }) : [];

        //Return user authentication data if exists
        resolve(usersAuthList[0] ? usersAuthList[0] : false);
      });
    });
  }
}
