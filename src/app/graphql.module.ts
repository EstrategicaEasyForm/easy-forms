import { NgModule } from '@angular/core';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { setContext } from 'apollo-link-context';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { onError } from 'apollo-link-error';
import { HttpHeaders } from '@angular/common/http';
import { ToastController } from '@ionic/angular';

const uri = 'http://tester.estrategicacomunicaciones.com/graphql'; // <-- add the URL of the GraphQL server here

export function createApollo(httpLink: HttpLink,
  toastCtrl: ToastController) {

  const http = httpLink.create({ uri });

  const auth = setContext(async (_, { headers }) => {
    headers = headers || new HttpHeaders();
    const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImZjNDYyZTE2M2ZhZDY5ODU1NGQ3ZWJiN2E5NGQ2MjM4NTRhN2FmZGFjOGZkZDAxNjk4NTc0MGI3ZDY4ZjRkZDU4OTRjM2YyODJkM2RmMmNmIn0.eyJhdWQiOiIzIiwianRpIjoiZmM0NjJlMTYzZmFkNjk4NTU0ZDdlYmI3YTk0ZDYyMzg1NGE3YWZkYWM4ZmRkMDE2OTg1NzQwYjdkNjhmNGRkNTg5NGMzZjI4MmQzZGYyY2YiLCJpYXQiOjE1NTQ5ODg1NTAsIm5iZiI6MTU1NDk4ODU1MCwiZXhwIjoxNTg2NjEwOTUwLCJzdWIiOiI1Iiwic2NvcGVzIjpbXX0.CeRyAMxIhrgjobmpuovq-ZA_KrIm_fcEKEy53Y5h-Dv6QIAU-6VIrMOwhblzx03KfaIqS-J2PB4UJj-cbfjGtsuqUIoMscKzCRRntMa-pgjBQtgP0K8A_juLr0EHMwNYj0OLrDvly0odznNYj6V19rrNvix-LpC_z8DbotAD2E96gl1e1SueKwRbzYln9A7Pmpp0NLJ5K3bgQSLbkJiqcC6N6COwjzYpAhnpRf7oyp1Ua9CBvlS7DWLTBO6zzaIXYQLk-lXZjKhup-b2qoFSqLNDKZoh2CeyGpeZXsciVCJ3SciDlliLQkpd1gPIeRYr2G7Qka2cuESCNyd5UUZ1b0UK8M-tvYHMKZftewdEh4R4rgU8b3aM7ywJ_QfUPv-Rs6EQJBdfp3horrPzUmntaHVBGNJFIjHOuU7HQqxHwBmgxgQhWuZn8OHv05avGUpMnd2XTc8sc5f0uESaRbq_CQFKAuOvI0Zc56h0gjV3I5Uy_dTm1Kxrr_-bkw-rzKyhASHhzX1022T0H1yBckfSxBXRHMunNznXZxwPjKTQQsUCupsOE6GseWIkrFr8TjlDm6oXtAi3Mq_TgxUb1CDK5JnGiA30mciWjiJqn_2s1qtfvFvPDqSxB08ZpALwkeJmrK71xDx0ZEj85nvUNz0F85ipfRLqFYHe7C1gjhjjyI4';
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
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink],
    },
  ],
})
export class GraphQLModule { }