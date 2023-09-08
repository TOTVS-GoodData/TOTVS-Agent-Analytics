import { Injectable } from "@angular/core";

@Injectable()
export class ModalService {
  
  private modals: any[] = [];
  
  add(modal: any) {
    this.modals.push(modal);
  }
  
  open(id: string) {
    const modal: any = this.modals.find((x: any) => x.id === id);
    if (modal !== undefined) modal.open();
  }
  
  close(id: string) {
    const modal: any = this.modals.find(x => x.id === id);
    if (modal !== undefined) modal.close();
  }
  
  remove(id: string) {
    this.modals = this.modals.filter(x => x.id !== id);
  }
}