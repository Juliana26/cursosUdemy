import { NgModule } from '@angular/core';

import { LoginComponent } from './components/login/login.component';
import { LoginRoutingModule } from './login-routing.module';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [LoginComponent],
  imports: [
    SharedModule,
    LoginRoutingModule
  ],
  exports: [LoginComponent]
})
export class LoginModule { }
