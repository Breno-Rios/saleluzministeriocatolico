-- Texto da cifra, guardado no próprio banco.
--
-- Uma cifra são alguns KB de texto - não vale um arquivo no Blob, com URL para
-- gerenciar e lixo para limpar a cada troca. Aqui ela viaja junto com a música
-- na mesma consulta que a página já faz.
--
-- cifra_url continua existindo para o caso de a cifra morar em outro site: se
-- as duas estiverem preenchidas, a embutida é a que o leitor vê, porque é a que
-- transpõe.

alter table musicas add column if not exists cifra text;
