const path = require( 'path' );
const childProcess = require( 'child_process' );
const fs = require( 'fs-extra' );


//import { Files } from './files';
import { Functions } from './functions';

import * as globals from './constants-electron';

import { Configuration } from '../src-angular/app/utilities/interfaces';

export class Process {
  
  //private files: Files = new Files();
  private functions: Functions = new Functions();
  
  
  public runAgent( scheduleId, javaId, lineProduct ): any {
    //const port = Process.server.getServerPort();
    const jarPath = ( ( lineProduct === 1 ) ? globals.CNST_PROGRAM_PATH_JAR_FAST : globals.CNST_PROGRAM_PATH_JAR_SMART );
    
    //this.files.checkFileSize();
    
    /*
    this.getJavaParamsByProject(javaId, port).then((params) => {
      this.getConfiguration(port).then((config) => {
        let sweepTime = new Date ();
        console.log( `[{Executando TOTVS Agent Analytics...${sweepTime}}]` );
        let child;
        
        params = [];
        
        params.push('-jar');
        params.push(jarPath);
        //params.push(scheduleId);
        //params.push(port);
        //params.push(config.showQuery);
        
        params.push('./agent/config.properties');
        
        
        console.log('PARAMMSSS...');
        console.log(params);
        
        child = childProcess.spawn('java', params);
        child.stdout.on('data', (data) => {
          let str = String.fromCharCode.apply(null, data);
          console.log(str, true);
        });
        
        child.stderr.on('data', (data) => {
          let str = String.fromCharCode.apply(null, data);
           console.log(str, true);
        });
      }, (err) => { console.log(err, true)});
    }, (err) => { console.log(err, true)});*/
  }
  
  /*public getJavaParamsByProject( javaId, port ): any {
    let javaParams = [];
    return new Promise((resolve, reject) => {
      if ((javaId !== null) && (javaId !== undefined ) && (javaId !== '')) {
        request({
                  url: `http://localhost:${port}/javas/${javaId}`,
                  json: true
                }, function ( error, response, body ) {console.log(body);
                    if  ( ( response !== undefined ) && ( response.statusCode === 200 ) ) {
                        for ( let parameter of body.parameters ) {
                            javaParams.push( parameter.value );
                        }
                        resolve( javaParams );
                    } else {
                        console.log( `getJavaParamsByProject => ${error}` );
                        reject();
                    }            
                } );   
            } else {console.log('OPA');
                resolve( javaParams );
            }
        } );
    }*/

    /*public getConfiguration( port ): any {
        let config: Configuration = new Configuration();
        return new Promise( ( resolve, reject ) => {
            request( {
                url: `http://localhost:${port}/configuration`,
                json: true
            }, function ( error: any, response: any, body: any ) {
                if  ( ( response !== undefined ) && ( response.statusCode === 200 ) ) {
                    config.intervalExecutionServer = ( body.intervalExecutionServer > 0 ? body.intervalExecutionServer : 1 ) * 60000;
                    if ( body[0] === undefined ) {
                        config.showQuery = false;    
                    } else {
                        config.showQuery = body[0].showQuery;
                    }    
                    resolve( config );
                } else {
                    console.log( `getConfiguration => ${error}` );
                    reject();
                }            
            } );   
        } );
    }*/

    



    public setStatusExecution( idExecutionCancel, status ): any {
        try {
            const d = new Date();
            const cancelDate = this.functions.convertDate( d, true );
            const execution = `[{"idExecution":"${idExecutionCancel}","server":"Local", "timeStamp":"${cancelDate}", "message":"Status de execução: ${status}"}]\n`;
            console.log( execution, true );
            return true;
        } catch ( error ) {
            console.log( 'setStatusExecution => ' + error );
            return false;
        }
    }

}
