export const CNST_JAVA_MESSAGES: any = {
   JAVA_LOADING: 'Carregando configurações do java...'
  ,JAVA_LOADING_OK: 'Configurações carregadas.'
  ,JAVA_LOADING_ERROR: 'Um erro inesperado ocorreu. Por favor tente novamente.'
  ,JAVA_SAVE: (s: string) => `Gravando configuração do java: ${s}`
  ,JAVA_SAVE_OK: 'Configuração do java cadastrada com sucesso!'
  ,JAVA_SAVE_ERROR: (s: string) => `Um erro inesperado ocorreu ao salvar a configuração ${s}. Por favor tente novamente.`
  ,JAVA_DELETE: (s: string) => `Apagando configuração do java: ${s}`
  ,JAVA_DELETE_OK: 'Configuração do java apagada com sucesso!'
  ,JAVA_DELETE_ERROR: (s: string) => `Um erro inesperado ocorreu ao apagar a configuração ${s}. Por favor tente novamente.`
};