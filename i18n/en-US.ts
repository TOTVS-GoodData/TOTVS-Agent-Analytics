export const CNST_TRANSLATIONS_EN_US: any = {
  SERVICES: {
    GOODDATA: {
      MESSAGES: {
        LOADING: 'Logging in to GoodData\'s platform...',
        LOADING_ERROR: 'Login has failed. Please check your credentials.',
        LOADING_WORKSPACES: 'Login\'s successfull. Loading workspaces...',
        LOADING_WORKSPACES_OK: 'Workspaces successfully loaded!',
        LOADING_WORKSPACES_ERROR: 'Unable to connect to GoodData\'s platform. Check your connection and try again.',
        LOADING_PROCESSES: 'Loading ETL processes...',
        LOADING_PROCESSES_ERROR: 'Unable to connect to GoodData\'s platform. Check your connection and try again.'
      }
    }
  },
  LANGUAGES: {
    en_US: 'English',
    pt_BR: 'Portuguese',
    es_ES: 'Spanish'
  },
  MENU: {
    WORKSPACES: 'Workspaces',
    DATABASES: 'Databases',
    SCHEDULES: 'Schedules',
    QUERIES: 'Queries',
    SCRIPTS: 'Scripts',
    MONITOR: 'Monitor',
    CONFIGURATION: 'Settings',
    EXIT: 'Exit'
  },
  BUTTONS: {
    SAVE: 'Save',
    ADD: 'Add',
    EDIT: 'Edit',
    DELETE: 'Delete',
    CONFIRM: 'Confirm',
    GO_BACK: 'Back',
    DETAILS: 'Detalhes',
    EXECUTE: 'Execute',
    NEW_PARAMETER: 'New parameter',
    YES_SIMPLIFIED: 'Y',
    NO_SIMPLIFIED: 'N',
    TEST_CONNECTION: 'Test Connection',
    LOAD_WORKSPACES: 'Load Workspaces'
  },
  WORKSPACES: {
    TITLE: 'Workspaces Management',
    NEW_WORKSPACE: 'New Workspace',
    EDIT_WORKSPACE: 'Edit Workspace',
    DELETE_CONFIRMATION: 'Are you sure you want to delete this workspace?',
    SECTIONS: {
      1: '1 / 4 - Commercial information',
      2: '2 / 4 - GoodData\'s platform settings',
      3: '3 / 4 - Database settings',
      4: '4 / 4 - Final settings'
    },
    MESSAGES: {
      LOADING: 'Loading workspaces...',
      LOADING_OK: 'Workspaces loaded.',
      LOADING_ERROR: 'Error - An unexpected error has happened. Please try again.',
      LOADING_DATABASES: 'Loading workspaces currently using database ${p1}...',
      LOADING_DATABASES_OK: 'Workspaces loaded.',
      LOADING_DATABASES_ERROR: 'Error - An unexpected error has happened. Please try again.',
      SAVE: 'Saving workspace: ${p1}',
      SAVE_OK: 'Workspace successfully saved!',
      SAVE_ERROR: 'Error - An unexpected error has happened while saving workspace ${p1}. Please try again.',
      SAVE_ERROR_SAME_NAME: 'Error - The workspace \'${p1}\' could not be saved, because there\'s a workspace with that name already.',
      DELETE: 'Deleting workspace: ${p1}',
      DELETE_OK: 'Workspace successfully deleted!',
      DELETE_ERROR: 'Error - An unexpected error has happened while deleting workspace ${p1}. Please try again.',
      VALIDATE: 'Validating workspace...',
      PASSWORD_ENCRYPT: 'Encrypting password...'
    },
    TABLE: {
      CONTRACT_TYPE: 'Contract Type',
      CUSTOMER_CODE: 'Customer\'s TOTVS code',
      ERP: 'ERP',
      MODULE: 'Module',
      SOURCE: 'Data source',
      USERNAME: 'Username',
      ENVIRONMENT: 'Domain',
      PASSWORD: 'Password',
      WORKSPACE: 'Workspace',
      UPLOAD_URL: 'Upload URL',
      PROCESS: 'ETL Process',
      GRAPH: 'Graph',
      DATABASE: 'Database',
      NAME: 'Configuration\'s name'
    }
  },
  DATABASES: {
    TITLE: 'Databases Management',
    NEW_DATABASE: 'New Database',
    EDIT_DATABASE: 'Edit Database',
    DELETE_CONFIRMATION: 'Are you sure you want to delete this database?',
    CONNECTION_STRING: {
      IP_ADDRESS: '<IP_ADDRESS>',
      PORT: '<PORT>',
      DATABASE_NAME: '<DATABASE_NAME>',
      SERVICE_NAME: '<SERVIÇE_NAME>',
      SID: '<SID>'
    },
    TABLE: {
      NAME: 'Configuration name',
      TYPE: 'Database type',
      DRIVER_CLASS: 'Driver class',
      DRIVER_PATH: 'Driver path',
      HOST_TYPE: 'Host type',
      HOST_NAME: 'IP address',
      PORT: 'Port',
      DATABASE: 'Database',
      SID: 'SID',
      SERVICE_NAME: 'Service name',
      INSTANCE: 'Database instance',
      CONNECTION_STRING: 'Connection string',
      USERNAME: 'Username',
      PASSWORD: 'Password',
      TEST_CONNECTION: 'Test Connection'
    },
    MESSAGES: {
      LOADING: 'Loading databases...',
      LOADING_OK: 'Databases loaded.',
      LOADING_ERROR: 'Error - An unexpected error has happened. Please try again.',
      SAVE: 'Saving database: ${p1}',
      SAVE_OK: 'Database successfully saved!',
      SAVE_ERROR: 'Error - An unexpected error has happened while saving database ${p1}. Please try again.',
      SAVE_ERROR_SAME_NAME: 'Error - The database \'${p1}\' could not be saved, because there\'s a database with that name already.',
      DELETE: 'Deleting database: ${p1}',
      DELETE_OK: 'Database successfully deleted!',
      DELETE_ERROR: 'Error - An unexpected error has happened while deleting database ${p1}. Please try again.',
      DELETE_ERROR_WORKSPACES: 'Error - Unable to delete this database, because there are workspaces using it.',
      LOGIN: 'Testing database connection: ${p1}',
      LOGIN_OK: 'Connection successfull!',
      LOGIN_ERROR: 'Error - Connection with database \'${p1}\' failed. Check the fields and try again.',
      LOGIN_WARNING: 'Warning - Database connections can only be tested with Electron.',
      VALIDATE: 'Validating database...',
      ERROR_INVALID_IP: 'Error - Invalid IP address. Please check it\'s type (ipv4 / ipv6 / hostname).',
      ERROR_INVALID_PORT: 'Error - Invalid database port. Please check if it\'s number is between the valid range (1024 - 65536).',
      PASSWORD_ENCRYPT: 'Criptografando senhas...',
    }
  },
  SCHEDULES: {
    TITLE: 'Schedules Management',
    NEW_SCHEDULE: 'New Schedule',
    EDIT_SCHEDULE: 'Edit Schedule',
    NOT_FOUND: 'No schedules found.',
    DELETE_CONFIRMATION: 'Are you sure you want to delete this schedule?',
    TABLE: {
      NAME: 'Schedule name',
      WORKSPACE: 'Workspace',
      WINDOWS: 'Execution windows',
      ENABLED: 'Enabled?',
      ZIP_FILENAME: 'Compressed filename',
      ZIP_EXTENSION: 'Compression algorithm',
      FILE_FOLDER: 'Folder to upload',
      FILE_WILDCARD: 'Wildcard',
      LAST_EXECUTION: 'Last execution',
      SQL_PARAMETERS: {
        TITLE: 'SQL Parameters',
        DESCRIPTION: 'Parameters to be sent to queries / scripts',
        TABLE: {
          NAME: 'Name',
          VALUE: 'Value',
          SQL: 'SQL (Y/N)?'
        }
      },
      ETL_PARAMETERS: {
        TITLE: 'ETL Parameters',
        DESCRIPTION: 'Parameters to be sent to ETL (CloudConnect / Bricks)',
        TABLE: {
          NAME: 'Name',
          VALUE: 'Value'
        }
      }
    },
    MESSAGES: {
      LOADING: 'Loading schedules...',
      LOADING_OK: 'Schedules loaded.',
      LOADING_ERROR: 'Error - An unexpected error has happened. Please try again.',
      ID_LOADING: 'Loading schedule with Id ${p1}...',
      ID_LOADING_OK: 'Schedule loaded.',
      ID_LOADING_ERROR: 'Error - An unexpected error has happened while saving schedule with Id ${p1}. Please try again.',
      VALIDATE: 'Validating schedule...',
      SAVE: 'Saving schedule: ${p1}',
      SAVE_OK: 'Schedule successfuly saved!',
      SAVE_ERROR: 'Error - An unexpected error has happened while saving schedule ${p1}. Please try again.',
      SAVE_ERROR_SAME_NAME: 'Error - The schedule \'${p1}\' could not be saved, because there\'s a schedule with that name already.',
      DELETE: 'Deleting schedule: ${p1}',
      DELETE_OK: 'Schedule successfully deleted!',
      DELETE_ERROR: 'Error - An unexpected error has happened while deleting schedule ${p1}. Please try again.',
      TRIGGERSCHEDULES_LOADING: 'Checking schedules: [${p1}]',
      TRIGGERSCHEDULES_OK: 'Initialization finished. Triggering schedules...',
      TRIGGERSCHEDULES_ERROR: 'Error - Schedule\'s automatic triggering has failed.',
      RUN: 'Requesting schedule \'${p1}\' execution.',
      RUN_MANUAL: 'Schedule\'s \'${p1}\' execution triggered manually by user.',
      RUN_OK: 'Schedule\'s execution successfully requested. Please check it\'s behaviour using \'Monitor\'s menu.',
      RUN_EXECUTIONDATE: 'Saving schedule\'s \'${p1}\' latest execution timestamp.',
      RUN_ERROR: 'Error - An unexpected error has happened while requesting schedule\'s \'${p1}\' execution. Please try again.',
      RUN_PREPARE: 'Preparing request package to send to java...',
      RUN_WARNING: 'Warning - Schedule\'s executions can only be tested with Electron.'
    }
  },
  QUERIES: {
    TITLE: 'Queries Management',
    IMPORT_QUERIES: 'Import FAST\'s queries',
    NEW_QUERY: 'New query',
    EDIT_QUERY: 'Edit query',
    DELETE_CONFIRMATION: 'Are you sure you want to delete this query?',
    TABLE: {
      SCHEDULE_NAME: 'Schedule name',
      QUERY_NAME: 'Query name',
      MODE: 'Execution mode',
      SQL: 'SQL command'
    },
    MESSAGES: {
      LOADING: 'Loading queries...',
      LOADING_OK: 'Queried loaded.',
      LOADING_ERROR: 'Error - An unexpected error has happened. Please try again.',
      SCHEDULE_LOADING: 'Loading queries from schedule: \'${p1}\'',
      SCHEDULE_LOADING_OK: 'Queries loaded.',
      SCHEDULE_LOADING_ERROR: 'Error - An unexpected error has happened. Please try again.',
      SAVE: 'Saving query: \'${p1}\'',
      SAVE_OK: 'Query successfully saved!',
      SAVE_ERROR: 'Error - An unexpected error has happened while saving query \'${p1}\'. Please try again.',
      SAVE_ERROR_SAME_NAME: 'Error - The query \'${p1}\' could not be saved, because there\'s a query with that name already.',
      DELETE: 'Deleting query: \'${p1}\'',
      DELETE_OK: 'Query successfully deleted!',
      DELETE_ERROR: 'Error - An unexpected error has happened while deleting query \'${p1}\'. Please try again.',
      EXPORT: 'Exporting queries...',
      EXPORT_OK: 'Query exporting finished successfully.',
      EXPORT_ERROR: 'Error - An unexpected error has happened. Please try again.',
      EXPORT_WARNING: 'Warning - Schedule \'${p1}\' already have all standard queries loaded',
      EXPORT_STANDARD: 'Extracting FAST\'s standard queries.',
      EXPORT_STANDARD_OK: 'FAST\'s standard queries successfully loaded.',
      EXPORT_STANDARD_WARNING: 'Warning - No standard queries were found for this schedule.',
      EXPORT_SAVE: 'Saving FAST\'s standard queries on schedule: \'${p1}\'.',
      EXPORT_SAVE_ERROR: 'Error - An unexpected error has happened while saving FAST\'s standaard queries on schedule \'${p1}\'. Please try again.',
      EXPORT_I01: 'Exportação de consultas da tabela I01 do Protheus ativada.',
      EXPORT_I01_PREPARE: 'Preparing request package to send to java...',
      EXPORT_I01_WARNING: 'Warning - I01\'s queries exports can only be tested with Electron.',
      EXPORT_I01_ERROR_NOTPROTHEUS: 'Error - I01\'s queries exports are only supported for Protheus ERP.',
      ENCRYPT: 'Encrypting query: ${p1}',
      VALIDATE: 'Validating query...'
    }
  },
  SCRIPTS: {
    TITLE: 'Scripts Management',
    IMPORT_SCRIPTS: 'Import FAST\'s scripts',
    NEW_SCRIPT: 'New script',
    EDIT_SCRIPT: 'Edit script',
    DELETE_CONFIRMATION: 'Are you sure you want to delete this script?',
    TABLE: {
      SCHEDULE_NAME: 'Schedule name',
      SCRIPT_NAME: 'Script name',
      SQL: 'SQL command'
    },
    MESSAGES: {
      LOADING: 'Loading scripts...',
      LOADING_OK: 'Scripts loaded.',
      LOADING_ERROR: 'Error - An unexpected error has happened. Please try again.',
      SCHEDULE_LOADING: 'Loading scripts from schedule: \'${p1}\'',
      SCHEDULE_LOADING_OK: 'Scripts loaded.',
      SCHEDULE_LOADING_ERROR: 'Error - An unexpected error has happened. Please try again.',
      SAVE: 'Saving script: \'${p1}\'',
      SAVE_OK: 'Script successfully saved!',
      SAVE_ERROR: 'Error - An unexpected error has happened while saving script \'${p1}\'. Please try again.',
      SAVE_ERROR_SAME_NAME: 'Error - The script \'${p1}\' could not be saved, because there\'s a script with that name already.',
      DELETE: 'Deleting script: \'${p1}\'',
      DELETE_OK: 'Script successfully deleted!',
      DELETE_ERROR: 'Error - An unexpected error has happened while deleting script \'${p1}\'. Please try again.',
      EXPORT: 'Exporting scripts...',
      EXPORT_OK: 'Script exporting finished successfully.',
      EXPORT_ERROR: 'Error - An unexpected error has happened. Please try again.',
      EXPORT_WARNING: 'Warning - Schedule \'${p1}\' already have all standard scripts loaded.',
      EXPORT_STANDARD: 'Extracting FAST\'s standard scripts.',
      EXPORT_STANDARD_OK: 'FAST\' standard scripts loaded successfully.',
      EXPORT_STANDARD_WARNING: 'Warning - No standard scripts were found for this schedule',
      EXPORT_SAVE: 'Saving FAST\'s standard scripts on schedule: \'${p1}\'.',
      EXPORT_SAVE_ERROR: 'Error - An unexpected error has happened while saving FAST\'s standard scripts on schedule \'${p1}\'. Please try again.',
      ENCRYPT: 'Encrypting script: \'${p1}\'',
      VALIDATE: 'Validating script...'
    }
  },
  MONITOR: {
    TITLE: 'Execution Monitor',
    TABLE: {
      STATUS: 'Status',
      SCHEDULE: 'Schedule',
      START_DATE: 'Date/Time start',
      FINAL_DATE: 'Date/Time finish',
      EXECUTION_TIME: 'Execution time',
      DETAILS: {
        TIMESTAMP: 'Timestamp',
        LEVEL: 'Level',
        SOURCE: 'Source',
        MESSAGE: 'Message'
      },
      EXECUTION_STATUS: {
        DONE: 'Done',
        RUNNING: 'Running',
        CANCELED: 'Canceled',
        ERROR: 'Error'
      }
    },
    MESSAGES: {
      WARNING: 'Warning - Log monitoring can only be tested with Electron.'
    }
  },
  CONFIGURATION: {
    TITLE: '${p1}\'s configuration',
    APPLICATION: 'Application',
    JAVA: 'Java',
    VERSION: 'Version',
    DEBUGMODE_ON: 'Debug mode: On',
    DEBUGMODE_OFF: 'Debug mode: Off',
    LOGFILES_TO_KEEP: 'Minimum number of logfiles to be kept',
    JAVA_XMS: 'Minimum memory allocation (MB)',
    JAVA_XMX: 'Maximum memory allocation (MB)',
    JAVA_TMPDIR: 'Temporary files directory',
    MESSAGES: {
      LOADING: 'Loading configurations...',
      LOADING_OK: 'Configurations loaded.',
      LOADING_ERROR: 'Error - An unexpected error has happened. Please try again.',
      VALIDATE: 'Validating configuration...',
      SAVE: 'Saving configuration...',
      SAVE_ERROR: 'Error - An unexpected error has happened. Please try again.',
      SAVE_OK: 'Configuration successfully saved!'
    }
  },
  FORM_ERRORS: {
    FIELD_NOT_FILLED: 'Error - Mandatory field \'${p1}\' not informed.',
    FIELD_NOT_FILLED_GRAPH: 'Error - Mandatory field  \'${p1}\' not informed. Please select a graph to execute, or remove field\'s \'ETL Process\' selecion.',
    FOLDER_SELECT_WARNING: 'Warning - Folder selection can only be tested with Electron.',
    ONLY_YES_OR_NO: 'Error - SQL Parameters can only be \'Y\' or \'N\'. Please check its typing.'
  }
}