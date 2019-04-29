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

  userAuthToken: any;

  constructor(private apollo: Apollo,
    private storage: Storage) { }

  /* Login function for graphql service */

  login(userAuth: any) {
    const loginMutation = gql`
      mutation login($data: LoginInput!){
        login(data:$data){
          access_token
          expires_in
          token_type
          id_user
          name_user
          email_user
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

  setUserAuthToken(userAuth: any) {
    this.userAuthToken = userAuth;
    this.storage.set('userAuthToken', userAuth);
  }
  
  getUserAuthToken() {
    return this.storage.get('userAuthToken');
  }

  getAccessToken() {
    return this.userAuthToken ? this.userAuthToken.access_token : '';
  }

  getUserId() {
    return this.userAuthToken ? this.userAuthToken.id_user : '';
  }

  deleteUserAuthToken() {
    this.storage.remove('userAuthToken');
  }

  /* Users list authentication Storage */

  addUserAuthStorage(userAuth) {

    //retrive users authentication list and replace current user if exists
    this.storage.get('users-auth-list').then((usersAuthList) => {
      usersAuthList = usersAuthList ? usersAuthList.filter((dataAuth) => {
        return userAuth.email !== dataAuth.email;
      }) : [];

      //save user authentication list
      usersAuthList.push(userAuth);
      this.storage.set('users-auth-list', usersAuthList);
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
        resolve(usersAuthList[0] ? true : false);
      });
    });
  }
}
