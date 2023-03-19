import { _decorator, Component, Node } from 'cc';
import { Login } from './Login/Login';
import { NetworkManager } from './NetworkManager';
import { NetworkResponse } from './NetworkResponse';
const { ccclass, property } = _decorator;

@ccclass('Main')
export class Main extends Component {
    @property(Login) login: Login = null;
    @property(NetworkResponse) loadingIndicator: NetworkResponse = null;

    start() {
        let url = 'http://127.0.0.1';
        let port = '2600';
        let fullUrl = url + ':' + port + '/'

        NetworkManager.Instance().init(fullUrl, this.onExpiredSession.bind(this));
        NetworkManager.Instance().setLoadingIndicator( this.loadingIndicator );

        this.login.init();
        this.login.show();
    }

    private onExpiredSession() {

    }
}


