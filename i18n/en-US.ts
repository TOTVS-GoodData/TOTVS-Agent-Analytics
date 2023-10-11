export const CNST_TRANSLATIONS_EN_US: any = {
  ELECTRON: {
    SYSTEM_START: '=== SYSTEM ONLINE ===',
    SYSTEM_FINISH: '=== SYSTEM OFFLINE ===',
    SYSTEM_WINDOW_CLOSE: '=== Window closed ===',
    SYSTEM_SERVICE: '=== Switching Agent to backend mode... ===',
    UPDATE_CHECK: 'Looking for updates...',
    UPDATE_AVAILABLE: 'Update available: ${p1} --> ${p2}',
    UPDATE_NOT_AVAILABLE: 'No updates available for this version (${p1})',
    UPDATE_ERROR: 'Error - Failed to download Agent\'s update package.',
    UPDATE_READY_TITLE: 'A new update is available!',
    UPDATE_READY_DESCRIPTION: 'Would you like to install the updates now?',
    AUTOLAUNCH_ERROR: 'Error - Agent\'s automatic startup has failed.',
    THREAD_ERROR: 'Error - ${p1} is already being executed. This instance will exit.',
    UPDATE_DOWNLOAD: 'Downloading update: ${p1} (${p2}) -- spd: ${p3}',
    UPDATE_DOWNLOAD_OK: 'Update ${p1} downloaded successfully. It\'s installation will start automatically when Agent is turned off.',
    TRAY_OPEN_INTERFACE: 'Open interface',
    TRAY_FINISH_PROCESS: 'Finish process',
    FOLDER_SELECT: 'Please select the directory',
    FILE_SELECT_DRIVER: 'Please select the driver\'s JDBC file',
    DATABASE_DEVELOPMENT: 'Using development database.',
    DATABASE_PRODUCTION: 'Using production database.',
    DATABASE_CREATE: 'New installation detected. Creating new database.',
    DATABASE_CREATE_OK: 'Database successfully created.',
    DELETE_OLD_LOGS: 'Removing old logfiles.',
    DELETE_OLD_LOGS_OK: 'Old logfiles successfully deleted.',
    DATABASE_LOGIN_ELEC_START: 'Requesting database conection test to java...',
    DATABASE_LOGIN_ELEC_FINISH: 'Database connection test has finished. Execution result: ${p1}',
    EXPORT_QUERY_ELEC_START: 'Requesting I01\'s table export to java...',
    EXPORT_QUERY_ELEC_FINISH: 'I01\'s table export has finished. Execution result: ${p1}',
    RUN_AGENT_ELEC_START: 'Requesting data extraction to java...',
    RUN_AGENT_ELEC_FINISH: 'Data extraction has finished. Execution result: ${p1}',
    PROCESS_KILL: 'Forcing process termination [Sch: ${p1} - Exec: ${p2}]...',
    PROCESS_KILL_OK: 'Process [Sch: ${p1} - Exec: ${p2}] terminated successfully.',
    PROCESS_KILL_WARN: 'Warning - Process [Sch: ${p1}, Exec: ${p2}] is no longer being executed.',
    PROCESS_KILL_ERROR: 'Error - Failed to terminate process execution [Sch: ${p1}, Exec: ${p2}].',
    PROCESS_KILL_ALL: 'Terminating all Java processes...',
    PROCESS_KILL_ALL_OK: 'All processes terminated.',
    JAVA_EXECUTION_START: '===Agent execution start: (.*)===',
    JAVA_EXECUTION_END: '===Agent execution end: (.*)===',
    JAVA_EXECUTION_DURATION: '===Agent execution time: (.*)===',
    JAVA_EXECUTION_CANCELLED: '===Process terminated by user request===',
    WINDOWS_REGISTRY_ERROR: 'Windows Registry update error (autoUpdate)',
    QUERY_UPDATER: 'Checking for FAST\'s standard query updates..',
    QUERY_UPDATER_OK: 'FAST\'s query updates has finished successfully.',
    QUERY_UPDATER_NO_UPDATES: 'No query updates were found for FAST.',
    QUERY_UPDATER_ERROR: 'Error - FAST\'s query updates has failed.',
    QUERY_UPDATER_AVAILABLE: '  ${p1} ([${p2}] --> [${p3}])',
    QUERY_UPDATER_NOT_STANDARD: '  ${p1} ([Ignored])',
    SCRIPT_UPDATER: 'Checking for FAST\'s standard script updates..',
    SCRIPT_UPDATER_OK: 'FAST\'s script updates has finished successfully.',
    SCRIPT_UPDATER_NO_UPDATES: 'No script updates were found for FAST.',
    SCRIPT_UPDATER_ERROR: 'Error - FAST\'s script updates has failed.',
    SCRIPT_UPDATER_AVAILABLE: '  ${p1} ([${p2}] --> [${p3}])',
    SCRIPT_UPDATER_NOT_STANDARD: '  ${p1} ([Ignored])',
    SERVER_COMMUNICATION: {
      MESSAGES: {
        START: '=== LISTENER ONLINE ON PORT [${p1}]===',
        FINISH: '=== LISTENER OFFLINE ON PORT [${p1}]===',
        ERROR: 'Error - Server initialization has failed.',
        NEW_WORD: '[${p1}] New command word received: \'${p2}\'.',
        CONNECTED: '=== CONNECTED TO SERVER ===',
        DISCONNECTED: '=== DISCONNECTED FROM SERVER ===',
        SEND_COMMAND: 'Sending \'${p1}\' command to TOTVS\'s server...',
        SEND_COMMAND_RESPONSE: '\'${p1}\'s command response was received.',
        SEND_COMMAND_OK: 'Request sent. Listening for a reponse...',
        SERIAL_NUMBER: 'Activating Agent...',
        SERIAL_NUMBER_OK: 'Agent successfully registered.',
        SERIAL_NUMBER_ERROR: 'Agent\'s activation has failed. Please try again.'
      }
    }
  },
  ANGULAR: {
    SYSTEM_EXIT: 'Are you sure you want to close Agent?',
    SYSTEM_FINISH_USER: '=== System shutdown request received from user (exit menu) ===',
    SYSTEM_FINISH_USER_WARNING: 'Warning - System shutdown can only be tested with Electron.',
    ERROR: 'Error - An unexpected error has happened. Please try again.',
    OTHER: 'Other',
    NONE: 'None',
    REGISTER_AGENT_TITLE: 'Installation activation',
    REGISTER_AGENT_DESCRIPTION_1: 'Enter GoodData\'s verification code, which was sent by TOTVS.',
    REGISTER_AGENT_DESCRIPTION_2: 'If you don\'t know this code, please reach out to "suporte.gd@totvs.com.br".',
    REGISTER_AGENT: 'Registering license...',
    REGISTER_AGENT_FIELD: 'Verification code',
    REGISTER_AGENT_OK: 'License sucessfully activated. Agent is ready to use.',
    REGISTER_AGENT_ERROR: 'Error - License activation has failed. Please try again.',
    REGISTER_AGENT_WARNING: 'Warning - Agent\'s installation activation can only be tested with Electron.'
  },
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
    TITLE: 'Application\'s language',
    "en-US": 'English',
    "pt-BR": 'Portuguese',
    "es-ES": 'Spanish'
  },
  CONTRACT_TYPES: {
    PLATFORM: 'GoodData Platform',
    FAST: 'FAST Analytics'
  },
  SOURCES: {
    LOCALLY: 'Locally',
    CLOUD_OTHERS: 'Cloud (Other)'
  },
  MENU: {
    WORKSPACES: 'Workspaces',
    DATABASES: 'Databases',
    SCHEDULES: 'Schedules',
    QUERIES: 'Queries',
    SCRIPTS: 'Scripts',
    MONITOR: 'Monitor',
    CONFIGURATION: 'Settings',
    ACTIVATION: 'Activation',
    EXIT: 'Exit'
  },
  BUTTONS: {
    SAVE: 'Save',
    ADD: 'Add',
    EDIT: 'Edit',
    DELETE: 'Delete',
    CONFIRM: 'Confirm',
    GO_BACK: 'Back',
    DETAILS: 'Details',
    EXECUTE: 'Execute',
    SELECT: 'Choose...',
    NEW_PARAMETER: 'New parameter',
    YES_SIMPLIFIED: 'Y',
    NO_SIMPLIFIED: 'N',
    TEST_CONNECTION: 'Test Connection',
    LOAD_WORKSPACES: 'Load Workspaces',
    NEXT_ERROR: 'Next error',
    NO_ERRORS: 'No errors',
    YES: 'Yes',
    NO: 'No',
    UPDATE_NOW: 'Yes (Will close Agent)',
    UPDATE_LATER: 'No (On exit)'
  },
  WORKSPACES: {
    TITLE: 'Workspaces Management',
    NEW_WORKSPACE: 'New Workspace',
    EDIT_WORKSPACE: 'Edit Workspace',
    DELETE_CONFIRMATION: 'Are you sure you want to delete this workspace?',
    NO_DATA: 'No workspaces were found',
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
      PASSWORD_ENCRYPT: 'Encrypting password...',
      LOADING_LICENSES: 'Requesting available licenses from server...',
      LOADING_LICENSES_OK: 'Licenses received.',
      LOADING_LICENSES_ERROR: 'Error - An unexpected error has happened. Please try again.',
      LOADING_LICENSES_WARNING: 'Warning - Server communication cannot be tested without Electron.'
    },
    TABLE: {
      ERP: 'ERP',
      MODULE: 'Module',
      USERNAME: 'Username',
      ENVIRONMENT: 'Domain',
      PASSWORD: 'Password',
      WORKSPACE: 'Workspace',
      UPLOAD_URL: 'Upload URL',
      PROCESS: 'ETL Process',
      GRAPH: 'Graph',
      DATABASE: 'Database',
      NAME: 'Configuration\'s name'
    },
    TOOLTIPS: {
      ENVIRONMENT: 'GoodData\'s platform domain name.',
      USERNAME: 'GoodData\'s platform username. This user must already have an account, and admin rights to the workspace.',
      PASSWORD: 'Username\'s password.',
      WORKSPACE: 'Choose the workspace for which the data will be uploaded.',
      UPLOAD_URL: 'GoodData\'s FTP / WebDAV server\'s fullpath, where the data will be uploaded by Agent.',
      PROCESS: 'Choose the ETL\'s process name (CloudConnect / Bricks) that will process the data sent.',
      GRAPH: 'Choose CloudConnect\'s main graph, that the ETL process will begin it\'s execution.'
    }
  },
  DATABASES: {
    TITLE: 'Databases Management',
    NEW_DATABASE: 'New Database',
    EDIT_DATABASE: 'Edit Database',
    DELETE_CONFIRMATION: 'Are you sure you want to delete this database?',
    NO_DATA: 'No databases were found',
    CONNECTION_STRING: {
      IP_ADDRESS: '<IP_ADDRESS>',
      PORT: '<PORT>',
      DATABASE_NAME: '<DATABASE_NAME>',
      SERVICE_NAME: '<SERVICE_NAME>',
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
      ERROR_INVALID_PORT: 'Error - Invalid database port. Please check if it\'s number is between the valid range (${p1} - ${p2}).',
      PASSWORD_ENCRYPT: 'Criptografando senhas...'
    },
    TOOLTIPS: {
      DRIVER_CLASS: 'JDBC driver\'s main Java class name. This name can be found using database connection IDEs',
      DRIVER_PATH: 'JDBC driver\'s full path. This file must have the ".jar" extension',
      HOST_TYPE: 'Host type: "Ipv4": Format "255.255.255.255". "Ipv6": Format "FF:FF:...:FF". "Hostname": Name of the machine.',
      HOST_NAME: 'IP address that the database is located at.',
      PORT: 'Choose the port\'s number that the database listens to. This number must be between ${p1} and ${p2}.',
      CONNECTION_STRING: 'Final connection string command, for database connections. This command will be used by Agent when connecting to the database.'
    }
  },
  SCHEDULES: {
    TITLE: 'Schedules Management',
    NEW_SCHEDULE: 'New Schedule',
    EDIT_SCHEDULE: 'Edit Schedule',
    NOT_FOUND: 'No schedules found.',
    DELETE_CONFIRMATION: 'Are you sure you want to delete this schedule?',
    NO_DATA: 'No schedules were found',
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
      TRIGGERSCHEDULES_LOADING_OK: 'Initialization finished. Triggering schedules...',
      TRIGGERSCHEDULES_LOADING_ERROR: 'Error - Schedule\'s automatic triggering has failed.',
      RUN: 'Requesting schedule \'${p1}\' execution.',
      RUN_MANUAL: 'Schedule\'s \'${p1}\' execution triggered manually by user.',
      RUN_OK: 'Schedule\'s execution successfully requested. Please check it\'s behaviour using \'Monitor\'s menu.',
      RUN_EXECUTIONDATE: 'Saving schedule\'s \'${p1}\' latest execution timestamp.',
      RUN_ERROR: 'Error - An unexpected error has happened while requesting schedule\'s \'${p1}\' execution. Please try again.',
      RUN_PREPARE: '  [Schedule: ${p1}] Preparing request package to send to java...',
      RUN_WARNING: 'Warning - Schedule\'s executions can only be tested with Electron.'
    },
    TOOLTIPS: {
      WINDOWS: 'Choose the time which Agent will trigger this schedule, on a daily basis.',
      ZIP_FILENAME: 'Compressed filename to be sent to GoodData. This file will have all extracted data inside of it.',
      FILE_FOLDER: 'Directory to be sent to GoodData. All files in this directory will be added to dataload.',
      FILE_WILDCARD: 'Use this field to filter out some files to be sent to GoodData. Example: To upload only Excel files, with any name, use: *.xlsx. If there\'s no restrictions, use: *.*'
    }
  },
  QUERIES: {
    TITLE: 'Queries Management',
    IMPORT_QUERIES: 'Import FAST\'s queries',
    NEW_QUERY: 'New query',
    EDIT_QUERY: 'Edit query',
    DELETE_CONFIRMATION: 'Are you sure you want to delete this query?',
    NO_DATA: 'No queries were found',
    TABLE: {
      SCHEDULE_NAME: 'Schedule name',
      QUERY_NAME: 'Query name',
      MODE: 'Execution mode',
      SQL: 'SQL command'
    },
    EXECUTION_MODES: {
      COMPLETE: 'Full',
      MONTHLY: 'Monthly'
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
    },
    TOOLTIPS: {
      QUERY_NAME: 'Query\'s name. This name will be shown by Agent\'s logfiles.',
      MODE: 'Query\'s execution mode: "Full" - Agent will attempt to replace schedule\'s parameters inside query\'s SQL instruction, and execute it only once. "Monthly" - Agent will generate new START_DATE / FINAL_DATE parameters that are between the schedule\'s predefined values, on a monthly basis, in order to execute the query multiple times. Example: If this schedule is set to execute for the last 3 months, Agent will execute this query 3 times, once for each month.'
    }
  },
  SCRIPTS: {
    TITLE: 'Scripts Management',
    IMPORT_SCRIPTS: 'Import FAST\'s scripts',
    NEW_SCRIPT: 'New script',
    EDIT_SCRIPT: 'Edit script',
    DELETE_CONFIRMATION: 'Are you sure you want to delete this script?',
    NO_DATA: 'No scripts were found',
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
    },
    TOOLTIPS: {
      SCRIPT_NAME: 'Script\'s name. This name will be shown by Agent\'s logfiles.'
    }
  },
  MONITOR: {
    TITLE: 'Execution Monitor',
    NO_DATA: 'No execution logs were found',
    TABLE: {
      STATUS: 'Status',
      LINES: 'Lines',
      SCHEDULE: 'Schedule',
      START_DATE: 'Date/Time start',
      FINAL_DATE: 'Date/Time finish',
      EXECUTION_TIME: 'Execution time',
      DETAILS: {
        TITLE: 'Execution details',
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
      WARNING: 'Warning - Log monitoring can only be tested with Electron.',
      KILL_PROCESS_TITLE: 'Are you sure you want to kill this execution?',
      SCHEDULE_NOT_FOUND: 'Unknown'
    }
  },
  CONFIGURATION: {
    TITLE: '${p1}\'s configuration',
    APPLICATION: 'Application',
    JAVA: 'Java',
    VERSION: 'Version',
    DEBUGMODE_ON: 'Debug mode: On',
    DEBUGMODE_OFF: 'Debug mode: Off',
    AUTOUPDATE_ON: 'Auto update: On',
    AUTOUPDATE_OFF: 'Auto update: Off',
    LOGFILES_TO_KEEP: 'Minimum number of logfiles to be kept',
    JAVA_XMX: 'Maximum memory allocation (MB)',
    JAVA_TMPDIR: 'Temporary files directory',
    JAVA_JREDIR: 'Java\'s JRE directory',
    TIMEZONE: 'Timezone',
    CLIENT_PORT: 'TOTVS Server\'s communication port',
    MESSAGES: {
      LOADING: 'Loading configurations...',
      LOADING_OK: 'Configurations loaded.',
      LOADING_ERROR: 'Error - An unexpected error has happened. Please try again.',
      VALIDATE: 'Validating configuration...',
      SAVE: 'Saving configuration...',
      SAVE_ERROR: 'Error - An unexpected error has happened. Please try again.',
      SAVE_OK: 'Configuration successfully saved!'
    },
    TOOLTIPS: {
      DEBUGMODE: 'Adds extra logging messages on Agent\'s execution log.',
      LOGFILES: 'Maximum number of logfiles to be kept inside Agent\'s log directory. Agent will automatically delete logfiles older than this parameter.',
      JAVA_XMX: 'Maximum RAM memory allocation (MB - Megabytes) that Agent is allowed to use when running schedules. If this threshold is not enough to upload data, Agent will terminate it\'s execution, with an error message. Minimum value: ${p1}MB',
      JAVA_TMPDIR: 'Temporary directory, used by Agent to store files before uploading to GoodData. Choose a directory that can be completely deleted if necessary.',
      JAVA_JREDIR: './bin directory, where Java\'s binary files are located. If not informed, Agent will search for Java under the system\'s environment variables.',
      AUTOUPDATE: 'Defines if Agent will automatically install any updates created by TOTVS. If positive, the user will be prompted when a new update has been found, which in turn will be installed immediately. If negative, Agent will never try to update itself.',
      CLIENT_PORT: 'Choose the port\'s number that Agent will use to communicate with TOTVS\'s server. This number must be between ${p1} and ${p2}.'
    }
  },
  FORM_ERRORS: {
    FIELD_NOT_FILLED: 'Error - Mandatory field \'${p1}\' not informed.',
    FIELD_NOT_FILLED_GRAPH: 'Error - Mandatory field  \'${p1}\' not informed. Please select a graph to execute, or remove field\'s \'ETL Process\' selecion.',
    FIELD_TYPING_WRONG: 'Error: Field \'${p1}\' data is not valid. Please check its typing.',
    FIELD_MINIMUM_ERROR: 'Error - Field \'${p1}\'s value is not within the expected range (${p2} - ${p3}).',
    FOLDER_SELECT_WARNING: 'Warning - Folder selection can only be tested with Electron.',
    ONLY_YES_OR_NO: 'Error - SQL Parameters can only be \'Y\' or \'N\'. Please check its typing.'
  }
}
