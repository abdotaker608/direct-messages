import React, {useState, useEffect} from 'react';
import {hypeDynos as hype} from 'api/queries';
import {Box, CircularProgress, Text} from '@chakra-ui/react';

function Preloader({children}) {

    //loading status
    const [loading, setLoading] = useState(true);

    //function to hype dynos
    const hypeDynos = async () => {
        await hype();
        setLoading(false);
    }

    useEffect(() => {
        hypeDynos();
    }, [])

    return (
        <>
            {
                loading ?
                <Box d="flex" justifyContent='center' alignItems="center" height="100vh" width="100%" position="fixed" top={0} left={0} background="rgb(247, 244, 244)">
                    <Box d="flex" alignItems="center" flexDir="column">
                        <CircularProgress size={12} isIndeterminate/>
                        <Text color="gray" padding="20px 10px">Initializing the project...</Text>
                    </Box>
                </Box>
                :
                children
            }
        </>
    )
}

export default Preloader
