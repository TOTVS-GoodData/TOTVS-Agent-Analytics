/* Interface de comunicação com o Agent-Server */
export class ServerCommunication {
  source: string;
  destination: string;
  word: string;
  args: string[];
}

/* Interface de registro dos sockets de conexão */
export class SocketCommunication {
  socket: any;
  serialNumber: string;
}