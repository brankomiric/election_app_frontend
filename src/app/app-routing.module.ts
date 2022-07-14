import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistrationComponent } from './registration/registration.component';
import { VotingComponent } from './voting/voting.component';

const routes: Routes = [
  {
    path: "register",
    component: RegistrationComponent
  },
  {
    path: "vote",
    component: VotingComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
