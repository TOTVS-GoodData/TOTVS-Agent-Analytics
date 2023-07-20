# TOTVS-FastAnalytics-Agent
Programa oficial da TOTVS para envio de dados para a plataforma GoodData.

Suporta sistemas Windows / Linux / MacOS.

Desenvolvido em Portinari.15 / Angular.15 / Electron.22

## Instalação
Executar o seguinte comando:

```powershell
   npm install
```

Depois, acessar a pasta ```node_modules``` criada pelo comando anterior, e alterar o código fonte do programa ```auto-launch/dist/AutoLaunchWindows.js```.

De:

```powershell
regKey = new Winreg({
  hive: Winreg.HKCU,
  key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'
});
```

Para:

```powershell
regKey = new Winreg({
  hive: Winreg.HKLM,
  key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'
});
```

Esta alteração é necessária pois esta dependência "auto-launch" não foi configurada para instalar pacotes do Windows de maneira global na máquina.

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

Por fim, neste ambiente de desenvolvimento, é possível testar qualquer funcionalidade da aplicação (executar o java, agendamento automático, etc), com exceção apenas à atualização automática dos Agents.

## Geração de Instaladores - Windows (.exe) / Linux (.deb) / MacOS ()
Executar um dos comandos abaixo, de acordo com o SO de destino:
```powershell
   npm run release-windows-32
   npm run release-windows-64
   npm run release-linux
   npm run release-mac
```
Cada um dos comandos acima irá gerar um pacote pronto para instalação, de acordo com o SO, na pasta ```release-builds``` do projeto. Estes pacotes podem ser copiados para um segundo computador e instalados, porém os mesmos não são publicados oficialmente neste GitHub, evitando a atualização automática de todos os Agents da TOTVS.

Vale lembrar que estes pacotes já serão atualizados automaticamente, caso um novo pacote seja oficialmente publicado neste GitHub.

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

## Testes unitários
Não tem ainda.

## Assinatura
Não tá pronto.

1. Instalar o Signtool.exe (`http://www.microsoft.com/en-us/download/details.aspx?id=6510`)
2. Possuir o certificado digital da Totvs instalado na maquina
3. Acessar via prompt o caminho onde o sigtool foi instalado (ex. `C:\Program Files\Microsoft Platform SDK\Bin`)
4. Executar o comando `signtool signwizard`
5. Na janela do wizard selecione o executavel do `totvs agent` e o `schedule windows`
6. Aguarde cerca de 2min caso ocorra erro de arquivo não encontrado ou somente leitura
7. Selecione o certificado, informe a senha e por fim conclua o procedimento.
