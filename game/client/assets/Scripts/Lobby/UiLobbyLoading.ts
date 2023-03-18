import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UiLobbyLoading')
export class UiLobbyLoading extends Component {

    public init() {

        this.node.active = false;
    }

    public show() {
        this.node.active = true;

    }

    public hide() {
        this.node.active = false;

    }
}


