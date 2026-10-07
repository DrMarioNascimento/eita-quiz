# Eita! — Um Quiz em Aliança

Quiz de sala para Fisiologia, no formato de batalha contra um chefão. A turma responde no celular; o telão mostra energia da turma e vida do chefão. Mais de 50% de acertos interrompe o golpe. Até 50%, o chefão ataca.

**Estado em 7 de outubro de 2026.** Repositório privado. Demo no ar em [eita-quiz.web.app](https://eita-quiz.web.app/). Banco atual: 45 perguntas de Cardiovascular, sorteio por batalha.

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
- README estava vazio até esta revisão; a licença não existia.

## Projetos relacionados

- [Fisiologia Interativa](https://github.com/DrMarioNascimento/fisiologia-interativa) — simuladores da mesma matéria.
- [Atividades Extras](https://github.com/DrMarioNascimento/Atividades-Extras) — missões de equipe.
- [Fisiologia em Fuga](https://github.com/DrMarioNascimento/fisiologia-em-fuga) — escape rooms por unidade.

## Licença e uso

Uso educacional restrito. Repositório privado não é licença aberta. Ver [LICENSE.md](LICENSE.md).

**Autor e titular declarado:** Mário César Nascimento, PhD.  
Copyright © 2026. Todos os direitos reservados.
