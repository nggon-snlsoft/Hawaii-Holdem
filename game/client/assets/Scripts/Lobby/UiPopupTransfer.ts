import { _decorator, Component, Node, Button } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UiPopupTransfer')
export class UiPopupTransfer extends Component {
    @property(Button) buttonExit: Button = null;

    private cbExit: ()=>void = null;    

    public init( cbExit: ()=>void ) {        
        if ( cbExit != null ) {
            this.cbExit = cbExit;
        }

        this.buttonExit.node.on("click", this.onClickExit.bind(this), this);
        this.node.active = false;
    }

    public show() {
        this.node.active = true;

    }

    public hide() {
        this.node.active = false;
    }

    public onClickExit(button: Button) {
        if ( this.cbExit != null ) {
            this.cbExit();
        }
    }
}


