# RPG Bíblico — Heróis da Fé · atualização cooperativa v6.5

## O que mudou

**Todos os participantes podem executar objetivos.** O botão AÇÃO do convidado faz a missão avançar sem pedir que o líder aprove ou clique por ele. As tarefas compartilhadas são aplicadas automaticamente e aparecem para toda a equipe.

- Fase 1 (Noé): dentro da arca, cada jogador pode pegar provisões e assumir um depósito diferente. O jogo atribui automaticamente um depósito livre por participante.
- Fase 2 (Noé): qualquer participante pode receber os animais e organizar os compartimentos; cada compartimento pode ser feito por uma pessoa diferente.
- Fases com marcos: cada integrante pode concluir marcos disponíveis, sem obrigar a execução em fila. Perguntas e desafios de habilidade são respondidos por quem interage.
- Mar Vermelho: qualquer participante pode falar com Moisés ou cumprir a etapa de sinalização.
- Jericó: voltas percorridas pelos convidados também contam para a equipe. O jogador que completar uma volta importante poderá fazer o desafio das trombetas.
- HUD cooperativo mostra quem realizou tarefas. Cada jogador tem seu próprio personagem e controles.
- O líder só cria a sala e inicia o capítulo seguinte. A sincronização centralizada da missão continua no dispositivo do líder para impedir conclusões duplicadas; não há etapa de aprovação manual.

## Instalação / atualização

Extraia o ZIP e substitua todos os arquivos/pastas no GitHub conectado à Vercel. Evite enviar o ZIP sem extrair. O `firebase-config.js` do projeto existente foi preservado. **Nenhuma mudança de regras do Firebase é necessária para o fluxo desta versão**, pois o canal `commands` já estava previsto nas regras anteriores publicadas.

## Limitações importantes

Esta implementação ainda usa o líder como sincronizador de estado; se ele desconectar, a sala é encerrada. A entrada/saída do interior da arca ainda acontece para o grupo todo, embora as tarefas dentro dela sejam individuais. O jogo funciona no navegador e requer testes entre dispositivos reais para confirmar sincronização e estabilidade com o Firebase configurado. Não é um servidor antitrapaça: validações de proximidade e conclusão são principalmente no cliente do líder.

## Arquivos

`index.html`, `css/`, `js/`, `assets/`, `firebase-config.js`, `database.rules.json`, `manifest.webmanifest`.

---
# RPG Bíblico — correção v6.4.1

**Esta versão é uma atualização da 6.4 e preserva a música, as 20 fases e a configuração Firebase já preenchida.**

## Correções

1. **Multiplayer / convidado:** a cutscene do anfitrião não abre mais uma tela cinematográfica no dispositivo convidado. A informação aparece como aviso pequeno na parte inferior, e os controles do convidado continuam ativos. A animação não depende mais de receber uma mensagem de encerramento para liberar o controle.
2. **Ao iniciar uma nova fase:** telas antigas de perguntas, cenas, explicações e minigames são fechadas para o convidado.
3. **Quatro skins andando para cima:** corrigidos 576 pixels quase transparentes no cabelo nos sprites `assets/personagens.png` (duas poses em cada skin).
4. **Cache:** caminhos de scripts e estilos incluem a versão v641 para o navegador recarregar os arquivos atualizados.

## Como publicar

Extraia este ZIP e substitua o conteúdo da pasta raiz de seu repositório GitHub conectado à Vercel. Preserve os diretórios `js`, `css`, `assets` e `assets/audio`. Os campos Firebase já estão no arquivo `firebase-config.js`, e as regras publicadas no Console Firebase não precisam ser alteradas. Depois do deploy, atualize a página nos dois aparelhos (se necessário, Ctrl+Shift+R no computador).

## Testar

1. No dispositivo A, crie a sala e inicie a missão (líder).
2. No dispositivo B, entre com o código da sala e confirme que o botão AÇÃO funciona.
3. Entre em uma cutscene no dispositivo A, por exemplo na fase do Mar Vermelho. O dispositivo B **não deve exibir o painel cinematográfico de tela inteira**; ele continua na exploração com um aviso curto inferior.
4. Caminhe para cima com Homem, Mulher, Menino e Menina e observe o cabelo sem falhas de transparência.

**Limite de validação:** os arquivos foram preparados para teste local; a conectividade real da sala contra seu Firebase precisa ser conferida em dois aparelhos após publicação.


## Atualização v6.4.2 — Botões no menu

- O menu principal apresenta **JOGAR COM AMIGOS** como um botão grande dourado, com ícone e texto descritivo. Não é um link externo: continua abrindo a tela de criar ou entrar em sala com os eventos originais do jogo.
- **Escolher fase**, **Voltar ao início** e **Sair da sala / Voltar ao menu** também aparecem como botões com borda, preenchimento e reação ao toque.
- Estilos ajustados para telas pequenas e atualização de cache do CSS (`v=642`).
- Nenhuma mudança nas regras, credenciais ou lógica do Firebase. Basta substituir os arquivos no GitHub e publicar pela Vercel.
