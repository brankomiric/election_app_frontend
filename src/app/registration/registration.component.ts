import { Component, OnInit } from '@angular/core';
import { Contract, utils } from 'ethers';
import { environment as env } from 'src/environments/environment';
import { EthereumService as AccountService } from '../services/blockchain/accounts/ethereum.service';
import { EthereumService as ConnectionService } from '../services/blockchain/connection/ethereum.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
})
export class RegistrationComponent implements OnInit {
  tokenContract?: Contract;
  errors: string[] = [];
  message: string = '';

  private tokenABI = [
    'function symbol() public view returns (string)',
    'function name() public view returns (string)',
    'function decimals() public view returns (uint8)',
    'function totalSupply() public view returns (uint)',
    'function balanceOf(address usr) public view returns (uint)',
    'function transfer(address dst, uint wad) returns (bool)',
    'function getOneToken(address to)'
  ];

  constructor(
    private accountService: AccountService,
    private connectionService: ConnectionService
  ) {}

  async ngOnInit(): Promise<void> {
    // To instantiate our ERC20 Contract a wallet is needed
    const secrets = this.accountService.restoreAddressesFromMnemonic(
      env.mnemonic,
      1
    );
    const pk = secrets.keys[0].privateKey;
    await this.connectionService.connect(pk);
    this.tokenContract = this.connectionService.getContractInstance(
      env.wakandaTokenAddr,
      this.tokenABI
    );
  }

  async onSubmit(event: any) {
    try {
      console.log('Starting transfer...');
      const address = event.target.address.value;
      if (this.tokenContract) {
        // This is not going to work if the contract instantiator address
        // doesn't have Rinkeby ETH to cover gas fees.
        // Make sure the address with BIP 0 of the mnemonic from
        // environments.ts can cover gas fees
        const tx = await this.tokenContract['getOneToken'](address);
        console.log(tx);
        await tx.wait(1);
        const res = await this.tokenContract['balanceOf'](address);
        console.log(res);
        this.message = `Congrats! Now you have ${utils.formatEther(res.toString())} tokens. Follow the link to cast your vote`;
      } else {
        throw new Error('Contract initiation failed');
      }
    } catch (err: any) {
      this.errors.push(err);
      this.message = err;
    }
  }
}
