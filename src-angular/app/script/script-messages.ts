export const CNST_SCRIPT_MESSAGES: any = {
   SCRIPT_LOADING: 'Carregando rotinas...'
  ,SCRIPT_LOADING_OK: 'Rotinas carregadas.'
  ,SCRIPT_LOADING_ERROR: 'Um erro inesperado ocorreu. Por favor tente novamente.'
  ,SCRIPT_SCHEDULE_LOADING: (s: string) => `Carregando rotinas do agendamento: '${s}'`
  ,SCRIPT_SCHEDULE_LOADING_OK: 'Rotinas carregadas.'
  ,SCRIPT_SCHEDULE_LOADING_ERROR: 'Um erro inesperado ocorreu. Por favor tente novamente.'
  ,SCRIPT_SAVE: (s: string) => `Gravando rotina: '${s}'`
  ,SCRIPT_SAVE_OK: 'Rotina salva com sucesso!'
  ,SCRIPT_SAVE_ERROR: (s: string) => `Um erro inesperado ocorreu ao salvar a rotina '${s}'. Por favor tente novamente.`
  ,SCRIPT_DELETE: (s: string) => `Apagando rotina: '${s}'`
  ,SCRIPT_DELETE_OK: 'Rotina apagada com sucesso!'
  ,SCRIPT_DELETE_ERROR: (s: string) => `Um erro inesperado ocorreu ao apagar a rotina '${s}'. Por favor tente novamente.`
  ,SCRIPT_EXPORT: 'Exportando rotinas...'
  ,SCRIPT_EXPORT_OK: 'Exportação de rotinas concluída com sucesso.'
  ,SCRIPT_EXPORT_ERROR: 'Um erro inesperado ocorreu. Por favor tente novamente.'
  ,SCRIPT_EXPORT_WARNING: (s: string) => `Aviso - O agendamento '${s}' já possui todas as rotinas padrões cadastradas.`
  ,SCRIPT_EXPORT_STANDARD: 'Extraindo rotinas padrões do FAST.'
  ,SCRIPT_EXPORT_STANDARD_OK: 'Rotinas padrões do FAST carregadas com sucesso.'
  ,SCRIPT_EXPORT_STANDARD_WARNING: 'Aviso - Rotinas padrões não encontradas para este agendamento.'
  ,SCRIPT_EXPORT_SAVE: (s: string) => `Gravando rotinas padrões do FAST no agendamento: '${s}'.`
  ,SCRIPT_EXPORT_SAVE_ERROR: (s: string) => `Um erro inesperado ocorreu ao gravar as rotinas padrões no agendamento '${s}'. Por favor tente novamente.`
  ,SCRIPT_ENCRYPT: (s: string) => `Criptografando rotina: ${s}`
  ,SCRIPT_VALIDATE: 'Validando rotina...'
};