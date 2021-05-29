import React from 'react'
import {FaPhone, FaVideo, FaTimes} from 'react-icons/fa';
import {IconButton} from "@chakra-ui/react";

function RTC({closeChatWindow}) {

    //rtc functioning icons
    const icons = [
        {Icon: FaPhone, onClick: null},
        {Icon: FaVideo, onClick: null},
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
        </div>
    )
}

export default RTC
