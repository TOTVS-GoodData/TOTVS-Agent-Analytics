/* Interface de ambientes do Agent */
export class Workspace {
  id: string;
  name: string;
  contractType: string;
  contractCode: string;
  erp: string;
  module: string;
  source: string;
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
    this.contractType = '';
    this.contractCode = '';
    this.erp = '';
    this.module = '';
    this.source = '';
    this.GDEnvironment = '';
    this.GDUsername = '';
    this.GDPassword = '';
    this.GDWorkspaceId = '';
    this.GDWorkspaceUploadURL = '';
    this.databaseIdRef = '';
    this.name = '';
  }
}