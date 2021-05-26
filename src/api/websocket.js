import RWS from 'reconnecting-websocket';
import {socketUrl} from './index';

export const connectToMainSocket = (uuid, username) => {
    const socket = new RWS(`${socketUrl}/main/${uuid}/${username}`);
    return socket;
}