-- Qual música ocupa o topo de /musicas. Antes disso o destaque era a primeira
-- música da primeira prateleira, o que na prática caía na ordem alfabética do
-- título - ninguém escolhia nada.
--
-- Não há unique aqui de propósito: marcar um destaque novo limpa o anterior na
-- mesma transação, e um índice único transformaria qualquer corrida entre duas
-- edições simultâneas em erro na cara de quem está publicando.

alter table musicas add column if not exists destaque boolean not null default false;

create index if not exists musicas_destaque_idx on musicas (destaque) where destaque;
