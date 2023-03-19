import { _decorator, Component, Node } from 'cc';
import { NetworkManager } from '../NetworkManager';
import { NetworkResponse } from '../NetworkResponse';
import { Controls } from './Controls';
const { ccclass, property } = _decorator;

@ccclass('ToolMain')
export class ToolMain extends Component {
    @property(NetworkResponse) loadingIndicator: NetworkResponse = null;
    @property(Controls) uiControls: Controls = null;    

    start() {
        NetworkManager.Instance().setLoadingIndicator( this.loadingIndicator );
        this.uiControls.init();
    }
}


