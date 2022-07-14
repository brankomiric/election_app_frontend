export interface Secrets {
  seedPhrase?: string;
  keys: KeyPair[];
}

export interface KeyPair {
  address: string;
  privateKey: string;
}
