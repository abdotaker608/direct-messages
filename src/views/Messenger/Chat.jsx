import React, {useContext, useEffect, useState, useRef, useCallback} from 'react';
import {UUIDContext} from 'providers/UUIDProvider';
import {Avatar, Heading, Box} from "@chakra-ui/react";
import {connectToChatSocket} from 'api/websocket';
import Emoji from 'react-emoji-render';
import RingTone from 'static/audio/notification_xperia.mp3';

function Chat({chat, activeChat, onClick, onReceive, tempMessage, msgEvent}) {

    //current user uuid
    const {UUID} = useContext(UUIDContext);

    //The connected user on chat is the one with an id different from
    //the current user
    const chatUser = chat.users.find(user => user.uuid !== UUID);

    //last message sent in chat
    const [lastMessage, setLastMessage] = useState(chat.last_message); 

    //No of unread messages in this chat
    const [unread, setUnread] = useState(chat.unread);

    //socket ref
    const socketRef = useRef(null);

    //notification ringtone
    const notificationTone = useRef(new Audio(RingTone));

    //listening to msg events
    useEffect(() => {
        if (msgEvent?.type === 'message' && msgEvent.payload.chat === chat.id) {
            if (chat.id !== activeChat?.id) {
                setUnread(unread + 1);
            }
            setLastMessage(msgEvent.payload);
        }
    }, [msgEvent])

    //function to fire read message event
    const fireRead = () => {
        if (chat.id === activeChat?.id) {
            const data = {type: 'read', payload: {uuid: UUID}};
            socketRef.current.send(JSON.stringify(data));
            setUnread(0);
        }
    }

    //connect to corresponding socket
    useEffect(() => {
        socketRef.current = connectToChatSocket(chat.id);
        socketRef.current.onmessage = (e) => {
            const data = JSON.parse(e.data);
            onReceive(data);
            if (data.type === 'message' && data.payload.sender.uuid !== UUID) {
                if (!document.hasFocus()) {
                    //play notification when user is on another tab
                    notificationTone.current.play();
                }
                else fireRead();
            }
        }    

        return () => socketRef.current.close();
    }, [])

    //message listener to window focus for firing read event
    useEffect(() => {
        window.addEventListener('focus', fireRead);
        
        return () => {
            window.removeEventListener('focus', fireRead);
        }
    }, [fireRead])

    useEffect(() => {
        //when this changes it means that the user did input
        //a message and submitted it to send in the chat
        //RTC events shall fire without depending on what chat is active
        if ((!tempMessage.message || chat.id !== activeChat?.id) && tempMessage.type !== 'rtc') return;
        const data = {type: tempMessage.type, payload: tempMessage.message};
        socketRef.current.send(JSON.stringify(data));
    }, [tempMessage])

    //mark messages as read once it becomes the active chat
    useEffect(() => {
        fireRead();
    }, [activeChat])

    //function to get last message preview
    const getLastMessage = (message) => {
        const defaultMessage = `You can now chat with ${chatUser.username}..`;
        if (!message) return defaultMessage;
        const lastMsgSender = message.sender.uuid === UUID ? 'You' : chatUser.username;
        if (message.text) return message.text;
        if (message.attachment) return `${lastMsgSender} sent an attachment`;
        if (message.audio) return `${lastMsgSender} sent a voice message`;
        return defaultMessage;
    }

    return (
        <div className={`chat ${chat.id === activeChat?.id ? 'active' : ''}`} onClick={onClick}>
            <div className='d-flex align-items-center'>
                <Avatar width="60px" height="60px"/>
                <Box margin="0 10px" flexGrow={1}>
                    <Heading fontSize={18} fontWeight="500">{chatUser.username}</Heading>
                    <h6 className='mt-1'>
                        <Emoji text={getLastMessage(lastMessage)} />
                    </h6>
                </Box>
                {
                    unread > 0 &&
                    <Box borderRadius="50%" width="30px" height="30px" display="flex" justifyContent="center" textAlign='center' alignItems="center" className='bg-info' color="white" fontWeight="bold" fontSize={14}>{unread}</Box>
                }
            </div>
        </div>
    )
}

export default Chat
