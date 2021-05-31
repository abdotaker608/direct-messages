import React, {useState, useEffect, useRef, useContext} from 'react'
import {FaPhone, FaVideo, FaTimes} from 'react-icons/fa';
import {IconButton} from "@chakra-ui/react";
import Ringtone from 'static/audio/call_ringtone.mp3';
import {UUIDContext} from 'providers/UUIDProvider';
import Call from './Call';
import {CSSTransition} from 'react-transition-group';
import 'adapterjs';

function RTC({closeChatWindow, msgEvent, onSend, isCall, chat, changeActiveChat, receiver}) {

    //current peer connection
    const peerConnection = useRef(null);

    //remote stream
    const remoteStream = useRef(new MediaStream());

    //local stream
    const localStream = useRef(null);

    //username of the current user
    const {username, UUID: uuid} = useContext(UUIDContext);

    //creating a peer connection
    const createPeerConnection = () => {
        peerConnection.current = new RTCPeerConnection({
            iceServers: [
                {
                    urls: 'turn:numb.viagenie.ca',
                    username: 'muazkh',
                    credential: 'webrtc@live.com'
                },
                {
                    urls: 'stun:stun.l.google.com:19302'
                }
            ]
        })
        
        //Track event
        peerConnection.current.ontrack = (e) => {
            remoteStream.current.addTrack(e.track, remoteStream.current);
        }

        //Tickling ice
        peerConnection.current.onicecandidate = (e) => {
            onSend({sender: {uuid}, 'candidate': e.candidate}, 'rtc');
        }
        
        //Disconnecting ice notifications
        peerConnection.current.oniceconnectionstatechange = (e) => {
            if (e.target.iceConnectionState === 'disconnected') endCall();
        }

        //Connection established
        peerConnection.current.onconnectionstatechange = () => {
            if (peerConnection.current.connectionState === 'connected') {
                setCall(call => ({...call, status: 'connected'}));
            }
        }
    }

    //creating a local stream
    const createLocalStream = async (callType) => {
        //Fetch the user media
        const constraints = {
            audio: {
                autoGainControl: false,
                noiseSuppression: false,
                echoCancellation: false,
                channelCount: {exact: 2},
                latency: 0,
                sampleRate: 48000,
                sampleSize: 16,
                volume: 1.0
            },
            video: callType === 'video'
        }
        localStream.current = await navigator.mediaDevices.getUserMedia(constraints);
    }

    //function to add local tracks
    const addMyStream = () => {
        localStream.current.getTracks().forEach(track => peerConnection.current.addTrack(track, localStream.current));
    }

    //function to mute tracks
    const toggleMuteTrack = (kind) => {
        const foundTrack = localStream.current.getTracks().find(track => track.kind === kind);
        foundTrack.enabled = !foundTrack.enabled;
    }

    //await time to answer call
    const MAX_AWAIT_TIME = 15;

    //call status
    const [call, setCall] = useState(null);

    //ringtone
    const callRingtone = useRef(new Audio(Ringtone));

    //call timeout
    const callTimeout = useRef(null);

    //creating rtc offer and sending it
    const createRTCOffer = async (callType) => {
        createPeerConnection();
        await createLocalStream(callType);
        addMyStream();
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        onSend({sender: {uuid, username}, offer, callType, receiver: receiver.uuid}, 'rtc');
        //Activating ringtone after sending the call offer and update the call status
        callRingtone.current.play();
        setCall({status: 'connecting', type: callType, peer: username, caller: true})
        //He will not be requesting that forever
        callTimeout.current = setTimeout(() => {
            setCall(null);
            callRingtone.current.pause();
            callRingtone.current.currentTime = 0;
            //Remove the user media devices
            localStream.current.getTracks().forEach(track => track.stop());
        }, MAX_AWAIT_TIME * 1000)
    }

    //creating rtc answer and responding with it
    const answerOffer = async () => {
        //Now we need to clear the timeout that is gonna close the call
        clearTimeout(callTimeout.current);
        setCall({...call, status: 'rtc-connecting'});
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(call.sdpOffer));
        const answer = await peerConnection.current.createAnswer();
        answer.sdp = answer.sdp.replace('useinbandfec=1', 'useinbandfec=1; stereo=1; maxaveragebitrate=510000');
        await peerConnection.current.setLocalDescription(answer);
        onSend({sender: {uuid, username}, answer, receiver: receiver.uuid}, 'rtc');
    }

    //accepting answers
    const acceptAnswer = async (answer) => {
        clearTimeout(callTimeout.current);
        setCall({...call, status: 'rtc-connecting'});
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
    }

    //terminate the call
    const terminateCall = () => {
        setCall(null);
    }

    //end the call
    const endCall = (notified) => {
        //Clear call timeout here too
        clearTimeout(callTimeout.current);
        //Indicate that the call is ended
        setCall({...call, status: 'ended'});
        //stop the ringtone in case user is still ringing
        callRingtone.current.pause();
        callRingtone.current.currentTime = 0;
        peerConnection.current?.close();
        peerConnection.current = null;
        // notify the other user if not notified
        //Typicall we call with notified = true from the side ending the call
        if (!notified) {
            onSend({sender: {uuid}, end: true, receiver: receiver?.uuid, chat: chat?.id}, 'rtc');
        }
        //Remove the user media devices
        localStream.current?.getTracks().forEach(track => track.stop());
        localStream.current = null;
        //Empty remote stream to add further tracks on future calls
        remoteStream.current.getTracks().forEach(track => remoteStream.current.removeTrack(track));
    }

    //listening to message events
    useEffect(() => {
        //We only need to listen to the other peer
        if (msgEvent?.payload.sender && msgEvent.payload.sender.uuid !== uuid) {
            if (msgEvent.payload.receiver === uuid) {
                if (msgEvent.payload.offer) {
                    //Ignore if on another call
                    if (call && ['connecting', 'connected'].includes(call.status)) return;
                    changeActiveChat(+msgEvent.payload.chatId);
                    createPeerConnection();
                    createLocalStream(msgEvent.payload.callType).then(addMyStream);
                    setCall({status: 'connecting', type: msgEvent.payload.callType, peer: msgEvent.payload.sender.username, sdpOffer: msgEvent.payload.offer});
                    callRingtone.current.play();
                    callTimeout.current = setTimeout(() => {
                        setCall(null);
                        callRingtone.current.pause();
                        callRingtone.current.currentTime = 0;
                    }, MAX_AWAIT_TIME * 1000)
                }
                if (msgEvent.payload.answer) acceptAnswer(msgEvent.payload.answer);
                if (msgEvent.payload.end && +msgEvent.payload.chatId === chat?.id) endCall(true);
            }
            if (msgEvent.payload.candidate) peerConnection.current?.addIceCandidate(new RTCIceCandidate(msgEvent.payload.candidate));
        }
    }, [msgEvent])

    useEffect(() => {
        isCall(call);
        if (!call) {
            peerConnection.current?.close();
            peerConnection.current = null;
        }
        if (call?.status === 'connected') {
            callRingtone.current.pause();
            callRingtone.current.currentTime = 0;
        }
    }, [call])

    //rtc functioning icons
    const icons = [
        {Icon: FaPhone, onClick: () => createRTCOffer('audio')},
        {Icon: FaVideo, onClick: () => createRTCOffer('video')},
        {Icon: FaTimes, onClick: closeChatWindow}
    ]
    
    return (
        <div className='d-flex align-items-center justify-content-around' style={{maxWidth: '150px'}}>
            {
                icons.map(({Icon, onClick}, index) => (
                    <IconButton key={index} onClick={onClick} variant="ghost" rounded="full" colorScheme="messenger" size="sm">
                        <Icon size={18}/>
                    </IconButton>
                ))
            }
            <CSSTransition in={call !== null} timeout={300} classNames='fade' unmountOnExit>
                <Call call={call} requestCall={createRTCOffer} endCall={endCall} terminateCall={terminateCall} answerCall={answerOffer} remoteStream={remoteStream.current} toggleMute={toggleMuteTrack} receiver={receiver}/>
            </CSSTransition>
        </div>
    )
}

export default RTC
