import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistrationComponent } from './registration/registration.component';
import { VotingThroughProxyComponent } from './voting-through-proxy/voting-through-proxy.component';
import { VotingComponent } from './voting/voting.component';

const routes: Routes = [
  {
    path: "register",
    component: RegistrationComponent
  },
  {
    path: "vote",
    component: VotingComponent
  },
  {
    path: "vote-proxy",
    component: VotingThroughProxyComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
