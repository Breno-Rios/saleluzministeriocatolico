# Login do /admin (Google)

O painel é protegido por conta Google, não por senha compartilhada. Quem
publica o folheto entra com a própria conta, e o acesso é dado e tirado por
pessoa — sem senha circulando no WhatsApp e sem trocar a senha de todo mundo
quando alguém sai.

## Como funciona

São três peças, e vale saber por quê:

1. **No navegador** (`AdminLogin.tsx`) o botão do Google devolve um *ID token* —
   um JWT assinado pelo Google dizendo quem é a pessoa.
2. **No servidor** (`/api/admin/google`) esse token é verificado com a
   `google-auth-library`: assinatura conferida contra as chaves públicas do
   Google, `aud` igual ao nosso client ID e prazo de validade. Isso não é
   formalidade — o token chega no corpo de um POST, e qualquer um consegue
   escrever um POST. Sem a verificação, o login seria decorativo.
3. **A sessão** (`src/lib/admin-auth.ts`) é um cookie com o e-mail e um
   vencimento, assinado com `ADMIN_SESSION_SECRET`. Sem assinatura, bastaria
   digitar `admin_session=fulano@gmail.com` no devtools para entrar.

Autenticado no Google ≠ autorizado no site: depois de saber quem é a pessoa, o
servidor confere o e-mail contra `ADMIN_EMAILS`. Essa conferência acontece a
cada requisição, não só no login, então tirar alguém da lista tem efeito
imediato, sem esperar a sessão vencer.

## Variáveis

| Variável | Para quê |
| --- | --- |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Client ID do OAuth. É público — vai no HTML da página. |
| `ADMIN_EMAILS` | Quem pode entrar, separado por vírgula. |
| `ADMIN_SESSION_SECRET` | Assina o cookie de sessão. `openssl rand -base64 32`. |

Em produção, sem `ADMIN_SESSION_SECRET` o servidor recusa abrir sessão em vez
de emitir um cookie sem assinatura.

## Criar o client ID

1. [console.cloud.google.com](https://console.cloud.google.com) → crie ou
   escolha um projeto.
2. **APIs & Services → OAuth consent screen**: tipo **External**, preencha nome
   do app e e-mail de contato. Enquanto estiver em *Testing*, só as contas
   listadas em *Test users* conseguem entrar — publique o app quando quiser
   liberar para as demais contas de `ADMIN_EMAILS`.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID →
   Web application**.
4. Em **Authorized JavaScript origins**, inclua as origens que vão exibir o
   botão:
   - `https://saleluzministeriocatolico.com.br`
   - `http://localhost:3000` (só se você quiser testar o Google localmente)

   Não é preciso preencher *Authorized redirect URIs*: este fluxo não
   redireciona, o token volta para a própria página.
5. Copie o client ID para `NEXT_PUBLIC_GOOGLE_CLIENT_ID` na Vercel e rode um
   deploy — a variável entra no HTML durante o build.

## Desenvolvimento

Com `NEXT_PUBLIC_GOOGLE_CLIENT_ID` vazio e fora de produção, a tela de login
mostra **"Entrar como administrador (dev)"**, que abre a sessão direto. É para
não precisar de projeto no Google Cloud só para mexer no painel.

Esse atalho não sobrevive ao deploy: `loginDeDesenvolvimento()` é falso assim
que `NODE_ENV` é `production`, e aí `/api/admin/dev-login` responde 404 como
qualquer rota inexistente. Um atalho que ficasse ligado em produção deixaria de
ser conveniência e passaria a ser a porta dos fundos.

Se quiser testar o Google de verdade na sua máquina, defina o client ID no
`.env.local` com `http://localhost:3000` entre as origens autorizadas — o
atalho some sozinho, porque ele só aparece quando não há Google configurado.
