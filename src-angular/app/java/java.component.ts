import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { ElectronService } from 'ngx-electronyzer';

import {
   PoModalComponent
  ,PoListViewAction
} from '@po-ui/ng-components';

import { WorkspaceService } from '../workspace/workspace-service';
import { JavaService } from './java-service';
import { CNST_JAVA_MESSAGES } from './java-messages';
import * as _constants from '../utilities/constants-angular';
import { Java, Workspace } from '../utilities/interfaces';
import { Utilities } from '../utilities/utilities';

@Component({
  selector: 'app-java',
  templateUrl: './java.component.html',
  styleUrls: ['./java.component.css']
})

export class JavaComponent implements OnInit {
  
  @ViewChild(PoModalComponent) modal_1: PoModalComponent;
  
  public CNST_MESSAGES: any = {
     JAVA_DELETE_ERROR_PROJECTS: 'Não e possível apagar esta configuração do java, pois existem projetos atrelados à ela.'
  };
  
  private javaToDelete: Java;
  protected javaConfigurations: Java[];
  protected po_lo_text: any = { value: null };
  
  protected setoptions(): Array<PoListViewAction> {
    return [
       { label: 'Editar',  action: this.editJava.bind(this) }
      ,{ label: 'Excluir', action: this.deleteJava.bind(this) }
    ];
  }
  
  constructor(
     private _workspaceService: WorkspaceService
    ,private _javaService: JavaService
    ,private _utilities: Utilities
    ,private _router: Router
  ) {}
  
  public ngOnInit(): void {
    this.loadJava();
  }
  
  private loadJava(): void {
    this.po_lo_text = { value: CNST_JAVA_MESSAGES.JAVA_LOADING };
    this._javaService.getJavaConfigurations().subscribe((j: Java[]) => {
      this.javaConfigurations = j;
      this.po_lo_text = { value: null };
    }, (err: any) => {
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, CNST_JAVA_MESSAGES.JAVA_LOADING_ERROR, err);
      this.po_lo_text = { value: null };
    });
  }
  
  protected editJava(j: Java): void {
   this._router.navigate(['/java-add'], { state: j });
  }
  
  protected addJava(): void {
    this._router.navigate(['/java-add']);
  }
  
  protected deleteJava(j: Java): void {
    this.javaToDelete = j;
    this.modal_1.open();
  }
  
  private deleteThisJava(j: Java): void {
    this.po_lo_text = { value: CNST_JAVA_MESSAGES.JAVA_DELETE(this.javaToDelete.name) };
    this._workspaceService.getWorkspacesByJavaConfiguration(j).subscribe((w: Workspace[]) => {
      if (w.length > 0) {
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, this.CNST_MESSAGES.JAVA_DELETE_ERROR_PROJECTS);
        this.po_lo_text = { value: null };
      } else {
        this._javaService.deleteJavaConfiguration(j).subscribe((b: boolean) => {
          this.po_lo_text = { value: null };
          this.loadJava();
        }, (err: any) => {
          this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, CNST_JAVA_MESSAGES.JAVA_DELETE_ERROR(this.javaToDelete.name), err);
          this.po_lo_text = { value: null };
        });
      }
    }, (err: any) => {
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, CNST_JAVA_MESSAGES.JAVA_DELETE_ERROR(this.javaToDelete.name), err);
      this.po_lo_text = { value: null };
    });
  }
  
  public modal_1_close(): void {
    this.javaToDelete = null;
    this.modal_1.close();
  };
  
  public modal_1_confirm(): void {
    this.modal_1.close();
    this.deleteThisJava(this.javaToDelete);
  }
}