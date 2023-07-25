import rc4 from 'arc4';
import { CNST_FILE_ENCODING_INPUT, CNST_FILE_ENCODING_OUTPUT } from '../src-angular/app/utilities/constants-angular';

export class Functions {
  public static cipher: rc4.Cipher = rc4('arc4', 'rasgolkiebploisl');
  
  public static encrypt(text: string): string {
    return Functions.cipher.encodeString(text, CNST_FILE_ENCODING_INPUT, CNST_FILE_ENCODING_OUTPUT);
  }
  
  public static decrypt(text: string): string {
    return Functions.cipher.decodeString(text, CNST_FILE_ENCODING_OUTPUT, CNST_FILE_ENCODING_INPUT);
  }
  
  public static convertDate(dateTime, special): any {
    function pad( s ) { return ( s < 10 ) ? '0' + s : s; }
    const d = new Date( dateTime );
  
    if ( special ) {
      return [ pad( d.getDate() ), pad( d.getMonth() + 1 ), d.getFullYear() ].join( '/' ) + ' ' + [ pad( d.getHours() ), pad( d.getMinutes() ) ].join( ':' );
    } else {
      return [ d.getFullYear() , pad( d.getMonth() + 1 ), pad( d.getDate() ) ].join( '' ) + 'T' + [ pad( d.getHours() ) , pad( d.getMinutes() ), pad ( d.getSeconds() ) ].join( '' );
    }
  }
  
  public static formatDate(date: Date): string {
    let year: any = date.getFullYear();
    let month: any = date.getMonth() + 1;
    let day: any = date.getDate();
    let hour: any = date.getHours();
    let minute: any = date.getMinutes();
    let second: any = date.getSeconds();
    
    if (month < 10) month = '0' + month;
    if (day < 10) day = '0' + day;
    if (hour < 10) hour = '0' + hour;
    if (minute < 10) minute = '0' + minute;
    if (second < 10) second = '0' + second;
    
    return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
  }
  
  public static between(x: number, min: number, max: number): boolean {
    return ((x >= min) && (x <= max));
  }
}
