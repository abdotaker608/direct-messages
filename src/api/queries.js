import {get} from './index';

export const getChats = (uuid) => get('/websocket/chats', {uuid});

export const getMessages = (chatId, lastDate) => get(`/websocket/${chatId}/messages`, {lastDate});

export const hypeDynos = () => get('/websocket/hype');