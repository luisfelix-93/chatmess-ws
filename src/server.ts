import * as path from "path";
import * as http from "http";
import * as express from "express";
import { Server} from "socket.io";
import IChatController  from "./controllers/ChatController";
import * as dotenv from "dotenv"
import IUserService from "./services/UserService";
import IMessageService from "./services/MessageService";
import { SocketManager } from "./managers/SocketManager";
import IUserRepository from "./infrastructure/repositories/UserRepository";
import Redis from "ioredis";

dotenv.config();

class App {
    private readonly app: express.Application;
    private readonly server: http.Server;
    private port: string | number;
    private  redisClient: Redis;
    private readonly io: Server;

    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = new Server(this.server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST']
            }
        });
        this.port = process.env.PORT || 3000;
        this.redisClient = this.configureRedis();
        this.configureMiddleware();
        this.configureStaticFiles();
        this.initializeSocket();
    }

    
    private configureRedis(): Redis {
        const redis = new Redis({
            host: process.env.REDIS_HOST || "localhost",
            port: parseInt(process.env.REDIS_PORT) || 6379,
            retryStrategy: (times) => Math.min(times * 100, 3000)
        });

        redis.on("connect", () => {
            console.log("Conectado ao Redis");
        });

        return redis;
    }

    private configureMiddleware(): void {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended : true }));
    }

    private configureStaticFiles(): void {
        this.app.use(express.static(path.join(__dirname, "public")));
    }

    public initializeSocket(): void {
        const userRepository = new IUserRepository();
        const userService = new IUserService(userRepository);
        const messageService = new IMessageService();
        const chatController = new IChatController(userService, messageService);
        new SocketManager(this.io, chatController);
    }

    public start(): void {
        this.server.listen(this.port, () => {
            console.log(`Aplicação rodando na porta ${this.port}`);
        });
    }
}

const application = new App();
application.start();