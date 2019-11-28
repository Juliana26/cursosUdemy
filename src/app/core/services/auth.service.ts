import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Apollo } from 'apollo-angular';

import { AUTHENTICATE_USER_MUTATION, SIGNUP_USER_MUTATION } from './auth.graphql';
import { StorageKeys } from 'src/app/storage-keys';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  redirectUrl: string;
  keepSigned: boolean;
  private authenticated = new ReplaySubject<boolean>(1);

  constructor(
    private apollo: Apollo
  ) {
    this.isAuthenticated.subscribe(is => console.log('AuthState', is));
    this.init();
  }

  init(): void {
    this.keepSigned = JSON.parse(window.localStorage.getItem(StorageKeys.KEEP_SIGNED));
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
      tap((res: any) => this.setAuthState({token: res && res.token, isAuthenticated: res !== null})),
      catchError((error: any) => {
        this.setAuthState({token: null, isAuthenticated: false});
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
      tap((res: any) => this.setAuthState({token: res && res.token, isAuthenticated: res !== null})),
      catchError(error => {
        this.setAuthState({token: null, isAuthenticated: false});
        return throwError(error);
      })
    );
  }

  toogleKeepSigned(): void {
    this.keepSigned = !this.keepSigned;
    window.localStorage.setItem(StorageKeys.KEEP_SIGNED, JSON.stringify(this.keepSigned));
  }

  private setAuthState(authData: {token: string, isAuthenticated: boolean}): void {
    if (authData.isAuthenticated) {
      window.localStorage.setItem(StorageKeys.AUTH_TOKEN, authData.token);
    }
    this.authenticated.next(authData.isAuthenticated);
  }
}
