export const CNST_TRANSLATIONS_PT_BR: any = {
  ELECTRON: {
    SYSTEM_START: '=== INICIALIZAÇÃO DO SISTEMA ===',
    SYSTEM_FINISH: '=== DESLIGAMENTO DO SISTEMA ===',
    SYSTEM_WINDOW_CLOSE: '=== Janela fechada ===',
    SYSTEM_SERVICE: '=== Executando aplicação pelo backend... ===',
    UPDATE_CHECK: 'Verificando atualizações...',
    UPDATE_AVAILABLE: 'Atualização disponível: ${p1} --> ${p2}',
    UPDATE_NOT_AVAILABLE: 'Nenhuma atualização do Agent disponível (${p1})',
    UPDATE_ERROR: 'Falha no download do pacote de atualização.',
    AUTOLAUNCH_ERROR: 'Falha na configuração da inicialização automática do Agent.',
    THREAD_ERROR: 'ERRO - ${p1} já está em execução. Esta instância será encerrada.',
    UPDATE_DOWNLOAD: 'Baixando atualização: ${p1} (${p2}) -- vel: ${p3}',
    UPDATE_DOWNLOAD_OK: 'Atualização ${p1} baixada com sucesso. A instalação automática ocorrerá após desligamento do Agent.',
    TRAY_OPEN_INTERFACE: 'Abrir interface',
    TRAY_FINISH_PROCESS: 'Encerrar processo',
    FOLDER_SELECT: 'Selecione o diretório.',
    DATABASE_DEVELOPMENT: 'Utilizando banco de desenvolvimento.',
    DATABASE_PRODUCTION: 'Utilizando banco de produção.',
    DATABASE_CREATE: 'Nova instalação detectada. Criando novo banco vazio.',
    DATABASE_CREATE_OK: 'Banco criado com sucesso.',
    DELETE_OLD_LOGS: 'Apagando arquivos de logs antigos.',
    DELETE_OLD_LOGS_OK: 'Arquivos de log antigos apagados com sucesso.',
    DATABASE_LOGIN_ELEC_START: 'Solicitando teste de conexão ao java...',
    DATABASE_LOGIN_ELEC_FINISH: 'Teste de conexão do java finalizado. Status de execução: ${p1}',
    EXPORT_QUERY_ELEC_START: 'Solicitando exportação de consultas da tabela I01 ao java...',
    EXPORT_QUERY_ELEC_FINISH: 'Exportação de consultas da tabela I01 finalizada. Status de execução: ${p1}',
    RUN_AGENT_ELEC_START: 'Solicitando extração de dados ao java...',
    RUN_AGENT_ELEC_FINISH: 'Extração dos dados finalizada. Status de execução: ${p1}',
    PROCESS_KILL: 'Forçando término imediato do processo [Ag: ${p1} - Exec: ${p2}]...',
    PROCESS_KILL_OK: 'Processo [Ag: ${p1} - Exec: ${p2}] terminado com sucesso.',
    PROCESS_KILL_WARN: 'Aviso - O processo a ser terminado [Ag: ${p1}, Exec: ${p2}] não está mais em execução.',
    PROCESS_KILL_ERROR: 'Erro - Não foi possível forçar a interrupção do processo [Ag: ${p1}, Exec: ${p2}].',
    JAVA_EXECUTION_START: '===Início da execução do Agent: (.*)===',
    JAVA_EXECUTION_END: '===Término da execução do Agent: (.*)===',
    JAVA_EXECUTION_DURATION: '===Tempo total de execução do Agent: (.*)===',
    JAVA_EXECUTION_CANCELLED: '===Execução cancelada via pedido do usuário==='
  },
  ANGULAR: {
    SYSTEM_EXIT: 'Tem certeza que deseja sair do Agent?',
    SYSTEM_FINISH_USER: '=== Desligamento solicitado pelo usuário (menu manual) ===',
    SYSTEM_FINISH_USER_WARNING: 'Aviso - Desligamento do sistema não pode ser testado sem o electron.',
    OTHER: 'Outro',
    NONE: 'Nenhum'
  },
  SERVICES: {
    GOODDATA: {
      MESSAGES: {
        LOADING: 'Fazendo login na plataforma GoodData...',
        LOADING_ERROR: 'Falha no login. Por favor, verifique seu usuário / senha.',
        LOADING_WORKSPACES: 'Login bem sucedido. Carregando ambientes...',
        LOADING_WORKSPACES_OK: 'Ambientes carregados com sucesso!',
        LOADING_WORKSPACES_ERROR: 'Não foi possível se conectar ao GoodData. Verifique sua conexão e tente novamente.',
        LOADING_PROCESSES: 'Carregando processos de ETL...',
        LOADING_PROCESSES_ERROR: 'Não foi possível se conectar ao GoodData. Verifique sua conexão e tente novamente.'
      }
    }
  },
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
  LANGUAGES: {
    TITLE: 'Idioma da aplicação',
    en_US: 'Inglês',
    pt_BR: 'Português',
    es_ES: 'Espanhol'
  },
  CONTRACT_TYPES: {
    PLATFORM: 'Plataforma GoodData',
    DEMO: 'Demonstração'
  },
  SOURCES: {
    LOCALLY: 'Local',
    CLOUD_OTHERS: 'Cloud (Outro)'
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
    TEST_CONNECTION: 'Testar Conexão',
    LOAD_WORKSPACES: 'Carregar Ambientes'
  },
  WORKSPACES: {
    TITLE: 'Cadastro de Ambientes',
    NEW_WORKSPACE: 'Cadastrar Ambiente',
    EDIT_WORKSPACE: 'Alterar Ambiente',
    DELETE_CONFIRMATION: ' Deseja realmente excluir este ambiente?',
    SECTIONS: {
      1: '1 / 4 - Informações comerciais',
      2: '2 / 4 - Informações da plataforma GoodData',
      3: '3 / 4 - Informações do banco de dados',
      4: '4 / 4 - Configurações finais'
    },
    MESSAGES: {
      LOADING: 'Carregando ambientes...',
      LOADING_OK: 'Ambientes carregados.',
      LOADING_ERROR: 'Erro - Um erro inesperado ocorreu. Por favor tente novamente.',
      LOADING_DATABASES: 'Carregando ambientes pertencentes ao banco de dados ${p1}...',
      LOADING_DATABASES_OK: 'Ambientes carregados.',
      LOADING_DATABASES_ERROR: 'Um erro inesperado ocorreu. Por favor tente novamente.',
      SAVE: 'Gravando ambiente: ${p1}',
      SAVE_OK: 'Ambiente salvo com sucesso!',
      SAVE_ERROR: 'Um erro inesperado ocorreu ao salvar o ambiente ${p1}. Por favor tente novamente.',
      SAVE_ERROR_SAME_NAME: 'Erro - O ambiente \'${p1}\' não pôde ser salvo, pois já existe um ambiente cadastrado com este nome.',
      DELETE: 'Apagando ambiente: ${p1}',
      DELETE_OK: 'Ambiente apagado com sucesso!',
      DELETE_ERROR: 'Um erro inesperado ocorreu ao apagar o ambiente ${p1}. Por favor tente novamente.',
      VALIDATE: 'Validando informações do ambiente...',
      PASSWORD_ENCRYPT: 'Criptografando senha...',
    },
    TABLE: {
      CONTRACT_TYPE: 'Modalidade de contratação',
      CUSTOMER_CODE: 'Código T do cliente',
      ERP: 'ERP',
      MODULE: 'Módulo',
      SOURCE: 'Origem dos dados',
      USERNAME: 'Usuário',
      ENVIRONMENT: 'Domínio',
      PASSWORD: 'Senha',
      WORKSPACE: 'Ambiente',
      UPLOAD_URL: 'URL p/ upload do arquivo',
      PROCESS: 'Processo de ETL',
      GRAPH: 'Graph',
      DATABASE: 'Banco de dados',
      NAME: 'Nome desta configuração'
    },
    TOOLTIPS: {
      CONTRACT_TYPE: 'Tipo de contratação adquirida pelo cliente.',
      CUSTOMER_CODE: 'Código do cliente TOTVS que adquiriu o GoodData. Caso não conheça este código, entre em contato com seu representante comercial (ESN).',
      ENVIRONMENT: 'Nome do dominio da plataforma GoodData.',
      USERNAME: 'Nome do usuario da plataforma GoodData. Este usuario já deve ter uma conta no GoodData, e ser um administrador do ambiente.',
      PASSWORD: 'Senha do usuário.',
      WORKSPACE: 'Selecione o ambiente de GoodData para onde os dados vão ser enviados.',
      UPLOAD_URL: 'Caminho do servidor FTP / WebDAV do GoodData, onde os dados vão ser enviados pelo Agent.',
      PROCESS: 'Selecione o nome do processo de ETL (CloudConnect / Bricks) que irá processar os dados enviados.',
      GRAPH: 'Selecione o nome do graph principal do CloudConnect, onde o processo de ETL irá começar.'
    }
  },
  DATABASES: {
    TITLE: 'Cadastro de Bancos de Dados',
    NEW_DATABASE: 'Cadastrar Banco de Dados',
    EDIT_DATABASE: 'Alterar Banco de Dados',
    DELETE_CONFIRMATION: ' Deseja realmente excluir este banco de dados?',
    CONNECTION_STRING: {
      IP_ADDRESS: '<ENDERECO_IP>',
      PORT: '<PORTA>',
      DATABASE_NAME: '<NOME_DO_BANCO>',
      SERVICE_NAME: '<NOME_DO_SERVIÇO>',
      SID: '<SID>'
    },
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
      SAVE_ERROR_SAME_NAME: 'Erro - O banco de dados \'${p1}\' não pôde ser salvo, pois já existe um banco cadastrado com este nome.',
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
    },
    TOOLTIPS: {
      DRIVER_CLASS: 'Nome da classe Java principal do driver. Este nome pode ser encontrado através de programas de conexão à bancos de dados (IDEs).',
      DRIVER_PATH: 'Caminho completo do driver JDBC de conexão do banco de dados. Este arquivo deve possuir a extensão ".jar".',
      HOST_TYPE: 'Tipo de endereço IP: "Ipv4": Formato "255.255.255.255". "Ipv6": Formato "FF:FF:...:FF". "Hostname": Informar o nome da máquina.',
      HOST_NAME: 'Informe o endereço IP da máquina em que o banco de dados está localizado.',
      PORT: 'Informe a porta de conexão ao banco de dados. Este valor deve estar entre 1024 e 65535.',
      CONNECTION_STRING: 'Comando final para conexão ao banco de dados. Este comando será utilizado pelo Agent ao tentar se conectar ao banco de dados.'
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
      VALIDATE: 'Validando agendamento...',
      SAVE: 'Gravando agendamento: ${p1}',
      SAVE_OK: 'Agendamento cadastrado com sucesso!',
      SAVE_ERROR: 'Erro - Um erro inesperado ocorreu ao salvar o agendamento ${p1}. Por favor tente novamente.',
      SAVE_ERROR_SAME_NAME: 'Erro - O agendamento \'${p1}\' não pôde ser salvo, pois já existe um agendamento cadastrado com este nome.',
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
    },
    TOOLTIPS: {
      WINDOWS: 'Informe em quais horários o Agent deverá executar este agendamento, de maneira diária.',
      ZIP_FILENAME: 'Nome do arquivo compactado a ser enviado ao GoodData. Este arquivo conterá todos os dados extraídos por este agendamento.',
      FILE_FOLDER: 'Diretório a ser enviado para o GoodData. Todos os arquivos deste diretório serão incluídos na carga dos dados.',
      FILE_WILDCARD: 'Utilize este campo para filtrar alguns arquivos do diretório a ser enviado ao GoodData. Exemplo: Para enviar apenas arquivos em Excel, com qualquer nome, escreva: *.xlsx. Caso não haja restrições, escreva: *.*'
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
    EXECUTION_MODES: {
      COMPLETE: 'Completa',
      MONTHLY: 'Mensal'
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
      SAVE_ERROR_SAME_NAME: 'Erro - A consulta \'${p1}\' não pôde ser salva, pois já existe uma consulta cadastrada com este nome.',
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
    },
    TOOLTIPS: {
      QUERY_NAME: 'Nome da consulta. Este nome será mostrado nos arquivos de log do Agent.',
      MODE: 'Modo de execução da consulta: "Completa" - O Agent irá executar a consulta uma única vez, substituindo os parâmetros do agendamento dentro do comando SQL da mesma. "Mensal" - O Agent irá executar a consulta mês a mês, utilizando novos parâmetros START_DATE e FINAL_DATE de acordo com a janela do agendamento. Exemplo: Se o agendamento for executado para os últimos 3 meses, o Agent irá executar esta consulta três vezes, uma vez para cada mês.'
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
      SAVE_ERROR_SAME_NAME: 'Erro - A rotina \'${p1}\' não pôde ser salva, pois já existe uma rotina cadastrada com este nome.',
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
    },
    TOOLTIPS: {
      SCRIPT_NAME: 'Nome da rotina a ser executada. Este nome será mostrado nos logs de execução do Agent.'
    }
  },
  MONITOR: {
    TITLE: 'Monitor de Execução',
    TABLE: {
      STATUS: 'Status',
      LINES: 'Linhas',
      SCHEDULE: 'Agendamento',
      START_DATE: 'Data/hora de início',
      FINAL_DATE: 'Data/hora de término',
      EXECUTION_TIME: 'Tempo de execução',
      DETAILS: {
        TITLE: 'Detalhes da execução',
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
      WARNING: 'Aviso - Monitoramento de logs não pode ser testado sem o Electron.',
      KILL_PROCESS_TITLE: 'Tem certeza que deseja terminar a execução deste agendamento?'
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
    JAVA_XMX: 'Alocação de memória máxima (em MB)',
    JAVA_TMPDIR: 'Diretório de arquivos temporários',
    JAVA_JREDIR: 'Diretório da JRE do Java',
    MESSAGES: {
      LOADING: 'Carregando configurações...',
      LOADING_OK: 'Configurações carregadas.',
      LOADING_ERROR: 'Erro - Um erro inesperado ocorreu. Por favor tente novamente.',
      VALIDATE: 'Validando configuração...',
      SAVE: 'Gravando configuração...',
      SAVE_ERROR: 'Erro - Um erro inesperado ocorreu. Por favor tente novamente.',
      SAVE_OK: 'Configuração atualizada com sucesso!',
    },
    TOOLTIPS: {
      LOGFILES: 'Número máximo, em dias, de arquivos de log a serem mantidos pelo Agent. O Agent irá apagar automaticamente os arquivos de log mais antigos do que este parâmetro.',
      JAVA_XMX: 'Alocação máxima de memória RAM (MB - Megabytes) que o Agent pode utilizar ao executar agendamentos. Caso a memória não seja suficiente, o Agent irá finalizar a execução, com uma mensagem de erro.',
      JAVA_TMPDIR: 'Diretório temporário, usado pelo Agent para guardar os arquivos antes de enviá-los para o GoodData. Selecione um diretório que pode ser completamente apagado, caso necessário.',
      JAVA_JREDIR: 'Diretório ./bin, onde estão os arquivos binários da JRE do Java. Caso não seja informado, o Agent irá procurar o Java nas variáveis de ambiente do sistema.'
    }
  },
  FORM_ERRORS: {
    FIELD_NOT_FILLED: 'Erro - Campo obrigatório \'${p1}\' não preenchido.',
    FIELD_NOT_FILLED_GRAPH: 'Erro - Campo obrigatório  \'${p1}\' não preenchido. Por favor selecione um graph para ser executado, ou remova a seleção do campo de processo de ETL.',
    FOLDER_SELECT_WARNING: 'Aviso - Seleção de diretórios não podem ser testados sem o Electron.',
    ONLY_YES_OR_NO: 'Erro - Os parâmetros SQL só podem ser do tipo \'S\' ou \'N\'. Por favor, verifique o preenchimento dos mesmos.'
  }
}