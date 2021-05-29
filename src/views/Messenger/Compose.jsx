import React, {useState, useRef} from 'react';
import {v4} from 'uuid';
import EmojiPicker from 'emoji-picker-react';
import {Input, Box, IconButton} from "@chakra-ui/react";
import {BiWinkTongue, BiMicrophone, BiUnlink, BiSend} from 'react-icons/bi';
import {useToast} from '@chakra-ui/react';

function Compose({onSend, uuid}) {

    //open emoji picker status
    const [openPicker, setOpenPicker] = useState(false);

    //input of type file to allow users to attach videos and images
    const fileInputRef = useRef(null);

    //compose input ref used to type message
    const composeInputRef = useRef(null);

    //messages toaster
    const toast = useToast();

    //current message value that is being typed
    const [message, setMessage] = useState('');

    //function for handling media change
    const handleMedia = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const validTypes = /image|video/;
        if (file.type.match(validTypes)) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const b64Data = e.target.result.split('base64,')[1];
                onSend({sender: {uuid}, attachment: b64Data, hash: v4()});
                //Reset the input
                fileInputRef.current.value = null;
            }
            reader.onerror = () => {
                toast({
                    title: "Whoops!",
                    description: "Failed to read the file data..",
                    status: "error",
                    duration: 3000,
                    isClosable: false
                })
            }
            reader.readAsDataURL(file);
        }
        else {
            toast({
                title: "Unsupported Media!",
                description: "Only images and videos can be attached..",
                status: "error",
                duration: 3000,
                isClosable: false
            })
        }
    }

    //functioning icons
    const icons = [
        {Icon: BiMicrophone, onClick: null},
        {Icon: BiUnlink, onClick: () => fileInputRef.current.click()},
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
            <input type="file" style={{display: 'none'}} ref={target => fileInputRef.current = target} onChange={handleMedia}/>
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
