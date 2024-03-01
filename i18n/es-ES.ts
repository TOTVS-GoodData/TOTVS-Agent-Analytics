export const CNST_TRANSLATIONS_ES_ES: any = {
  ELECTRON: {
    SYSTEM_START: '=== SISTEMA ONLINE ===',
    SYSTEM_FINISH: '=== SISTEMA OFFLINE ===',
    SYSTEM_WINDOW_CLOSE: '=== Pantalla cerrada ===',
    SYSTEM_SERVICE: '=== Ejecutando aplicación en el backend... ===',
    UPDATE_CHECK: 'Buscando actualizaciones...',
    UPDATE_AVAILABLE: 'Actualización disponible: ${p1} --> ${p2}',
    UPDATE_NOT_AVAILABLE: 'Ninguna actualización del Agent disponible (${p1})',
    UPDATE_ERROR: 'Error - El download del paquete de actualización ha fallado.',
    UPDATE_READY_TITLE: 'Una actualización del Agent fue descargada!',
    UPDATE_READY_DESCRIPTION: '¿Cuando quieres hacer la actualización del Agent?',
    AUTOLAUNCH_ERROR: 'Error - Inicialización automatica del Agent ha fallado.',
    THREAD_ERROR: 'Error - ${p1} ya esta en ejecución. Esta instancia va cerrar.',
    UPDATE_DOWNLOAD: 'Descargando actualización: ${p1} (${p2}) -- vel: ${p3}',
    UPDATE_DOWNLOAD_OK: 'Actualización ${p1} descargada con éxito. La instalación automatica va empezar cuando cerrar el Agent.',
    TRAY_OPEN_INTERFACE: 'Abrir interfaz',
    TRAY_FINISH_PROCESS: 'Cerrar el proceso',
    FOLDER_SELECT: 'Selecciona el diretorio',
    FILE_SELECT_DRIVER: 'Selecciona el archivo JDBC del driver',
    DATABASE_MIRROR: 'Utilizando banco espejo.',
    DATABASE_DEVELOPMENT: 'Utilizando banco de desarrollo.',
    DATABASE_PRODUCTION: 'Utilizando banco de produción.',
    DATABASE_CREATE: 'Nueva instalación detectada. Creando nuevo banco.',
    DATABASE_CREATE_OK: 'Banco creado con éxito.',
    DELETE_OLD_LOGS: 'Borrando archivos de log antíguos.',
    DELETE_OLD_LOGS_OK: 'Archivos de log antíguos borrados con éxito.',
    DATABASE_LOGIN_ELEC_START: 'Solicitando prueba de conexión para el java...',
    DATABASE_LOGIN_ELEC_FINISH: 'Prueba de conexión ha terminado. Resultado de la conexión: ${p1}',
    EXPORT_QUERY_ELEC_START: 'Solicitando exportación de la tabla I01 para el java...',
    EXPORT_QUERY_ELEC_FINISH: 'Exportación de la tabla I01 ha terminado. Resultado de la exportación: ${p1}',
    RUN_AGENT_ELEC_START: 'Solicitando extración de los datos para el java...',
    RUN_AGENT_ELEC_FINISH: 'Extración de los datos ha terminado. Resultado de la extración: ${p1}',
    PROCESS_KILL: 'Forzando la terminación imediata del proceso [Sch: ${p1} - Exec: ${p2}]...',
    PROCESS_KILL_OK: 'Proceso [Ag: ${p1} - Exec: ${p2}] finalizado con éxito',
    PROCESS_KILL_WARN: 'Atención - El proceso a ser finalizado [Hor: ${p1}, Exec: ${p2}] no esta en ejecución.',
    PROCESS_KILL_ERROR: 'Error - No fue possible finalizar la ejecución del proceso [Hor: ${p1}, Exec: ${p2}].',
    PROCESS_KILL_ALL: 'Finalizando todos los procesos en ejecución...',
    PROCESS_KILL_ALL_OK: 'Procesos finalizados.',
    JAVA_VERSION: 'Solicitando numero de versión del Java...',
    JAVA_VERSION_OK: 'Versión del Java recibida.',
    JAVA_EXECUTION_START: '===Inicio de ejecución del Agent: (.*)===',
    JAVA_EXECUTION_END: '===Fin de ejecución del Agent: (.*)===',
    JAVA_EXECUTION_DURATION: '===Tiempo de ejecución del Agent: (.*)===',
    JAVA_EXECUTION_CANCELLED: '===Proceso finalizado a petición del usuario===',
    WINDOWS_REGISTRY_ERROR: 'Actualización del Registro del Windows ha fallado (autoUpdate)',
    QUERY_UPDATER: 'Buscando por actualizaciones de las consultas estándar del FAST..',
    QUERY_UPDATER_OK: 'Atualización de consultas finalizada con éxito.',
    QUERY_UPDATER_NO_UPDATES: 'Ninguna actualización fue encontrada.',
    QUERY_UPDATER_ERROR: 'Error - La atualización automatica de las consultas ha fallado.',
    QUERY_UPDATER_AVAILABLE: '  ${p1} ([${p2}] --> [${p3}])',
    QUERY_UPDATER_NOT_STANDARD: '  ${p1} ([Ignorada])',
    SCRIPT_UPDATER: 'Buscando por actualizaciones de las rutinas estándar del FAST..',
    SCRIPT_UPDATER_OK: 'Atualización de rutinas finalizada con éxito.',
    SCRIPT_UPDATER_NO_UPDATES: 'Ninguna actualización fue encontrada.',
    SCRIPT_UPDATER_ERROR: 'Error - La atualización automatica de las rutinas ha fallado.',
    SCRIPT_UPDATER_AVAILABLE: '  ${p1} ([${p2}] --> [${p3}])',
    SCRIPT_UPDATER_NOT_STANDARD: '  ${p1} ([Ignorada])',
    SERVER_COMMUNICATION: {
      MESSAGES: {
        START: '=== LISTENER ACTIVADO EN LA PUERTA [${p1}]===',
        FINISH: '=== LISTENER DESACTIVADO EN LA PUERTA [${p1}]===',
        ERROR: 'Error - La inicialización del servidor ha fallado.',
        NEW_WORD: '[${p1}] Nueva palabra de comando recibida: \'${p2}\'.',
        CONNECTED: '=== CONECTADO COM EL SERVIDOR (CLIENT) ===',
        DISCONNECTED: '=== CONEXIÓN CERRADA CON EL SERVIDOR (CLIENT) ===',
        SEND_COMMAND: 'Enviando comando \'${p1}\' para el servidor TOTVS...',
        SEND_COMMAND_RESPONSE: 'Respuesta del comando \'${p1}\' fue recibida.',
        SEND_COMMAND_OK: 'Comando enviado. Esperando por una respuesta...',
        CONNECTION_ERROR: '=== Perda de conexión con el Agent remoto. Por favor cerre instância del Agent y intenta otra vez ===',
        DEACTIVATED: 'Atención - Agent desactivado por el servidor del TOTVS. Por favor entre en contacto con nuestro equipo de soporte.'
      }
    }
  },
  SUPPORT_TICKET: {
    HELP: 'Si necesitas de ayuda, por favor entre en contacto con nuestro equipo de soporte, con las seguientes opciones en el formulario:',
    GROUP_1: 'Macrossegmento -> Cross Segmentos',
    GROUP_2: 'Produto -> Analytics By GoodData',
    GROUP_3: 'ABC -> 123',
    LINK: 'Link:'
  },
  MIRROR_MODE: {
    MODAL: {
      TITLE: 'Acceso remoto del Agent',
      DESCRIPTION_1: 'ATENCIÓN - El acceso remoto va bloquear la utilización del Agent por su cliente hasta su finalización, por el comando \'Salir\' de la interfaz. Además, cualquier cambio en las configuraciones del Agent van a ser, automaticamente, sincronizadas con la instalación remota del mismo.',
      DESCRIPTION_2: 'Si esté seguro que quieres seguir con el acceso, por favor informe abajo el codigo de contratación del GoodData, informado por TOTVS',
      FIELD: 'Codigo de contratación',
      BUTTONS: {
        PROCEED: 'Seguir con el acceso remoto',
        CANCEL: 'Cancelar acceso'
      },
    },
    MESSAGES: {
      TITLE: 'MODO ESPEJO ACTIVADO - Todos los cambios en este Agent van a ser replicados hasta el Agent remoto [${p1}]',
      ONLINE: 'Atención - Acceso remoto activado por el servidor central del TOTVS. Ese Agent esta bloqueado ahora hasta la finalización del acceso.',
      OFFLINE: 'Acceso remoto finalizado. El Agent esta listo para utilización.',
      RUNNING: 'Acceso remoto em ejecución',
      WAIT: 'Aguarde...',
      WARNING: 'Atención - Acceso remoto no puede ser probado sin el Electron.',
      WARNING_SAME_AGENT: 'Atención - Acceso remoto no es permitido para el mismo Agent fuente.',
      LOADING: '========== INICIANDO MIRRORMODE [${p1}] ==========',
      LOADING_OK: '========== MIRRORMODE ACTIVADO [${p1}] ==========',
      LOADING_ERROR: 'Error - La inicialización del protocolo \'mirrorMode\ de Agent [${p1}] ha fallado.',
      SHUTDOWN: '========== CERRANDO MIRRORMODE [${p1}] ==========',
      SHUTDOWN_OK: '========== MIRRORMODE CERRADO [${p1}] ==========',
      SHUTDOWN_ERROR: 'Error - El cerre del protocolo \'mirrorMode\ del Agent [${p1}] ha fallado.',
      SYNCHRONIZE_LOGS: 'Sincronizando archivos de log del Agent remoto...',
      SYNCHRONIZE_LOGS_OK: 'Sincronización de los archivos de log hecho con éxito.',
      SYNCHRONIZE_DB: 'Sincronizando configuraciones del Agent remoto...',
      SYNCHRONIZE_DB_OK: 'Sincronización de las configuraciones hecha con éxito.',
      REDIRECT_REQUEST: 'Redireccionando solicitud \'${p1}\' para el Agent remoto [${p2}]',
      REDIRECT_REQUEST_OK: 'Solicitud \'${p1}\' redireccionana con éxito.',
      REDIRECT_REQUEST_ERROR: 'Error - El envio de la solicitud \'${p1}\' para el Agent remoto ha fallado.',
      SERVER_SYNC: 'Solicitando sincronización con la instancia remota del Agent [${p1}]...',
      SERVER_SYNC_OK: 'Sincronización hecha con éxito. Todas las actualizaciones fueron aplicadas en el Agent remoto.',
      SERVER_SYNC_ERROR: 'Error - La sincronización del Agent [${p1}] ha fallado. La instancia espejo no pudiste cambiar ninguna configuración del Agent remoto.',
      SERVER_PING_WARNING: 'Atención - La comunicación con el servidor ha fallado (${p1}/${p2}). Vamos a intentar otra vez en 1 minuto...',
      SERVER_PING_ERROR: 'Error - Comunicación con el servidor perdida. Acceso remoto abortado.',
      INVALID_TOKEN_ERROR: 'Error - Token de acceso remoto invalido. Por favor entre em contacto con nustro equipo de soporte.',
      INVALID_AGENT_ERROR: 'Error - Sin conexión con el Agent para activar el acceso remoto. Por favor entre em contacto con nuestro equipo de soporte.'
    }
  },
  ANGULAR: {
    SYSTEM_EXIT: '¿Seguro que quieres cerrar el Agent?',
    SYSTEM_FINISH_USER: '=== Desligamento del sistema solicitado por el usuario (menu de salida) ===',
    SYSTEM_FINISH_USER_WARNING: 'Atención - Desligamento del sistema no puede ser probado sin el Electron.',
    ERROR: 'Error - Un error inesperado ocurrió. Por favor intenta otra vez.',
    OTHER: 'Otro',
    NONE: 'Ninguno',
    REGISTER_AGENT_TITLE: 'Activación de la instalación',
    REGISTER_AGENT_DESCRIPTION: 'Ingrese el codigo de contratación del GoodData, informado por TOTVS.',
    REGISTER_AGENT: 'Activando licencia...',
    REGISTER_AGENT_FIELD: 'Codigo de contratación',
    REGISTER_AGENT_OK: 'Licencia activada con éxito. El Agent esta listo para utilización.',
    REGISTER_AGENT_ERROR: 'Error - La activación de la licencia del Agent ha fallado. Por favor intenta otra vez.',
    REGISTER_AGENT_WARNING: 'Atención - Activación de la instalación del Agent no puede ser probada sin el Electron.'
  },
  SERVICES: {
    GOODDATA: {
      MESSAGES: {
        LOADING: 'Iniciando sesión en la plataforma GoodData...',
        LOADING_ERROR: 'Login ha fallado. Mira sus credenciales.',
        LOADING_WORKSPACES: 'Login hecho con éxito. Cargando ambientes...',
        LOADING_WORKSPACES_OK: 'Ambientes cargados con éxito!',
        LOADING_WORKSPACES_ERROR: 'No fue posible conectar a la plataforma GoodData. Mira su conexión y intenta otra vez.',
        LOADING_PROCESSES: 'Cargando procesos de ETL...',
        LOADING_PROCESSES_ERROR: 'No fue posible conectar a la plataforma GoodData. Mira su conexión y intenta otra vez.'
      }
    },
    SERVER: {
      MESSAGES: {
        LOADING_LICENSES: 'Cargando licencias del servidor TOTVS...',
        LOADING_LICENSES_ERROR: 'Error - El recibimiento de las licencias del servidor TOTVS ha fallado. Por favor intenta otra vez.',
        SERVER_ERROR: 'Error - La comunicación con el servidor TOTVS ha fallado. Por favor mira su conexión del internet y intenta otra vez.',
        COMMUNICATION_WARNING: 'Atención - La comunicación con el Agent-Server no puede ser probada sin el Electron.',
        LOADING_PARAMETERS: 'Cargando parámetros...',
        LOADING_PARAMETERS_ERROR: 'Error - Los parámetros de ETL / SQL estándar del servidor TOTVS no fueron recibidos. Por favor intenta otra vez.',
        SERIAL_NUMBER: 'Activando Agent...',
        SERIAL_NUMBER_OK: 'Agent activado con éxito.',
        SERIAL_NUMBER_ERROR: 'La activación del Agent ha fallado. Por favor intenta novamente.',
        SERIAL_NUMBER_ERROR_INVALID: 'Error - El codigo de activación es invalido. Por favor mira la información del mismo.',
        SERIAL_NUMBER_ERROR_COMMUNICATION: 'Error - La comunicación con la puerta de entrada del Agent ha fallado. Por favor mira si la puerta no esta bloqueada.',
        UPDATES: 'Solicitando actualizaciones del FAST...',
        UPDATES_OK: 'Actualizaciones del FAST recibidas con éxito!',
        UPDATES_NOT_FOUND: 'Ninguna actualización del FAST fue encontrada.',
        UPDATES_ERROR: 'Error - Algunos errores fueron encontrados mientras actualización del FAST. Por favor mira sus configuraciones.'
      }
    }
  },
  LANGUAGES: {
    TITLE: 'Lenguaje de la aplicación',
    "en-US": 'Ingles',
    "pt-BR": 'Portugues',
    "es-ES": 'Español'
  },
  CONTRACT_TYPES: {
    PLATFORM: 'Plataforma GoodData',
    FAST: 'FAST Analytics'
  },
  SOURCES: {
    LOCALLY: 'Local',
    CLOUD_OTHERS: 'Cloud (Otro)'
  },
  LICENSES: {
    MODULES: {
      ACCOUNTING: 'Controlaría',
      ANALYTICS: 'Analytics',
      CEP_TIN: 'C&P (TIN)',
      CEP_TOP: 'C&P (TOP)',
      COMERCIAL: 'Comercial',
      CUSTOM: 'Customización',
      DISTRIBUTION: 'Distribuición',
      EDUCACIONAL: 'Educacional',
      FINANCIAL: 'Financiero',
      GFE: 'GFE',
      GPS: 'GPS',
      HEALTHCARE: 'Salud',
      HR: 'Recursos Humanos',
      LEARNING: 'Learning',
      LEGAL: 'Jurídico',
      LOGISTICS: 'Logistica',
      MATERIALS: 'Mantenimientos',
      PLS: 'PLS',
      PMS: 'PMS',
      PRODUCTION: 'Producción',
      SERVICES: 'Gestión de Servicios',
      SHOPPING: 'Shopping',
      SUPPLY: 'Supply',
      TMS: 'TMS',
      UNIVERSAL: 'Universal',
      WMS: 'WMS'
    }
  },
  MENU: {
    WORKSPACES: 'Ambientes',
    DATABASES: 'Bancos de Datos',
    SCHEDULES: 'Horarios',
    QUERIES: 'Consultas (Queries)',
    SCRIPTS: 'Rutinas (Scripts)',
    MONITOR: 'Monitor',
    CONFIGURATION: 'Configuración',
    ACTIVATION: 'Activación',
    REMOTE: 'Acceso remoto',
    EXIT: 'Salir',
  },
  BUTTONS: {
    SAVE: 'Gravar',
    ADD: 'Anadir',
    EDIT: 'Editar',
    DELETE: 'Borrar',
    CONFIRM: 'Listo',
    GO_BACK: 'Volver',
    DETAILS: 'Detalles',
    EXECUTE: 'Ejecutar',
    SELECT: 'Seleccionar...',
    NEW_PARAMETER: 'Anadir parámetro',
    YES_SIMPLIFIED: 'S',
    NO_SIMPLIFIED: 'N',
    TEST_CONNECTION: 'Testar Conexión',
    LOAD_WORKSPACES: 'Cargar Ambientes',
    NEXT_ERROR: 'Proximo error',
    NO_ERRORS: 'Sin errores',
    YES: 'Si',
    NO: 'No',
    UPDATE_NOW: 'Ahora (Va cerrar Agent)',
    UPDATE_LATER: 'Después (Al salir)'
  },
  WORKSPACES: {
    TITLE: 'Cadastro de Ambientes',
    NEW_WORKSPACE: 'Novo Ambiente',
    EDIT_WORKSPACE: 'Cambiar Ambiente',
    DELETE_CONFIRMATION: '¿Estás seguro que quieres borrar este ambiente?',
    NO_DATA: 'Ningún ambiente fue encontrado',
    MESSAGES: {
      LOADING: 'Cargando ambientes...',
      LOADING_OK: 'Ambientes cargados.',
      LOADING_ERROR: 'Error - Un error inesperado ocurrió. Por favor intenta otra vez.',
      LOADING_DATABASES: 'Cargando ambientes utilizando el banco de datos ${p1}...',
      LOADING_DATABASES_OK: 'Ambientes cargados.',
      LOADING_DATABASES_ERROR: 'Error - Un error inesperado ocurrió. Por favor intenta otra vez.',
      SAVE: 'Gravando ambiente: ${p1}',
      SAVE_OK: 'Ambiente gravado con éxito!',
      SAVE_ERROR: 'Error - Un error inesperado ocurrió mientras gravación del ambiente ${p1}. Por favor intenta otra vez.',
      SAVE_ERROR_SAME_NAME: 'Error - El ambiente \'${p1}\' no puede ser gravado, porqué ya existe un ambiente con este nombre.',
      DELETE: 'Borrando ambiente: ${p1}',
      DELETE_OK: 'Ambiente borrado con éxito!',
      DELETE_ERROR: 'Error - Un error inesperado ocurrió mientras borro del ambiente ${p1}. Por favor intenta otra vez.',
      VALIDATE: 'Validando informaciones del ambiente...',
      PASSWORD_ENCRYPT: 'Encriptando contraseña...',
      LOADING_LICENSES: 'Solicitando licencias disponilbes al servidor...',
      LOADING_LICENSES_OK: 'Licencias recibidas.',
      LOADING_LICENSES_ERROR: 'Error - Un error inesperado ocurrió. Por favor intenta otra vez.',
      LOADING_LICENSES_WARNING: 'Atención - Comunicación con el servidor no puede ser probada sin el Electron.'
    },
    SECTIONS: {
      1: '1 / 4 - Informaciones comerciales',
      2: '2 / 4 - Informaciones de la plataforma GoodData',
      3: '3 / 4 - Informaciones del banco de datos',
      4: '4 / 4 - Configuraciones finales'
    },
    TABLE: {
      ERP: 'ERP',
      MODULE: 'Modulo',
      USERNAME: 'Usuario',
      ENVIRONMENT: 'Dominio',
      PASSWORD: 'Contraseña',
      WORKSPACE: 'Ambiente',
      UPLOAD_URL: 'URL de upload',
      PROCESS: 'Proceso de ETL',
      GRAPH: 'Graph',
      DATABASE: 'Banco de Datos',
      NAME: 'Nombre de la configuración'
    },
    TOOLTIPS: {
      ENVIRONMENT: 'Nombre del dominio de la plataforma GoodData.',
      USERNAME: 'Nombre del usuario de la plataforma GoodData. Este usuario ya debe tener una cuenta en GoodData, y ser un administrador del ambiente.',
      PASSWORD: 'Contraseña del usuario.',
      WORKSPACE: 'Selecciona el ambiente del GoodData donde los datos van a ser cargados.',
      UPLOAD_URL: 'Camiño del servidor FTP / WebDAV del GoodData, donde los datos van a ser cargados por el Agent.',
      PROCESS: 'Selecciona el nombre del proceso de ETL (CloudConnect / Bricks) que va procesar los datos cargados.',
      GRAPH: 'Selecciona el nombre del graph principal del CloudConnect, donde va empezar el proceso de ETL.'
    }
  },
  DATABASES: {
    TITLE: 'Cadastro de Bancos de Datos',
    NEW_DATABASE: 'Novo Banco de Datos',
    EDIT_DATABASE: 'Cambiar Banco de Datos',
    DELETE_CONFIRMATION: '¿Estás seguro que quieres borrar este banco de datos?',
    NO_DATA: 'Ningún banco de datos fue encontrado',
    CONNECTION_STRING: {
      IP_ADDRESS: '<ENDERECO_IP>',
      PORT: '<PORTA>',
      DATABASE_NAME: '<BANCO_DE_DATOS>',
      SERVICE_NAME: '<SERVICIO>',
      SID: '<SID>'
    },
    TABLE: {
      NAME: 'Nombre de la configuración',
      TYPE: 'Tipo de banco de datos',
      DRIVER_CLASS: 'Clase del driver',
      DRIVER_PATH: 'Camino del driver',
      HOST_TYPE: 'Tipo del host',
      HOST_NAME: 'Endereco IP',
      PORT: 'Puerta',
      DATABASE: 'Banco de datos',
      SID: 'SID',
      SERVICE_NAME: 'Nombre del servicio',
      INSTANCE: 'Instancia del banco de datos',
      CONNECTION_STRING: 'String de conexión final',
      USERNAME: 'Usuario',
      PASSWORD: 'Contraseña'
    },
    MESSAGES: {
      LOADING: 'Cargando bancos de datos...',
      LOADING_OK: 'Bancos de datos cargados.',
      LOADING_ERROR: 'Error - Un error inesperado ocurrió. Por favor intenta otra vez.',
      SAVE: 'Gravando banco de datos: ${p1}',
      SAVE_OK: 'Banco de datos gravado con éxito!',
      SAVE_ERROR: 'Error - Un error inesperado ocurrió mientras gravación del banco de datos ${p1}. Por favor intenta otra vez.',
      SAVE_ERROR_SAME_NAME: 'Error - El banco de datos \'${p1}\' no puede ser gravado, porqué ya existe un banco con este nombre.',
      DELETE: 'Borrando banco de datos: ${p1}',
      DELETE_OK: 'Banco de datos borrado con éxito!',
      DELETE_ERROR: 'Error - Un error inesperado ocurrió mientras borro del banco de datos ${p1}. Por favor intenta otra vez.',
      DELETE_ERROR_WORKSPACES: 'Error - No fue posible borrar este banco de datos, porqué existen ambientes lo utilizando.',
      LOGIN: 'Probando conexión con banco de datos: ${p1}',
      LOGIN_OK: 'Conexión con éxito!',
      LOGIN_ERROR: 'Error - Conexión con banco de datos \'${p1}\' ha fallado. Mira los campos y intenta otra vez.',
      LOGIN_WARNING: 'Atención - Conexión con banco de datos no pueden ser probada sin el Electron.',
      VALIDATE: 'Validando informaciones del banco de datos...',
      ERROR_INVALID_IP: 'Error - Endereço IP inválido. Por favor mira si el tipo informado esta correcto (ipv4 / ipv6 / hostname).',
      ERROR_INVALID_PORT: 'Error - Porta del banco de datos inválida. Por favor mira si el numero esta en el range permitido (${p1} - ${p2}).',
      PASSWORD_ENCRYPT: 'Encriptando contraseña...',
    },
    TOOLTIPS: {
      DRIVER_CLASS: 'Nombre de la clase Java principal del driver. Este nombre puede ser encontrado utilizando programas de conexión a los bancos de datos (IDEs).',
      DRIVER_PATH: 'Camiño completo del driver JDBC de conexión al banco de datos. Este archivo debe tener la extensión ".jar".',
      HOST_TYPE: 'Tipo de host: "Ipv4": Formato "255.255.255.255". "Ipv6": Formato "FF:FF:...:FF". "Hostname": Nombre de la máquina.',
      HOST_NAME: 'Hostname de la máquina donde el banco de datos esta localizado.',
      PORT: 'Selecciona el número de la puerta de conexión del banco de datos. Este numero debe estar entre ${p1} y ${p2}.',
      CONNECTION_STRING: 'Comando final de conexión del banco de datos. Este comando va a ser utilizado por Agent para intentar conectarse al banco de datos.'
    }
  },
  SCHEDULES: {
    TITLE: 'Cadastro de Horarios',
    NEW_SCHEDULE: 'Novo Horario',
    EDIT_SCHEDULE: 'Cambiar Horario',
    NOT_FOUND: 'Ningún horario fue encontrado.',
    DELETE_CONFIRMATION: '¿Estás seguro que quieres borrar este horario?',
    NO_DATA: 'Ningún horario fue encontrado',
    TABLE: {
      NAME: 'Nombre del horario',
      WORKSPACE: 'Ambiente',
      WINDOWS: 'Pantallas de ejecución',
      ENABLED: 'Activo?',
      ZIP_FILENAME: 'Nombre del archivo comprimido',
      ZIP_EXTENSION: 'Algoritmo de compressión',
      FILE_FOLDER: 'Directorio de upload',
      FILE_WILDCARD: 'Formato válido',
      LAST_EXECUTION: 'Ultima ejecución',
      SQL_PARAMETERS: {
        TITLE: 'Parámetros SQL',
        DESCRIPTION: 'Parámetros utilizados por las consultas / rutinas',
        TABLE: {
          MODULE: 'Modulo',
          NAME: 'Nombre',
          TOTVS: '¿Customización?',
          VALUE: 'Valor',
          SQL: 'SQL (S/N)?'
        }
      },
      ETL_PARAMETERS: {
        TITLE: 'Parámetros ETL',
        DESCRIPTION: 'Parámetros del ETL (CloudConnect / Bricks)',
        TABLE: {
          MODULE: 'Modulo',
          NAME: 'Nombre',
          TOTVS: '¿Customización?',
          VALUE: 'Valor'
        }
      }
    },
    MESSAGES: {
      LOADING: 'Cargando horarios...',
      LOADING_OK: 'Horarios cargados.',
      LOADING_ERROR: 'Error - Un error inesperado ocurrió. Por favor intenta otra vez.',
      ID_LOADING: 'Cargando horario con codigo ${p1}...',
      ID_LOADING_OK: 'Horario cargado.',
      ID_LOADING_ERROR: 'Error - Un error inesperado ocurrió mientras gravación del horario con id \'${p1}\'. Por favor intenta otra vez.',
      VALIDATE: 'Validando horario...',
      SAVE: 'Gravando horario: ${p1}',
      SAVE_OK: 'Horario gravado con éxito!',
      SAVE_ERROR: 'Error - Un error inesperado ocurrió mientras gravación del horario ${p1}. Por favor intenta otra vez.',
      SAVE_ERROR_SAME_NAME: 'Error - El horario \'${p1}\' no puede ser gravado, porqué ya existe un horario con este nombre.',
      DELETE: 'Borrando horario: ${p1}',
      DELETE_OK: 'Horario borrado con éxito!',
      DELETE_ERROR: 'Error - Un error inesperado ocurrió mientras borro del horario ${p1}. Por favor intenta otra vez.',
      TRIGGERSCHEDULES_LOADING: 'Revisando horarios: [${p1}]',
      TRIGGERSCHEDULES_LOADING_OK: 'Inicialización lista. Disparando horarios...',
      TRIGGERSCHEDULES_LOADING_ERROR: 'Error - Disparo automatico del horario ha fallado.',
      RUN: 'Solicitando ejecución del horario \'${p1}\'.',
      RUN_MANUAL: 'Ejecución del horario \'${p1}\' solicitada manualmente por el usuario.',
      RUN_OK: 'Solicitación del horario ejecutada con éxito. Por favor mira su progresso por la opción \'Monitor\' del menu.',
      RUN_EXECUTIONDATE: 'Gravando fecha de última ejecución del horario \'${p1}\'.',
      RUN_ERROR: 'Error - Un error inesperado ocurrió mientras solicitación de ejecución del horario \'${p1}\'. Por favor intenta otra vez.',
      RUN_PREPARE: '  [Horario: ${p1}] Preparando paquete de solicitación para el java...',
      RUN_WARNING: 'Atención - Ejecución de horarios solo pueden ser probadas con Electron.',
      SCHEDULE_ALREADY_EXECUTING: 'Atención - El horario [${p1}] no fue ejecutado, porque el mismo ya esta en ejecución.',
      VALIDATION: 'Início de la validación de los archivos locales [${p1}].',
      VALIDATION_OK: 'Validación de los archivos locales [${p1}] hecha con éxito.',
      VALIDATION_ERROR: 'Error - La validación de los archivos locales [${p1}] ha fallado. La ejecución del horario fue cerrada.',
      VALIDATION_FILE: 'Validando archivo [${p1}]...',
      VALIDATION_FILE_OK: 'Archivo [${p1}] validado con éxito.',
      VALIDATION_FILE_ERROR: 'Error - La validación del archivo [${p1}] ha fallado.',
      FILE_VALIDATION_ERROR: 'Error - Foram encontados ${p1} archivos ${p2} corruptos en el directorio de upload del Agent. Por favor verifica los archivos de log del Agent.'
    },
    TOOLTIPS: {
      WINDOWS: 'Informe cuales horários el Agent va ejecutar este horario, a diario.',
      ZIP_FILENAME: 'Nombre del archivo comprimido a ser enviado al GoodData. Este archivo tiene todos los datos extraídos por este horario.',
      FILE_FOLDER: 'Directorio a ser cargado al GoodData. Todos los archivos del directorio van a ser añadidos a la carga de los datos.',
      FILE_WILDCARD: 'Utilize este campo para filtrar los archivos del directorio a ser cargado al GoodData. Ejemplo: Para cargar solamente archivos en Excel, con cualquier nombre, escriba: *.xlsx. Si no existen restricciones, escriba: *.*'
    }
  },
  QUERIES: {
    TITLE: 'Cadastro de consultas (Queries)',
    IMPORT_QUERIES: 'Importar consultas FAST',
    NEW_QUERY: 'Nueva consulta',
    EDIT_QUERY: 'Cambiar consulta',
    NO_DATA: 'Ninguna consulta fue encontrada',
    DELETE_CONFIRMATION: '¿Estás seguro que quieres borrar esta consulta?',
    TABLE: {
      SCHEDULE_NAME: 'Nombre del horario',
      MODULE: 'Modulo',
      QUERY_NAME: 'Nombre de la consulta',
      MODE: 'Modo de ejecución',
      TOTVS: '¿Customización?',
      SQL: 'Comando SQL'
    },
    EXECUTION_MODES: {
      COMPLETE: 'Completa',
      MONTHLY: 'Mensual'
    },
    MESSAGES: {
      LOADING: 'Cargando consultas...',
      LOADING_OK: 'Consultas cargadas.',
      LOADING_ERROR: 'Error - Un error inesperado ocurrió. Por favor intenta otra vez.',
      SCHEDULE_LOADING: 'Cargando consultas del horario: \'${p1}\'',
      SCHEDULE_LOADING_OK: 'Consultas cargadas.',
      SCHEDULE_LOADING_ERROR: 'Error - Un error inesperado ocurrió. Por favor intenta otra vez.',
      SAVE: 'Gravando consulta: \'${p1}\'',
      SAVE_OK: 'Consulta gravada con éxito!',
      SAVE_ERROR: 'Error - Un error inesperado ocurrió mientras gravación de la consulta \'${p1}\'. Por favor intenta otra vez.',
      SAVE_ERROR_SAME_NAME: 'Error - La consulta \'${p1}\' no puede ser gravada, porqué ya existe una consulta con este nombre.',
      SAVE_WARNING_ALREADY_EXISTS: 'Atención - La consulta \'${p1}\' ya existe en este horario. Ignorando...',
      DELETE: 'Borrando consulta: \'${p1}\'',
      DELETE_OK: 'Consulta borrada con éxito!',
      DELETE_ERROR: 'Error - Un error inesperado ocurrió mientras borro de la consulta \'${p1}\'. Por favor intenta otra vez.',
      EXPORT_MESSAGE: 'Importando las consultas del FAST...',
      IMPORT: 'Gravando consultas estándar del FAST en el horario: \'${p1}\'.',
      IMPORT_OK: 'Importación de las consultas finalizada con éxito.',
      IMPORT_ERROR: 'Error - Un error inesperado ocurrió mientras gravación de las consultas estándar del horario \'${p1}\'. Por favor intenta otra vez.',
      IMPORT_WARNING_FAILURES: 'Atención - Algunas consultas no fueron gravadas por tener customizaciones. Por favor mira los archivos de log.',
      IMPORT_NO_DATA: 'Ninguna información recibida del Agent-Server.',
      IMPORT_NO_DATA_ERROR: 'Error - ninguna información disponible para la importación. Por favor entre em contacto con el equipo de soporte.',
      IMPORT_I01: 'Importación de consultas de la tabla I01 del Protheus activada.',
      IMPORT_I01_PREPARE: 'Preparando paquete de solicitación para el java...',
      ENCRYPT: 'Encriptando consulta: \'${p1}\'',
      VALIDATE: 'Validando consulta...'
    },
    TOOLTIPS: {
      QUERY_NAME: 'Nombre de la consulta. Este nombre va a ser mostrado en los logs de ejecución del Agent.',
      MODE: 'Modo de ejecución de la consulta: "Completa" - Agent va cambiar los parametros del horario en el comando SQL de la consulta, y ejecutar una sola vez. "Mensual" - Agent va generar nuevos parametros START_DATE / FINAL_DATE entre los valores estándar del horario, mensualmente, y ejecutar la consulta multiplas veces. Ejemplo: Si el horario va ejecutar los últimos 3 meses de datos, Agent va ejecutar esta consulta 3 veces, una vez para cada mes.'
    }
  },
  SCRIPTS: {
    TITLE: 'Cadastro de Rutinas (Scripts)',
    IMPORT_SCRIPTS: 'Importar rutinas FAST',
    NEW_SCRIPT: 'Nueva Rutina',
    EDIT_SCRIPT: 'Cambiar Rutina',
    NO_DATA: 'Ninguna rutina fue encontrada',
    DELETE_CONFIRMATION: '¿Estás seguro que quieres borrar esta rutina?',
    TABLE: {
      SCHEDULE_NAME: 'Nombre del horario',
      MODULE: 'Modulo',
      SCRIPT_NAME: 'Nombre de la rutina',
      SQL: 'Instrucción SQL',
      TOTVS: '¿Customización?',
    },
    MESSAGES: {
      LOADING: 'Cargando rutinas...',
      LOADING_OK: 'Rutinas cargadas.',
      LOADING_ERROR: 'Error - Un error inesperado ocurrió. Por favor intenta otra vez.',
      SCHEDULE_LOADING: 'Cargando rutinas del horario: \'${p1}\'',
      SCHEDULE_LOADING_OK: 'Rutinas cargadas.',
      SCHEDULE_LOADING_ERROR: 'Error - Un error inesperado ocurrió. Por favor intenta otra vez.',
      SAVE: 'Gravando rutina: \'${p1}\'',
      SAVE_OK: 'Rutina gravada con éxito!',
      SAVE_ERROR: 'Error - Un error inesperado ocurrió mientras gravación de la rutina \'${p1}\'. Por favor intenta otra vez.',
      SAVE_ERROR_SAME_NAME: 'Error - La rutina \'${p1}\' no puede ser gravada, porqué ya existe una rutina con este nombre.',
      SAVE_WARNING_ALREADY_EXISTS: 'Atención - La consulta \'${p1}\' ya existe en este horario. Ignorando...',
      DELETE: 'Borrando rutina: \'${p1}\'',
      DELETE_OK: 'Rutina borrada con éxito!',
      DELETE_ERROR: 'Error - Un error inesperado ocurrió mientras borro de la rutina \'${p1}\'. Por favor intenta otra vez.',
      EXPORT_MESSAGE: 'Importando las consultas del FAST...',
      IMPORT: 'Importando rutinas...',
      IMPORT_OK: 'Importación de las consultas finalizada con éxito.',
      IMPORT_ERROR: 'Error - Un error inesperado ocurrió mientras gravación de las rutinas estándar del horario \'${p1}\'. Por favor intenta otra vez.',
      IMPORT_WARNING_FAILURES: 'Atención - Algunas rutinas no fueron gravadas por tener customizaciones. Por favor mira los archivos de log.',
      IMPORT_NO_DATA: 'Ninguna información recibida del Agent-Server.',
      IMPORT_NO_DATA_ERROR: 'Error - ninguna información disponible para la importación. Por favor entre em contacto con el equipo de soporte.',
      ENCRYPT: 'Encriptando rutina: \'${p1}\'',
      VALIDATE: 'Validando rutina...'
    },
    TOOLTIPS: {
      SCRIPT_NAME: 'Nombre de la rutina. Este nombre va a ser mostrado en los logs de ejecución del Agent.'
    }
  },
  MONITOR: {
    TITLE: 'Monitor de Ejecución',
    NO_DATA: 'Ningún log de ejecución fue encontrado',
    TABLE: {
      STATUS: 'Status',
      LINES: 'Líneas',
      SCHEDULE: 'Horario',
      START_DATE: 'Fecha/hora de início',
      FINAL_DATE: 'Fecha/hora de finalización',
      EXECUTION_TIME: 'Tiempo de execución',
      DETAILS: {
        TITLE: 'Detalles de la ejecución',
        TIMESTAMP: 'Fecha/Hora',
        LEVEL: 'Nivel',
        SOURCE: 'Origen',
        MESSAGE: 'Mensaje'
      },
      EXECUTION_STATUS: {
        DONE: 'Listo',
        RUNNING: 'En ejecución',
        CANCELED: 'Cancelado',
        ERROR: 'Error'
      }
    },
    MESSAGES: {
      WARNING: 'Atención - Monitoramento de logs no puede ser probado sin el Electron.',
      KILL_PROCESS_TITLE: '¿Seguro que quieres finalizar la ejecución del horario?',
      SCHEDULE_NOT_FOUND: 'Desconocido'
    }
  },
  CONFIGURATION: {
    TITLE: 'Configuración del ${p1}',
    APPLICATION: 'Aplicación',
    JAVA: 'Java',
    VERSION: 'Versión',
    INSTANCE: 'Nombre de la instancia',
    DEBUGMODE: 'Modo de depuración',
    AUTOUPDATE: 'Actualizacion automatica',
    ACTIVATED_1: 'Activado',
    ACTIVATED_2: 'Activada',
    DEACTIVATED_1: 'Desactivado',
    DEACTIVATED_2: 'Desactivada',
    LOGFILES_TO_KEEP: 'Número mínimo, en días, de archivos de log mantenidos',
    JAVA_XMX: 'Alocación de memoria máxima (en MB)',
    JAVA_TMPDIR: 'Directorio de archivos temporarios',
    JAVA_JREDIR: 'Directorio de la JRE del Java',
    TIMEZONE: 'Fuso horario',
    CLIENT_PORT: 'Puerta de comunicación con el servidor de TOTVS',
    MESSAGES: {
      LOADING: 'Cargando configuración...',
      LOADING_OK: 'Configuración cargada.',
      LOADING_ERROR: 'Error - Un error inesperado ocurrió. Por favor intenta otra vez.',
      VALIDATE: 'Validando configuración...',
      SAVE: 'Gravando configuración...',
      SAVE_ERROR: 'Error - Un error inesperado ocurrió. Por favor intenta otra vez.',
      SAVE_OK: 'Configuración actualizada con éxito!',
      SAVE_ERROR_SERVER: 'Error - La comunicación con el servidor del TOTVS ha fallando. Volviendo cambios...',
      SAVE_ERROR_CONFIG: 'Error - La gravación de la configuración ha fallado. Volviendo cambios...',
      SAVE_ERROR_PORT: 'Error - La inicialización del servidor en la puerta \'${p1}\' ha fallado. Volviendo cambios...'
    },
    TOOLTIPS: {
      INSTANCE: 'Nombre de la instancia del Agent, definido automaticamente por TOTVS. Este nombre es utilizado para ayudar el servicio del equipo de soporte del TOTVS.',
      DEBUGMODE: 'Muestra mensajes adicionales de debug en las ejecuciones del Agent.',
      LOGFILES: 'Numero máximo de archivos de log mantenenidos por el Agent, en su directorio de log. Agent automáticamente va a borrar los archivos antíguos.',
      JAVA_XMX: 'Alocación máxima de memoria RAM (MB - Megabytes) que el Agent puede utilizar mientras ejecuta los horarios. Si la alocación no es suficiente para cargar los datos, Agent va cerrar el proceso con una mensaje de error. Valor minimo: ${p1}MB',
      JAVA_TMPDIR: 'Directorio temporario, utilizar por el Agent para almacenar los archivos antes de cargar al GoodData. Selecciona un directorio que puede ser borrado, si necesario.',
      JAVA_JREDIR: 'Directorio ./bin, donde se encuentra los archivos binarios de la JRE del Java. Si no informado, Agent buscará el Java en las variables de ambiente del sistema.',
      AUTOUPDATE: 'Define si el Agent va bajar actualizaciones creadas por TOTVS automaticamente. En caso positivo, Agent va contestar el usuario cuando encontrar una nueva versión, y va hacer la instalación inmediatamente. En caso negativo, Agent no va actualizar a nadie.',
      CLIENT_PORT: 'Selecciona el numero de la puerta para hacer la comunicación con el servidor del TOTVS. Este numero debe estar entre ${p1} y ${p2}.'
    }
  },
  FORM_ERRORS: {
    FIELD_NOT_FILLED: 'Error - Campo obligatorio \'${p1}\' sin información.',
    FIELD_NOT_FILLED_GRAPH: 'Error - Campo obligatorio  \'${p1}\' sin información. Por favor selecciona um graph para ejecución, o entoces borre la selección del campo \'Proceso de ETL\'.',
    FIELD_TYPING_WRONG: 'Error: El contenido del campo \'${p1}\' es invalido. Por favor verifica su valor.',
    FIELD_RANGE_ERROR: 'Error - El valor del campo \'${p1}\' no esta entre el range permitido (${p2} - ${p3}).',
    FOLDER_SELECT_WARNING: 'Atención - Selección de diretorios no puede ser probada sin el Electron.',
    ONLY_YES_OR_NO: 'Error - Los parámetros SQL solo pueden ser \'Y\' or \'N\'. Por favor verifica los valores.'
  }
}
