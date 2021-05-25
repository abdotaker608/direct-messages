import React, {useState, useContext} from 'react';
import {Form, Button} from 'react-bootstrap';
import {UUIDContext} from 'providers/UUIDProvider';

function Home() {

    //the name the user will be using
    const [name, setName] = useState('');

    //function for connecting to main socket
    const {connectToMainSocket} = useContext(UUIDContext);

    //blurred status for input
    const [blurred, setBlurred] = useState(false);

    //function to handle submission
    const handleSubmit = (e) => {
        e.preventDefault();
        //User must enter a name
        if (!name) return;
        //Connect to the main socket
        connectToMainSocket();
    }

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
                        <Button variant="primary">Join</Button>
                    </Form.Group>
                </Form>
            </header>
        </div>
    )
}

export default Home
