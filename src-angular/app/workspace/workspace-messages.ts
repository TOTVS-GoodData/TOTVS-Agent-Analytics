export const CNST_WORKSPACE_MESSAGES: any = {
   WORKSPACE_LOADING: 'Carregando ambientes...'
  ,WORKSPACE_LOADING_OK: 'Ambientes carregados.'
  ,WORKSPACE_LOADING_ERROR: 'Um erro inesperado ocorreu. Por favor tente novamente.'
  ,WORKSPACE_LOADING_DATABASES: (s: string) => `Carregando ambientes pertencentes ao banco de dados ${s}...`
  ,WORKSPACE_LOADING_DATABASES_OK: 'Ambientes carregados.'
  ,WORKSPACE_LOADING_DATABASES_ERROR: 'Um erro inesperado ocorreu. Por favor tente novamente.'
  ,WORKSPACE_SAVE: (s: string) => `Gravando ambiente: ${s}`
  ,WORKSPACE_SAVE_OK: 'Ambiente salvo com sucesso!'
  ,WORKSPACE_SAVE_ERROR: (s: string) => `Um erro inesperado ocorreu ao salvar o ambiente ${s}. Por favor tente novamente.`
  ,WORKSPACE_DELETE: (s: string) => `Apagando ambiente: ${s}`
  ,WORKSPACE_DELETE_OK: 'Ambiente apagado com sucesso!'
  ,WORKSPACE_DELETE_ERROR: (s: string) => `Um erro inesperado ocorreu ao apagar o ambiente ${s}. Por favor tente novamente.`
};