import React, {useEffect, useRef} from 'react';
import Emoji from 'react-emoji-render';

function MessagesWindow({messages, uuid, fetchMessages, chat}) {

    //messages container ref
    const containerRef = useRef(null);

    //first load ref
    const firstLoad = useRef(true);

    useEffect(() => {
        //do not do that if the user is intending to fetch older messages
        if (containerRef.current.scrollHeight > containerRef.current.clientHeight && firstLoad.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
            firstLoad.current = false;
        }
        if (containerRef.current.scrollTop === 0) return;
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }, [messages])

    //fetch more messages by scrolling to the very top
    const loadMoreMsgs = (e) => {
        //Fetching older messages
        if (e.target.scrollTop === 0 && !firstLoad.current) {
            fetchMessages();
        }
    }

    useEffect(() => {
        firstLoad.current = true;
    }, [chat])

    useEffect(() => {
        containerRef.current.addEventListener('scroll', loadMoreMsgs);
    }, [])

    return (
        <div className='messages-window' ref={target => containerRef.current = target}>
            {
                messages.map(message => (
                    <div className={`message ${message.sender.uuid === uuid ? 'mine' : ''}`} key={message.hash}>
                        <Emoji text={message.text} />
                    </div>
                ))
            }
        </div>
    )
}

export default MessagesWindow
