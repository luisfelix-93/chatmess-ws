import Redis from "ioredis";
import User from "../models/entities/User";

export default interface IUserRepository {
    userJoinRepository(username: string, socketId: string, room: string): Promise<void|null>;
    getUserRepository(socketId: string): Promise<User |null>;
    userLeaveRepository(socketId: string): Promise<void|null>;
    getRoomUsersRepository(room: string): Promise<User[]|null>;
}

export default class UserRepository implements IUserRepository {
    private redisClient: Redis;
    private readonly USER_PREFIX = "user";
    private readonly ROOM_PREFIX = "room";

    constructor() {
        this.redisClient = new Redis({
            host: process.env.REDIS_HOST || "localhost",
            port: parseInt(process.env.REDIS_PORT) || 6379,
        });
    }

    public async userJoinRepository(username: string, socketId: string, room: string): Promise<void | null> {
        const userKey = `${this.USER_PREFIX}:${socketId}`;
        const roomKey = `${this.ROOM_PREFIX}:${room}`;

        // Salva os dados do usuário
        await this.redisClient.hset(userKey,
            'username', username,
            'socketId', socketId,
            'room', room
        );

        // Adiciona o usuário na sala 
        await this.redisClient.sadd(roomKey, socketId);

        // Define a vida útil do usuário na sala
        await this.redisClient.expire(userKey, 86400);

    }

    public async getUserRepository(socketId: string): Promise<User | null> {
        let user = new User();
        const userKey = `${this.USER_PREFIX}:${socketId}`;
        // Busca os dados do usuário
        const userData = await this.redisClient.hgetall(userKey);
        user.username = userData.username;
        user.socketId = userData.socketId;
        user.room = userData.room;
        user.joinedAt = new Date();
        return user;
    }

    public async getRoomUsersRepository(room: string): Promise<User[] | null> {
        let userList: User[] = [];
        const roomKey = `${this.ROOM_PREFIX}:${room}`;
        // Retorna os usuários da sala
        const socketIds = await this.redisClient.smembers(roomKey);

        const userPromises = socketIds.map(async (socketIds) => {
            return await this.getUserRepository(socketIds);
        });
        userList = (await Promise.all(userPromises)).filter(Boolean) as User[];
        return userList;
    }

    public async userLeaveRepository(socketId: string): Promise<void | null> {
        const user = await this.getUserRepository(socketId);

        const userKey = `${this.USER_PREFIX}:${socketId}`;
        const roomKey = `${this.ROOM_PREFIX}:${user.room}`;

        // Remover o usuário da sala

        await this.redisClient.srem(roomKey, socketId);

        // Remover os dados do usuário
        await this.redisClient.del(userKey);
    }

    public async disconnect(): Promise<void> {
        this.redisClient.disconnect();
    }
}

