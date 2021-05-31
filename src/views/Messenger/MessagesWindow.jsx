import React, {useEffect, useRef} from 'react';
import Emoji from 'react-emoji-render';
import {FaCheckDouble} from 'react-icons/fa';
import {toObjectUrl} from 'utils/tools';
import {CircularProgress, Box} from '@chakra-ui/react';

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

    //function to get message send date
    const getMsgDate = (date) => {
        date = date || new Date();
        const msgDate = new Date(date);
        let [time, dayTime] = msgDate.toLocaleTimeString().split(' ');
        time = time.split(':').filter((_, idx, arr) => idx !== arr.length - 1).join(':');
        const localTime = `${time} ${dayTime}`;
        const past = (new Date().getTime() - msgDate.getTime()) / (1000 * 60 * 60 * 24);
        if (past < 1) return localTime;
        if (past >= 1 && past < 2) return `Yesterday at ${localTime}`;
        else return msgDate.toLocaleDateString();
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
                messages.map((message, idx, arr) => (
                    <div
                        className={`
                            message
                            ${message.sender.uuid === uuid ? 'mine' : ''}
                            ${message.pending ? 'pending' : ''}
                        `}
                        key={message.hash}
                    >
                        {
                            message.text ?
                            <div className='text'>
                                <Emoji text={message.text} />
                            </div>
                            :
                            <>
                            {
                                message.attachment &&
                                (
                                    message.pending ?
                                    <Box d="flex" alignItems="center" justifyContent="center" minHeight="100px">
                                        <CircularProgress trackColor="transparent" size={8} isIndeterminate/>
                                    </Box>
                                    :
                                    <img src={toObjectUrl(message.attachment, 'image/*')} alt="" />
                                )
                            }
                            {
                                message.audio &&
                                (
                                    message.pending ?
                                    <Box d="flex" alignItems="center" justifyContent="center" minHeight="100px">
                                        <CircularProgress trackColor="transparent" size={8} isIndeterminate/>
                                    </Box>
                                    :
                                    <audio src={toObjectUrl(message.audio, 'audio/webm')} controls />
                                )
                            }
                            </>
                        }
                        {
                            (!message.pending && message.sender.uuid === uuid && idx === arr.length - 1) &&
                            <div className='seen-footer'>
                                <span className='mx-1'>
                                    {getMsgDate(message.created)}
                                </span>
                                {
                                    message.seen ?
                                    <FaCheckDouble size={12} color="rgb(33, 137, 207)"/>
                                    :
                                    <FaCheckDouble size={12} color="gray"/>
                                }
                            </div>
                        }
                    </div>
                ))
            }
        </div>
    )
}

export default MessagesWindow
