import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Plan, DataStorageService } from './data-storage.service';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()

export class CalenderResolver implements Resolve<Plan>{

    constructor(private dataStorage: DataStorageService) { }
    
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Plan> |
        Promise<Plan> |
        Plan {
        return this.dataStorage.getSuggestedPlan();
    }
}