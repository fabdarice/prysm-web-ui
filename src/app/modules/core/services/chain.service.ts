import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { switchMap, startWith } from 'rxjs/operators';
import { interval } from 'rxjs';

import { BeaconNodeService } from './beacon-node.service';

import {
  ValidatorParticipationResponse,
} from 'src/app/proto/eth/v1alpha1/beacon_chain';
import { MILLISECONDS_PER_EPOCH } from '../constants';

@Injectable({
  providedIn: 'root',
})
export class ChainService {
  constructor(
    private http: HttpClient,
    private beaconService: BeaconNodeService
  ) { }

  // Chain information.
  participation$ = interval(MILLISECONDS_PER_EPOCH).pipe(
    startWith(0),
    switchMap(_ => this.beaconService.nodeEndpoint$),
    switchMap((url: string) => {
      return this.http.get<ValidatorParticipationResponse>(`${url}/validators/participation`);
    }),
  );
}
