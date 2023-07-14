export const CNST_SCHEDULE_MESSAGES: any = {
   SCHEDULE_LOADING: 'Carregando agendamentos...'
  ,SCHEDULE_LOADING_OK: 'Agendamentos carregados.'
  ,SCHEDULE_LOADING_ERROR: 'Um erro inesperado ocorreu. Por favor tente novamente.'
  ,SCHEDULE_ID_LOADING: (s: string) => `Carregando agendamento de código ${s}...`
  ,SCHEDULE_ID_LOADING_OK: 'Agendamento carregado.'
  ,SCHEDULE_ID_LOADING_ERROR: (s: string) => `Um erro inesperado ocorreu ao carregar o agendamento de código ${s}. Por favor tente novamente.`
  ,SCHEDULE_SAVE: (s: string) => `Gravando agendamento: ${s}`
  ,SCHEDULE_SAVE_OK: 'Agendamento cadastrado com sucesso!'
  ,SCHEDULE_SAVE_ERROR: (s: string) => `Um erro inesperado ocorreu ao salvar o agendamento ${s}. Por favor tente novamente.`
  ,SCHEDULE_DELETE: (s: string) => `Apagando agendamento: ${s}`
  ,SCHEDULE_DELETE_OK: 'Agendamento apagado!'
  ,SCHEDULE_DELETE_ERROR: (s: string) => `Um erro inesperado ocorreu ao apagar o agendamento ${s}. Por favor tente novamente.`
  ,TRIGGERSCHEDULES_LOADING: (date: string) => `Verificando agendamentos: [${date}]`
  ,TRIGGERSCHEDULES_OK: 'Inicialização concluída. Disparando agendamentos...'
  ,TRIGGERSCHEDULES_ERROR: 'Falha no disparo automático de agendamaentos.'
  ,RUN_AGENT: (s: string) => `Solicitando execução do agendamento: ${s}`
  ,RUN_AGENT_MANUAL: (s: string) => `Execução do agendamento '${s}' solicitado manualmente pelo usuário`
  ,RUN_AGENT_OK: 'Execução do agendamento solicitado com sucesso. Verifique a execução do mesmo pela opção \'Monitor\' do menu.'
  ,RUN_AGENT_EXECUTIONDATE: (s: string) => `Gravando nova data de última execução do agendamento: ${s}`
  ,RUN_AGENT_ERROR: (s: string) => `Um erro inesperado ocorreu ao solicitar a execução do agendamento ${s}. Por favor tente novamente.`
  ,RUN_AGENT_PREPARE: 'Preparando informações para envio ao java...'
  ,RUN_AGENT_WARNING: 'Aviso - Execução de agendamentos não podem ser testados sem o Electron.'
  ,FOLDER_SELECT_WARNING: 'Aviso - Seleção de diretórios não podem ser testados sem o Electron.'
};