-- Prateleiras de partida, para a página não nascer vazia. São editáveis pelo
-- painel /admin/musicas como qualquer outra, e o on conflict deixa a migration
-- reaplicável sem desfazer renomeações feitas por lá.

insert into generos (slug, nome, ordem) values
  ('lancamentos', 'Lançamentos', 10),
  ('entrada', 'Entrada', 20),
  ('ofertorio', 'Ofertório', 30),
  ('comunhao', 'Comunhão', 40),
  ('final', 'Final', 50),
  ('mariana', 'Marianas', 60),
  ('adoracao', 'Adoração', 70),
  ('casamento', 'Casamentos e Bodas', 80)
on conflict (slug) do nothing;
