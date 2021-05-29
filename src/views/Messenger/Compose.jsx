import React, {useState, useRef} from 'react';
import {v4} from 'uuid';
import EmojiPicker from 'emoji-picker-react';
import {Input, Box, IconButton} from "@chakra-ui/react";
import {BiWinkTongue, BiMicrophone, BiUnlink, BiSend} from 'react-icons/bi';
import Emoji from 'react-emoji-render';

function Compose({onSend, uuid}) {

    //open emoji picker status
    const [openPicker, setOpenPicker] = useState(false);

    //input of type file to allow users to attach videos and images
    const fileInputRef = useRef(null);

    //compose input ref used to type message
    const composeInputRef = useRef(null);

    //current message value that is being typed
    const [message, setMessage] = useState('');

    //functioning icons
    const icons = [
        {Icon: BiMicrophone, onClick: null},
        {Icon: BiUnlink, onClick: null},
        {Icon: BiWinkTongue, onClick: () => setOpenPicker(!openPicker)}
    ]

    //function to handle emoji click
    const handleEmojiClick = (_, emoji) => {
        const insert = composeInputRef.current.selectionStart;
        const emojifiedMessage = `${message.slice(0, insert)}${emoji.emoji}${message.slice(insert, message.length)}`;
        setMessage(emojifiedMessage);
        setOpenPicker(false);
        composeInputRef.current.focus();
    }

    //function to handle compose submissionc
    const handleSubmit = (e) => {
        e.preventDefault();
        //Do not compose emtpy messages
        if (!message) return;
        onSend({sender: {uuid}, text: message, hash: v4()});
        setMessage('');
        composeInputRef.current.focus();
    }

    return (
        <div className='compose'>
            <Box position='absolute' top="-500%" left="35px" zIndex={50} onBlur={() => setOpenPicker(false)} display={openPicker ? 'block' : 'none'}>
                <EmojiPicker onEmojiClick={handleEmojiClick}/>
            </Box>
            <input type="file" style={{display: 'none'}} ref={target => fileInputRef.current = target} />
            <div className='d-flex align-items-center justify-content-around' style={{maxWidth: '120px', marginRight: '10px'}}>
                {
                    icons.map(({Icon, onClick}, index) => (
                        <IconButton as="button" key={index} onClick={onClick} colorScheme="messenger" variant="ghost" rounded="full" size="sm">
                            <Icon size={20}/>
                        </IconButton>
                    ))
                }
            </div>
            <form className='d-flex align-items-center' onSubmit={handleSubmit}>
                <Input value={message} onChange={e => setMessage(e.target.value)} placeholder="Type here.." ref={target => composeInputRef.current = target} />
                <IconButton type="submit" colorScheme="messenger" rounded="full" size="sm">
                    <BiSend size={20} />
                </IconButton>
            </form>
        </div>
    )
}

export default Compose
