import Home from 'views/Home/Home';
import Messenger from 'views/Messenger/Messenger';

//Routes Literal Paths
export const HomeRoute = '/';
export const MessengerRoute = '/messenger';

//Routes Objects
const Routes = [
    {path: HomeRoute, Component: Home},
    {path: MessengerRoute, Component: Messenger}
]

export default Routes;