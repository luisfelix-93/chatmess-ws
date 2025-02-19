import axios from "axios";
import MessageDTO from "../infrastructure/models/DTO/MessageDTO";
import Message from "../infrastructure/models/entities/Message"
import * as dotenv from 'dotenv';
dotenv.config();

export default interface IMessageService {
    createMessage(pMessage: MessageDTO): Promise<object | null>;
    findMessage(room: string): Promise<Message | null>;
    deleteMessage(messageid: string): Promise<string | null>;
    updateMessage(id: string, messageUpdate: MessageDTO): Promise<object | null>
}

export default class MessageService implements IMessageService {
    constructor(){}

    async createMessage(pMessage: MessageDTO): Promise<object | null> {
        const body = JSON.stringify(pMessage);
        const config = {
            method: 'POST',
            url: process.env.URL_MESSAGE,
            headers: {'Content-type': 'application/json'},
            body
        }
        const response = await axios.request(config);
        return response.data.ResultObject;
    }

    async findMessage(room: string): Promise<Message | null> {
        let message: Message = new Message();
        const url = process.env.URL_MESSAGE;
        const config = {
            method: 'GET',
            url: `${url}/room/${room}`,
        }
        const response = await axios.request(config) 
        return message;
    }

    async deleteMessage(messageid: string): Promise<string | null> {
        const url = process.env.URL_MESSAGE;
        const config = {
            method: 'GET',
            url: `${url}/message/${messageid}`,
        }
        const response = await axios.request(config);
        return response.data.Message;
    }

    async updateMessage(id: string, messageUpdate: MessageDTO): Promise<object | null> {
        const body = JSON.stringify(messageUpdate);
        const url = process.env.URL_MESSAGE;
        const config = {
            method: 'PUT',
            url: `${url}/message/${id}`,
            headers: {'Content-type': 'application/json'},
            body
        };
        const response = await axios.request(config);
        return response.data.ResultObject;
    }
}