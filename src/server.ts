import * as path from "path";
import * as http from "http";
import * as express from "express";
import { Server} from "socket.io";
import IChatController  from "./controllers/ChatController";


import * as dotenv from "dotenv"
import IUserService from "./services/UserService";
import IMessageService from "./services/MessageService";
import { SocketManager } from "./managers/SocketManager";

dotenv.config();

class App {
    private readonly app: express.Application;
    private readonly server: http.Server;
    private port: string | number;

    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.port = process.env.PORT || 3000;

        this.configureMiddleware();
        this.configureStaticFiles();
    }

    private configureMiddleware(): void {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended : true }));
    }

    private configureStaticFiles(): void {
        this.app.use(express.static(path.join(__dirname, "public")));
    }

    public initializeSocket(io: Server): void {
        const userService = new IUserService();
        const messageService = new IMessageService();

        const chatController = new IChatController(userService, messageService);

        new SocketManager(io, chatController);
    }

    public start(): void {
        this.server.listen(this.port, () => {
            console.log(`Aplicação rodando na porta ${this.port}`);
        });
    }
}

const io = new Server(http.createServer(), {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
});

const application = new App();
application.initializeSocket(io);
application.start();