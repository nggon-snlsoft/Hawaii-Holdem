import { _decorator, Component, Node, Button } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UiControls')
export class UiControls extends Component {
    public static instance: UiControls = null;

    @property(Button) buttonExit: Button = null;

    private cbExit: ()=>void = null;

    init() {
        UiControls.instance = this;        
        this.buttonExit.node.on('click', this.onClickExit.bind(this));
    }

    show() {
        this.node.active = true;
    }

    hide() {
        this.node.active = false;
    }

    public setExitCallback( cbExit: ()=>void ) {
        if ( cbExit != null ) {
            this.cbExit = cbExit;
        }
    }

    private onClickExit(button: Button) {
        if ( this.cbExit != null ) {
            this.cbExit();

        }
    }
}


