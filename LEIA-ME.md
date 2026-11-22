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
