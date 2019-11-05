import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

import { AuthService } from 'src/app/core/services/auth.service';
import { ErrorService } from 'src/app/core/services/error.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  loginForm: FormGroup;
  configs = {
      isLogin: true,
      actionText: 'SignIn',
      buttonActionText: 'Create account'
  };
  private nameControl = new FormControl('', [Validators.required, Validators.minLength(5)]);
  private alive = true;

  constructor(
    private authService: AuthService,
    private errorService: ErrorService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.createForm();
  }

  createForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  onSubmit(): void {
    console.log(this.loginForm.value);

    const operation: Observable<{id: string, token: string}> =
      (this.configs.isLogin)
        ? this.authService.singinUser(this.loginForm.value)
        : this.authService.signupUser(this.loginForm.value);

    operation
      .pipe(
        takeWhile(() => this.alive)
      )
      .subscribe(
        (res: any) =>{
          console.log('Redirecting ...', res);
        },
        err => {
          console.log(this.errorService.getErrorMessage(err));
        },
        () => console.log('Observable completed!'))
  }

  changeAction(): void {
    this.configs.isLogin = !this.configs.isLogin;
    this.configs.actionText = !this.configs.isLogin ? "SignUp" : "SignIn";
    this.configs.buttonActionText = !this.configs.isLogin ? "Already have account" : "Create acco";
    !this.configs.isLogin ? this.loginForm.addControl('name', this.nameControl) : this.loginForm.removeControl('name');
  }

  get name(): FormControl { return this.loginForm.get('name') as FormControl; }
  get email(): FormControl { return this.loginForm.get('email') as FormControl; }
  get password(): FormControl { return this.loginForm.get('password') as FormControl; }

  ngOnDestroy(): void {
    this.alive = false;
  }
}
