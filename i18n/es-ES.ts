export const CNST_TRANSLATIONS_ES_ES: any = {
  MENU: {
    WORKSPACES: 'Ambientes',
    DATABASES: 'Bancos de Datos',
    SCHEDULES: 'Horarios',
    QUERIES: 'Consultas (Queries)',
    SCRIPTS: 'Rutinas (Scripts)',
    MONITOR: 'Monitor',
    CONFIGURATION: 'Configuración',
    EXIT: 'Salir',
  },
  BUTTONS: {
    SAVE: 'Gravar',
    ADD: 'Anadir',
    EDIT: 'Editar',
    DELETE: 'Borrar',
    CONFIRM: 'Listo',
    GO_BACK: 'Volver',
    DETAILS: 'Detalhes',
    EXECUTE: 'Ejecutar',
    NEW_PARAMETER: 'Anadir parámetro',
    YES_SIMPLIFIED: 'S',
    NO_SIMPLIFIED: 'N'
  },
  WORKSPACES: {
    MESSAGES: {
      LOADING: 'Cargando ambientes...',
      LOADING_ERROR: 'Error - Un error inesperado ocurrió. Por favor intenta otra vez.'
    }
  },
  SCHEDULES: {
    TITLE: 'Cadastro de Horarios',
    NEW_SCHEDULE: 'Novo Horario',
    EDIT_SCHEDULE: 'Cambiar Horario',
    NOT_FOUND: 'Ningún horario fue encontrado.',
    DELETE_CONFIRMATION: '¿Estás seguro que quieres borrar este horario?',
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
          NAME: 'Nombre',
          VALUE: 'Valor',
          SQL: 'SQL (S/N)?'
        }
      },
      ETL_PARAMETERS: {
        TITLE: 'Parámetros ETL',
        DESCRIPTION: 'Parámetros del ETL (CloudConnect / Bricks)',
        TABLE: {
          NAME: 'Nombre',
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
      SAVE: 'Gravando horario: ${p1}',
      SAVE_OK: 'Horario gravado con éxito!',
      SAVE_ERROR: 'Error - Un error inesperado ocurrió mientras gravación del horario ${p1}. Por favor intenta otra vez.',
      DELETE: 'Borrando horario: ${p1}',
      DELETE_OK: 'Horario borrado con éxito!',
      DELETE_ERROR: 'Error - Un error inesperado ocurrió mientras borro del horario ${p1}. Por favor intenta otra vez.',
      TRIGGERSCHEDULES_LOADING: 'Revisando horarios: [${p1}]',
      TRIGGERSCHEDULES_OK: 'Inicialización lista. Disparando horarios...',
      TRIGGERSCHEDULES_ERROR: 'Error - Disparo automatico del horario ha fallado.',
      RUN: 'Solicitando ejecución del horario \'${p1}\'.',
      RUN_MANUAL: 'Ejecución del horario \'${p1}\' solicitada manualmente por el usuario.',
      RUN_OK: 'Solicitación del horario ejecutada con éxito. Por favor mira su progresso por la opción \'Monitor\' del menu.',
      RUN_EXECUTIONDATE: 'Gravando fecha de última ejecución del horario \'${p1}\'.',
      RUN_ERROR: 'Error - Un error inesperado ocurrió mientras solicitación de ejecución del horario \'${p1}\'. Por favor intenta otra vez.',
      RUN_PREPARE: 'Preparando paquete de solicitación para el java...',
      RUN_WARNING: 'Atención - Ejecución de horarios solo pueden ser probadas con Electron.'
    }
  },
  QUERIES: {
    TITLE: 'Cadastro de consultas (Queries)',
    IMPORT_QUERIES: 'Importar consultas FAST',
    NEW_QUERY: 'Nueva consulta',
    EDIT_QUERY: 'Cambiar consulta',
    DELETE_CONFIRMATION: '¿Estás seguro que quieres borrar esta consulta?',
    TABLE: {
      SCHEDULE_NAME: 'Nombre del horario',
      QUERY_NAME: 'Nombre de la consulta',
      MODE: 'Modo de ejecución',
      SQL: 'Comando SQL'
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
      DELETE: 'Borrando consulta: \'${p1}\'',
      DELETE_OK: 'Consulta borrada con éxito!',
      DELETE_ERROR: 'Error - Un error inesperado ocurrió mientras borro de la consulta \'${p1}\'. Por favor intenta otra vez.',
      EXPORT: 'Exportando consultas...',
      EXPORT_OK: 'Exportación de las consultas finalizada con éxito.',
      EXPORT_ERROR: 'Error - Un error inesperado ocurrió. Por favor intenta otra vez.',
      EXPORT_WARNING: 'Atención - Horario \'${p1}\' ya tienes todas las consultas estándar cargadas.',
      EXPORT_STANDARD: 'Exportando consultas estándar del FAST.',
      EXPORT_STANDARD_OK: 'Consultas estándar del FAST\'s cargadas con éxito.',
      EXPORT_STANDARD_WARNING: 'Atención - Ninguna consulta padrón fue encontrada para ese horario.',
      EXPORT_SAVE: 'Gravando consultas estándar del FAST en el horario: \'${p1}\'.',
      EXPORT_SAVE_ERROR: 'Error - Un error inesperado ocurrió mientras gravación del las consultas estándar del FAST en el horario \'${p1}\'. Por favor intenta otra vez.',
      EXPORT_I01: 'Exportación de consultas de la tabla I01 del Protheus activada.',
      EXPORT_I01_PREPARE: 'Preparando paquete de solicitación para el java...',
      EXPORT_I01_WARNING: 'Atención - Exportación de las consultas estándar por la tabla I01 puede ser probada solamente con Electron.',
      EXPORT_I01_ERROR_NOTPROTHEUS: 'Error - Exportacíon de las consultas estándar por la tabla I01 es permitido solamente para el ERP Protheus.',
      ENCRYPT: 'Encriptando consulta: \'${p1}\'',
      VALIDATE: 'Validando consulta...'
    }
  },
  SCRIPTS: {
    TITLE: 'Cadastro de Rutinas (Scripts)',
    IMPORT_SCRIPTS: 'Importar rutinas FAST',
    NEW_SCRIPT: 'Nueva Rutina',
    EDIT_SCRIPT: 'Cambiar Rutina',
    DELETE_CONFIRMATION: '¿Estás seguro que quieres borrar esta rutina?',
    TABLE: {
      SCHEDULE_NAME: 'Nombre del horario',
      SCRIPT_NAME: 'Nombre de la rutina',
      SQL: 'Instrucción SQL'
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
      DELETE: 'Borrando rutina: \'${p1}\'',
      DELETE_OK: 'Rutina borrada con éxito!',
      DELETE_ERROR: 'Error - Un error inesperado ocurrió mientras borro de la rutina \'${p1}\'. Por favor intenta otra vez.',
      EXPORT: 'Exportando rutinas...',
      EXPORT_OK: 'Exportación de las rutinas finalizada con éxito.',
      EXPORT_ERROR: 'Error - Un error inesperado ocurrió. Por favor intenta otra vez.',
      EXPORT_WARNING: 'Atención - Horario \'${p1}\' ya tienes todas las rutinas estándar cargadas.',
      EXPORT_STANDARD: 'Exportando rutinas estándar del FAST.',
      EXPORT_STANDARD_OK: 'Rutinas estándar del FAST cargadas con éxito.',
      EXPORT_STANDARD_WARNING: 'Atención - Ninguna rutina estándar fue encontrada para ese horario.',
      EXPORT_SAVE: 'Gravando rutinas estándar del FAST en el horario: \'${p1}\'.',
      EXPORT_SAVE_ERROR: 'Error - Un error inesperado ocurrió mientras gravación del las rutinas estándar del FAST en el horario \'${p1}\'. Por favor intenta otra vez.',
      ENCRYPT: 'Encriptando rutina: \'${p1}\'',
      VALIDATE: 'Validando rutina...'
    }
  },
  MONITOR: {
    TITLE: 'Monitor de Execución',
    TABLE: {
      STATUS: 'Status',
      SCHEDULE: 'Agendamento',
      START_DATE: 'Fecha/hora de início',
      FINAL_DATE: 'Fecha/hora de finalización',
      EXECUTION_TIME: 'Tiempo de execución',
      DETAILS: {
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
      WARNING: 'Aviso - Monitoramento de logs no puede ser probado sin el Electron.'
    }
  },
  CONFIGURATION: {
    TITLE: 'Configuración del ${p1}',
    APPLICATION: 'Aplicación',
    JAVA: 'Java',
    VERSION: 'Versión',
    DEBUGMODE_ON: 'Modo de depuración: Activado',
    DEBUGMODE_OFF: 'Modo de depuración: Desactivado',
    LOGFILES_TO_KEEP: 'Número mínimo, en días, de archivos de log mantenidos',
    JAVA_XMS: 'Alocación de memoria inicial (en MB)',
    JAVA_XMX: 'Alocación de memoria máxima (en MB)',
    JAVA_TMPDIR: 'Directorio de archivos temporarios',
    MESSAGES: {
      LOADING: 'Cargando configuración...',
      LOADING_OK: 'Configuración cargada.',
      LOADING_ERROR: 'Error - Un error inesperado ocurrió. Por favor intenta otra vez.',
      VALIDATE: 'Validando configuración...',
      SAVE: 'Gravando configuración...',
      SAVE_ERROR: 'Error - Un error inesperado ocurrió. Por favor intenta otra vez.',
      SAVE_OK: 'Configuración actualizada con éxito!'
    }
  },
  FORM_ERRORS: {
    FIELD_NOT_FILLED: 'Error - Campo obligatorio \'${p1}\' sin información.',
    FOLDER_SELECT_WARNING: 'Atención - Selección de diretorios no puede ser probada sin el Electron.',
    ONLY_YES_OR_NO: 'Error - Los parámetros SQL solo pueden ser \'Y\' or \'N\'. Por favor verifica los valores.'
  }
}