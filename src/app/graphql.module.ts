import { NgModule } from '@angular/core';
import { ApolloModule, Apollo, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { setContext } from 'apollo-link-context';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { onError } from 'apollo-link-error';
import { HttpHeaders } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import { UsersService } from './users.service';

const uri = 'http://tester.estrategicacomunicaciones.com/graphql'; // <-- add the URL of the GraphQL server here

@NgModule({
  exports: [ApolloModule, HttpLinkModule],

})
export class GraphQLModule {

  constructor(
    public apollo: Apollo,
    public httpLink: HttpLink,
    public toastCtrl: ToastController,
    public usersService: UsersService) {

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
      let toast = this.toastCtrl.create({
        message: 'No se puede consultar el servicio',
        duration: 2000
      });
    });

    apollo.create({
      link: linkError.concat(authToken).concat(http),
      // other options like cache
      cache: new InMemoryCache(),
    });
  }
}