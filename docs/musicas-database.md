# Catálogo de músicas (/musicas)

A página `/musicas` mostra o repertório em prateleiras por gênero, no formato
de vitrine da Netflix: cada card abre um painel com o vídeo do YouTube
embutido, descrição, créditos e — quando houver link cadastrado — o botão para
a cifra. Tudo vem de um Postgres; o cadastro é feito em `/admin/musicas`, com a
mesma senha do Folheto do Dia (`FOLHETO_UPLOAD_PASSWORD`).

## Desenvolvimento

Sem `DATABASE_URL` nada quebra: `/musicas` mostra o estado vazio e
`/admin/musicas` avisa que o banco não está configurado. Para trabalhar no
catálogo de verdade, há dois caminhos.

### 1. Banco local no Docker

O driver do Neon fala HTTP, não o protocolo do Postgres, então o
`docker-compose.yml` sobe o Postgres **e** um proxy que traduz — assim o código
da aplicação é o mesmo em dev e em produção.

```bash
docker compose up -d
npm run db:migrate   # cria as tabelas e os gêneros iniciais
npm run dev
```

`DATABASE_URL` local já está no `.env.local`:
`postgres://postgres:postgres@localhost:55432/saleluz`. A porta 55432 é do host
(a 5432 costuma estar ocupada por outro projeto) e serve só para psql/DBeaver —
o proxy fala com o banco pela rede interna do compose.

Para derrubar: `docker compose down` (os dados ficam no volume `pgdata`;
`docker compose down -v` apaga tudo).

### 2. Neon de verdade

1. No painel da Vercel: **Storage → Create Database → Neon**, e conecte ao
   projeto. Isso já injeta `DATABASE_URL` em produção e preview.
2. Para apontar o ambiente local para lá, troque `DATABASE_URL` no `.env.local`
   pela connection string **pooled** do Neon (ou rode `vercel env pull`).
3. `npm run db:migrate` — inclusive apontando para produção depois de cada
   migration nova, porque o deploy não aplica schema sozinho.

## Migrations

Os arquivos ficam em `db/migrations`, aplicados em ordem alfabética e uma única
vez cada — o que já rodou fica registrado na tabela `schema_migrations`. Para
uma mudança de schema, crie `db/migrations/003_....sql` e rode `npm run
db:migrate`; nunca edite uma migration já aplicada.

## Modelo

- `generos` — uma prateleira da página. `ordem` decide a posição (menor
  primeiro); `slug` é derivado do nome e não muda quando o nome é editado.
- `musicas` — `youtube_id` é só o ID do vídeo (11 caracteres): dele saem o
  embed e a capa em `i.ytimg.com`. `imagem_url` só é preenchida para
  sobrescrever essa capa por uma arte própria. `publicada = false` guarda a
  música como rascunho, fora da página. `destaque = true` põe a música no topo
  da página — só uma por vez, e marcar uma desmarca a anterior. `cifra_url` já
  existe no schema e o botão "Ver cifra" aparece assim que ela é preenchida.
- `musica_generos` — a mesma música pode estar em várias prateleiras, e `ordem`
  define a posição dela dentro de cada uma.

O `slug` da música é a chave do link compartilhável (`/musicas?musica=slug`),
então ele é gerado uma vez e mantido mesmo que o título mude depois.

## Quem fica no topo

O bloco grande no alto de `/musicas` é a música com `destaque = true`, marcada
pela caixa correspondente no painel. Se nenhuma estiver marcada — ou se a
marcada não estiver em prateleira nenhuma, e portanto não aparecer na página —
o topo cai na primeira música da primeira prateleira, que é a de menor `ordem`
entre os gêneros. A tarja acima do título mostra o gênero de menor `ordem`
daquela música.

## Cache

`/musicas` é estática com revalidação de 5 minutos, e cada publicação pelo
painel chama `revalidatePath("/musicas")` — ou seja, a alteração aparece na
hora, e os 5 minutos só valem como rede de segurança.
