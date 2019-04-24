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

export function createApollo(httpLink: HttpLink,
  toastCtrl: ToastController,
  usersService: UsersService) {

  const http = httpLink.create({ uri });

  const auth = setContext(async (_, { headers }) => {
    headers = headers || new HttpHeaders();

    const token = usersService.getToken();
    if (!token) {
      return {};
    } else {
      return {
        headers: headers.append('Authorization', 'Bearer ' + token)
      };
    }
  });
  const linkError = onError(({ graphQLErrors, networkError }) => {
    let toast = this.toastCtrl.create({
      message: 'No se puede consultar la lista de agendas',
      duration: 2000
    });
    toast.present();
    toast = this.toastCtrl.create({
      message: networkError || graphQLErrors || '',
      duration: 2000
    });
    toast.present();
  });
  return {
    link: linkError.concat(auth).concat(http),
    cache: new InMemoryCache(),
  };
}

@NgModule({
  exports: [ApolloModule, HttpLinkModule],

})
export class GraphQLModule {

  authUser: any;

  constructor(
    public apollo: Apollo,
    public httpLink: HttpLink,
    public toastCtrl: ToastController,
    public usersService: UsersService) {

    const http = httpLink.create({ uri });

    const authToken = setContext(async (_, { headers }) => {
      headers = headers || new HttpHeaders();
      if (this.authUser) {
        return {
          headers: headers.append('Authorization', 'Bearer ' + this.authUser.access_token)
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
    const _self = this;
    usersService.getToken().then((authUser) => {
      _self.authUser = authUser;
      apollo.create({
        link: linkError.concat(authToken).concat(http),
        // other options like cache
        cache: new InMemoryCache(),
      });
    });
  }
}