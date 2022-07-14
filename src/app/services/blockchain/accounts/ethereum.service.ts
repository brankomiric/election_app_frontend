import { Injectable } from '@angular/core';
import { Wallet } from 'ethers';
import { isValidMnemonic } from '@ethersproject/hdnode';
import { Secrets } from './models';

@Injectable({
  providedIn: 'root',
})
export class EthereumService {
  private pathBIP = "m/44'/60'/0'/0/";

  constructor() {}

  public restoreAddressFromPrivateKey(pk: string): Secrets {
    const wallet = new Wallet(pk);
    const keys = {
      address: wallet.address,
      privateKey: wallet.privateKey,
    };
    return { seedPhrase: undefined, keys: [keys] };
  }

  public restoreAddressesFromMnemonic(
    mnemonic: string,
    limit: number
  ): Secrets {
    if (!isValidMnemonic(mnemonic)) throw new Error('Invalid seed phrase');

    const keys = [...Array(limit).keys()].map((i) => {
      const wallet = Wallet.fromMnemonic(mnemonic, this.pathBIP + i);
      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
      };
    });

    return { seedPhrase: mnemonic, keys };
  }

  public generateAddress() {
    const {
      mnemonic: { phrase },
      address,
      privateKey,
    } = Wallet.createRandom();
    return {
      seedPhrase: phrase,
      keys: [{ address, privateKey }],
    };
  }
}
