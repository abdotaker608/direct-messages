import React, {createContext, useState} from 'react';
import {v4} from 'uuid';
import {connectToMainSocket as connectMain} from 'api/websocket';
import {useToast} from '@chakra-ui/react';


export const UUIDContext = createContext();

function UUIDProvider({children}) {
    
    //current uuid, automatically generated every time the app starts
    const [UUID] = useState(v4());

    //username inserted
    const [username, setUsername] = useState('');

    //connection status
    const [connected, setConnected] = useState(false);

    //toaster for user friendly messages
    const toast = useToast();

    //event of other users creation and deletion
    const [event, setEvent] = useState({});

    //function to connect to the main websocket
    const connectToMainSocket = (name) => {
        setUsername(name);
        //Connect using the name and UUID
        const socket = connectMain(UUID, name);
        socket.onopen = () => setConnected(true);
        //Listen to user creation and deletion real time events
        socket.onmessage = (e) => {
            const data = JSON.parse(e.data);
            //Check if the message is an error message and also for current user
            if (data.type === 'exception' && data.payload.uuid === UUID) {
                toast({
                    title: 'Whoops!',
                    description: data.payload.message,
                    status: 'error',
                    isClosable: true
                })
                setConnected(false);
                //Close the socket so that user can retry with another name
                socket.close();
            }
            else setEvent(data);
        }
    }

    const contextValue = {
        UUID,
        event,
        connected,
        username,
        connectToMainSocket
    }

    return (
        <UUIDContext.Provider value={contextValue}>
            {children}
        </UUIDContext.Provider>
    )
}

export default UUIDProvider
