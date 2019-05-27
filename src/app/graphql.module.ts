import { NgModule } from '@angular/core';
import { ApolloModule, Apollo, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { setContext } from 'apollo-link-context';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { onError } from 'apollo-link-error';
import { HttpHeaders } from '@angular/common/http';
import { ToastController, Events } from '@ionic/angular';
import { UsersService } from './users.service';
import * as moment from 'moment-timezone';
import ApolloLinkTimeout from 'apollo-link-timeout';

// <-- The URL of the GraphQL server 
const uri = 'http://tester.estrategicacomunicaciones.com/graphql';

@NgModule({
  exports: [ApolloModule, HttpLinkModule],

})
export class GraphQLModule {

  constructor(
    public apollo: Apollo,
    public httpLink: HttpLink,
    public toastCtrl: ToastController,
    public usersService: UsersService,
    public events: Events) {

    const http = httpLink.create({ uri });

    const authToken = setContext(async (_, { headers }) => {
      headers = headers || new HttpHeaders();
      const access_token: string = this.usersService.getAccessToken();
      if (access_token.length > 0) {
        return {
          headers: headers.append('Authorization', 'Bearer ' + access_token)
        };
      }
      return {};
    });
    const linkError = onError(({ graphQLErrors, networkError }) => {
      let message = '';

      if (networkError) {
        message = networkError.message;
        // GraphQl error event	     
        this.events.publish('graphql:error', {
          type: 'error',
          message: message,
          time: moment().format('HH:mm:ss')
        });
      }
      else if (graphQLErrors) {
        graphQLErrors.forEach(err => {
          if (err.extensions.category === 'authentication') {
            message = 'Usuario o clave incorrectos';
          }
          else message = err.message || err.extensions.category;

          // GraphQl error event	     
          this.events.publish('graphql:error', {
            type: 'error',
            message: message,
            time: moment().format('HH:mm:ss')
          });
        });
      }


    });
    const timeoutLink = new ApolloLinkTimeout(10000); // 10 second timeout

    apollo.create({
      link: linkError.concat(timeoutLink).concat(authToken).concat(http),
      // other options like cache
      cache: new InMemoryCache(),
      defaultOptions: {
        watchQuery: {
          fetchPolicy: 'no-cache'
        },
        query: {
          fetchPolicy: 'no-cache'
        }
      }
    });
  }
}