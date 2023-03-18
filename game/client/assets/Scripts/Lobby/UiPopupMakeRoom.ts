import { _decorator, Component, Node, Button } from 'cc';
import { NetworkManager } from '../NetworkManager';
const { ccclass, property } = _decorator;

@ccclass('UiPopupMakeRoom')
export class UiPopupMakeRoom extends Component {
    @property (Button) buttonMakeRoom: Button = null;
    @property (Button) buttonExitPopup: Button = null;

    private closeCallback: ()=> void = null;
    private joinCallback: (id: number)=> void = null; 

    private isOpen = false;

    public init() {
        this.node.active = false;
        this.isOpen = false;

        this.buttonMakeRoom.node.on("click", this.onClickMakeInstanceRoom.bind(this), this);
        this.buttonExitPopup.node.on("click", this.onClickExitPopup.bind(this), this);
    }
    
    public show() {
        if ( this.isOpen == true ) {
            return;
        }

        // this.closeCallback = closeCallback;
        // this.joinCallback = joinCallback;

        this.isOpen = true;        
        this.node.active = true;
    }

    public hide() {
        this.node.active = false;
    }

    public isPopupOpen(): boolean {
        return this.isOpen;
    }

    private onClickMakeInstanceRoom() { 
        NetworkManager.Instance().reqMakeInstanceRoom({
			name: "",
			betTimeLimit: 20,
			smallBlind: 300,
			bigBlind: 600,
			minStakePrice: 35000,
			maxStakePrice: 70000,
        }, (res)=>{
            this.node.active = false;
            this.isOpen = false;

            this.joinCallback(res.id);

        }, (msg)=>{

        });
    }

    private onClickExitPopup() {
        this.node.active = false;
        this.isOpen = false;

        this.closeCallback();
    }
}


