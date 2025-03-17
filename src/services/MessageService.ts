import axios from "axios";
import MessageDTO from "../infrastructure/models/DTO/MessageDTO";
import Message from "../infrastructure/models/entities/Message"
import * as dotenv from 'dotenv';
import * as https from "https" // Importando lib de HTTPS
dotenv.config();

/**
 * Criando um agente HTTPS que ignora certificados não confiáveis
 */
const httpsAgent = new https.Agent({
    rejectUnauthorized: false, // O agente vai passar a ignorar os erros de certificados
    minVersion: 'TLSv1.2'
})
export default interface IMessageService {
    createMessage(pMessage: MessageDTO): Promise<Message | null>;
    findMessage(room: string): Promise<Message[] | null>;
    deleteMessage(messageid: string): Promise<string | null>;
    updateMessage(id: string, messageUpdate: MessageDTO): Promise<object | null>
}

export default class MessageService implements IMessageService {
    constructor(){}

    /**
     * Método de envio de mensagem no chat
     * @param pMessage : {MessageDTO}
     * @returns 
     */
    async createMessage(pMessage: MessageDTO): Promise<Message | null> {
        const body = JSON.stringify(pMessage);
        const config = {
            method: 'POST',
            url: process.env.URL_MESSAGE,
            headers: {'Content-Type': 'application/json'},
            data: body,
            httpsAgent
        }
        const response = await axios.request(config);
        return response.data.resultObject;
    }
    /**
     * Método que busca as mensagens da sala
     * @param room : string
     * @returns Message
     */
    async findMessage(room: string): Promise<Message[] | null> {
        let message: Message[] = [];
        const url = process.env.URL_MESSAGE;
        const config = {
            method: 'GET',
            url: `${url}/room/${room}`,
            httpsAgent
        }
        const response = await axios.request(config);
        message = response.data.resultObject;
        return message;
    }
    /**
     * Método que exclui a mensagem pelom id dela
     * @param messageid 
     * @returns 
     */
    async deleteMessage(messageid: string): Promise<string | null> {
        const url = process.env.URL_MESSAGE;
        const config = {
            method: 'GET',
            url: `${url}/message/${messageid}`,
            httpsAgent
        }
        const response = await axios.request(config);
        return response.data.message;
    }
    /**
     * Método que atualiza a mensagem pelo ID dela
     * @param id : string
     * @param messageUpdate: MessageDTO
     * @returns Message
     */
    async updateMessage(id: string, messageUpdate: MessageDTO): Promise<object | null> {
        const body = JSON.stringify(messageUpdate);
        const url = process.env.URL_MESSAGE;
        const config = {
            method: 'PUT',
            url: `${url}/message/${id}`,
            headers: {'Content-Type': 'application/json'},
            data: body,
            httpsAgent
        };
        const response = await axios.request(config);
        return response.data.resultObject;
    }
}