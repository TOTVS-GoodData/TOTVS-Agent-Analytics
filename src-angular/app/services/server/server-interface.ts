/* Interface de consultas do Agent */
import { QueryClient } from '../../query/query-interface';

/* Interface de rotinas do Agent */
import { ScriptClient } from '../../script/script-interface';

/* Interface de parâmetros de ETL do Agent */
import { ETLParameterClient } from '../../schedule/schedule-interface';

/* Interface de parâmetros de SQL do Agent */
import { SQLParameterClient } from '../../schedule/schedule-interface';

/* Interface de licenças do Agent */
export class License {
  id: string;
  source: string;
  module: string;
}

/* Interface de resposta do Agent-Server, com as licenças disponíveis para esta instalação do Agent */
export class AvailableLicenses {
  contractType: string;
  TOTVSCode: string;
  licenses: License[];
}

/* Interface de resposta do Agent-Server, com as consultas padrões para esta licença do Agent */
export class QueryCommunication {
  License: License;
  Queries: QueryClient[];
}

/* Interface de resposta do Agent-Server, com as rotinas padrões para esta licença do Agent */
export class ScriptCommunication {
  License: License;
  Scripts: ScriptClient[];
}

/* Interface de resposta do Agent-Server, com os parâmetros de ETL padrões para esta licença do Agent */
export class ETLParameterCommunication {
  License: License;
  ETLParameters: ETLParameterClient[];
}

/* Interface de resposta do Agent-Server, com os parâmetros de SQL padrões para esta licença do Agent */
export class SQLParameterCommunication {
  License: License;
  SQLParameters: SQLParameterClient[];
}
