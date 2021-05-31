import React, {useState, useRef, useEffect} from 'react';
import {v4} from 'uuid';
import EmojiPicker from 'emoji-picker-react';
import {Input, Box, IconButton} from "@chakra-ui/react";
import {BiWinkTongue, BiMicrophone, BiUnlink, BiSend} from 'react-icons/bi';
import {useToast} from '@chakra-ui/react';
import Wave from 'wave-visualizer';

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

    //recording stream
    const recordStream = useRef(null);

    //media recorder
    const mediaRecorder = useRef(null);

    //chunks recorded
    const [chunks, setChunks] = useState([]);

    //recording status
    const [isRecording, setIsRecording] = useState(false);

    //function for reading file data as base64
    const readAsB64 = (file, callback) => {
        const reader = new FileReader();
        reader.onload = (e) => callback(e.target.result.replace(/^data:.+;base64,/, ''));
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

    //function to start recording
    const startRecord = () => {
        setIsRecording(true);
        navigator.mediaDevices.getUserMedia({
            audio: true
        })
        .then((stream) => {
            recordStream.current = stream;
            mediaRecorder.current = new MediaRecorder(recordStream.current, {mimeType: 'audio/webm'});
            mediaRecorder.current.ondataavailable = (e) => {
                if (e.data.size > 0) setChunks([...chunks, e.data]);
            }
            mediaRecorder.current.start();
            let wave = new Wave();
            wave.fromStream(recordStream.current, 'record-wave-visualizer', {
                type: 'shine',
                stroke: 1,
                colors: ['white', 'white', 'white']
            });
        })
        .catch(() => setIsRecording(false))
    }

    //function to stop recording
    const stopRecord = () => {
        if (!mediaRecorder.current || mediaRecorder.current.state === 'inactive') return;
        mediaRecorder.current.stop();
        setIsRecording(false);
        recordStream.current.getTracks().forEach(track => track.stop());
    }
    
    useEffect(() => {
        //sending chunks in chat when ready
        if (chunks.length) {
            const blob = new Blob(chunks, {type: 'audio/webm'});
            readAsB64(blob, (result) => {
                onSend({sender: {uuid}, audio: result, hash: v4()});
                setChunks([]);
            })
        }
    }, [chunks])

    //function for handling media change
    const handleMedia = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const validTypes = /image|video/;
        if (file.type.match(validTypes)) {
            readAsB64(file, (result) => {
                onSend({sender: {uuid}, attachment: result, hash: v4()});
                //Reset the input
                fileInputRef.current.value = null;
            })
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
        {Icon: BiMicrophone, onMouseDown: startRecord, onMouseUp: stopRecord, onMouseLeave: stopRecord},
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
            <div className='d-flex align-items-center justify-content-around position-relative' style={{maxWidth: '120px', marginRight: '10px'}}>
                {
                    icons.map(({Icon, onClick, onMouseDown, onMouseUp, onMouseLeave}, index) => (
                        <IconButton as="button" key={index} onClick={onClick} colorScheme="messenger" variant="ghost" rounded="full" size="sm" onMouseDown={onMouseDown} onMouseUp={onMouseUp} onTouchStart={onMouseDown} onTouchEnd={onMouseUp} onMouseLeave={onMouseLeave} onTouchCancel={onMouseLeave}>
                            <Icon size={20}/>
                        </IconButton>
                    ))
                }
                {
                    isRecording &&
                    <Box position="absolute" top="-40px" left="0" className='bg-primary' padding="10px" width="fit-content" height="fit-content" borderRadius="25px">
                        <canvas id='record-wave-visualizer' width="250px" height="15px"/>
                    </Box>
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
