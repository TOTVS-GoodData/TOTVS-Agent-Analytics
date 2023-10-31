/* Algoritmo de criptografia de mensagens */
import crypto from 'crypto';

/* Dependência de manipulação de arquivos da máquina do usuário */
import * as fs from 'fs-extra';

/* Dependência do Node, usada para consultar o endereço dos arquivos da Máquina */
import * as path from 'path';

/* Constantes de criptografia */
import {
  CNST_ENCRYPTION_PATH,
  CNST_FILE_KEY_PUBLIC_AGENT,
  CNST_FILE_KEY_PRIVATE_AGENT,
  CNST_FILE_KEY_PUBLIC_SERVER,CNST_KEYS_PATH
} from './encryption-constants';

/* Componentes rxjs para controle de Promise / Observable */
import { Observable, of } from 'rxjs';

export class EncryptionService {
  
  /**************************/
  /***     VARIÁVEIS      ***/
  /**************************/
  /********* Gerais *********/  
  //Codificação de entrada / saída do texto criptografado
  private static CNST_FILE_ENCODING_INPUT: BufferEncoding = 'utf-8';
  private static CNST_FILE_ENCODING_OUTPUT: BufferEncoding = 'hex';
  
  //Chaves de criptografia / descriptografia
  private static CNST_KEY_PUBLIC_AGENT: string = null;
  private static CNST_KEY_PRIVATE_AGENT: string = null;
  private static CNST_KEY_PUBLIC_SERVER: string = null;
  //private static CNST_KEY_AGENT: Buffer = crypto.randomBytes(32);
  private static CNST_KEY_AGENT: Buffer = Buffer.from('nwuaŕoapkpsdnhwofaimgaodpsanwiu');
  private static CNST_KEY_AGENT_2: Buffer = Buffer.from('nwuanhoapkpsdnhwofaimgaodpsanwiu');
  //Algoritmo de criptografia
  private static CNST_ALGORITHM: string = 'aes-256-cbc';
  
  //Vetor de inicialização
  //private static IV: Buffer = crypto.randomBytes(16);
  private static IV: Buffer = Buffer.from('opknbvoinsuiygat');
  
  private static cipher: any = crypto.createCipheriv(EncryptionService.CNST_ALGORITHM, EncryptionService.CNST_KEY_AGENT, EncryptionService.IV);
  private static decipher: any = crypto.createDecipheriv(EncryptionService.CNST_ALGORITHM, EncryptionService.CNST_KEY_AGENT, EncryptionService.IV);
  
  /**************************/
  /*** MÉTODOS DO MÓDULO  ***/
  /**************************/
  /* Método de inicialização do sistema de criptografia do Agent */
  public static init(): boolean {
    
    //Geração de um novo par de chaves de criptografia (caso não exista)
    if ((!fs.existsSync(CNST_FILE_KEY_PUBLIC_AGENT)) || (!fs.existsSync(CNST_FILE_KEY_PRIVATE_AGENT))) {
      EncryptionService.generateKeyPair();
    }
    
    //Inicialização das chaves de criptografia
    EncryptionService.CNST_KEY_PUBLIC_AGENT = fs.readFileSync(CNST_FILE_KEY_PUBLIC_AGENT, 'utf-8');
    EncryptionService.CNST_KEY_PUBLIC_SERVER = fs.readFileSync(CNST_FILE_KEY_PUBLIC_SERVER, 'utf-8');
    EncryptionService.CNST_KEY_PRIVATE_AGENT = fs.readFileSync(CNST_FILE_KEY_PRIVATE_AGENT, 'utf-8');
    return true;
  }
  
  /* Método de geração de um novo par de chaves de criptografia */
  public static generateKeyPair(): void {
    let { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: EncryptionService.CNST_ALGORITHM,
        passphrase: '12345'
      }
    });
    
    //Grava as novas chaves de criptografia dentro do Agent
    fs.writeFileSync(CNST_FILE_KEY_PUBLIC_AGENT, publicKey);
    fs.writeFileSync(CNST_FILE_KEY_PRIVATE_AGENT, privateKey);
  }
  
  /* Método de criptografia de um texto */
  public static encrypt(text: string): string {
    let cipher: any = crypto.createCipheriv(EncryptionService.CNST_ALGORITHM, EncryptionService.CNST_KEY_AGENT_2, EncryptionService.IV);
    let encrypted: string = cipher.update(text, EncryptionService.CNST_FILE_ENCODING_INPUT, EncryptionService.CNST_FILE_ENCODING_OUTPUT);
    encrypted += cipher.final(EncryptionService.CNST_FILE_ENCODING_OUTPUT);
    return encrypted;
  }
  
  /* Método de descriptografia de um texto */
  public static decrypt(text: string): string {
    let decipher: any = crypto.createDecipheriv(EncryptionService.CNST_ALGORITHM, EncryptionService.CNST_KEY_AGENT, EncryptionService.IV);
    let decrypted: string = decipher.update(text, EncryptionService.CNST_FILE_ENCODING_OUTPUT, EncryptionService.CNST_FILE_ENCODING_INPUT);
    decrypted += decipher.final(EncryptionService.CNST_FILE_ENCODING_INPUT);
    return decrypted;
  }
}
