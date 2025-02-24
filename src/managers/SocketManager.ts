import { Server, Socket } from "socket.io";
import IChatController from "../controllers/ChatController";
import MessageDTO from "../infrastructure/models/DTO/MessageDTO";

export class SocketManager {
    constructor(
        private readonly io: Server,
        private readonly chatController: IChatController
    ){
        this.setupSocketEvents();
    }

    private setupSocketEvents(): void {
        this.io.on("connection", (socket: Socket) => {
            this.registerEventHandlers(socket); 
        })
    }

    private  registerEventHandlers(socket: Socket): void {
        console.log("Novo usuário conectado");
        socket.on("joinRoom", async (username: string, room: string) => {
            await this.handleJoinRoom(socket, username, room);
        });
        
        socket.on("chatMessage", async (msg: MessageDTO) => {
            await this.handleChatMessage(socket, msg);
        });

        socket.on("disconnect", async () => {
            await this.handleDisconnect(socket);
        })

    }

    private async handleJoinRoom(socket: Socket, username: string, room: string): Promise<void> {
        try {

            await this.chatController.onJoinRoom(socket, this.io, username, room);
            socket.join(room);
            this.emitSystemMessage(room, `${username} entrou na sala ${room}`);
        } catch (error) {
            this.handleError(socket, error);
        }
    }

    private async handleChatMessage(socket: Socket, msg: MessageDTO): Promise<void> {
        try {
            const message = await this.chatController.onChatMessage(socket, this.io, msg);
            if (!msg.room) {
                this.handleMessage(socket, "Não foi encontrada a sala do chat na mensagem")
                return;
            }
            this.io.to(msg.room).emit("new message", message);
        } catch (error) {
            this.handleError(socket, error);
        }
    }

    private async handleDisconnect(socket: Socket): Promise<void> {
        try {
            const result = await this.chatController.onDisconect(socket, this.io);
            if (result) {
                this.emitSystemMessage(result.room, `${result.username} deixou a sala`);
            }
        } catch (error) {
            this.handleError(socket, error);
        }
    }

    private emitSystemMessage(room: string, content: string): void {
        this.io.to(room).emit("systemMessage", {
          content,
          timestamp: new Date().toISOString()
        });
    }

    private handleError(socket: Socket, error: Error): void {
        console.error("Socket error:", error);
        socket.emit("error", { message: error.message });
    }
    private handleMessage(socket: Socket, message: string): void {
        console.log(message);
        socket.emit("error", {message: message} );
    }
}