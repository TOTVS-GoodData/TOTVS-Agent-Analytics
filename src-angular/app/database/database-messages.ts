export const CNST_DATABASE_MESSAGES: any = {
   DATABASE_LOADING: 'Carregando bancos de dados...'
  ,DATABASE_LOADING_OK: 'Bancos de dados carregados.'
  ,DATABASE_LOADING_ERROR: 'Um erro inesperado ocorreu. Por favor tente novamente.'
  ,DATABASE_SAVE: (s: string) => `Gravando banco de dados: ${s}`
  ,DATABASE_SAVE_OK: 'Banco de dados salvo com sucesso!'
  ,DATABASE_SAVE_ERROR: (s: string) => `Um erro inesperado ocorreu ao salvar o banco de dados ${s}. Por favor tente novamente.`
  ,DATABASE_DELETE: (s: string) => `Apagando banco de dados: ${s}`
  ,DATABASE_DELETE_OK: 'Banco de dados apagado com sucesso!'
  ,DATABASE_DELETE_ERROR: (s: string) => `Um erro inesperado ocorreu ao apagar o banco de dados ${s}. Por favor tente novamente.`
  ,DATABASE_LOGIN: (s: string) => `Testando conexão com o banco de dados: ${s}`
  ,DATABASE_LOGIN_OK: 'Conexão efetuada com sucesso!'
  ,DATABASE_LOGIN_ERROR: (s: string) => `A conexão com o banco de dados ${s} falhou. Verifique se as informações digitadas estão corretas.`
  ,DATABASE_LOGIN_WARNING: 'Aviso - Conexões a banco de dados não podem ser testadas sem o electron.'
};