import path from "path";
import http from "http";
import * as express from "express";
import { Server } from "socket.io";
import * as dotenv from "dotenv"
dotenv.config();


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
