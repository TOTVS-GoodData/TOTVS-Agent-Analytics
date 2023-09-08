/* Algoritmo de criptografia de mensagens */
import rc4 from 'arc4';

export class Functions {
  
  /**************************/
  /***     VARIÁVEIS      ***/
  /**************************/
  /********* Gerais *********/
  //Inicialização do algoritmo de criptografia
  private static cipher: rc4.Cipher = rc4('arc4', 'rasgolkiebploisl');
  
  //Codificação de entrada / saída do texto criptografado
  private static CNST_FILE_ENCODING_INPUT: string = 'UTF-8';
  private static CNST_FILE_ENCODING_OUTPUT: string = 'HEX';
  
  /**************************/
  /*** MÉTODOS DO MÓDULO  ***/
  /**************************/
  /* Método de criptografia de um texto */
  public static encrypt(text: string): string {
    return Functions.cipher.encodeString(text, Functions.CNST_FILE_ENCODING_INPUT, Functions.CNST_FILE_ENCODING_OUTPUT);
  }
  
  /* Método de descriptografia de um texto */
  public static decrypt(text: string): string {
    return Functions.cipher.decodeString(text, Functions.CNST_FILE_ENCODING_OUTPUT, Functions.CNST_FILE_ENCODING_INPUT);
  }
  
  /* Método que formata um objeto de data do Javascript para a mesma máscara utilizada pela função de log do Agent */
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
  
  /* Método que verifica se um número está entre um range */
  public static between(x: number, min: number, max: number): boolean {
    return ((x >= min) && (x <= max));
  }
}
