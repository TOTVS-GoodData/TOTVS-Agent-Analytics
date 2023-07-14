import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked  } from '@angular/core';

import { ElectronService } from 'ngx-electronyzer';
import { PoButtonGroupItem } from '@po-ui/ng-components';

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.css']
})

export class LogComponent implements OnInit, OnDestroy, AfterViewChecked  {

  @ViewChild( 'textLog', { read: ElementRef } ) textLog: any;

  hiddenConfiguration = true;
  interval: any;
  logAgent;

  logAgentButton: Array<PoButtonGroupItem> = [
    { label: 'Abrir Arquivo Log', action: this.openLogAgent }
  ];

  constructor( private _electronService: ElectronService ) { }

  ngOnInit() {
    this.interval = setInterval( () => {
      this.loadLogAgent();
    }, 5000 );
  }

  ngOnDestroy() {
    clearInterval( this.interval );
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    try {
      this.textLog.nativeElement.scrollTop = this.textLog.nativeElement.scrollHeight;
    } catch ( err ) { }
  }

  showConfiguration() {
    this.hiddenConfiguration = ! this.hiddenConfiguration;
  }

  loadLogAgent() {
    if ( this._electronService.isElectronApp ) {
      this.logAgent = this._electronService.ipcRenderer.sendSync( 'loadLogManual' );
    }
  }

  openLogAgent() {
    if ( this._electronService.isElectronApp ) {
      this._electronService.ipcRenderer.sendSync( 'loadLogManual' );
    }
  }

}
