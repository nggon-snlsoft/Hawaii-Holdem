import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('NetworkResponse')
export class NetworkResponse extends Component {
    @property(Node) root: Node = null;

    private count: number = 0;

    init() {
        this.root.active = false;
    }

    public allocate() {
        this.count ++;
        if ( this.root.active == true ) {
            return;
        }

        this.root.active = true;
    }

    public deallocate() {
        this.count --;
        if ( this.count < 0 ) {
            this.count = 0;
        }

        if ( this.count != 0 ) {
            return;
        }

        this.root.active = false;
    }

}


