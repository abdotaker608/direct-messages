import React, {useContext} from 'react';
import {Avatar, Heading} from '@chakra-ui/react';
import {UUIDContext} from 'providers/UUIDProvider';
import RTC from './RTC';
import Compose from './Compose';
import MessagesWindow from './MessagesWindow';

function ChatWindow({chat, messages, closeCurrent, onSend, fetchMessages}) {

    //UUID
    const {UUID} = useContext(UUIDContext);

    //connected user on chat
    const chatUser = chat?.users?.find(user => user.uuid !== UUID);

    return (
        <div className='chat-window'>
            <div className='top-nav'>
                <div className='d-flex align-items-center'>
                    <Avatar width="50px" height="50px"/>
                    <Heading margin="0 10px" fontSize={16} fontWeight="500">{chatUser?.username}</Heading>
                </div>
                <RTC closeChatWindow={closeCurrent}/>
            </div>
            <MessagesWindow messages={messages} uuid={UUID} fetchMessages={fetchMessages} chat={chat}/>
            <Compose onSend={onSend} uuid={UUID}/>
        </div>
    )
}

export default ChatWindow
