import * as moment from "moment";
import MessageDTO from "../models/DTO/MessageDTO";
import Message from "../models/entities/Message";

/**
 * 
 * @param pMessage 
 * @returns 
 */
export default function formatMessage(pMessage: MessageDTO): Message {
    const username = pMessage.username;
    const text = pMessage.text;
    const room = pMessage.room || '';
    const message: Message = {
        username,
        room,
        text,
        time: moment().format('h:mm a')
    }

    return message;
}