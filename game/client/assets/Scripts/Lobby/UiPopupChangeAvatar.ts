import { _decorator, Component, Node, Button, Toggle, instantiate, Label, Sprite, ToggleContainer, UITransform } from 'cc';
import { CommonUtil } from '../CommonUtil';
import { NetworkManager } from '../NetworkManager';
import { LobbyAudioContoller } from './LobbyAudioContoller';
import { TableListUiElement } from './UiTableList';
const { ccclass, property } = _decorator;

@ccclass('PlayerAvatarElement')
export class PlayerAvatarElement {
    @property(Node) nodeRoot: Node = null;
    @property(Toggle) toggle: Toggle = null;

    private id: number = -1;
    private cb: (num: number, toggle: Toggle)=>void = null;

    public copy(): PlayerAvatarElement {
        let copyObj: PlayerAvatarElement = new PlayerAvatarElement();
        let newObj: Node = instantiate( this.nodeRoot );

        copyObj.nodeRoot = newObj;
        copyObj.toggle = newObj.getComponent(Toggle);

        return copyObj;
    }

    public clear() {
        this.id = -1;
    }

    public setParent(parent: Node) {
        this.nodeRoot.parent = parent;
    }

    public setAvatar(currentId: number, id: number, cb:(num: number)=>void ) {
        this.id = id;

        if (cb != null) {
            this.cb = cb;
        }

        let s = this.nodeRoot.getComponent(Sprite);
        if ( s != null) {
            CommonUtil.setAvatarSprite( id, s, ()=>{
                this.nodeRoot.active = true;
                let t = this.nodeRoot.getComponent(UITransform);
            });
        }

        if ( currentId == id) {
            this.toggle.isChecked = true;
        } else {
            this.toggle.isChecked = false;
        }

        this.toggle.node.on('toggle', this.onToggle.bind(this));
    }

    private onToggle(toggle: Toggle ) {
        if ( this.cb != null ) {
            if ( toggle.isChecked == true ) {
                LobbyAudioContoller.instance.playButtonClick();

                this.cb( this.id, toggle );
            }
        }
    }
}

@ccclass('UiPopupChangeAvatar')
export class UiPopupChangeAvatar extends Component {
    @property(Button) buttonExit: Button = null;
    @property(Button) buttonApply: Button = null;
    @property(PlayerAvatarElement) origin: PlayerAvatarElement = new PlayerAvatarElement();
    @property(Node) contents: Node = null;

    private userInfo: any = null;
    private gameSetting: any = null;
    private selectId: number = -1;
    private currentId: number = -1;

    private cbExit: ()=>void = null;
    private cbApply: (num: number)=>void = null;    

    public init( cbExit: ()=>void, cbApply: (num: number)=>void ) {        
        if ( cbExit != null ) {
            this.cbExit = cbExit;
        }

        if ( cbApply != null ) {
            this.cbApply = cbApply;
        }

        this.buttonExit.node.on("click", this.onClickExit.bind(this));
        this.buttonApply.node.on('click', this.onClickApply.bind(this))
        this.node.active = false;
    }


    public show() {
        this.userInfo = NetworkManager.Instance().getUserInfo();
        this.gameSetting = CommonUtil.getGameSetting();

        this.currentId = this.userInfo.avatar;        
        this.showAvatars( this.gameSetting.avatars ) ;
        this.selectId = this.currentId;

        this.node.active = true;
    }

    private showAvatars( count ) {
        if (count <= 0) {
            return;
        }

        let container:ToggleContainer = this.contents.getComponent(ToggleContainer);
        container.allowSwitchOff = true;        

        for ( let i = 0 ; i < count ; i++) {
            let e = this.origin.copy();
            e.setAvatar( this.currentId, i, this.onClickToggle.bind(this) );
            e.setParent( this.contents );
        }

        container.allowSwitchOff = false;
    }

    public hide() {

        this.contents.removeAllChildren();
        this.node.active = false;
    }

    private onClickToggle(num: number, toggle: Toggle) {
        this.selectId = num;
    }

    public onClickExit(button: Button) {
        if ( this.cbExit != null ) {
            LobbyAudioContoller.instance.playButtonClick();

            this.cbExit();
        }
    }

    public onClickApply( button: Button) {
        if ( this.currentId != this.selectId ) {
            if ( this.cbApply != null ) {
                LobbyAudioContoller.instance.playButtonClick();

                this.cbApply ( this.selectId );
            }
        }
        else {
            if ( this.cbExit != null ) {
                LobbyAudioContoller.instance.playButtonClick();
                                
                this.cbExit();
            }
        }
    }
}


