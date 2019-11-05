import { NgModule, Optional, SkipSelf } from '@angular/core';
import { AppRoutingModule } from '../app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ApolloConfigModule } from '../apollo-config.module';

@NgModule({
  exports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    ApolloConfigModule
  ]
})
export class CoreModule {
  constructor(
    @Optional() @SkipSelf() parentModule: CoreModule
  ) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only.');
    }
  }
}
