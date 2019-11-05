import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor() { }

  getErrorMessage(error: any): string {
    let message = error.message.split(': ');
    return message[message.length - 1];
  }
}
