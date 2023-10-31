export class Functions {
  /**************************/
  /*** MÉTODOS DO MÓDULO  ***/
  /**************************/
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
