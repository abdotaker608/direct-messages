import {Route, Switch, withRouter} from 'react-router-dom';
import {TransitionGroup, CSSTransition} from 'react-transition-group';
import Routes from './routes';

function Router({location}) {
    return (
        <TransitionGroup>
            <CSSTransition key={location.key} classNames='fade' timeout={300}>
                <Switch location={location}>
                    {
                        Routes.map(({path, Component}) => (
                            <Route path={path} exact key={path}>
                                <Component />
                            </Route>
                        ))
                    }
                </Switch>
            </CSSTransition>
        </TransitionGroup>
    )
}

export default withRouter(Router)
