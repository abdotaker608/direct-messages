import React, {createContext} from 'react';
import {v4} from 'uuid';
import RWS from 'reconnecting-websocket';


export const UUIDContext = createContext();

function UUIDProvider({children}) {
    
    //current uuid, automatically generated every time the app starts
    const UUID = v4();

    //function to connect to the main websocket
    const connectToMainSocket = (name) => {
        //Connect using the name and UUID
    }

    const contextValue = {
        UUID,
        connectToMainSocket
    }

    return (
        <UUIDContext.Provider value={contextValue}>
            {children}
        </UUIDContext.Provider>
    )
}

export default UUIDProvider
