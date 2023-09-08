//Porta que hospeda a API do Angular, usada para cadastro das informações do Agent (Apenas em modo de desenv.)
export const CNST_LOCALHOST_PORT: number = 3000;

//Níveis de resposta do sistema (Angular / Electron / Java)
export const CNST_SYSTEMLEVEL: any = {
   ANGL: '[ANGL]'
  ,ELEC: '[ELEC]'
  ,JAVA: '[JAVA]'
};

//Níveis de resposta dos logs
export const CNST_LOGLEVEL: any = {
   ERROR: { tag: '[ERROR]', level: 0 }
  ,WARN:  { tag: '[WARN ]', level: 1 }
  ,INFO:  { tag: '[INFO ]', level: 2 }
  ,DEBUG: { tag: '[DEBUG]', level: 5 }
};