/* Interface de validação de arquivos locais do Agent */
export class FileValidation {
  type: string;
  errors: number;
  
  constructor(type: string, errors: number) {
    this.type = type;
    this.errors = errors;
  }
}
