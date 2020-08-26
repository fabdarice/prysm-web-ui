import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';

export interface WalletResponse {
  walletPath: string;
}

export interface GenerateMnemonicResponse {
  mnemonic: string;
}

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  constructor(
    private http: HttpClient,
  ) { }

  // Properties.
  token: string;

  // Observables.
  walletConfig$ = this.http.get<WalletResponse>('/api/wallet');
  // Retrieve a randomly generateed bip39 mnemonic from the backend,
  // ensuring it can be replayed by multiple subscribers. For example: being able
  // to verify the generated mnemonic matches the user input in a confirmation box
  // would require share replay for us to compare to the proper value.
  generateMnemonic$ = this.http.get<GenerateMnemonicResponse>('/api/mnemonic/generate').pipe(
    map((resp: GenerateMnemonicResponse) => resp.mnemonic),
    shareReplay(1),
    catchError(err => throwError(err)),
  );
}
