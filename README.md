# Eita! — Um Quiz em Aliança

## Desenvolvimento e acesso

Os jogos estão em diferentes etapas de desenvolvimento, teste e aperfeiçoamento e ainda não foram lançados ao público. Nesta fase, os testes são realizados internamente, sem participação externa.

Enquanto os jogos estiverem em desenvolvimento, regras, interfaces e funcionalidades poderão mudar. Algumas páginas poderão apresentar demonstrações do projeto, mas isso não significa que os jogos estejam disponíveis para participação do público.

Mário César Nascimento estuda **Game Design e desenvolvimento de jogos**. Estes projetos acompanham esse percurso de formação e experimentação. As autorias e condições de uso de cada projeto estão identificadas em [LICENSE.md](LICENSE.md).

**Development status:** internal testing only; external participation is not open. Demonstration pages do not constitute a public game launch. Rules, interfaces and features may change.


Quiz de sala para Fisiologia, no formato de batalha contra um chefão. A turma responde no celular; o telão mostra energia da turma e vida do chefão. Mais de 50% de acertos interrompe o golpe. Até 50%, o chefão ataca.

**Estado documental em 12 de outubro de 2026.** Repositório privado. Demo no ar em [eita-quiz.web.app](https://eita-quiz.web.app/). Banco atual: 45 perguntas de Cardiovascular, sorteio por batalha.

## O que a sala faz

- Professor abre a sala, gera QR e link, escolhe o número de perguntas (1 a 45) e o modo.
- Aluno entra por `aluno.html`, escolhe nome e animal, sem conta.
- Modos: individual cooperativo, esquadrões com vida compartilhada, esquadrões com vida própria.
- Avanço automático ou manual. Morte súbita se os dois lados continuarem vivos.
- Editor de perguntas no próprio telão: enunciado, quatro alternativas, correta, segundos e explicação.

## Arquivos

| Arquivo | Função |
|---|---|
| `index.html` | Telão do professor |
| `aluno.html` | Entrada do estudante |
| `cardio-bank.js` | Banco de Cardiovascular |
| `app.js` | Regras da batalha |
| `online.js` | Sala online |
| `firestore.rules` | Regras da sala |

Firebase está ligado a este app. Não misturar com as salas de Dragon, Atividades Extras ou Learning-lab.

## O que ainda falta para acabamento

- Bancos das outras unidades (só Cardiovascular está no ar).
- Relatório da partida para o professor (quem errou o quê), sem guardar dado além da sessão.
- Documentação e condições de uso disponíveis neste README e em [LICENSE.md](LICENSE.md).

## Dragon Games

Eita! também integra o [catálogo Dragon Games](https://dragongames.dev.br/).
A associação ao catálogo não mistura o aplicativo ou suas salas Firebase com os
jogos de outros repositórios. Código e publicação continuam neste projeto.
Autoria e titularidade permanecem as indicadas em [LICENSE.md](LICENSE.md).

## Projetos relacionados

- [Fisiologia Interativa](https://github.com/DrMarioNascimento/fisiologia-interativa) — simuladores da mesma matéria.
- [Atividades Extras](https://github.com/DrMarioNascimento/Atividades-Extras) — missões de equipe.
- [Fisiologia em Fuga](https://github.com/DrMarioNascimento/fisiologia-em-fuga) — escape rooms por unidade.

## Licença e uso

Uso educacional restrito. Repositório privado não é licença aberta. Ver [LICENSE.md](LICENSE.md).

**Autor e titular declarado:** Mário César Nascimento, PhD.  
Copyright © 2026. Todos os direitos reservados.
# Publicação no Firebase

Alterações integradas à branch `main` são publicadas automaticamente pelo workflow
`Publish Firebase Hosting`. Também é possível executar esse workflow manualmente
na aba Actions. Aguarde a execução terminar com sucesso antes de considerar o
site atualizado.

O pacote é preparado por `node scripts/prepare-hosting.cjs` na pasta `dist/`:
somente os arquivos do aplicativo e `assets/` entram na publicação. Não publique
a raiz do repositório, que contém Git e arquivos de desenvolvimento.

Para publicar manualmente a versão aprovada:
`npx --yes firebase-tools@latest deploy --only hosting --project eita-quiz`.
O comando prepara o pacote automaticamente. Esta publicação altera apenas Hosting,
sem publicar regras ou alterar dados do Firestore.

O acesso do workflow fica no segredo `FIREBASE_SERVICE_ACCOUNT_EITA_QUIZ` do
repositório. Nunca inclua credenciais em arquivos versionados ou em `assets/`.
