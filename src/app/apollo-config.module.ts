import { NgModule } from '@angular/core';

import { ApolloModule, Apollo } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { HttpClientModule } from '@angular/common/http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { environment } from 'src/environments/environment';
import { onError } from 'apollo-link-error';
import { ApolloLink } from 'apollo-link';

@NgModule({
  imports: [
    HttpClientModule,
    ApolloModule,
    HttpLinkModule
  ]
})
export class ApolloConfigModule {

  constructor(
    private apollo: Apollo,
    private httpLink: HttpLink
  ) {
    const uri = 'https://api.graph.cool/simple/v1/ck2cgn9fk2vma0167xm25qk2l';
    const http = httpLink.create({ uri });

    const linkError = onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        graphQLErrors.map(({ message, locations, path }) =>
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
          ),
        );
      }
      if (networkError) {
        console.log(`[Network error]: ${networkError}`);
      }
    });

    apollo.create({
      link: ApolloLink.from([
        linkError,
        http
      ]),
      cache: new InMemoryCache(),
      connectToDevTools: !environment.production
    });
  }
}
