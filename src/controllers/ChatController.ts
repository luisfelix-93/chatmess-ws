import MessageDTO from "../infrastructure/models/DTO/MessageDTO";
import IUserService from "../services/UserService";
import IMessageService from "../services/MessageService";
import formatMessage from "../infrastructure/utils/FormatMessage";
import Message from "../infrastructure/models/entities/Message";
import User from "../infrastructure/models/entities/User";

export default interface IChatController {
    onJoinRoom(socket: any, io: any, username: string, room: string): Promise<void | null>;
    onChatMessage(socket: any, io: any, pMessage: MessageDTO): Promise<void | null>;
    onDisconect(socket: any, io: any): Promise<User | null>;
}

export default class ChatController implements IChatController {
    private userService: IUserService;
    private messageService: IMessageService;

    constructor(
        userService: IUserService,
        messageService: IMessageService
    ) {
        this.userService = userService;
        this.messageService = messageService;
    }
    /**
     * - Método para usuário entrar no chat
     * @param socket : any
     * @param io : any
     * @param username : string
     * @param room : string
     * @returns 
     */
    async onJoinRoom(socket: any, io: any, username: string, room: string): Promise<void | null> {
        const socketId: string = socket.id;
        try {
            const user = await this.userService.userJoin(username, socketId, room);
            
            if (!user) {
                console.error("Não foi encontrado nenhum usuário");
                return null;
            }

            socket.join(user.room);
            const messageWelcome: MessageDTO = {
                username: "ChatMess Bot",
                room: room,
                text: `Oi, ${username}, seja bem vindo a sala ${room}`
            }
            // Bem vindo ao chat
            socket.emit("message", formatMessage(messageWelcome))

            const messages = await this.messageService.findMessage(room);
            if(!messages) {
                console.error("");
                return null;
            }
            messages.forEach((message:MessageDTO) => {
                socket.emit("message", formatMessage({
                    username: message.username,
                    text: message.text
                } ))
            });

            // Notificação aos outros usuários
            const notifyMessage: MessageDTO = {
                username: "ChatMess Bot",
                text: `${user.username}`
            }

            socket.broadcast.to(user.room).emit("message", formatMessage(notifyMessage));
            io.to(user.room).emit("roomUsers", {
                room: user.room,
                users: await this.userService.getRoomUsers(user.room)
            });
        } catch (error) {
            console.error(error);
            return null
        }  
    }
    /**
     * Método para enviar mensagem no chat
     * @param socket 
     * @param io 
     * @param pMessage 
     * @returns 
     */
    async onChatMessage(socket: any, io: any, pMessage: MessageDTO): Promise<void> {
        try {
            const user = await this.userService.getCurrentUser(socket.id)
            if(!user) {
                return;
            }
            const message = await this.messageService.createMessage(pMessage);
            if (!message) {
                return;
            }
            io.to(user.room).emit("message", formatMessage(message));
        } catch (error) {
            console.error(error);
        }
    }
    /**
     * Mensagem para deixar o chat
     * @param socket 
     * @param io 
     */
    async onDisconect(socket: any, io: any): Promise<User | null> {
        try {
            const user = await this.userService.getCurrentUser(socket.id);
                if (!user) {
                    return null;
                }
                // Mensagem para os membros da sala
                const message : MessageDTO = {
                    username: "ChatMess Bot",
                    room: user.room,
                    text: `${user.username} deixou a sala`
                }
                io.to(user.room).emit("message", formatMessage(message));
                io.to(user.room).emit("roomUsers", {
                room: user.room,
                users: await this.userService.getRoomUsers(user.room)
            });

            await this.userService.userLeave(socket.id)
            return user;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}