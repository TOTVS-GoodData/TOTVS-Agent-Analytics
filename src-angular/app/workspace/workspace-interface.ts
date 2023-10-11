/* Interface de licenças do Agent */
import { License } from '../services/server/server-interface';

/* Interface de ambientes do Agent */
export class Workspace {
  id: string;
  name: string;
  license: License;
  GDEnvironment: string;
  GDUsername: string;
  GDPassword: string;
  GDWorkspaceId: string;
  GDWorkspaceUploadURL: string;
  GDProcessId: string;
  GDProcessGraph: string;
  databaseIdRef: string;
  databaseName?: string;
  pathMyProperties: string;
  
  constructor() {
    this.id = null;
    this.GDEnvironment = '';
    this.GDUsername = '';
    this.GDPassword = '';
    this.GDWorkspaceId = '';
    this.GDWorkspaceUploadURL = '';
    this.databaseIdRef = '';
    this.name = '';
  }
}
