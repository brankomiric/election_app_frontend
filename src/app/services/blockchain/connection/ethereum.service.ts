import { Injectable } from '@angular/core';
import { Contract, providers, utils, Wallet } from 'ethers';
import { environment as env } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EthereumService {
  private _wallet?: Wallet;
  private _provider?: providers.BaseProvider;

  private erc20ABI = [
    'function symbol() public view returns (string)',
    'function name() public view returns (string)',
    'function decimals() public view returns (uint8)',
    'function totalSupply() public view returns (uint)',
    'function balanceOf(address usr) public view returns (uint)',
    'function transfer(address dst, uint wad) returns (bool)',
  ];

  constructor() {}

  public async connect(pk: string): Promise<void> {
    try {
      this._provider = new providers.JsonRpcProvider(env.nodeUrl);
      this._wallet = new Wallet(pk, this.provider);
    } catch (err) {
      throw err;
    }
  }

  public get wallet() {
    if (this._wallet) return this._wallet;
    throw new Error(
      'You must call the connect method first to initialize wallet'
    );
  }

  public get provider() {
    if (this._provider) return this._provider;
    throw new Error(
      'You must call the connect method first to initialize provider'
    );
  }

  public getContractInstance(address: string, abi: string[]): Contract {
    return new Contract(address, abi, this.wallet);
  }

  public async getNativeBalance(): Promise<number> {
    const balance = await this.wallet.getBalance();
    return Number(utils.formatEther(balance));
  }

  public async createNativeTransferTx(
    toAddr: string,
    amountEth: string
  ): Promise<providers.TransactionRequest> {
    return this.wallet.populateTransaction({
      to: toAddr,
      value: utils.parseEther(amountEth),
    });
  }

  /**
   *
   * @param tx - Signed transaction
   * @returns Gas fee in wei
   */
  public async estimateTxFee(
    tx: providers.TransactionRequest
  ): Promise<string> {
    const gasPrice = await this.wallet.getGasPrice();
    const gasEstimate = await this.wallet.estimateGas(tx);
    const txFee = gasPrice.mul(gasEstimate);
    return txFee.toString();
  }

  public async broadcastTransaction(
    txReq: providers.TransactionRequest,
    confirmations: number = 1
  ): Promise<boolean> {
    try {
      const tx = await this.wallet.sendTransaction(txReq);
      await tx.wait(confirmations);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  public async getTokenBalance(
    tokenAddress: string,
    tokenDecimals: number
  ): Promise<number> {
    const tokenContract = new Contract(
      tokenAddress,
      this.erc20ABI,
      this.wallet
    );
    const balance = await tokenContract['balanceOf'](this.wallet.address);
    return Number(balance.toString()) / 10 ** tokenDecimals;
  }

  /**
   *
   * @param tokenAddress
   * @param tokenDecimals
   * @param toAddress
   * @param amount
   * @returns Gas fee in wei
   */
  public async estimateTokenTransfer(
    tokenAddress: string,
    tokenDecimals: number,
    toAddress: string,
    amount: string
  ): Promise<string> {
    const tokenContract = new Contract(
      tokenAddress,
      this.erc20ABI,
      this.wallet
    );
    const tokens = utils.parseUnits(amount, tokenDecimals);
    const gasPrice = await this.wallet.getGasPrice();
    const gasEstimate = await tokenContract.estimateGas['transfer'](
      toAddress,
      tokens
    );
    const txFee = gasPrice.mul(gasEstimate);
    return txFee.toString();
  }

  public async transferTokens(
    tokenAddress: string,
    tokenDecimals: number,
    toAddress: string,
    amount: string
  ): Promise<boolean> {
    try {
      const tokenContract = new Contract(
        tokenAddress,
        this.erc20ABI,
        this.wallet
      );
      const tokens = utils.parseUnits(amount, tokenDecimals);
      const tx = await tokenContract['transfer'](toAddress, tokens);
      console.log(tx);
      await tx.wait(1);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
}
