export const CNST_PROGRAM_NAME: string = 'Totvs-Agent.exe';
export const CNST_PROGRAM_JDBC_CLASS: string = 'com.gooddata.agent.util.TestDataBaseConnection';
export const CNST_PROGRAM_TOKEN_CLASS: string = 'com.gooddata.agent.util.CheckToken';
export const CNST_LOGLEVEL_ERROR: number = 0;
export const CNST_LOGLEVEL_WARN: number = 1;
export const CNST_LOGLEVEL_INFO: number = 2;
export const CNST_LOGLEVEL_DEBUG: number = 5;

export const CNST_LOGLEVEL: any = [
  { value: 0, label: '[ERROR]' },
  { value: 1, label: '[WARN ]' },
  { value: 2, label: '[INFO ]' },
  { value: 5, label: '[DEBUG]' }
];