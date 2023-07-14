import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Router, Navigation } from '@angular/router';

import { ElectronService } from 'ngx-electronyzer';

import { PoGridRowActions } from '@po-ui/ng-components';

import { WorkspaceService } from '../workspace/workspace-service';
import { JavaService } from '../java/java-service';
import { CNST_JAVA_MESSAGES } from '../java/java-messages';
import { Java, Parameter } from '../utilities/interfaces';
import * as _constants from '../utilities/constants-angular';
import { Utilities } from '../utilities/utilities';

const CNST_FIELD_NAMES: Array<any> = [
   { key: 'name', value: 'Nome da configuração*' }
];

@Component({
  selector: 'app-java-add',
  templateUrl: './java-add.component.html',
  styleUrls: ['./java-add.component.css']
})
export class JavaAddComponent {
  
  @Input() modal: boolean = false;
  @Input() javaObject: Java = null;
  @Output() closeModal: EventEmitter<Java>  = new EventEmitter<Java>();
  
  @ViewChild('po_javaParams') javaParams: any;
  
  public CNST_MESSAGES: any = {
     JAVA_VALIDATE: 'Validando configuração do java...'
    ,JAVA_SAVE_ERROR_NO_PARAMETERS: 'Nenhum parâmetro foi informado nesta configuração do java.'
  };
  
  protected _CNST_FIELD_NAMES: any;
  protected _CNST_NEW_PARAMETER_VALUE: string;
  
  /*************************************************/
  /* MAPEAMENTO DOS NOMES DOS CAMPOS DO FORMULÁRIO */
  /*************************************************/
  protected lbl_name: string;
  
  /*************************************************/
  /*************************************************/
  /*************************************************/
  
  protected po_gridActions: PoGridRowActions = {
    beforeRemove: this.onBeforeRemove.bind(this),
    beforeInsert: this.onBeforeInsert.bind(this)
  };
  
  protected po_columns = [
    { property: 'value', label: 'Parâmetro', width: 260, required: true, editable: true }
  ];
  
  protected java: Java = new Java();
  protected operation: string;
  protected po_lo_text: Parameter = { value: null };
  
  constructor(
     private _workspaceService: WorkspaceService
    ,private _javaService: JavaService
    ,private _electronService: ElectronService
    ,private _utilities: Utilities
    ,private _router: Router
  ) {
    this._CNST_FIELD_NAMES = CNST_FIELD_NAMES;
    this._CNST_NEW_PARAMETER_VALUE = _constants.CNST_NEW_PARAMETER_VALUE;
    this.lbl_name = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'name'; }).value;
    
    let nav: Navigation = this._router.getCurrentNavigation();
    if (this.javaObject) {
      this.java = this.javaObject;
    } else if ((nav != undefined) && (nav.extras.state)) {
      Object.getOwnPropertyNames.call(Object, nav.extras.state).map((p: string) => {
        this.java[p] = nav.extras.state[p];
      });
    }
    
    if (this.java.id != null) {
      this.operation = 'Alterar Configuração do Java';
    } else {
      this.operation = 'Cadastrar nova Configuração do Java';
    }
  }
  
  protected onBeforeInsert(row: Parameter): boolean {
    let valid: boolean = false;
    let new_parameter: Parameter = this.java.parameters.filter((p: Parameter) => {
      return (p.value === this._CNST_NEW_PARAMETER_VALUE);
    })[0];
    if (new_parameter === undefined) {
      this.java.parameters.push(row);
      valid = true;
    }
    return valid;
  }
  
  protected onBeforeRemove(): void {
    this.clearUnusedParameters();
  }
  
  private clearUnusedParameters(): void {
    this.java.parameters = this.java.parameters.filter((p: Parameter) => { 
      p.value = p.value.replace(/\s+/g, '');
      return ((p.value != null) && (p.value != '') && (p.value != this._CNST_NEW_PARAMETER_VALUE));
    });
  }
  
  private validateJava(): boolean {
    this._utilities.writeToLog(_constants.CNST_LOGLEVEL.DEBUG, this.CNST_MESSAGES.JAVA_VALIDATE);
    this.po_lo_text = { value: this.CNST_MESSAGES.JAVA_VALIDATE };
    let java = new Java();
    
    let propertiesNotDefined = Object.getOwnPropertyNames.call(Object, java).map((p: string) => {
      if ((this.java[p] == undefined) && (p != 'id')) return p;
    }).filter((p: string) => { return p != null; });
    
    // Validação dos campos de formulário //
    if (propertiesNotDefined.length > 0) {
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, 'Campo obrigatório "' + this._CNST_FIELD_NAMES.find((f: any) => { return f.key === propertiesNotDefined[0]}).value + '" não preenchido.');
      this.po_lo_text = { value: null };
      return false;
    } else if (this.java.parameters.length == 0) {
      this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, this.CNST_MESSAGES.JAVA_SAVE_ERROR_NO_PARAMETERS);
      this.po_lo_text = { value: null };
      return false;
    } else {
      return true;
    }
  }
  
  protected goBack(newJava?: Java): void {
    if (this.modal) {
      this.closeModal.emit(newJava);
    } else {
      this._router.navigate(['/java']);
    }
  }
  
  protected saveJava(): void {
    this.clearUnusedParameters();
    if (this.validateJava()) {
      this._javaService.saveJavaConfiguration(this.java).subscribe((b: boolean) => {
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.INFO, CNST_JAVA_MESSAGES.JAVA_SAVE_OK);
        this.po_lo_text = { value: null };
        this.goBack(this.java);
      }, (err: any) => {
        this._utilities.createNotification(_constants.CNST_LOGLEVEL.ERROR, CNST_JAVA_MESSAGES.JAVA_SAVE_ERROR(this.java.name), err);
        this.po_lo_text = { value: null };
      });
    }
  }
}
