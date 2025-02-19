import axios from 'axios';
import * as dotenv from 'dotenv'
import User from '../infrastructure/models/entities/User'
dotenv.config();

export default interface IUserService {
    userJoin(username: string, socketId: string, room: string): Promise<object|null>;
    getCurrentUser(socketId: string): Promise<User|null>;
    userLeave(socketId: string): Promise<string|null>;
    getRoomUsers(room: string): Promise<User|null>;
}

export default class UserService implements IUserService {
    constructor() {}

    public async userJoin(username: string, socketId: string, room: string): Promise<object|null> {
        const body = JSON.stringify({username, socketId, room});
        const config  = {
            method: 'POST',
            url: process.env.URL_API,
            headers: {
                'Content-type': 'application/json',
            },
            body
        };

        try {
            const response = await axios.request(config);
            return response.data.ObjectResult;
        } catch(error) {
            throw new Error("Erro ao inserir usuário no chat")
        }
    }

    public async getCurrentUser(socketId: string): Promise<User|null> {
        let user = new User();
        const url = `${process.env.URL_API}`
        const config = {
            method: 'GET',
            url: `${url}/${socketId}`
        }

        const response = await axios.request(config);
        user = response.data.ObjectResult;
        return user;

    }

    public async userLeave(socketId: string): Promise<string|null> {
        const url = `${process.env.URL_API}`
        const config = {
            method: 'DELETE',
            url: `${url}/${socketId}`
        }

        const response = await axios.request(config);

        return response.data.Message;

    }

    async getRoomUsers(room: string): Promise<User|null> {
        let user = new User();
        const url = `${process.env.URL_API}`
        const config = {
            method: 'GET',
            url: `${url}/room/${room}`
        }

        const response = await axios.request(config);
        user = response.data.ObjectResult;
        return user;
    }
}

