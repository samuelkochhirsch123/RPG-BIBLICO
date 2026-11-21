## Esta versão já contém SUA configuração Firebase

O arquivo `firebase-config.js` **já está preenchido** com o aplicativo Web do projeto `rpg-biblico-71e94` e o endereço de Realtime Database `https://rpg-biblico-71e94-default-rtdb.firebaseio.com`. **Não precisa editar o Firebase para publicar este ZIP.**

O código recebido da console usava imports de SDK para apps empacotados; aqui usei apenas o objeto de configuração, porque este jogo carrega Firebase pelo módulo remoto sob demanda, quando o jogador entra no modo online. O Analytics não é necessário para o multiplayer.

**As regras já foram publicadas pelo usuário**, segundo a conversa. O arquivo `database.rules.json` é fornecido como cópia de referência; subi-lo ao GitHub/Vercel não publica nem altera as regras no painel Firebase.

**Antes do teste:** confirme que **Authentication → Sign-in method → Anônimo** está **Ativado** e que, em **Authorized domains**, está autorizado o endereço da Vercel (se necessário). Veja também se não há restrições indevidas na API Key no Google Cloud.

### Substituir a versão antiga no repositório conectado à Vercel

1. Extraia **RPG-Biblico-Firebase-Conectado-v6.3.2.zip**.
2. Envie **o conteúdo** para a raiz do repositório GitHub já conectado à Vercel, substituindo os arquivos antigos e preservando as pastas `assets/`, `css/` e `js/`.
3. Verifique o deploy da Vercel e abra a URL real do jogo em HTTPS.
4. No celular A, toque em **Jogar online → Criar sala**. No celular B, toque em **Jogar online → Entrar com código**.
5. Se falhar, veja a mensagem da tela; em particular, erro `auth/operation-not-allowed` significa que o login Anônimo não foi habilitado; `permission-denied` significa que regras/permissões do Realtime Database impediram a escrita.

**Sem teste de rede real:** o arquivo está configurado, mas a conexão entre dois jogadores só pode ser confirmada em execução contra seu Firebase. O projeto não tem acesso às credenciais de administrador e não mexe nas regras publicadas.

**Interface preservada:** recados na parte inferior, sem mensagens ao bater em paredes, hitbox para casas/muralhas, analógico e botões no celular, atalhos no PC. As 20 fases continuam no jogo, sem menu de fases de teste.

---

# Heróis da Fé — v6.3.2 | Firebase conectado — Multiplayer Beta

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

- Sala com código de 6 caracteres, até 4 participantes pela interface. O limite de quatro é validado no cliente, não é imposto atomicamente pelas regras do Realtime Database; partidas com acesso não autorizado precisam de backend/contadores de vagas para proteção mais forte.
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
cd RPG-Biblico-v6.3
python -m http.server 8000
# Abra http://localhost:8000
```

## Ajuste de interface v6.3

- Mensagens informativas transitórias foram movidas para a **região inferior da tela**. No modo paisagem, ocupam a faixa entre os controles; em retrato, ficam acima dos botões.
- O aviso **PRESSIONE AÇÃO** também foi reposicionado para baixo, evitando cobrir o personagem.
- **Nenhuma mensagem aparece ao esbarrar em casas, muralhas ou água profunda.** As colisões seguem funcionando e a animação de caminhada permanece ativa se o jogador ficar encostado na parede.
- As regras do Firebase foram corrigidas após detectar uso inválido de `numChildren()`; a escrita da raiz da sala agora é permitida somente para criação ou encerramento pelo anfitrião, evitando que uma regra permissiva no pai ignore permissões dos filhos. Se o seu arquivo `firebase-config.js` já estiver configurado na Vercel/GitHub, **não substitua pela configuração de exemplo**. Para atualizar só a interface, use o pacote de atualização parcial (index.html, css/style.css e js/game.js).

## Correção das regras (v6.3.1)

Se a aba Regras mostrar `No such method/property numChildren`, cole o conteúdo de `database.rules.json` e clique em **Publicar**. O novo arquivo remove `numChildren()` e restringe a escrita da sala, preservando as ações do líder e dos convidados. A publicação das regras no Firebase é separada da publicação do site na Vercel. Regras ainda precisam ser validadas no simulador do Firebase e com duas contas reais antes de uso amplo.
