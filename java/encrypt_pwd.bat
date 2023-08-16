@echo Off

rem Informa ao usuário a versão do Java utilizada.
java -version

rem Realiza a criptografia da senha informada.
:inicio
echo Digite a senha para criptografar:
set /p password=
cls
echo Senha criptografada:
java -cp TOTVS-FastAnalytics-Agent-1.7.8-jar-with-dependencies.jar com.gooddata.agent.util.Encrypt %password%
echo Deseja criptografar outra senha (1=sim, 2=nao)?
set /p opcao=
IF "%opcao%"=="1" (
	cls
	GOTO inicio
)