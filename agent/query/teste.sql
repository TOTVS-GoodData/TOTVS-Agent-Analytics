SELECT 'P |01|SA1T10|'
       + COALESCE(NULLIF(Rtrim( COALESCE(A1_FILIAL, ' ') )+'|'+Rtrim( COALESCE(
       A1_COD,
       ' ') )+Rtrim( COALESCE(A1_LOJA, ' ') ), ' '), '|') AS BK_CLIENTE,
       SA1.A1_COD                                         AS COD_CLIENTE,
       SA1.A1_LOJA                                        AS LOJA_CLIENTE,
       SA1.A1_NOME                                        AS NOME_CLIENTE,
       SA1.A1_SATIV1                                      AS
       SEGMENTACAO_ATIVIDADE_1,
       '01'                                               AS INSTANCIA
FROM   SA1T10 SA1
WHERE  SA1.D_E_L_E_T_ = ' '
UNION
SELECT 'P |01|SA1T10||',
       'T1 - INDEFINIDO',
       'T1 - INDEFINIDO',
       'T1 - INDEFINIDO',
       'T1 - INDEFINIDO',
       'T1 - INDEFINIDO' 