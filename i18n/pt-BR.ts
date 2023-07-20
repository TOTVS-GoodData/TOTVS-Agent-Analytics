export const CNST_TRANSLATIONS_PT_BR: any = {
  MENU: {
    WORKSPACES: 'Ambientes',
    DATABASES: 'Bancos de Dados',
    SCHEDULES: 'Agendamentos',
    QUERIES: 'Consultas (Queries)',
    SCRIPTS: 'Rotinas (Scripts)',
    MONITOR: 'Monitor',
    CONFIGURATION: 'Configurações',
    EXIT: 'Sair'
  },
  BUTTONS: {
    SAVE: 'Salvar',
    ADD: 'Adicionar',
    EDIT: 'Editar',
    DELETE: 'Apagar',
    CONFIRM: 'Confirmar',
    GO_BACK: 'Voltar',
    DETAILS: 'Detalhes',
    EXECUTE: 'Executar',
    NEW_PARAMETER: 'Novo parâmetro',
    YES_SIMPLIFIED: 'S',
    NO_SIMPLIFIED: 'N',
    TEST_CONNECTION: 'Testar Conexão'
  },
  WORKSPACES: {
    TITLE: 'Cadastro de Ambientes',
    DELETE_CONFIRMATION: ' Deseja realmente excluir este ambiente?',
    MESSAGES: {
      LOADING: 'Carregando ambientes...',
      LOADING_ERROR: 'Erro - Um erro inesperado ocorreu. Por favor tente novamente.'
    },
    TABLE: {
      WORKSPACE: 'Ambiente',
      GRAPH: 'Graph',
      DATABASE: 'Banco de dados',
      CONTRACT_TYPE: 'Contratação'
    }
  },
  DATABASES: {
    TITLE: 'Cadastro de Bancos de Dados',
    NEW_DATABASE: 'Cadastrar Banco de Dados',
    EDIT_DATABASE: 'Alterar Banco de Dados',
    DELETE_CONFIRMATION: ' Deseja realmente excluir este banco de dados?',
    TABLE: {
      NAME: 'Nome da configuração',
      TYPE: 'Tipo de banco de dados',
      DRIVER_CLASS: 'Classe do driver',
      DRIVER_PATH: 'Caminho do driver',
      HOST_TYPE: 'Tipo de host',
      HOST_NAME: 'Endereço IP',
      PORT: 'Porta',
      DATABASE: 'Banco de dados',
      SID: 'SID',
      SERVICE_NAME: 'Nome do serviço',
      INSTANCE: 'Instância do banco de dados',
      CONNECTION_STRING: 'String de conexão final',
      USERNAME: 'Usuário',
      PASSWORD: 'Senha'
    },
    MESSAGES: {
      LOADING: 'Carregando bancos de dados...',
      LOADING_OK: 'Bancos de dados carregados.',
      LOADING_ERROR: 'Um erro inesperado ocorreu. Por favor tente novamente.',
      SAVE: 'Gravando banco de dados: ${p1}',
      SAVE_OK: 'Banco de dados salvo com sucesso!',
      SAVE_ERROR: 'Um erro inesperado ocorreu ao salvar o banco de dados ${p1}. Por favor tente novamente.',
      DELETE: 'Apagando banco de dados: ${p1}',
      DELETE_OK: 'Banco de dados apagado com sucesso!',
      DELETE_ERROR: 'Um erro inesperado ocorreu ao apagar o banco de dados ${p1}. Por favor tente novamente.',
      DELETE_ERROR_WORKSPACES: 'Erro - Não foi possível apagar este banco de dados, pois existem ambientes atrelados á ele.',
      LOGIN: 'Testando conexão com o banco de dados: ${p1}',
      LOGIN_OK: 'Conexão efetuada com sucesso!',
      LOGIN_ERROR: 'A conexão com o banco de dados ${p1} falhou. Verifique se as informações digitadas estão corretas.',
      LOGIN_WARNING: 'Aviso - Conexões a banco de dados não podem ser testadas sem o electron.',
      VALIDATE: 'Validando informações do banco de dados...',
      ERROR_INVALID_IP: 'Erro - Endereço IP inválido. Verifique o tipo informado (ipv4 / ipv6 / hostname) e se o preenchimento está correto.',
      ERROR_INVALID_PORT: 'Erro - Porta do banco de dados inválida. Verifique se a porta está no range permitido (1024 - 65536).',
      PASSWORD_ENCRYPT: 'Criptografando senhas...',
    }
  },
  SCHEDULES: {
    TITLE: 'Configurações dos Agendamentos',
    NEW_SCHEDULE: 'Cadastrar Agendamento',
    EDIT_SCHEDULE: 'Editar Agendamento',
    NOT_FOUND: 'Nenhum agendamento encontrado.',
    DELETE_CONFIRMATION: 'Deseja realmente excluir este agendamento?',
    TABLE: {
      NAME: 'Nome do agendamento',
      WORKSPACE: 'Ambiente',
      WINDOWS: 'Janelas de execução',
      ENABLED: 'Habilitado?',
      ZIP_FILENAME: 'Nome do arquivo compactado',
      ZIP_EXTENSION: 'Algoritmo de compactação',
      FILE_FOLDER: 'Pasta p/ upload',
      FILE_WILDCARD: 'Formato válido',
      LAST_EXECUTION: 'Última execução',
      SQL_PARAMETERS: {
        TITLE: 'Parâmetros SQL',
        DESCRIPTION: 'Parâmetros das consultas / rotinas de extração',
        TABLE: {
          NAME: 'Nome',
          VALUE: 'Valor',
          SQL: 'SQL (S/N)?'
        }
      },
      ETL_PARAMETERS: {
        TITLE: 'Parâmetros ETL',
        DESCRIPTION: 'Parâmetros das consultas do ETL (CloudConnect / Bricks)',
        TABLE: {
          NAME: 'Nome',
          VALUE: 'Valor'
        }
      }
    },
    MESSAGES: {
      LOADING: 'Carregando agendamentos...',
      LOADING_OK: 'Agendamentos carregados.',
      LOADING_ERROR: 'Erro - Um erro inesperado ocorreu. Por favor tente novamente.',
      ID_LOADING: 'Carregando agendamento de código ${p1}...',
      ID_LOADING_OK: 'Agendamento carregado.',
      ID_LOADING_ERROR: 'Erro - Um erro inesperado ocorreu ao carregar o agendamento de código ${p1}. Por favor tente novamente.',
      SAVE: 'Gravando agendamento: ${p1}',
      SAVE_OK: 'Agendamento cadastrado com sucesso!',
      SAVE_ERROR: 'Erro - Um erro inesperado ocorreu ao salvar o agendamento ${p1}. Por favor tente novamente.',
      DELETE: 'Apagando agendamento: ${p1}',
      DELETE_OK: 'Agendamento apagado!',
      DELETE_ERROR: 'Erro - Um erro inesperado ocorreu ao apagar o agendamento ${p1}. Por favor tente novamente.',
      TRIGGERSCHEDULES_LOADING: 'Verificando agendamentos: [${p1}]',
      TRIGGERSCHEDULES_OK: 'Inicialização concluída. Disparando agendamentos...',
      TRIGGERSCHEDULES_ERROR: 'Erro - Falha no disparo automático de agendamentos.',
      RUN: 'Solicitando execução do agendamento: ${p1}',
      RUN_MANUAL: 'Execução do agendamento \'${p1}\' solicitado manualmente pelo usuário',
      RUN_OK: 'Execução do agendamento solicitado com sucesso. Verifique a execução do mesmo pela opção \'Monitor\' do menu.',
      RUN_EXECUTIONDATE: 'Gravando nova data de última execução do agendamento: ${p1}',
      RUN_ERROR: 'Erro - Um erro inesperado ocorreu ao solicitar a execução do agendamento ${p1}. Por favor tente novamente.',
      RUN_PREPARE: 'Preparando informações para envio ao java...',
      RUN_WARNING: 'Aviso - Execução de agendamentos não podem ser testados sem o Electron.'
    }
  },
  QUERIES: {
    TITLE: 'Cadastro de consultas (Queries)',
    IMPORT_QUERIES: 'Importar consultas FAST',
    NEW_QUERY: 'Nova consulta',
    EDIT_QUERY: 'Editar consulta',
    DELETE_CONFIRMATION: 'Deseja realmente excluir esta consulta?',
    TABLE: {
      SCHEDULE_NAME: 'Nome do agendamento',
      QUERY_NAME: 'Nome da consulta',
      MODE: 'Modo de execução',
      SQL: 'Comando SQL'
    },
    MESSAGES: {
      LOADING: 'Carregando consultas...',
      LOADING_OK: 'Consultas carregadas.',
      LOADING_ERROR: 'Erro - Um erro inesperado ocorreu. Por favor tente novamente.',
      SCHEDULE_LOADING: 'Carregando consultas do agendamento: \'${p1}\'',
      SCHEDULE_LOADING_OK: 'Consultas carregadas.',
      SCHEDULE_LOADING_ERROR: 'Erro - Um erro inesperado ocorreu. Por favor tente novamente.',
      SAVE: 'Gravando consulta: \'${p1}\'',
      SAVE_OK: 'Consulta salva com sucesso!',
      SAVE_ERROR: 'Erro - Um erro inesperado ocorreu ao salvar a consulta \'${p1}\'. Por favor tente novamente.',
      DELETE: 'Apagando consulta: \'${p1}\'',
      DELETE_OK: 'Consulta apagada com sucesso!',
      DELETE_ERROR: 'Erro - Um erro inesperado ocorreu ao apagar a consulta \'${p1}\'. Por favor tente novamente.',
      EXPORT: 'Exportando consultas...',
      EXPORT_OK: 'Exportação de consultas concluída com sucesso.',
      EXPORT_ERROR: 'Erro - Um erro inesperado ocorreu. Por favor tente novamente.',
      EXPORT_WARNING: 'Aviso - O agendamento \'${p1}\' já possui todas as consultas padrões cadastradas.',
      EXPORT_STANDARD: 'Extraindo consultas padrões do FAST.',
      EXPORT_STANDARD_OK: 'Consultas padrões do FAST carregadas com sucesso.',
      EXPORT_STANDARD_WARNING: 'Aviso - Consultas padrões não encontradas para este agendamento.',
      EXPORT_SAVE: 'Gravando consultas padrões do FAST no agendamento: \'${p1}\'.',
      EXPORT_SAVE_ERROR: 'Erro - Um erro inesperado ocorreu ao gravar as consultas padrões no agendamento \'${p1}\'. Por favor tente novamente.',
      EXPORT_I01: 'Exportação de consultas da tabela I01 do Protheus ativada.',
      EXPORT_I01_PREPARE: 'Preparando informações para envio ao java...',
      EXPORT_I01_WARNING: 'Aviso - Exportação de consultas da tabela I01 não pode ser testada sem o electron.',
      EXPORT_I01_ERROR_NOTPROTHEUS: 'Erro - Exportação de consultas da tabela I01 só é suportada para o ERP Protheus.',
      ENCRYPT: 'Criptografando consulta: ${p1}',
      VALIDATE: 'Validando consulta...'
    }
  },
  SCRIPTS: {
    TITLE: 'Cadastro de Rotinas (Scripts)',
    IMPORT_SCRIPTS: 'Importar rotinas FAST',
    NEW_SCRIPT: 'Nova Rotina',
    EDIT_SCRIPT: 'Editar Rotina',
    DELETE_CONFIRMATION: 'Deseja realmente excluir esta rotina?',
    TABLE: {
      SCHEDULE_NAME: 'Nome do agendamento',
      SCRIPT_NAME: 'Nome da rotina',
      SQL: 'Comando SQL'
    },
    MESSAGES: {
      LOADING: 'Carregando rotinas...',
      LOADING_OK: 'Rotinas carregadas.',
      LOADING_ERROR: 'Erro - Um erro inesperado ocorreu. Por favor tente novamente.',
      SCHEDULE_LOADING: 'Carregando rotinas do agendamento: \'${p1}\'',
      SCHEDULE_LOADING_OK: 'Rotinas carregadas.',
      SCHEDULE_LOADING_ERROR: 'Erro - Um erro inesperado ocorreu. Por favor tente novamente.',
      SAVE: 'Gravando rotina: \'${p1}\'',
      SAVE_OK: 'Rotina salva com sucesso!',
      SAVE_ERROR: 'Erro - Um erro inesperado ocorreu ao salvar a rotina \'${p1}\'. Por favor tente novamente.',
      DELETE: 'Apagando rotina: \'${p1}\'',
      DELETE_OK: 'Rotina apagada com sucesso!',
      DELETE_ERROR: 'Erro - Um erro inesperado ocorreu ao apagar a rotina \'${p1}\'. Por favor tente novamente.',
      EXPORT: 'Exportando rotinas...',
      EXPORT_OK: 'Exportação de rotinas concluída com sucesso.',
      EXPORT_ERROR: 'Erro - Um erro inesperado ocorreu. Por favor tente novamente.',
      EXPORT_WARNING: 'Aviso - O agendamento \'${p1}\' já possui todas as rotinas padrões cadastradas.',
      EXPORT_STANDARD: 'Extraindo rotinas padrões do FAST.',
      EXPORT_STANDARD_OK: 'Rotinas padrões do FAST carregadas com sucesso.',
      EXPORT_STANDARD_WARNING: 'Aviso - Rotinas padrões não encontradas para este agendamento.',
      EXPORT_SAVE: 'Gravando rotinas padrões do FAST no agendamento: \'${p1}\'.',
      EXPORT_SAVE_ERROR: 'Erro - Um erro inesperado ocorreu ao gravar as rotinas padrões no agendamento \'${p1}\'. Por favor tente novamente.',
      ENCRYPT: 'Criptografando rotina: \'${p1}\'',
      VALIDATE: 'Validando rotina...'
    }
  },
  MONITOR: {
    TITLE: 'Monitor de Execução',
    TABLE: {
      STATUS: 'Status',
      SCHEDULE: 'Agendamento',
      START_DATE: 'Data/hora de início',
      FINAL_DATE: 'Data/hora de término',
      EXECUTION_TIME: 'Tempo de execução',
      DETAILS: {
        TIMESTAMP: 'Data/Hora',
        LEVEL: 'Nível',
        SOURCE: 'Origem',
        MESSAGE: 'Mensagem'
      },
      EXECUTION_STATUS: {
        DONE: 'Concluído',
        RUNNING: 'Em execução',
        CANCELED: 'Cancelado',
        ERROR: 'Erro'
      }
    },
    MESSAGES: {
      WARNING: 'Aviso - Monitoramento de logs não pode ser testado sem o Electron.'
    }
  },
  CONFIGURATION: {
    TITLE: 'Configuração do ${p1}',
    APPLICATION: 'Aplicação',
    JAVA: 'Java',
    VERSION: 'Versão',
    DEBUGMODE_ON: 'Modo de depuração: Ativado',
    DEBUGMODE_OFF: 'Modo de depuração: Desativado',
    LOGFILES_TO_KEEP: 'Número mínimo, em dias, de arquivos de log para serem mantidos',
    JAVA_XMS: 'Alocação de memória inicial (em MB)',
    JAVA_XMX: 'Alocação de memória máxima (em MB)',
    JAVA_TMPDIR: 'Diretório de arquivos temporários',
    MESSAGES: {
      LOADING: 'Carregando configurações...',
      LOADING_OK: 'Configurações carregadas.',
      LOADING_ERROR: 'Erro - Um erro inesperado ocorreu. Por favor tente novamente.',
      VALIDATE: 'Validando configuração...',
      SAVE: 'Gravando configuração...',
      SAVE_ERROR: 'Erro - Um erro inesperado ocorreu. Por favor tente novamente.',
      SAVE_OK: 'Configuração atualizada com sucesso!',
    }
  },
  FORM_ERRORS: {
    FIELD_NOT_FILLED: 'Erro - Campo obrigatório \'${p1}\' não preenchido.',
    FOLDER_SELECT_WARNING: 'Aviso - Seleção de diretórios não podem ser testados sem o Electron.',
    ONLY_YES_OR_NO: 'Erro - Os parâmetros SQL só podem ser do tipo \'S\' ou \'N\'. Por favor, verifique o preenchimento dos mesmos.'
  }
}