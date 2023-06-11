import { _decorator, Component, Node, Button, Label } from 'cc';
import { AudioController } from './AudioController';
import { NetworkManager } from '../NetworkManager';
const { ccclass, property } = _decorator;

@ccclass('UiControls')
export class UiControls extends Component {
    public static instance: UiControls = null;

    @property(Button) buttonExit: Button = null;
    @property(Button) buttonMessage: Button = null;

    @property(Node) BADGE_MESSAGE:Node = null;
    @property(Label) labelUnread: Label = null;

    private cbExit: ()=>void = null;
    private cbMessage: ()=>void = null;    

    init() {
        UiControls.instance = this;        
        this.buttonExit.node.on('click', this.onClickExit.bind(this));
        this.buttonMessage.node.on('click', this.onClickMessage.bind(this));
        
        this.labelUnread.string = '0';
        this.labelUnread.node.active = true;
        this.BADGE_MESSAGE.active = false;
    }

    show() {
        this.onREFRESH_UNREAD_BADGE();
        this.node.active = true;
    }

    hide() {
        this.node.active = false;
    }

    public SetUnreadCount( count: number ) {
        if ( count != null && count > 0 ) {
            this.labelUnread.string = count.toString();
            this.BADGE_MESSAGE.active = true;
        } else {
            this.BADGE_MESSAGE.active = false;
        }
    }

    public setExitCallback( cbExit: ()=>void ) {
        if ( cbExit != null ) {
            this.cbExit = cbExit;
        }
    }

    public onREFRESH_UNREAD_BADGE() {
        NetworkManager.Instance().reqGET_UNREAD_MESSAGE(( res: any )=>{
            if ( res != null && res.unread_messages != null && res.unread_messages > 0 ) {
                this.SetUnreadCount( res.unread_messages );
            } else {
                this.SetUnreadCount( 0 );
            }
        }, ( err: any )=>{
            this.SetUnreadCount( 0 );
        });
    }

    public SetCallback( cbMessage:()=> void, cbExit: ()=>void ) {
        if ( cbMessage != null ) {
            this.cbMessage = cbMessage;
        }

        if ( cbExit != null ) {
            this.cbExit = cbExit;
        }
    }

    private onClickExit(button: Button) {
        if ( this.cbExit != null ) {
            AudioController.instance.ButtonClick();
            this.cbExit();

        }
    }

    private onClickMessage(button: Button) {
        if ( this.cbMessage != null ) {
            AudioController.instance.ButtonClick();
            this.cbMessage();

        }
    }
}


