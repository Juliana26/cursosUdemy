import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, ReplaySubject, of, throwError, merge } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { Apollo } from 'apollo-angular';

import { AUTHENTICATE_USER_MUTATION, SIGNUP_USER_MUTATION, LoggedInUserQuery, LOGGED_IN_USER_QUERY } from './auth.graphql';
import { StorageKeys } from 'src/app/storage-keys';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  redirectUrl: string;
  keepSigned: boolean;
  private authenticated = new ReplaySubject<boolean>(1);

  constructor(
    private apollo: Apollo,
    private router: Router
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

  logout(): void {
    window.localStorage.removeItem(StorageKeys.AUTH_TOKEN);
    window.localStorage.removeItem(StorageKeys.KEEP_SIGNED);
    this.keepSigned = false;
    this.authenticated.next(false);
    this.router.navigate(['/login']);
    this.apollo.getClient().resetStore();
  }

  autoLogin(): Observable<any> {
    if (!this.keepSigned) {
      this.authenticated.next(false);
      window.localStorage.removeItem(StorageKeys.AUTH_TOKEN);
      return of();
    }

    return this.validateToken()
      .pipe(
        tap(authData => {
          const token = window.localStorage.getItem(StorageKeys.AUTH_TOKEN);
          this.setAuthState({token, isAuthenticated: authData.isAuthenticated});
        }),
        mergeMap(() => of()),
        catchError(error => {
          this.setAuthState({token: null, isAuthenticated: false});
          return throwError(error);
        })
      );
  }

  private validateToken(): Observable<{id: string, isAuthenticated: boolean}> {
    return this.apollo.query<LoggedInUserQuery>({
      query: LOGGED_IN_USER_QUERY
    }).pipe(
      map((res: any) => {
        const user = res.data.loggedInUser;
        return {
          id: user && user.id,
          isAuthenticated: user !== null
        };
      })
    );
  }

  private setAuthState(authData: {token: string, isAuthenticated: boolean}): void {
    if (authData.isAuthenticated) {
      window.localStorage.setItem(StorageKeys.AUTH_TOKEN, authData.token);
    }
    this.authenticated.next(authData.isAuthenticated);
  }
}
