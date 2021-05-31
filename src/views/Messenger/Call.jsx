import React, {useEffect, useRef, useState} from 'react';
import {Avatar, Box, Text, Button} from "@chakra-ui/react";
import {FaMicrophoneSlash, FaVideoSlash, FaPhoneSlash, FaPhone, FaTimes, FaMicrophone, FaVideo} from 'react-icons/fa';

function Call({answerCall, terminateCall, call, requestCall, endCall, remoteStream, toggleMute, receiver}) {

    //call ringing buttons
    const buttons = [
        {Icon: FaPhoneSlash, background: 'red', onClick: () => endCall(), condition: true},
        {Icon: FaPhone, background: 'whatsapp', onClick: () => answerCall(), condition: !call?.caller}
    ]

    //ended call buttons
    const postButtons = [
        {Icon: FaTimes, background: 'blackAlpha', onClick: terminateCall},
        {Icon: FaVideo, background: 'whatsapp', onClick: () => requestCall('video')},
        {Icon: FaPhone, background: 'whatsapp', onClick: () => requestCall('audio')}
    ]

    //mute configurations
    const [mute, setMute] = useState({audio: false, video: false});

    //function to toggle mic mute
    const toggleAudioMute = () => {
        toggleMute('audio');
        setMute({...mute, audio: !mute.audio});
    }

    //function to toggle camera
    const toggleVideoMute = () => {
        toggleMute('video');
        setMute({...mute, video: !mute.video});
    }

    useEffect(() => {
        //resetting mute status
        if (call?.status !== 'connected') setMute({audio: false, video: false});
    }, [call])

    //connected buttons
    const connectedButtons = [
        {Icon: mute.audio ? FaMicrophoneSlash : FaMicrophone, background: 'blackAlpha', onClick: toggleAudioMute, condition: true},
        {Icon: mute.video ? FaVideoSlash : FaVideo, background: 'blackAlpha', onClick: toggleVideoMute, condition: call?.type === 'video'},
        {Icon: FaPhoneSlash, background: 'red', onClick: () => endCall(), condition: true}
    ]

    //function to get caller text
    const getCallerText = () => {
        if (!call) return;
        if(call.status === 'connected') return receiver?.username;
        if (call.status === 'rtc-connecting') return 'Connecting..';
        if (call.caller) return `Calling ${receiver?.username}`;
        else return `${call.peer} is ${call.type === 'video' ? 'video' : ''} calling you..`;
    }

    //reference for media container that will be streaming
    const mediaRef = useRef(null);
    
    //setting the stream on the video
    useEffect(() => {
        if (call?.status === 'connected') mediaRef.current.srcObject = remoteStream;
    }, [call])

    return (
        <Box className='call-window' background={call?.status === 'connected' ? 'rgb(43, 42, 42)' : 'gray'}>
            <Box visibility={call?.type === 'audio' || call?.status !== 'connected' ? 'visible' : 'hidden'} d="flex" flexDir="column" alignItems="center">
                <Avatar width="120px" height="120px"/>
                <Text fontSize={18} fontWeight={600} color="white" padding="15px">
                    {
                        call?.status === 'ended' ?
                        'Call ended' :
                        getCallerText()
                    }
                </Text>
            </Box>
            {
                call?.status === 'connecting' &&
                <Box d="flex" justifyContent="center" alignItems="center" marginTop="100px">
                    {
                        buttons.map(({Icon, background, onClick, condition}, index) => (
                            condition &&
                            <Button color="white" rounded="full" colorScheme={background} marginInline="25px" width="50px" height="50px" onClick={onClick} key={index}>
                                <Icon size={20}/>
                            </Button>
                        ))
                    }
                </Box>
            }
            {
                call?.status === 'ended' &&
                <Box d="flex" justifyContent="center" alignItems="center" marginTop="100px">
                    {
                        postButtons.map(({Icon, background, onClick}, index) => (
                            <Button color="white" rounded="full" colorScheme={background} marginInline="25px" width="50px" height="50px" onClick={onClick} key={index}>
                                <Icon size={20}/>
                            </Button>
                        ))
                    }
                </Box>
            }
            {
                call?.status === 'connected' &&
                <Box d="flex" justifyContent="center" alignItems="center" marginTop="200px">
                    {
                        connectedButtons.map(({Icon, background, onClick, condition}, index) => (
                            condition &&
                            <Button color="white" rounded="full" colorScheme={background} marginInline="25px" width="50px" height="50px" onClick={onClick} key={index}>
                                <Icon size={20}/>
                            </Button>
                        ))
                    }
                </Box>
            }
            {
                call?.status === 'connected' &&
                <Box as="video" src={remoteStream} autoPlay position="fixed" top={0} left={0} minHeight="100%" minWidth="100%" objectFit="cover" zIndex={-1} ref={target => mediaRef.current = target} transform="rotateY(-180deg)"/>
            }
        </Box>
    )
}

export default Call
