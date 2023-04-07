import { _decorator, Component, Node, Sprite, Label, profiler, Button, resources, SpriteFrame } from 'cc';
import { CommonUtil } from '../CommonUtil';
import { NetworkManager } from '../NetworkManager';
import { LobbyAudioContoller } from './LobbyAudioContoller';
import { ResourceManager } from '../ResourceManager';
const { ccclass, property } = _decorator;

@ccclass('UiPlayer')
export class UiPlayer extends Component {
    @property(Sprite) spriteAvatar: Sprite = null;
    @property(Label) labelNickname: Label = null;
    @property(Label) labelChips: Label = null;
    @property(Label) labelPoints: Label = null;
    @property(Button) buttonAvatar: Button = null;

    private avatarType: number = -1;
    private nickname: string = "";
    private chips: number = -1; 
    private points: number = -1;

    private cbClickAvatar: ()=>void = null;

    public init( cbClickAvatar: ()=>void = null ) {
        this.cbClickAvatar = cbClickAvatar;

        this.avatarType = -1;
        this.nickname = "";
        this.chips = -1;
        this.points = -1;

        this.labelNickname.string = this.nickname;
        this.labelChips.string = this.chips.toString();
        this.labelPoints.string = this.points.toString();

        this.buttonAvatar.node.on("click", this.onClickAvatar.bind(this), this);
        this.spriteAvatar.node.active = false;

        this.node.active = false;
    }

    private onClickAvatar(button: Button) {
        LobbyAudioContoller.instance.playButtonClick();

        this.cbClickAvatar();
    }

    public show () {
        this.refresh();        
        this.node.active = true;
    }

    public refresh() {
        let user = NetworkManager.Instance().getUserInfo();
        if (user != null)
        {
            this.labelNickname.string = user.nickname;
            this.labelChips.string = CommonUtil.getKoreanNumber(user.balance + user.chip);
            this.labelPoints.string = (0).toString();

            let s = Number( user.avatar );
            let sf: SpriteFrame = ResourceManager.Instance().getAvatarImage( s );
            this.spriteAvatar.spriteFrame = sf;

            this.spriteAvatar.node.active = true;


            // CommonUtil.setAvatarSprite(s, this.spriteAvatar, ()=>{
            //     this.spriteAvatar.node.active = true;
            // });
        }
        this.node.active = true;
    }
}


