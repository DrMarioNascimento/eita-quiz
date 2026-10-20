# Eita! — Um Quiz em Aliança

Quiz cooperativo de batalha contra um chefão, para aulas, cursos, palestras, treinamentos e encontros. A tela principal (TV ou projetor) mostra a pergunta, a vida do chefão e a energia do grupo; os participantes respondem pelo celular, sem instalar nada e sem criar conta.

## Situação atual — 20 de outubro de 2026

**Fase de testes abertos.** Qualquer pessoa pode usar o Eita! gratuitamente pelos endereços oficiais. Telas, regras e funcionalidades ainda podem mudar.

- Jogar: [eita.drmarionascimento.com.br](https://eita.drmarionascimento.com.br/) · também em [eita.dragongames.dev.br](https://eita.dragongames.dev.br/) e [eita-quiz.web.app](https://eita-quiz.web.app/)
- Manual de uso (PDF): [Eita-Manual-de-Uso-v1.3.pdf](https://eita.drmarionascimento.com.br/assets/manual/Eita-Manual-de-Uso-v1.3.pdf)
- Planilha-modelo de perguntas: [eita-modelo-perguntas.xlsx](https://eita.drmarionascimento.com.br/assets/eita-modelo-perguntas.xlsx)
- Sugestões e problemas: srzrn15m3@mozmail.com

**Development status:** open public testing. Free to use through the official addresses; rules, interfaces and features may change.

## Como funciona

1. **Perguntas:** quem conduz preenche a planilha-modelo (Excel, LibreOffice ou Google Planilhas) e a importa no jogo. A planilha é lida só no navegador e não vai para o servidor; ela sobrevive a recarregar a página e some ao fechar a aba. Sem planilha, há um banco de demonstração (Cardiovascular).
2. **Temas:** uma planilha pode ter vários temas; em cada partida, quem conduz marca de quais temas sortear.
3. **Sala:** abrir a sala exige uma conta Google (qualquer uma) e gera código de seis números e QR Code. Recarregar a página retoma a sala.
4. **Participantes:** entram por `aluno.html` com nome e animal, sem conta.
5. **Ensaio:** dá para experimentar sozinho, com participantes simulados, sem abrir sala.
6. **Batalha:** se o grupo bate a meta de acertos, golpeia o chefão; se não, o chefão ataca. Metas: Fácil (40%), Normal (mais da metade), Desafio (60%) e Difícil (80%). Morte súbita se os dois lados continuarem de pé.
7. **Modos:** individual cooperativo, esquadrões com vida compartilhada e esquadrões com vida por esquadrão.
8. **Privacidade:** ao encerrar a sala, nomes, animais e respostas são apagados do servidor. Uma sala que ficou aberta é apagada na próxima vez que a mesma pessoa abrir o Eita! no mesmo navegador (se foi aberta há mais de 6 horas). O projeto está no plano gratuito do Firebase, que não permite exclusão automática por TTL; o campo `expiresAt` continua gravado para quando houver plano pago.

Mário César Nascimento estuda **Game Design e desenvolvimento de jogos**. Este projeto acompanha esse percurso de formação e experimentação.

## Arquivos

| Arquivo | Função |
|---|---|
| `index.html` | Tela principal (quem conduz a partida) |
| `aluno.html` / `student.js` | Entrada e respostas dos participantes |
| `app.js` | Regras da batalha, meta de acertos e controles |
| `online.js` / `cloud.js` | Sala online (Firebase), retomada da sala e encerramento com exclusão dos dados |
| `planilha.js` | Importação da planilha, temas e banco da sessão |
| `ensaio.js` | Ensaio com participantes simulados |
| `menu.js` / `tela-cheia.js` | Menu lateral e tela cheia |
| `chefes.js` | Chefões, cenários, músicas e tempos dos efeitos |
| `animals.js` | Animais dos participantes e dos esquadrões |
| `cardio-bank.js` | Banco de demonstração (Cardiovascular) |
| `firestore.rules` | Regras de segurança da sala |
| `assets/manual/` | Manual de uso em PDF |
| `assets/eita-modelo-perguntas.xlsx` | Planilha-modelo |
| `assets/fonts/` | Fonte da marca (Nunito, SIL OFL) |

Firebase está ligado a este app. Não misturar com as salas de Dragon, Atividades Extras ou Learning-lab.

Arquivos com o sufixo `_SUBSTITUIDO_<data>` são versões anteriores guardadas no repositório; não entram na publicação.

## Próximos passos

- Relatório da partida para quem conduz (quem errou o quê), sem guardar dado além da sessão.
- Novos chefões, criaturas fantasiosas de criação própria.

## Dragon Games

Eita! também integra o [catálogo Dragon Games](https://dragongames.dev.br/).
A associação ao catálogo não mistura o aplicativo ou suas salas Firebase com os
jogos de outros repositórios. Código e publicação continuam neste projeto.

## Projetos relacionados

- [Fisiologia Interativa](https://github.com/DrMarioNascimento/fisiologia-interativa) — simuladores de Fisiologia.
- [Atividades Extras](https://github.com/DrMarioNascimento/Atividades-Extras) — missões de equipe.
- [Fisiologia em Fuga](https://github.com/DrMarioNascimento/fisiologia-em-fuga) — escape rooms por unidade.

## Licença e uso

Uso gratuito pelos endereços oficiais durante a fase de testes abertos, em aulas, cursos, palestras e eventos. Repositório público não é licença aberta: código, arte e demais componentes não podem ser copiados, modificados ou hospedados em outro endereço sem autorização. Ver [LICENSE.md](LICENSE.md).

**Autor e titular:** Mário César Nascimento, PhD.  
Copyright © 2026. Todos os direitos reservados.

## Publicação no Firebase

Alterações integradas à branch `main` são publicadas automaticamente pelo workflow
`Publish Firebase Hosting`. Também é possível executar esse workflow manualmente
na aba Actions. Aguarde a execução terminar com sucesso antes de considerar o
site atualizado.

O pacote é preparado por `node scripts/prepare-hosting.cjs` na pasta `dist/`:
somente os arquivos do aplicativo e `assets/` entram na publicação (sem os backups
`_SUBSTITUIDO_`). Não publique a raiz do repositório, que contém Git e arquivos de
desenvolvimento.

Para publicar manualmente a versão aprovada:
`npx --yes firebase-tools@latest deploy --only hosting --project eita-quiz`.
O comando prepara o pacote automaticamente. Esta publicação altera apenas Hosting,
sem publicar regras ou alterar dados do Firestore.

**Regras do Firestore:** o workflow não publica `firestore.rules`. Sempre que o
arquivo mudar, publique as regras antes do commit do site (Console do Firebase →
Firestore → Regras, ou `firebase deploy --only firestore:rules`).

O acesso do workflow fica no segredo `FIREBASE_SERVICE_ACCOUNT_EITA_QUIZ` do
repositório. Nunca inclua credenciais em arquivos versionados ou em `assets/`.
