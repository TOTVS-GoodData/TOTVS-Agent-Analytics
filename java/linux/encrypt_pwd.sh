next=1
while [ "$next" == 1 ]; do
  read -p "Digite a senha para criptografar:" password
  echo Senha criptografada:
  java -cp ../TOTVS-Agent-Analytics-Java-0.9.0.jar com.gooddata.agent.util.Encrypt $password
  read -p "Deseja criptografar outra senha \(1=sim, 0=nao\)?" next
  clear
done