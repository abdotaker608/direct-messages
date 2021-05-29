import React, {useState, useContext, useEffect} from 'react';
import {Form, Button} from 'react-bootstrap';
import {UUIDContext} from 'providers/UUIDProvider';
import {useHistory} from 'react-router-dom';
import {MessengerRoute} from 'router/routes';

function Home() {

    //the name the user will be using
    const [name, setName] = useState('');

    //function for connecting to main socket
    const {connectToMainSocket, connected} = useContext(UUIDContext);

    //websocket connecting status
    const [connecting, setConnecting] = useState(false);

    //blurred status for input
    const [blurred, setBlurred] = useState(false);

    //function to handle submission
    const handleSubmit = (e) => {
        e.preventDefault();
        //User must enter a name
        if (!name) return;
        //Connect to the main socket
        setConnecting(true);
        connectToMainSocket(name);
    }

    //history object

    const history = useHistory();
    useEffect(() => {
        //If the user is already connected redirect to messenger
        if (connected) history.push(MessengerRoute);
    }, [connected])


    return (
        <div>
            <header className='home-header'>
                <h1>Welcome To Direct Messages</h1>
                <h3>Your Place To Make New Friends</h3>
                <Form onSubmit={handleSubmit}>
                    <Form.Group>
                        <Form.Control onBlur={() => setBlurred(true)} onChange={(e) => setName(e.target.value)} isInvalid={blurred && !name} placeholder="Enter your name.." />
                    </Form.Group>
                    <Form.Group>
                        <Button type="submit" variant="primary" disabled={connecting}>Join</Button>
                    </Form.Group>
                </Form>
            </header>
        </div>
    )
}

export default Home
