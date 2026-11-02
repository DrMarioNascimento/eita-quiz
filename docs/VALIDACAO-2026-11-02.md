# Validação da revisão do Eita! — 02/11/2026

## Escopo

Editor em formulário, leitura do menu, distratores da demonstração, semântica acessível, diagnóstico de conexão e revalidação de HTML/JS/CSS. O limite de sala online permanece em 60 participantes; o ensaio agora permite simular até 60. Nenhuma regra de acesso do Firestore foi alterada.

## Verificações automatizadas

- `node --test tests/*.test.*`: 25 testes, incluindo abertura, validação e round-trip do editor, banco de 45 questões, diagnóstico sem conteúdo pessoal, ordenação de transições e ciclo do aluno.
- `node scripts/measure-protocol.mjs`: comparação de tamanho JSON com a mesma pergunta revisada, UIDs de 28 caracteres e nomes sintéticos. Não mede pacotes de rede, cobrança, compressão, cache ou infraestrutura Firestore.
- 60 contextos independentes executam o `student.js` real contra um transporte em memória: 60 cadastros, 60 respostas únicas, pausa, retomada, resultado e encerramento. Todas as escutas e cronômetros são liberados. Esse teste valida lógica concorrente, sem equivaler a 60 navegadores conectados ao servidor.
- Sintaxe de todos os arquivos JS e geração do pacote de Hosting.

## Modelagem de conteúdo no modo individual

| Participantes | Formato anterior (bytes JSON) | Formato atual (bytes JSON) | Redução |
|---:|---:|---:|---:|
| 12 | 1.080 | 737 | 31,8% |
| 30 | 2.106 | 1.295 | 38,5% |
| 60 | 3.816 | 2.225 | 41,7% |

A comparação isola a retirada da lista redundante de nomes/grupos. Inclui `result: null` no formato atual. Não compara alterações de redação das questões nem o download de vídeos. A redução não deve ser apresentada como redução equivalente de latência ou custo do Firestore.

## Medição no uso real

Entrada → Conexão da sala exibe o número de atualizações confirmadas, falhas, média e P95 do tempo de confirmação das escritas docentes. É medição do navegador em uso, incluindo as condições de conexão dele. O tamanho exibido é apenas o conteúdo JSON estimado. O diagnóstico exportado contém operação, duração, tamanho e sucesso; não contém UIDs, nomes, enunciados, alternativas ou respostas.

## Acessibilidade e responsividade

Rótulos explícitos no editor e configuração, navegação nativa por teclado, foco visível, link para a pergunta, progresso com nome/valor, anúncio do estado da pergunta no aluno, redução de movimento e campos que se reorganizam em uma coluna em telas estreitas. Esses recursos não constituem certificação WCAG nem teste com leitor de tela físico.

A validação visual no endereço público será registrada após a publicação. Testes em larguras estreitas de navegador não substituem iOS/Android reais nem projeção em sala. A medição com turma real requer os aparelhos e a conexão daquela turma.
