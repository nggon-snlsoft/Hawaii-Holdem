import { _decorator, Component, Node, Button, Sprite, Label, SpriteFrame, resources } from 'cc';
import { Board } from './Board';
import { CommonUtil } from './CommonUtil';
const { ccclass, property } = _decorator;

@ccclass('UiSeat')
export class UiSeat extends Component {
    @property(Node) public entity: Node = null;
    @property(Button) public buttonTakeSeat: Button = null;
    @property(Sprite) public spriteReserve: Sprite = null;

    private buttonAvatar: Button = null;
    private isChildRegistered: boolean = false;
    private labelNickname: Label = null;
    private labelChips: Label = null;
    private spriteSelected: Sprite = null;
    private posSymbols: {} = {};
    private spriteAvatar: Sprite = null;
    private info: any = null;
    private isSet: boolean = false;
    private id: number = -1;

    onLoad() {
        this.childRegistered();
    }

    childRegistered() {
        if (true == this.isChildRegistered) {
            return;
        }

        this.isChildRegistered = true;
        this.labelNickname = this.entity.getChildByPath('BG/LABEL_NAME').getComponent(Label);
        this.labelNickname.string = 'EMPTY'

        this.labelChips = this.entity.getChildByPath('BG/LABEL_CHIPS').getComponent(Label);
        this.labelChips.node.active = true;

        this.spriteAvatar = this.entity.getChildByPath('AVATAR/SPRITE/AVATAR').getComponent(Sprite);
        this.spriteAvatar.node.active = false;

        this.posSymbols['dealer'] = this.entity.getChildByPath('SPRITE_DEALER').getComponent(Sprite);
        this.posSymbols['dealer'].node.active = false;

        this.posSymbols['sb'] = this.entity.getChildByPath('SPRITE_SMALL_BLIND').getComponent(Sprite);
        this.posSymbols['sb'].node.active = false;

        this.posSymbols['bb'] = this.entity.getChildByPath('SPRITE_BIG_BLIND').getComponent(Sprite);
        this.posSymbols['bb'].node.active = false;

        this.buttonAvatar = this.entity.getChildByPath('AVATAR/SPRITE/AVATAR').getComponent(Button);
        this.buttonAvatar.node.on('click', this.onClickAvatar.bind(this));

        this.isSet = false;
    }

    setUi( entity ) {        
        this.childRegistered();

        if (null == entity) {
            this.setEscapee();
        }

        this.id = entity.id;

        this.info = entity;

        this.clearUiPosSymbol();
        this.setNickname( entity.nickname );
        if (entity.wait == true) {
            if (entity.isSitOut == true) {
                this.setStatus('자리비움');
            } else {
                this.setStatus('대기중');
            }
        } else {
            this.setUiChips(entity.chips);
        }

        let s = Number(entity.avatar);
        CommonUtil.setAvatarSprite(s, this.spriteAvatar, ()=>{
            this.spriteAvatar.node.active = true;
        });

        this.isSet = true;
    }

    setEscapee() {
        this.labelNickname.string = 'EMPTY'
        this.labelChips.node.active = false;

        this.posSymbols['dealer'].node.active = false;
        this.posSymbols['sb'].node.active = false;
        this.posSymbols['bb'].node.active = false;
    }

    setNickname(name: string) {
        this.labelNickname.string = name;
    }

    setUiChips( chips: number) {
        this.labelChips.string = CommonUtil.getKoreanNumber(chips);
        this.labelChips.node.active = true;
    }

    setStatus(status: string) {
        this.labelChips.string = status;
        this.labelChips.node.active = true;
    }

    setUiPosSymbol( symbolName: string)
    {
        let keys = Object.keys( this.posSymbols );
        keys.forEach((element)=>{
            let v: Sprite = this.posSymbols[element];
            if ( element == symbolName) {
                v.node.active = true;
            }
        });
    }

    setAvatarImg( avatar: SpriteFrame ) {
        this.spriteAvatar.spriteFrame = avatar;
        this.spriteAvatar.node.active = null != avatar;
    }

    clearAvatarImg() {
        this.spriteAvatar.spriteFrame = null;
        this.spriteAvatar.node.active = false;
    }

    getTakeButton (): Button {
        return this.buttonTakeSeat;
    }

    setShowEntity( show: boolean ) {
        this.entity.active = show;
    }

    setShowReserve(show: boolean) {
        this.spriteReserve.node.active = show;
    }

    getEntity(): Node {
        return this.entity;
    }

    clearUiPosSymbol() {
        let keys = Object.keys(this.posSymbols);
        keys.forEach(element => {
            let v: Sprite = this.posSymbols[element];
            v.node.active = false;
        });
    }

    private onClickAvatar(button:Button) {
        if ( this.isSet == false ) {
            return;
        }

        Board.table.openUserProfile( this.id );
    }
}


