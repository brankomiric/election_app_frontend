import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegistrationComponent } from './registration/registration.component';
import { VotingComponent } from './voting/voting.component';
import { VotingThroughProxyComponent } from './voting-through-proxy/voting-through-proxy.component';

@NgModule({
  declarations: [
    AppComponent,
    RegistrationComponent,
    VotingComponent,
    VotingThroughProxyComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
