# ChatMess WebSocket

## 1. Visão Geral
Aplicação de chat em tempo real usando **Express.js**, **Socket.io** e **TypeScript**, seguindo princípios SOLID e Clean Code. Permite que usuários se conectem a salas, troquem mensagens e recebam notificações de entrada/saída de participantes.

---

## 2. Funcionalidades Principais
- 🚪 Entrar em salas de chat
- 💬 Enviar mensagens em tempo real
- 👥 Listagem de usuários na sala
- 📜 Histórico de mensagens
- 🔔 Notificações de entrada/saída
- 🛠 Arquitetura modular e extensível

---

## 3. Tecnologias
| Tecnologia       | Descrição                           |
|------------------|-------------------------------------|
| Node.js          | Ambiente de execução                |
| Express.js       | Framework web                       |
| Socket.io        | Comunicação em tempo real           |
| TypeScript       | Tipagem estática                    |
| SOLID            | Princípios de design                |

---

## 4. Instalação
```bash
# Clone o repositório
git clone https://github.com/luisfelix-93/chatmess-ws.git

# Instale as dependências
npm install

# Configure o ambiente (crie .env)
echo "PORT=3000" > .env

# Inicie o servidor
npm run dev
```

## 5. Estrutura do Projeto
 ```bash 
 src/
├── controllers/    # Lógica de controle
│   └── ChatController.ts
├── services/       # Regras de negócio
│   ├── UserService.ts
│   └── MessageService.ts
├── infrastructure/ # Camada de infraestrutura
│   ├── models/
│   │   ├── DTO/ # Objetos de transferência
│           └── MessageDTO.ts # DTO relacionado a m          
│   │   └── entities/      # Entidades de domínio
│   └── utils/             # Utilitários
├── managers/       # Gerenciadores de recursos
│   └── SocketManager.ts
└── server.ts          # Ponto de entrada
 ```

 ## 6. Diagrama de Fluxo

 ```bash
 sequenceDiagram
    participant Cliente
    participant SocketManager
    participant ChatController
    participant Services
    
    Cliente->>SocketManager: joinRoom (username, room)
    SocketManager->>ChatController: onJoinRoom()
    ChatController->>UserService: userJoin()
    UserService-->>ChatController: User
    ChatController->>MessageService: findMessage()
    MessageService-->>ChatController: Message[]
    ChatController-->>SocketManager: Confirmação
    SocketManager->>Cliente: roomJoined
 ```

## 7. Referências da API
#### a) Eventos

| Evento           | Parâmetros                          | Descrição                   |
|------------------|-------------------------------------|-----------------------------|
| ``joinRoom``     | `username: string`, `room: string`  |Entrar em uma sala           |
| ``chatMessage``  | `MessageDTO`                        |Enviar mensagem              |
| ``disconnect``   | -                                   |Desconectar                  |

#### b) Respostas

| Evento           | Parâmetros                          | Descrição                   |
|------------------|-------------------------------------|-----------------------------|
| ``message``      | `FormattedMessage`                  |Mensagem formatada           |
| ``roomUsers``    | `{ room: string, users: Users[] }`  |Usuários na sala             |
| ``error``        | `{ message: string }`               |Desconectar                  |

#### Exemplo de Uso

```html
<!-- Frontend Básico -->
<script>
  const socket = io('http://localhost:3000');
  
  socket.emit('joinRoom', 'Alice', 'devs-room');
  
  socket.on('message', (msg) => {
    console.log(`${msg.username}: ${msg.text}`);
  });
</script>
```

## 8. Como Contribuir
 - 1. Faça um fork do projeto
 - 2. Crie uma branch: `git checkout -b feat/nova-funcionalidade`
 - 3. Commit: `git commit -m 'abudabdo'` 
 - 4. Push: `git push origin feat/nova-funcionalidade`
 - 5. Abra um Pull Request

## 9. Licença
- MIT © 2024 Luis Felipe Felix Filho