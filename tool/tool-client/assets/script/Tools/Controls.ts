import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Controls')
export class Controls extends Component {
    @property(Node) rootTop: Node = null;
    @property(Node) rootSide: Node = null;

    public init() {
        this.rootSide.active = false;
        this.rootTop.active = true;

        this.node.active = false;
    }

    public show() {
        this.node.active = true;
    }

    public hide() {
        this.node.active = false;
    }
}
