import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from "rxjs";

@Injectable()
export class MenuService {
  private menuRef = new Subject<any>();
  public menuRefObs$ = this.menuRef.asObservable();
  public updateMenu(): void {
    this.menuRef.next(null);
   }
}