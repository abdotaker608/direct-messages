import React, {createContext, useState} from 'react';
import {v4} from 'uuid';
import {connectToMainSocket as connectMain} from 'api/websocket';
import {useHistory} from 'react-router-dom';
import {MessengerRoute} from 'router/routes';


export const UUIDContext = createContext();

function UUIDProvider({children}) {
    
    //current uuid, automatically generated every time the app starts
    const UUID = v4();

    //event of other users creation and deletion
    const [event, setEvent] = useState({});

    //router history object
    const history = useHistory();

    //function to connect to the main websocket
    const connectToMainSocket = (name) => {
        //Connect using the name and UUID
        const socket = connectMain(UUID, name);
        //Redirect to messenger on connect
        socket.onopen = () => history.push(MessengerRoute);
        //Listen to user creation and deletion real time events
        socket.onmessage = (e) => {
            const data = JSON.parse(e.data);
            setEvent(data);
        }
    }

    const contextValue = {
        UUID,
        event,
        connectToMainSocket
    }

    return (
        <UUIDContext.Provider value={contextValue}>
            {children}
        </UUIDContext.Provider>
    )
}

export default UUIDProvider
