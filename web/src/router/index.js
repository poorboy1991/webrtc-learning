import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
// import { Provider } from 'mobx-react'
import Home from '@/views/pages/home/index'
import Entry from '@/views/pages/entry/index'
import P2pByMqtt from '@/views/pages/p2p-by-mqtt/index'
import RoomBySfu from '@/views/pages/room-by-sfu/index'
import OneToOneLocal from '@/views/pages/one-to-one-local/index'
import AlgoApp from '@/views/pages/simulated-algo/app'
import AlgoDevice from '@/views/pages/simulated-algo/device'


// import * as Store from '@/store'

export default class router extends Component {
    render() {
        return (
            // <Provider {...Store} >
                <Router>
                    <Switch>
                        <Route path="/" exact component={props => <Home {...props}></Home>} />
                        <Route path="/one-to-one-local" exact component={props => <OneToOneLocal {...props}></OneToOneLocal>} />
                        <Route path="/simulated-algo-app/app" exact component={props => <AlgoApp {...props}></AlgoApp>} />
                        <Route path="/simulated-algo-app/device" exact component={props => <AlgoDevice {...props}></AlgoDevice>} />
                        <Route path="/entry/:roomid" component={props => <Entry {...props}></Entry>} />
                        <Route path="/p2p-mqtt" exact component={props => <P2pByMqtt {...props}></P2pByMqtt>} />
                        <Route path="/room-by-sfu/:roomid/:userid" exact component={props => <RoomBySfu {...props}></RoomBySfu>} />
                        <Redirect from="/*" to="/" />
                    </Switch>
                </Router>
            // </Provider>
        )
    }
}
