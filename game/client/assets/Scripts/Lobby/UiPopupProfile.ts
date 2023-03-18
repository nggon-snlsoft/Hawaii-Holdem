import { _decorator, Component, Node, Button, Sprite, Label } from 'cc';
import { CommonUtil } from '../CommonUtil';
import { NetworkManager } from '../NetworkManager';
import { LobbyAudioContoller } from './LobbyAudioContoller';
const { ccclass, property } = _decorator;

@ccclass('UiPopupProfile')
export class UiPopupProfile extends Component {
    @property(Sprite) avatar: Sprite = null;
    @property(Button) buttonExit: Button = null;
    @property(Button) buttonChangeAvatar: Button = null;
    
    @property(Label) labeNickname: Label = null;
    @property(Label) labelChips: Label = null;
    @property(Label) labelPoints: Label = null;
    @property(Label) labelRanking: Label = null;
    
    private cbExit: ()=>void = null;
    private cbChangeAvatar: ()=>void = null;    
    
    public init( cbExit: ()=>void, cbChangeAvatar: ()=>void ) {        
        if ( cbExit != null ) {
            this.cbExit = cbExit;
        }

        if ( cbChangeAvatar != null ) {
            this.cbChangeAvatar = cbChangeAvatar;
        }

        this.buttonExit.node.on('click', this.onClickExit.bind(this), this);
        this.buttonChangeAvatar.node.on('click', this.onClickChangeAvatar.bind(this), this);
        this.node.active = false;

        this.labeNickname.string = '';
        this.labelChips.string = '';
        this.labelPoints.string = '';
        this.labelRanking.string = '';
    }

    public show() {
        this.node.active = true;
        this.avatar.node.active = false;

        this.refresh();
    }

    public refresh() {
        let info = NetworkManager.Instance().getUserInfo();

        this.labeNickname.string = info.name;
        this.labelChips.string = CommonUtil.getNumberStringWithComma(info.balance);
        this.labelPoints.string = CommonUtil.getNumberStringWithComma(info.chip);

        let url = info.avatar;
        CommonUtil.setAvatarSprite(url, this.avatar, ()=>{
            this.avatar.node.active = true;
        });
    }

    public hide() {
        this.node.active = false;
    }

    private onClickExit(button: Button) {
        if ( this.cbExit != null ) {
            LobbyAudioContoller.instance.playButtonClick();

            this.cbExit();
        }
    }

    private onClickChangeAvatar( button: Button ) {
        if ( this.cbChangeAvatar != null ) {
            LobbyAudioContoller.instance.playButtonClick();
                        
            this.cbChangeAvatar();
        }
    }
}


