import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { Candidate, CandidatesResponse } from './models';
import { EthereumService } from '../services/blockchain/connection/ethereum.service';
import { EthereumService as AccountsService } from '../services/blockchain/accounts/ethereum.service';
import { environment as env } from 'src/environments/environment';
import { BigNumber, utils } from 'ethers';

@Component({
  selector: 'app-voting',
  templateUrl: './voting.component.html',
  styleUrls: ['./voting.component.css'],
})
export class VotingComponent implements OnInit {
  private addresses = [
    '0x2928b69605e20459395715ccC56c2Ae6c9aE99A1',
    '0x3D102fd93BD618cC8Eb404651F04cC9dB17dD2A3',
    '0x0487F2fccF7cC21aE3b8906D3ef6869B8B9e1BD8',
    '0x0b22581AF5d5908A667556012505501dc045F77f',
    '0x2CCD8494424103547C3d77C6B67e70b1FF96A18d',
    '0xDecbC7572f63b31a6Df55868746dF98B975a24a7',
    '0xFfeB78c7C55D74F4333aE10f87Af8194E8f768c0',
    '0xea0da8843DdE53851fCbb809b2a098f706Eab646',
    '0xfC7F30488caeAD12C9217455e610aeeE98e82094',
    '0xDbea3086B55C156e8d318bfb6A4f2b39C084D0EC',
  ];

  private electionAbi = [
    'function vote(address candidate)',
    'function getScoreboard() view returns (tuple(address electeeAddr, uint256 score)[] electees)',
  ];

  private tokenAbi = [
    'function symbol() public view returns (string)',
    'function name() public view returns (string)',
    'function decimals() public view returns (uint8)',
    'function totalSupply() public view returns (uint)',
    'function balanceOf(address usr) public view returns (uint)',
    'function transfer(address dst, uint wad) returns (bool)',
    'function getOneToken(address to)',
  ];

  private api = 'https://wakanda-task.3327.io/list';

  candidates: Candidate[] = [];
  candidatesObj: any = {};

  selectedCandidateAddr = '';
  selectedAmount = 0;
  voterPK: string = '';

  completionMessage = '';
  disableVoting = false;
  showCandidatesRank = false;

  constructor(
    private httpClient: HttpClient,
    private ethereumService: EthereumService,
    private accountsService: AccountsService
  ) {}

  async ngOnInit(): Promise<void> {
    const list$ = this.httpClient.get<CandidatesResponse>(this.api);
    const list = await lastValueFrom(list$);

    // Appending an Eth address to each item as it lacks unique identifier
    list.candidates.forEach((c, i) => {
      c.address = this.addresses[i];
      c.votes = 0;
      this.candidates.push(c);
    });

    this.candidates.forEach((c) => {
      this.candidatesObj[c.address] = c;
    });

    console.log(this.candidatesObj);
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
      await this.ethereumService.connect(this.voterPK);
      const token = this.ethereumService.getContractInstance(
        env.wakandaTokenAddr,
        this.tokenAbi
      );
      const election = this.ethereumService.getContractInstance(
        env.electionContractAddr,
        this.electionAbi
      );

      const secrets = this.accountsService.restoreAddressFromPrivateKey(
        this.voterPK
      );

      const balance = await token['balanceOf'](secrets.keys[0].address);
      const tokenAmount = utils.parseUnits(
        this.selectedAmount.toString(),
        'ether'
      );
      console.log(tokenAmount.toString());

      // Checking only if voter has the amount he wishes to send
      // Should probably check for a lower limit but the requirements are unclear there
      if (tokenAmount.lt(balance)) {
        throw new Error(
          'Your input tokens are greater than the amount you hold'
        );
      }

      // Transfering Tokens to the selected candidate
      await token['transfer'](this.selectedCandidateAddr, tokenAmount);

      // Finally, vote
      await election['vote'](this.selectedCandidateAddr);
      this.completionMessage = 'Success! Your vote is recorded';
      this.disableVoting = true;
    } catch (err: any) {
      this.completionMessage = err;
    }
  }

  async listAll() {
    const pk =
      this.voterPK != ''
        ? this.voterPK
        : this.accountsService.restoreAddressesFromMnemonic(env.mnemonic, 1)
            .keys[0].privateKey;
    await this.ethereumService.connect(pk);
    const election = this.ethereumService.getContractInstance(
      env.electionContractAddr,
      this.electionAbi
    );

    const response = await election['getScoreboard']();

    response.forEach((item: any) => {
      const c = this.candidatesObj[item.electeeAddr];
      if (c) {
        (c as Candidate).votes = +item.score.toString();
      }
    });

    let candidates: Candidate[] = Object.values(this.candidatesObj);
    candidates = candidates.sort(this.compare);

    console.log(candidates);

    this.candidates = candidates;
    this.showCandidatesRank = true;
  }

  private compare(a: Candidate, b: Candidate) {
    if (a.votes > b.votes) {
      return -1;
    }
    if (a.votes < b.votes) {
      return 1;
    }
    return 0;
  }
}
