export const CNST_QUERY_MESSAGES: any = {
   QUERY_LOADING: 'Carregando consultas...'
  ,QUERY_LOADING_OK: 'Consultas carregadas.'
  ,QUERY_LOADING_ERROR: 'Um erro inesperado ocorreu. Por favor tente novamente.'
  ,QUERY_SCHEDULE_LOADING: (s: string) => `Carregando consultas do agendamento: '${s}'`
  ,QUERY_SCHEDULE_LOADING_OK: 'Consultas carregadas.'
  ,QUERY_SCHEDULE_LOADING_ERROR: 'Um erro inesperado ocorreu. Por favor tente novamente.'
  ,QUERY_SAVE: (s: string) => `Gravando consulta: '${s}'`
  ,QUERY_SAVE_OK: 'Consulta salva com sucesso!'
  ,QUERY_SAVE_ERROR: (s: string) => `Um erro inesperado ocorreu ao salvar a consulta '${s}'. Por favor tente novamente.`
  ,QUERY_DELETE: (s: string) => `Apagando consulta: '${s}'`
  ,QUERY_DELETE_OK: 'Consulta apagada com sucesso!'
  ,QUERY_DELETE_ERROR: (s: string) => `Um erro inesperado ocorreu ao apagar a consulta '${s}'. Por favor tente novamente.`
  ,QUERY_EXPORT: 'Exportando consultas...'
  ,QUERY_EXPORT_OK: 'Exportação de consultas concluída com sucesso.'
  ,QUERY_EXPORT_ERROR: 'Um erro inesperado ocorreu. Por favor tente novamente.'
  ,QUERY_EXPORT_WARNING: (s: string) => `Aviso - O agendamento '${s}' já possui todas as consultas padrões cadastradas.`
  ,QUERY_EXPORT_STANDARD: 'Extraindo consultas padrões do FAST.'
  ,QUERY_EXPORT_STANDARD_OK: 'Consultas padrões do FAST carregadas com sucesso.'
  ,QUERY_EXPORT_STANDARD_WARNING: 'Aviso - Consultas padrões não encontradas para este agendamento.'
  ,QUERY_EXPORT_SAVE: (s: string) => `Gravando consultas padrões do FAST no agendamento: '${s}'.`
  ,QUERY_EXPORT_SAVE_ERROR: (s: string) => `Um erro inesperado ocorreu ao gravar as consultas padrões no agendamento '${s}'. Por favor tente novamente.`
  ,QUERY_EXPORT_I01: 'Exportação de consultas da tabela I01 do Protheus ativada.'
  ,QUERY_EXPORT_I01_PREPARE: 'Preparando informações para envio ao java...'
  ,QUERY_EXPORT_I01_WARNING: 'Aviso - Exportação de consultas da tabela I01 não pode ser testada sem o electron.'
  ,QUERY_EXPORT_I01_ERROR_NOTPROTHEUS: 'Exportação de consultas da tabela I01 só é suportada para o ERP Protheus.'
  ,QUERY_ENCRYPT: (s: string) => `Criptografando consulta: ${s}`
  ,QUERY_VALIDATE: 'Validando consulta...'
};