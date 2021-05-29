import React, {useState, useEffect, useContext, useRef} from 'react';
import {getChats} from 'api/queries';
import Chat from './Chat';
import {UUIDContext} from 'providers/UUIDProvider';
import {useHistory} from 'react-router-dom';
import {HomeRoute} from 'router/routes';
import {getMessages} from 'api/queries';
import ChatWindow from './ChatWindow';

function Messenger() {

    //current chats
    const [chats, setChats] = useState([]);

    //current active chat
    const [currentChat, setCurrentChat] = useState(null);

    //connected status and uuid for user
    const {connected, UUID, event} = useContext(UUIDContext);

    //last date for fetching older messages
    const [fetchOld, setFetchOld] = useState(false);

    //active chat messages
    const [messages, setMessages] = useState([]);

    //temp message to send in socket
    const [tempMessage, setTempMessage] = useState(null);

    //new received message
    const [msgEvent, setMsgEvent] = useState(null);

    //flag ref for fetching old messages
    const oldFlag = useRef(false);

    //function to fetch chats
    const fetchChats = async () => {
        const response = await getChats(UUID);
        if (Array.isArray(response)) setChats(response);
    }

    useEffect(() => {
        fetchChats();
    }, [])

    useEffect(() => {
        //Check if the current chat is deleted or still there
        if (!chats.find(chat => chat.id === currentChat?.id)) setCurrentChat(null);
    }, [chats, currentChat])

    //function to fetch messages
    const fetchMessages = async (lastDate = null) => {
        if (!currentChat) return;
        if (!lastDate) setMessages([]);
        let msgs = [];
        if (lastDate) msgs = [...messages]; 
        const response = await getMessages(currentChat.id, lastDate);
        setFetchOld(false);
        if (Array.isArray(response)) setMessages([...response, ...msgs]);
    }
 
    //history objet
    const history = useHistory();

    useEffect(() => {
        //User must be connected to be on messenger
        if (!connected) history.push(HomeRoute);
    }, [connected])

    useEffect(() => {
        //listen to new connecting/disconnecting users
        if (event.type === 'create' || event.type === 'delete') fetchChats();
    }, [event])

    //callback for receiving messages
    const onReceive = (event) => setMsgEvent(event);

    //call back for sending messages
    const onSend = (message) => {
        setTempMessage(message);
        const pendingMessage = {...message, pending: true};
        setMessages([...messages, pendingMessage]);
    }

    useEffect(() => {
        //when the active chat changes fetch it's messages
        if (currentChat) {
            fetchMessages();
        }
        else setMessages([]);
    }, [currentChat])

    useEffect(() => {
        //Verify first that the user isn't intending to fetch more messages
        if (oldFlag.current) {
            oldFlag.current = false;
            return;
        }
        //messages should never exceed 20, show more upon scrolling up
        const max = 20;
        const len = messages.length;
        if (len > max && messages[len - 1].sender.uuid === UUID) {
            setMessages(messages.slice(len - max, len));
        }
    }, [messages])

    useEffect(() => {
        if (msgEvent?.type === 'read') {
            const newMessages = [...messages];
            newMessages.forEach(message => message.seen = true);
            setMsgEvent(null);
            setMessages(newMessages);
        }

        if (msgEvent?.type === 'message') {
            //Make sure it's a message in the activeChat
            if (msgEvent.payload.chat !== currentChat?.id) return;
            const newMessages = [...messages];
            const idx = newMessages.findIndex(message => message.hash === msgEvent.payload.hash);
            if (idx === -1) {
                setMessages([...newMessages, msgEvent.payload]);
                return;
            }
            newMessages[idx] = msgEvent.payload;
            setMsgEvent(null);
            setMessages(newMessages);
        }
    }, [msgEvent])

    useEffect(() => {
        if (fetchOld && messages[0]) {
            fetchMessages(messages[0]?.created);
            oldFlag.current = true;
        }
    }, [fetchOld, messages])

    return (
        <div className='messenger'>
            <div className='messenger-layout'>
                <div className='chats-container'>
                    {
                        chats.map(chat => (
                            <Chat key={chat.id} chat={chat} activeChat={currentChat} onClick={() => setCurrentChat(chat)} onReceive={onReceive} tempMessage={tempMessage} msgEvent={msgEvent}/>
                        ))
                    }
                </div>
                <div className='window' style={{zIndex: currentChat ? 50 : 1, display: currentChat ? 'block' : 'none'}}>
                    <ChatWindow messages={messages} chat={currentChat} closeCurrent={() => setCurrentChat(null)} onSend={onSend} fetchMessages={() => setFetchOld(true)}/>
                </div>
            </div>
        </div>
    )
}

export default Messenger
