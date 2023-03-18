import { _decorator, Component, Node, Button, Label, Sprite } from 'cc';
import { CommonUtil } from '../CommonUtil';
import { NetworkManager } from '../NetworkManager';
const { ccclass, property } = _decorator;

@ccclass('UiProfile')
export class UiProfile extends Component {
    @property(Node) nodePanel: Node = null;

    @property(Button) buttonExit: Button = null;

    @property(Label) labelNickname: Label = null;
    @property(Sprite) spriteAvatar: Sprite = null;
    @property(Label) labelChips: Label = null;
    @property(Label) labelRanking: Label = null;

    private cbExit: ()=>void = null;

    init( cbExit: ()=>void ) {
        if (cbExit != null) {
            this.cbExit = cbExit;
        }

        this.labelNickname.string = '';
        this.labelChips.string = '';
        this.labelRanking.string = '';
        this.spriteAvatar.node.active = false;

        this.buttonExit.node.on('click', this.onClickExit.bind(this));
        this.nodePanel.active = false;
        this.node.active = false;        
    }

    show( entity: any ) {
        this.node.active = true;
    }

    open(id: number) {
        this.node.active = true;
        this.nodePanel.active = false;

        NetworkManager.Instance().getPlayerProfile( id, (res)=>{

            this.labelNickname.string = res.profile.name;
            this.labelChips.string = CommonUtil.getNumberStringWithComma(res.profile.chip);

            let s = res.profile.avatar;

            CommonUtil.setAvatarSprite(s, this.spriteAvatar, ()=>{
                this.spriteAvatar.node.active = true;
                this.nodePanel.active = true;                
            });

        }, (err)=>{
            this.node.active = true;
        });
    }

    hide() {
        this.node.active = false;
    }

    private onClickExit( button: Button ) {
        if ( this.cbExit != null ) {
            this.cbExit();
        }

        this.node.active = false;
    }
}


