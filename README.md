# TOTVS-Agent-Analytics
Programa oficial da TOTVS para envio de dados para a plataforma GoodData.

Suporta sistemas Windows / Linux / MacOS.

Desenvolvido em NodeJS 18.17.1 / Portinari.16.4.1 / Angular.16.2.11 / Electron.27.0.0

## Instalação do programa
Executar o seguinte comando:

```powershell
   npm install
```

Depois, é necessário alterar o código fonte da dependência ```auto-launch```, instalada na pasta ```node_modules``` pelo comando acima. Para isto, basta pegar os 2 fontes da pasta ```replacements``` (AutoLaunchWindowsjs e AutoLaunchLinux.js), e substituí-los na pasta ```node_modules/auto-launch/dist/```.

Após a instalação das dependências do projeto e realizado o ajuste acima, executar o seguinte comando para subir a aplicação:

```powershell
   npm start
```

## Desenvolvimento
### Ambiente de desenvolvimento (Angular)
Executar os seguintes comandos para subir um ambiente de desenvolvimento do Agent, utilizando o navegador da web para testar a aplicação:

```powershell
   npm run angular
```

```powershell
   npm run json-server
```

O comando ```npm run angular``` irá subir a aplicação como um todo no navegador da web, enquanto que o comando ```npm run json-server``` irá subir um servidor json, que irá permitir a leitura/gravação dos dados inseridos no Agent. Desta forma, é possível testar a interface do Agent mesmo sem utilizar o Electron.

É necessário abrir um terminal do SO para cada um destes comandos, e executá-los separadamente. Além disso, algumas funcionalidades que dependem do SO (como executar o java) não são suportadas neste ambiente de desenvolvimento.

### Ambiente de desenvolvimento (Electron)
Para subir um ambiente de desenvolvimento do Agent, como uma aplicação nativa do SO, primeiramente é necessário gerar uma nova build do Angular, na pasta ```/dist/``` do projeto, através do seguinte comando:

```powershell
   npm run build-angular
```

Nesta build, apenas as interfaces gráficas do Agent, e seus serviços de comunicação com o Electron, são compilados.

Após a geração da build, executar os seguintes comandos, um em cada terminal do SO:

```powershell
   npm run build-electron-w
```

```powershell
   npm run electron
```

O comando ```build-electron-w``` irá ativar o compilador do Typescript, e incluir o código-fonte compilado do Electron na mesma pasta ```/dist/``` do projeto, permitindo assim que o Angular e o Electron se comuniquem, enquanto que o comando ```npm run electron``` irá simplesmente executar o programa ```app.js```, da pasta ```/dist/```, inicializando a aplicação.

Além disso, o comando ```build-electron-w``` permite que qualquer alteração no código-fonte do Electron seja replicado automaticamente para a pasta ```/dist/```, permitindo assim testar a aplicação mais rapidamente.

Caso o código fonte do Angular seja alterado, é necessário recompilar a build inteira, conforme os comandos mencionados acima.

### Comunicação com o Agent-Server

Ao ativar o Electron, é necessário subir uma build do Agent-Server, também com o Electron ativado, para testar as outras funcionalidades do sistema.

Caso o Agent-Server não esteja ativado, as interfaces do Agent irão retornar um erro de comunicação com o servidor, impossibilitando sua utilização.

Para definir o IP / Porta do Agent-Server, deve-se alterar seguintes constantes do arquivo ```/src-electron/electron-constants```:

```powershell
  export const CNST_SERVER_SOURCE: string = 'SERVER';
  export const CNST_SERVER_PORT: number = 2000;
  export const CNST_SERVER_HOSTNAME: any = {
    DEVELOPMENT: '::1',
    PRODUCTION: 'gooddata.fluig.com'
  };

  //Tipos de IP (IPv4 / IPv6)
  export const CNST_SERVER_IP: any = {
    DEVELOPMENT: CNST_SERVER_IP_TYPES.IPV6,
    PRODUCTION: CNST_SERVER_IP_TYPES.IPV4
};
```

Vale lembrar que a porta definida acima deve estar devidamente configurada no menu de "Configuração" do Agent-Server **(e não do Agent)**. Além disso, é necessário informar o tipo de IP usado nos hosts definidos acima.

Após ativar o Agent-Server localmente, é possível testar qualquer funcionalidade da aplicação (executar o java, agendamento automático, etc), com exceção apenas à atualização automática dos Agents.

**IMPORTANTE: A geração de uma nova build do Agent, com IP / Porta diferentes, obriga a geração de uma nova build do próprio Agent-Server também, e sua atualização.**

## Geração de Instaladores - Windows (.exe) / Linux (.deb) / MacOS (?)
Executar um dos comandos abaixo, de acordo com o SO de destino:
```powershell
   npm run release-windows-32
   npm run release-windows-64
   npm run release-linux
   npm run release-mac
```
Cada um dos comandos acima irá gerar um pacote pronto para instalação, de acordo com o SO, na pasta ```release-builds``` do projeto. Estes pacotes podem ser copiados para um segundo computador e instalados, porém os mesmos não são publicados oficialmente neste GitHub, evitando a atualização automática de todos os Agents da TOTVS.

Para liberar um pacote oficial para todos os Agents da TOTVS, execute um dos comandos abaixo, de acordo com o SO de destino:

```powershell
   npm run release-windows-32-p
   npm run release-windows-64-p
   npm run release-linux-p
   npm run release-mac-p
```

A diferença destes comandos é apenas a publicação do novo pacote no GitHub, liberando assim p/ atualização.

## Comandos de suporte

```powershell
   npm run github
```
Realiza o git commit / push automaticamente, marcando a mensagem de commit com a data/hora atual.

## Assinatura de arquivos com a marca TOTVS

Feito automaticamente pelos comandos de release acima. Para a assinatura ser realizada, é necessário:
1.Ter o programa "signtool", do Windows, instalado na máquina. Geralmente o mesmo fica localizado em: ```C:\Program Files (x86)\Windows Kits\10\bin\10.0.22621.0\x64\```.
2.Ter o programa "HSM Dinamo" instalado no computador, para obter os certificados de assinatura de código da TOTVS (Uso único).
3.Estar conectado á VPN da TOTVS, para realizar a assinatura.

Caso algum destes programas não esteja instalado, é necessário pedir apoio á equipe de TI da TOTVS, no grupo de TI-Infraestrutura, através do seguinte formulário: https://atendimento-totvs.atlassian.net/servicedesk/customer/portal/11

### Assinatura manual (Windows)

Para assinar manualmente o arquivo .exe gerado pelo comandos ```release-windows-32``` ou ```release-windows-64```, realizar os seguintes passos:

1.Copie o arquivo .exe gerado para uma máquina Windows.
2.Conecte-se à VPN da TOTVS (Obrigatório p/ uso do Dinamo Console, e assinatura manual).
3.Juntamente com a equipe de TI, configure um novo usuário no Dinamo para fazer o download dos certificados.
4.Configure um novo container HSM no Dinamo Console, que é aonde os certificados são armazenados.
5.Faça o download do certificado da TOTVS para sua máquina (extensão .cer).
6.Execute o seguinte comando no terminal do Windows:

```powershell
   signtool sign /f <CERTIFICADO> /csp "Dinamo HSM Cryptographic Provider" /k CodeSigning /fd sha256 /debug <ARQUIVO>
```
Onde:
<CERTIFICADO> é o caminho até o arquivo de certificado (Extensão .cer)
<ARQUIVO> é o caminho do arquivo .exe copiado no passo 1.

O executável "signtool" geralmente está instalado na seguinte pasta do Windows:

```C:\Program Files (x86)\Windows Kits\<VERSAO>\bin\<PATCH>\x64\```

Onde:
<VERSAO> é a versão do Windows (Windows 8, Windows 10...)
<PATCH> é a versão do patch do Windows (Ex: 10.0.22621.0)

Caso a certificação tenha sido feita com sucesso, o arquivo de instalação, ao ser executado, passará a mostrar a TOTVS como um "Fornecedor Verificado" na popup de instalação do mesmo.

Também é possível verificar a certificação do arquivo de instalação clicando com o botão direito no mesmo, e acessando "Propriedades" -> "Assinaturas Digitais".

Caso o arquivo não possua esta opção "Assinaturas Digitais", ele não foi assinado corretamente.

Finalmente, a instalação do Agent nos clientes, de forma certificada, remove a necessidade de rodá-lo como Administrador, e evita conflitos de segurança com o SO.

### Assinatura manual (Linux / Mac)

Não tá pronto

## Testes unitários
Não tem ainda.