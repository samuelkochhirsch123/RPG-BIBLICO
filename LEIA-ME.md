# Heróis da Fé — Jornada Bíblica · versão 4.1

Aventura bíblica em **pixel art original**, para computador, Android e iPhone. É uma adaptação lúdica com **20 fases**, quatro skins (Homem, Mulher, Menino, Menina), sprites PNG de personagens, terreno e animais, caminhada em dois quadros por direção, três corações, missões e perguntas bíblicas.

## Novidades desta versão

### Fase 1 — Prepare a arca de Noé (Gênesis 6–7)

- Caminhe até a **porta central da arca** e pressione `AÇÃO` ou `E` para entrar.
- Lá dentro, **pegue sacos de mantimentos** e leve-os aos três depósitos (feno, grãos e água).
- Você pode sair pela porta inferior do interior da arca; a missão termina ao organizar os três depósitos.
- Há uma breve cena de conclusão.

### Fase 2 — A chegada dos animais (Gênesis 7:8–9)

- Os animais **vêm até Noé por conta própria**; nenhum animal é caçado ou capturado.
- São quatro grupos: ovelhas, aves, bois e cabras, em sequência.
- Espere cada grupo chegar, aproxime-se e pressione `AÇÃO` / `E` **uma vez** para abrir a passagem.
- **Acompanhe a animação de aproximadamente 7,5 segundos** em que o grupo caminha até a porta e entra na arca. Tocar novamente não acelera o processo.
- **Depois de cada entrada há um intervalo obrigatório de 11 segundos** antes que o grupo seguinte possa chegar. O tempo restante aparece na missão.
- Depois que todos os grupos entrarem, **entre na arca** e prepare os **quatro compartimentos** internos. É preciso aguardar quatro segundos entre as organizações de compartimentos.
- Só depois dos compartimentos prontos a missão é concluída. Há uma breve cena final.

### Fase 7 — A travessia do mar (Êxodo 14)

- Aproxime-se de Moisés e use `AÇÃO` / `E` para iniciar a **cena do mar se abrindo**.
- As águas se separam com uma animação em pixel art e expõem o caminho seco entre duas paredes de água.
- Depois da cena, o jogador deve **atravessar o caminho** para concluir a fase; não basta assistir.

### Fase 9 — Jericó (Josué 6)

- Marcha ao redor da cidade, com seis voltas correspondentes aos seis dias e sete voltas no sétimo dia, na forma de uma adaptação para o jogo.
- Ao concluir, aparece a cena da **queda das muralhas**.

### Fase 14 — Pães e peixes (João 6)

- Em vez de coletar pães espalhados pelo mapa, o jogador **ajuda a distribuir a refeição** a cinco grupos de pessoas.
- Há uma espera de quatro segundos entre as entregas e uma cena final. A história deixa claro que **Jesus** realizou o milagre.

### Fase 15 — A tempestade (Marcos 4)

- Aproxime-se do barco para assistir à cena animada de tempestade e calmaria.

**Importante:** as outras fases mantêm, por enquanto, as atividades mais simples de exploração do protótipo anterior. Esta versão amplia principalmente as aventuras e cenas descritas acima; não é ainda um RPG completo com 20 missões cinematográficas exclusivas.

## Como jogar no computador

1. Extraia **todos** os arquivos do ZIP.
2. Mantenha `index.html`, `manifest.webmanifest` e as pastas `assets/`, `css/` e `js/` na mesma estrutura.
3. Abra `index.html` em Chrome, Edge ou Firefox. Não é preciso instalar Python ou Java.

**Controles no PC:** `WASD` ou setas para andar; `E` ou `Espaço` para interagir; segurar `Shift` para correr; `P` para pausar; `F` para tela cheia; `Esc` para sair da tela cheia.

**Controles no celular:** analógico à esquerda; `CORRER` e `AÇÃO` à direita. Segure o botão de correr enquanto se move. Os controles foram colocados mais para dentro e para cima, evitando toques acidentais nas bordas.

## Perguntas bíblicas

A cada **60 segundos de exploração ativa**, aparece uma pergunta. O jogo solo e o cronômetro da missão **param completamente** durante a pergunta, e o jogador tem **60 segundos para responder**. Respostas erradas ou tempo esgotado custam um coração. As cenas animadas também pausam o cronômetro de exploração.

## Publicar no GitHub Pages

1. Acesse seu repositório `https://github.com/samuelkochhirsch123/RPG-Biblico`.
2. Na branch `main`, envie **o conteúdo extraído** do ZIP para a raiz do repositório. Preserve a estrutura de diretórios e substitua o `index.html` e todos os arquivos anteriores. **Não envie apenas o ZIP.**
3. Se o Pages ainda não estiver ativo, abra **Settings → Pages → Deploy from a branch → main → / (root) → Save**.
4. Após o GitHub publicar, abra `https://samuelkochhirsch123.github.io/RPG-Biblico/`.
5. Se aparecer o jogo antigo, recarregue a página; esta versão usa identificação `v=4.1` nos scripts e estilos para reduzir problemas de cache.

O GitHub Pages publica arquivos estáticos. Não é preciso Vercel, Python nem banco de dados para o modo individual. **O multiplayer online ainda não está implementado nesta versão**; precisaria de um serviço como Firebase, configurado com segurança.

## Android, iPhone e orientação de tela

O jogo funciona em tela horizontal e vertical, mas o layout é otimizado para **horizontal**. Em dispositivos que suportam a API, o botão de tela cheia tenta solicitar rotação para paisagem. **O Safari do iPhone pode impedir a orientação forçada ou a tela cheia automática**, pois isso depende do navegador/sistema; nesse caso, gire o aparelho manualmente. Ao instalar como web app (onde disponível), o manifesto solicita paisagem.

## Estrutura dos arquivos

```text
index.html
manifest.webmanifest
assets/
  personagens.png
  animais.png
  terreno.png
  icone-192.png
  icone-512.png
css/
  style.css
js/
  data.js
  adventures.js
  art.js
  game.js
LEIA-ME.md
```

## Testes e limitações

- Os arquivos JavaScript passaram por validação de sintaxe no Node.js.
- Os testes de lógica automatizados em um ambiente JavaScript simulado cobriram o interior da arca, a sequência e intervalo dos quatro grupos de animais, os quatro compartimentos, o quiz pausado, a abertura e travessia do mar, a tempestade, a distribuição de alimentos e renderização das 20 fases.
- **Ainda é necessário testar diretamente no Safari de iPhone e em um navegador Android real**, especialmente tela cheia, orientação, controles e a aparência das animações; não declare estes testes como concluídos.
- A arte utiliza sprites originais simples em pixel art, sem copiar gráficos ou personagens do Zelda.
- O progresso desbloqueado fica armazenado no `localStorage` do dispositivo/navegador.
