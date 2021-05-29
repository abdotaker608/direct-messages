import {Route, Switch, withRouter} from 'react-router-dom';
import {TransitionGroup, CSSTransition} from 'react-transition-group';
import Routes from './routes';

function Router({location}) {
    return (
        <TransitionGroup className='scale-container'>
            <CSSTransition key={location.key} classNames='scale' timeout={300}>
                <Switch location={location}>
                    {
                        Routes.map(({path, Component}) => (
                            <Route path={path} exact key={path}>
                                <div className='scale'>
                                    <Component />
                                </div>
                            </Route>
                        ))
                    }
                </Switch>
            </CSSTransition>
        </TransitionGroup>
    )
}

export default withRouter(Router)
