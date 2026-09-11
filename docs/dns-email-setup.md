# DNS para envio de e-mail (Resend)

Explicação em linguagem simples dos registros DNS adicionados no Registro.br
para verificar `saleluzministeriocatolico.com.br` no Resend, usado pelo
`/api/contato` para enviar os pedidos de orçamento a partir de
`contato@saleluzministeriocatolico.com.br` em vez do endereço de sandbox do
Resend (`onboarding@resend.dev`).

## Por que isso é necessário

Qualquer servidor pode, tecnicamente, mandar um e-mail dizendo "de:
contato@saleluzministeriocatolico.com.br" — não existe trava nenhuma no
protocolo de e-mail (SMTP) que impeça isso. É exatamente esse buraco que
golpes de phishing exploram.

Pra evitar isso, provedores de e-mail (Gmail, Outlook etc.) checam registros
públicos no DNS do domínio remetente antes de confiar na mensagem. Sem esses
registros, o e-mail tende a cair em spam ou ser rejeitado — mesmo sendo
legítimo. DKIM e SPF são dois desses mecanismos de confiança, e ambos foram
configurados para este domínio.

## DKIM — assinatura que prova que o e-mail não foi alterado

**Registro:** TXT em `resend._domainkey.saleluzministeriocatolico.com.br`

DKIM (DomainKeys Identified Mail) funciona como uma assinatura digital:

1. O Resend tem uma chave privada, que usa para "assinar" cada e-mail enviado
   em nome do domínio.
2. A chave pública correspondente fica publicada nesse registro TXT.
3. Quando o Gmail (ou qualquer outro provedor) recebe o e-mail, ele busca essa
   chave pública no DNS e confere se a assinatura bate.

Se bater, o provedor sabe duas coisas: que o e-mail realmente saiu de um
servidor autorizado pelo dono do domínio (só quem tem a chave privada — o
Resend, nesse caso — consegue gerar uma assinatura válida), e que o conteúdo
não foi alterado no caminho.

## SPF — lista de quem pode mandar e-mail pelo domínio

**Registros:** CNAME em `send.saleluzministeriocatolico.com.br` e
`rsend.saleluzministeriocatolico.com.br`, ambos apontando para
`*.forge.rmta.net`

SPF (Sender Policy Framework) é mais simples: é uma lista pública dizendo
"estes servidores têm permissão para enviar e-mail como
`@saleluzministeriocatolico.com.br`". Um servidor que não está nessa lista e
tenta mandar e-mail se passando pelo domínio falha na checagem SPF.

Normalmente o SPF é um único registro TXT com a lista de servidores
permitidos. O Resend usa uma variação baseada em subdomínios (`send` e
`rsend` apontando via CNAME para a infraestrutura de envio deles,
`forge.rmta.net`) que cumpre o mesmo papel — declarar a infraestrutura do
Resend como remetente autorizado — mas delegando o gerenciamento da lista
para o próprio provedor em vez de mantê-la manualmente no TXT do domínio.

## CNAME, rapidamente

CNAME é só um tipo de registro DNS que diz "este nome é um apelido para
aquele outro endereço" — em vez de listar um IP diretamente, ele aponta para
outro hostname (aqui, algo em `*.forge.rmta.net`, que resolve para os
servidores do Resend). É o mesmo mecanismo usado, por exemplo, quando
`www.exemplo.com` aponta para `exemplo.com`, só que aqui aplicado a
subdomínios técnicos de e-mail que ninguém acessa diretamente no navegador.

## Resumo

| Registro | Tipo | O que prova |
|---|---|---|
| `resend._domainkey.saleluzministeriocatolico.com.br` | TXT (DKIM) | O e-mail foi assinado por quem tem a chave privada (Resend) e não foi alterado no caminho |
| `send.saleluzministeriocatolico.com.br` | CNAME (SPF) | O Resend está autorizado a enviar e-mail como este domínio |
| `rsend.saleluzministeriocatolico.com.br` | CNAME (SPF) | Idem — parte da mesma verificação SPF baseada em subdomínio |

Sem os dois (DKIM + SPF), o e-mail até pode ser entregue, mas com risco bem
maior de cair em spam — provedores tratam a ausência desses registros como
sinal de que o remetente não é confiável.
