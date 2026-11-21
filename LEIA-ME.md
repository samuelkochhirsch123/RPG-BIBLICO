# Heróis da Fé — Jornada Bíblica (v3)

Protótipo **single player** de RPG bíblico original em pixel art. Contém 20 fases, quatro personagens com sprites reais (arquivos PNG), dois quadros de caminhada para cada uma das quatro direções, pontuação, três corações e perguntas bíblicas.

## Executar no computador

1. Extraia **todo** o conteúdo do ZIP.
2. Mantenha as pastas `assets`, `css`, `js` e o arquivo `index.html` juntos.
3. Abra `index.html` em Chrome, Edge ou Firefox. Não é preciso instalar Python, Java ou servidor para o modo local.

## Atualizar o GitHub Pages

1. Entre em `https://github.com/samuelkochhirsch123/RPG-Biblico` com sua conta.
2. Substitua o `index.html` antigo pelo novo e envie também os diretórios **`assets/`**, **`css/`** e **`js/`** e o `manifest.webmanifest`, preservando os nomes e a estrutura. O ZIP precisa ser **extraído** antes do upload ao GitHub; enviar só o ZIP não publica o jogo.
3. Faça commit na branch `main`. Em `Settings > Pages`, configure `Deploy from a branch`, branch `main`, pasta `/ (root)`.
4. Abra `https://samuelkochhirsch123.github.io/RPG-Biblico/`. Se o navegador continuar mostrando a versão antiga, atualize a página e limpe o cache do site, se necessário.
5. Em Android, use a opção **Adicionar à tela inicial/Instalar app**, quando disponível. O arquivo `manifest.webmanifest` solicita orientação horizontal no modo instalado, dependendo do navegador.
6. Em iPhone, abra pelo Safari e gire o aparelho para a horizontal. O Safari do iPhone pode **não permitir que uma página force a rotação ou entre no fullscreen automaticamente**. O jogo funciona na vertical, mas foi otimizado para horizontal.

## Controles

**Computador:**
- `WASD` ou setas: andar.
- `E` ou `Espaço`: ação.
- `Shift`: correr.
- `P`: pausar/retomar.
- `F`: tela cheia.
- `Esc`: sair da tela cheia; se não estiver em tela cheia, pausar.

**Android e iPhone:** analógico à esquerda, `CORRER` segurado e `AÇÃO` à direita. Controles sobre o mapa, mais internos e elevados. Os botões de fechar, pausar e tela cheia estão na parte superior; ao tocar em sair, aparece a opção de retornar ao menu.

## Perguntas e vidas

A pergunta aparece **a cada 60 segundos de exploração**. O mapa, personagens e a missão ficam pausados durante a resposta. O jogador tem mais **60 segundos para responder**; errar ou deixar o tempo terminar perde um coração. Há três corações.

## Fase 2: chegada dos animais

Os quatro grupos de animais **caminham espontaneamente** até os pontos próximos à arca. Quando param, aproxime o personagem de cada grupo e pressione `AÇÃO` (ou `E` no computador). Não é necessário caçá-los nem arrastá-los. Ao receber quatro grupos, a fase 3 é liberada.

## Fases e progresso

As 20 fases cobrem o Antigo Testamento, a partir da fase 10 a vida de Jesus e as missões de Paulo nas últimas fases. A seleção de fases desbloqueadas fica disponível no menu; a liberação de fases é salva localmente neste navegador com `localStorage`.

O jogo é uma **adaptação lúdica**, e alguns marcos de exploração são símbolos, não uma reconstituição literal dos acontecimentos. O episódio de Jericó representa 6 voltas nos seis dias iniciais, e 7 voltas no sétimo dia, conforme Josué 6.

## Estrutura

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
  art.js
  game.js
LEIA-ME.md
```

**Atenção:** esta versão é single player. Ainda não há autenticação, salas online nem sincronização Firebase.
