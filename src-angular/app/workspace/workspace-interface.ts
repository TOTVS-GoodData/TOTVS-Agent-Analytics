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
  
  /* Método de conversão do ambiente (JSON => Objeto) */
  public toObject(data: Workspace): Workspace {
    this.id = data.id;
    this.name = data.name;
    this.license = data.license;
    this.GDEnvironment = data.GDEnvironment;
    this.GDUsername = data.GDUsername;
    this.GDPassword = data.GDPassword;
    this.GDWorkspaceId = data.GDWorkspaceId;
    this.GDWorkspaceUploadURL = data.GDWorkspaceUploadURL;
    this.GDProcessId = data.GDProcessId;
    this.GDProcessGraph = data.GDProcessGraph;
    this.databaseIdRef = data.databaseIdRef;
    this.pathMyProperties = data.pathMyProperties;
    
    return this;
  }
}
