import { Clipboard } from '@angular/cdk/clipboard';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { throwError } from 'rxjs';
import { catchError, take, tap } from 'rxjs/operators';

import { MAX_ACCOUNTS_CREATION } from 'src/app/modules/core/constants';
import { mockDepositDataJSON } from 'src/app/modules/core/mocks';
import { WalletService } from 'src/app/modules/core/services/wallet.service';
import { CreateAccountsRequest, DepositDataResponse, DepositDataResponse_DepositData } from 'src/app/proto/validator/accounts/v2/web_api';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
})
export class CreateAccountComponent {
  @ViewChild('stepper') stepper?: MatStepper;
  constructor(
    private fb: FormBuilder,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer,
    private walletService: WalletService,
  ) { }
  loading = false;
  maxAccounts = MAX_ACCOUNTS_CREATION;
  accountsFormGroup = this.fb.group({
    numAccounts: new FormControl('', [
      Validators.required,
      Validators.min(0),
      Validators.max(MAX_ACCOUNTS_CREATION),
    ]),
  });
  depositData: DepositDataResponse_DepositData[] = [];
  depositDataFileName = 'deposit_data-23920932.json';

  generateDownloadJSONUri(data: DepositDataResponse_DepositData[]): SafeUrl {
    const json = JSON.stringify(data);
    return this.sanitizer.bypassSecurityTrustUrl('data:text/json;charset=UTF-8,' + encodeURIComponent(json));
  }

  copy(data: DepositDataResponse_DepositData[]): void {
    this.clipboard.copy(JSON.stringify(data));
    this.snackBar.open('Copied JSON string to clipboard', 'Close', {
      duration: 4000,
    });
  }

  createAccounts(): void {
    this.accountsFormGroup.markAllAsTouched();
    if (this.accountsFormGroup.invalid) {
      return;
    }
    const req: CreateAccountsRequest = {
      numAccounts: this.accountsFormGroup.controls.numAccounts.value,
    };
    this.loading = true;
    this.walletService.createAccounts(req).pipe(
      take(1),
      tap((res: DepositDataResponse) => {
        this.snackBar.open(`Successfully created ${req.numAccounts} accounts`, 'Close', {
          duration: 4000,
        });
        this.loading = false;
        this.depositData = res.depositDataList.map(d => d.data);
        this.stepper?.next();
      }),
      catchError(err => {
        this.loading = false;
        return throwError(err);
      })
    ).subscribe();
  }
}
