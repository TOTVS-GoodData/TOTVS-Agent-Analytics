import * as path from 'path';
import * as constants from '../src-angular/app/utilities/constants-angular';
import { CNST_APPLICATION_ROOTDIR } from '../app';

export const CNST_PROGRAM_PATH: string = CNST_APPLICATION_ROOTDIR;

export const CNST_COMMAND_FILE: string = '_jCommand';

export const CNST_ICONS_PATH: string = path.join(CNST_PROGRAM_PATH, 'icons');
export const CNST_ICONS_PATH_WINDOWS: string = path.join(CNST_ICONS_PATH, 'windows');
export const CNST_ICONS_PATH_LINUX: string = path.join(CNST_ICONS_PATH, 'linux');
export const CNST_ICON_WINDOWS: string = path.join(CNST_ICONS_PATH_WINDOWS, 'analytics.ico');
export const CNST_ICON_LINUX: string = path.join(CNST_ICONS_PATH_LINUX, 'analytics.png');

export const CNST_TMP_PATH: string = path.join(CNST_PROGRAM_PATH, 'tmp');
export const CNST_I18N_PATH: string = path.join(CNST_PROGRAM_PATH, 'i18n');
export const CNST_DATABASE_PATH: string = path.join(CNST_PROGRAM_PATH, 'assets');
export const CNST_DATABASE_NAME: string = path.join(CNST_DATABASE_PATH, 'db.json');
export const CNST_DATABASE_NAME_DEV: string = path.join(CNST_DATABASE_PATH, 'dbDevelopment.json');

export const CNST_PROGRAM_PATH_JAR_FAST: string = path.join(CNST_PROGRAM_PATH, 'java/TOTVS-FastAnalytics-Agent-1.7.8-jar-with-dependencies.jar');
export const CNST_PROGRAM_PATH_JAR_SMART: string = path.join(CNST_PROGRAM_PATH, 'java/gdc-agent-totvs-3.2.2.jar');
export const CNST_PROGRAM_PATH_LOGS: string = path.join(CNST_PROGRAM_PATH, '/logs');
export const CNST_REGEX_LOGS: string = 'logfile\-[0-9]{4}\-[0-9]{2}\-[0-9]{2}';

export const CNST_LINEBREAK: any = {
  WIN: '\r\n',
  LINUX: '\n',
  MAC: '\r'
}

export const CNST_OS_LINEBREAK = () => {
  if (process.platform == 'win32') {
    return CNST_LINEBREAK.WIN;
  } else if (process.platform == 'linux') {
    return CNST_LINEBREAK.LINUX;
  } else {
    return CNST_LINEBREAK.MAC;
  }
 }