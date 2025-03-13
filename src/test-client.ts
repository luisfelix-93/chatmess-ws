import * as chalk from "chalk";
import * as readline from "readline";
import { io, Socket } from "socket.io-client";
interface ClientConfig  {
    baseUsername: string;
    room: string;
    serverUrl: string;
}

class ChatTester {
    private socket!: Socket;
    private rl: readline.Interface;
    private username!: string;

    constructor(private config: ClientConfig) {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    public connect(): void {
        this.socket = io(this.config.serverUrl, {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.setupEventListeners();
        this.initializeChat();
    }

    private setupEventListeners(): void {
        this.socket.on('connect', () => {
            // Gera o username único com o socket.id
            this.username = `${this.config.baseUsername} - ${this.shortSocketId()}`;
            console.log(chalk.green(`Connected as ${this.username} (ID: ${this.socket.id})`));
            this.joinRoom();
        });

        this.socket.on('message', (msg: any) => {
            this.displayMessage(msg);
        });
        
        this.socket.on("roomUsers", ({ room, users }: { room: string; users: any[] }) => {
            console.log(chalk.blue(`\n[Room Update] Users in ${room}:`));
            users.forEach(user => console.log(`- ${chalk.yellow(user.username)}`));
            this.prompt();
        });
      
        this.socket.on("error", (error: { message: string }) => {
            console.error(chalk.red(`\n[ERROR] ${error.message}`));
            this.prompt();
        });
      
        this.socket.on("disconnect", () => {
            console.log(chalk.yellow("\nDisconnected from server"));
            process.exit(0);
        });
    }

    private shortSocketId(): string {
        return this.socket.id.slice(-4);
    }

    private joinRoom(): void {
        this.socket.emit('joinRoom', this.username, this.config.room);
        console.log(chalk.blue('\n Joining room ' + this.config.room));
    }

    private async initializeChat(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.prompt();
        this.rl.on('line', (input) => {
            if (input === '/exit') {
                this.socket.disconnect();
                return;
            }
            this.socket.emit('chatMessage', {
                username: this.username,
                text: input,
                room: this.config.room,
            });

            this.prompt();
        })
    }

    private displayMessage(msg: any): void {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        console.log(chalk.cyan(`[${new Date().toLocaleTimeString()}] ${msg.username}: `) + msg.text);
        this.prompt();
    }

    private prompt(): void {
        process.stdout.write(chalk.green('You > '));
    }
}

const config : ClientConfig = {
    baseUsername: 'TestUser',
    room: 'teste_02',
    serverUrl: 'http://localhost:3000'
}

console.clear();
console.log(chalk.yellow('Starting the server...'));

const tester = new ChatTester(config);
tester.connect();