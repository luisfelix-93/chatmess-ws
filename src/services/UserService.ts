import * as dotenv from 'dotenv'
import User from '../infrastructure/models/entities/User'
import IUserRepository from 'src/infrastructure/repositories/UserRepository';
dotenv.config();

export default interface IUserService {
    userJoin(username: string, socketId: string, room: string): Promise<void|null>;
    getCurrentUser(socketId: string): Promise<User|null>;
    userLeave(socketId: string): Promise<void|null>;
    getRoomUsers(room: string): Promise<User[]|null>;
}

export default class UserService implements IUserService {
    constructor(
        private readonly userRepository: IUserRepository
    ) {}
    public async userJoin(username: string, socketId: string, room: string): Promise<void | null> {
        try {
            await this.userRepository.userJoinRepository(username, socketId, room);
        } catch (error) {
            console.error('Erro ao tentar adicionar o usuário na sala', error);
        }
    }

    public async getCurrentUser(socketId: string): Promise<User | null> {
        try {
            const user = await this.userRepository.getUserRepository(socketId);
            return user;
        } catch (error) {
            console.error("Aconteceu um erro ao tentar buscar o usuário", error);
        }
    }

    public async getRoomUsers(room: string): Promise<User[] | null> {
        try {
            const users = await this.userRepository.getRoomUsersRepository(room);
            return users;
        } catch (error) {
            console.error("Aconteceu um erro ao tentar buscar os usuários da sala", error);
        }
    }

    public async userLeave(socketId: string): Promise<void | null> {
        try {
            await this.userRepository.userLeaveRepository(socketId);
        } catch (error) {
            console.error("Aconteceu um erro ao tentar remover o usuário da sala", error);
        }
    }
}

