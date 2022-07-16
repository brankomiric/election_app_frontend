import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment as env } from 'src/environments/environment';
import { Candidate } from '../voting/models';

@Component({
  selector: 'app-voting-through-proxy',
  templateUrl: './voting-through-proxy.component.html',
  styleUrls: ['./voting-through-proxy.component.css']
})
export class VotingThroughProxyComponent implements OnInit {
  private candidatesUrl = `${env.serverUrl}candidates/list`;
  private scoreboardUrl = `${env.serverUrl}scoreboard`;
  private voteUrl = `${env.serverUrl}vote`;

  candidates: Candidate[] = [];

  selectedCandidateAddr = '';
  selectedAmount = 0;
  voterPK: string = '';

  completionMessage = '';
  disableVoting = false;
  showCandidatesRank = false;

  constructor(private httpClient: HttpClient) { }

  async ngOnInit() {
    const list$ = this.httpClient.get<Candidate[]>(this.candidatesUrl);
    const list = await lastValueFrom(list$);
    this.candidates = list;
    
  }

  onCandidateSelection(event: any) {
    console.log(event.target.value);
    this.selectedCandidateAddr = event.target.value;
  }

  onNumberInput(event: any) {
    console.log(event.target.value);
    this.selectedAmount = event.target.value;
  }

  onPrivateKeyInput(event: any) {
    console.log(event.target.value);
    this.voterPK = event.target.value;
  }

  async onVote() {
    console.log('voting');
    if (!this.selectedCandidateAddr) {
      this.completionMessage =
        'Voting unsuccessful! You must select a candidate first';
      return;
    }
    if (!this.voterPK) {
      this.completionMessage =
        'Voting unsuccessful! Unable to sign transactions with your PK';
      return;
    }
    try {
      const response$ = this.httpClient.post(this.voteUrl, {
        candidate: this.selectedCandidateAddr,
        amount: this.selectedAmount,
        userPK: this.voterPK
      });

      const response = await lastValueFrom(response$);
      this.completionMessage = 'Success! Your vote is recorded';
      this.disableVoting = true;
    } catch (err: any) {
      this.completionMessage = err;
    }
  }

  async listAll() {
    const response$ = this.httpClient.get<Candidate[]>(this.scoreboardUrl);
    const candidates = await lastValueFrom(response$);

    console.log(candidates);

    this.candidates = candidates;
    this.showCandidatesRank = true;
  }

}
