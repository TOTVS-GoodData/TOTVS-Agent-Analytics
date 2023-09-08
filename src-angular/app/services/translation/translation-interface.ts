/* Interface de requisições de tradução */
export class TranslationInput {
  key: string;
  replacements: string[];
  
  constructor(key: string, replacements: string[]) {
    this.key = key;
    this.replacements = replacements;
  }
}