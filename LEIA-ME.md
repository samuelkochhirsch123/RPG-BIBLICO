# Heróis da Fé — v6.2 | Multiplayer Beta

Jogo bíblico original em pixel art com **20 fases Single Player** e **salas online cooperativas de 2 a 4 pessoas** usando Firebase Realtime Database. Publicável no **GitHub Pages** sem servidor Node, Python ou hospedagem paga.

## Começar a jogar sozinho

Abra `index.html` por um servidor web estático (por exemplo GitHub Pages, Vercel ou `python -m http.server 8000`). **O jogo individual funciona mesmo sem Firebase configurado**, sem login.

## Ativar o multiplayer no Firebase (configuração única)

1. Entre em https://console.firebase.google.com/ e crie um projeto Firebase.
2. Em **Build > Authentication > Sign-in method**, habilite **Anônimo (Anonymous)**. O nome é apenas um apelido; não exige e-mail do jogador.
3. Em **Build > Realtime Database**, crie um banco, anote o **databaseURL** (deve ser exatamente a URL da instância criada).
4. Abra a aba **Rules** do Realtime Database, cole o conteúdo integral de `database.rules.json` e clique em **Publish**. **Não use regras públicas/test mode em produção.**
5. Em **Project settings > Your apps**, registre um app **Web** e copie os campos da configuração do SDK para `firebase-config.js` (inclusive `databaseURL`). **Nunca compartilhe senhas, credenciais de admin ou service accounts.** Os campos da config Web são públicos por design, mas precisam de regras de segurança.
6. Em **Authentication > Settings > Authorized domains**, verifique `samuelkochhirsch123.github.io` (ou seu domínio da Vercel) está autorizado; adicione se necessário.
7. **Extraia e envie TODOS os arquivos e pastas deste ZIP** para a raiz do repositório GitHub (incluindo `firebase-config.js`, `database.rules.json`, `js/multiplayer.js`, `assets`, `css`, `js` e `index.html`). O site GitHub Pages continua em `https://samuelkochhirsch123.github.io/RPG-Biblico/` quando publicado com sucesso.
8. Em dois dispositivos diferentes, abra o endereço do jogo, clique em **Jogar online**, digite apelidos, crie uma sala no primeiro e **entre com código** no segundo. O líder inicia a partida.

**Importante:** `database.rules.json` NÃO é aplicado automaticamente ao banco ao publicar no GitHub. É necessário copiar as regras na Console Firebase.

## Funcionalidades online — beta

- Sala com código de 6 caracteres, até 4 participantes.
- Login anônimo Firebase; apelido sem cadastro com e-mail.
- Skins próprias Homem / Mulher / Menino / Menina e outros jogadores no mapa em tempo real.
- Sincronização das posições com intervalo de ~240 ms (mais econômica que enviar a cada frame).
- Missão com líder: o anfitrião controla o avanço das 20 fases e o estado dos objetivos; os convidados podem percorrer o mapa e enviar interações à missão do anfitrião.
- Questões bíblicas locais para os convidados a cada 60 s de exploração; o próprio jogador responde e perde corações individualmente. As perguntas e minigames **do líder** são resolvidos na sessão do líder.
- Se o líder sair/desconectar, a sala é encerrada. Se um convidado sair, sua presença é removida pelo Firebase.
- Single Player original preservado, com progresso local e 20 fases.
- **Progresso online básico** da conta anônima: maior capítulo liberado e melhor pontuação são gravados em `profiles/<uid>` no Firebase quando uma fase é concluída, e recuperados no mesmo navegador.

### Limitações conscientes da versão beta

1. O anfitrião é a autoridade do mundo; **missões especiais, cutscenes e minigames (mira, procissão de Jericó) ainda dependem do líder**. Não há servidor dedicado nem mecanismo anti-trapaça de alto nível.
2. O cronômetro da missão acompanha a sessão do líder, e perguntas/minigames do anfitrião podem suspender seu progresso temporariamente; convidados podem continuar se movendo na maior parte do tempo.
3. Ao entrar na arca, a sala acompanha o líder para o interior, em vez de manter mapas internos independentes por jogador.
4. O multiplayer salva **desbloqueios e melhor pontuação por ID anônimo** no Firebase e sincroniza checkpoints do líder com a sala. **Contas anônimas não garantem recuperação ao mudar/apagar o dispositivo** e não são contas recuperáveis com senha/e-mail. Os estados exatos das missões não são salvos permanentemente.
5. A mesma sala não reabre automaticamente depois que o líder desconecta; crie outra.
6. É necessário **internet** e hospedar o jogo em HTTPS para multiplayer (GitHub Pages atende). Abrir `file://` no aparelho não é recomendável para login e imports do Firebase.
7. O projeto ainda não foi testado contra um Firebase real nesta entrega: é necessário fornecer/configurar o projeto para validar a conexão entre dois aparelhos.

## Segurança e custos

- Os códigos de sala são **códigos de convite**, não criptografia nem proteção para dados sensíveis. Não coloque dados pessoais no apelido.
- Regras do RTDB limitam escrita de presença ao próprio usuário, estado da sala ao host, progresso individual ao seu dono e interações a membros autenticados. Como todas as regras em apps web, devem ser revisadas antes de uso amplo.
- A franquia gratuita Spark tem limite de **100 conexões simultâneas ao Realtime Database**, além de limites de armazenamento/tráfego. Monitore o painel Usage do Firebase; sincronização pode gastar dados. Fonte: https://firebase.google.com/docs/database/usage/limits

## Estrutura de arquivos

- `index.html` — site e menus
- `css/style.css` — pixel art UI e controles responsivos
- `js/game.js` — gameplay, desafios e integração com as salas
- `js/multiplayer.js` — autenticação anônima, sala, participantes e sincronização Firebase
- `js/art.js` — sprites dos personagens e convidados
- `js/physics.js`, `js/adventures.js`, `js/data.js` — física, cenários e perguntas
- `firebase-config.js` — **edite com as configurações do seu projeto**
- `database.rules.json` — **publique manualmente no console Firebase**
- `assets/*` — imagens originais
- `manifest.webmanifest` — instalação como web app

Para testar localmente no PC:

```sh
cd RPG-Biblico-v6.2
python -m http.server 8000
# Abra http://localhost:8000
```
