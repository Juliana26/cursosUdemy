import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Apollo } from 'apollo-angular';

import { AUTHENTICATE_USER_MUTATION, SIGNUP_USER_MUTATION } from './auth.graphql';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authenticated = new ReplaySubject<boolean>(1);

  constructor(
    private apollo: Apollo
  ) {
    this.isAuthenticated.subscribe(is => console.log('AuthState', is));
  }

  get isAuthenticated(): Observable<boolean> {
    return this.authenticated.asObservable();
  }

  singinUser(variables: {email: string, password: string}): Observable<{id: string, token: string}> {
    return this.apollo.mutate({
      mutation: AUTHENTICATE_USER_MUTATION,
      variables
    }).pipe(
      map((res: any) => res.data.authenticateUser),
      tap((res: any) => this.setAuthState(res !== null)),
      catchError((error: any) => {
        this.setAuthState(false);
        return throwError(error);
      })
    );
  }

  signupUser(variables: {name: string, email: string, password: string}): Observable<{id: string, token: string}> {
    return this.apollo.mutate({
      mutation: SIGNUP_USER_MUTATION,
      variables
    }).pipe(
      map((res: any) => res.data.signupUser),
      tap((res: any) => this.setAuthState(res !== null)),
      catchError(error => {
        this.setAuthState(false);
        return throwError(error);
      })
    );
  }

  private setAuthState(isAuthenticated: boolean): void {
    this.authenticated.next(isAuthenticated);
  }
}
