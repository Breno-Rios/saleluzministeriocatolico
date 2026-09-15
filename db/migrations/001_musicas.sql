-- Catálogo de músicas exibido em /musicas, no formato de prateleiras por
-- gênero. Uma música pode aparecer em mais de uma prateleira, daí a tabela
-- de ligação.

create table if not exists generos (
  id serial primary key,
  slug text not null unique,
  nome text not null,
  ordem integer not null default 0,
  criado_em timestamptz not null default now()
);

create table if not exists musicas (
  id serial primary key,
  slug text not null unique,
  titulo text not null,
  -- Só o ID do vídeo (11 caracteres), não a URL inteira: é o que serve tanto
  -- para montar o embed quanto para derivar a capa em i.ytimg.com.
  youtube_id text not null,
  -- Preenchida apenas quando a capa do YouTube não serve; vazia significa
  -- "usa a thumb do próprio vídeo".
  imagem_url text,
  descricao text,
  creditos text,
  -- Ainda não usada na interface: o botão de cifra só aparece quando houver
  -- link, e o resto do fluxo de cifras vem depois.
  cifra_url text,
  ano integer,
  publicada boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists musica_generos (
  musica_id integer not null references musicas (id) on delete cascade,
  genero_id integer not null references generos (id) on delete cascade,
  -- Posição da música dentro daquela prateleira; o catálogo é pequeno e
  -- curado na mão, então a ordem é editorial e não por data.
  ordem integer not null default 0,
  primary key (musica_id, genero_id)
);

create index if not exists musica_generos_genero_idx on musica_generos (genero_id, ordem);
