import { _decorator, Component, Node, Label, Color, native, Sprite, Vec3, Animation, animation, tween, Quat, Tween, bezier, SpriteFrame } from 'cc';
import { CommonUtil } from '../CommonUtil';
const { ccclass, property } = _decorator;

const TIMER_BEGIN_COLOR: Color = Color.YELLOW;
const TIMER_END_COLOR: Color = Color.RED;

export enum ENUM_STATUS_TYPE {
    NONE,
    FOLD,
    WAITING,
    SITOUT,
}

@ccclass('UiEntityAvatar')
export class UiEntityAvatar extends Component {
    @property(SpriteFrame) spriteFrameStatus: SpriteFrame[] = [];

    private entity: any = null;

    private rootSelected: Node = null;
    private rootNameTag: Node = null;
    private rootActions: Node = null;
    // private rootFoldCover: Node = null;
    private rootStatus: Node = null;

    private spriteAvatarProfile: Sprite = null;
    private spriteTimer: Sprite = null;
    private spriteDimmed: Sprite = null;
    private spriteStatus: Sprite = null;

    private labelNickname: Label = null;
    private labelChips: Label = null;
    // private labelSitout: Label = null;
    private labelWaitingTimer: Label = null;

    private actions: {} = {};
    private isChildRegisted: boolean = false;
    private isFold: boolean = false;
    private isMe: boolean = false;

    init() {
        this.childRegistered();
        this.isFold = false;
        this.node.active = false;
    }

    setAvatar(entity: any, isMe: boolean  ) {
        this.entity = entity;
        this.isMe = isMe;

        this.setNickname( entity.nickname );
        this.setUiChips( entity.chips, false );
        this.setAvatarProfile();

        if ( this.isMe == true ) {
            this.SetStatus(ENUM_STATUS_TYPE.NONE);
        } else {
            this.SetStatus(ENUM_STATUS_TYPE.WAITING);
        }

        this.rootNameTag.active = true;
        this.isFold = false;
        this.node.active = true;
    }

    public setNickname( name: string ) {
        this.labelNickname.string = name;        
    }

    public getNickname() {
        return this.entity.nickname;
    }

    public setUiChips( chips: number, isSitout: boolean ) {
        if ( this.labelChips != null ) {
            this.labelChips.color = new Color(255, 200, 70);

            this.labelChips.string = CommonUtil.getKoreanNumber( chips );

            if ( isSitout == true ) {
                this.setUiSitout();
            } else {
                this.setUiSitback();
            }
        }
    }

    public setSmallBlind() {
        this.labelChips.color = new Color(100, 150, 180);
        this.labelChips.string = "스몰블라인드"
    }

    public setBigBlind() {
        this.labelChips.color = new Color(100, 150, 180);
        this.labelChips.string = "빅블라인드"
    }

    private setAvatarProfile() {
        let s = Number( this.entity.avatar);
        CommonUtil.setAvatarSprite(s, this.spriteAvatarProfile, ()=>{
            this.spriteAvatarProfile.node.active = true;
        });
    }

    public clearUiBetValue() {

    }

    public setUiAction( action: string ) {
        let keys = Object.keys( this.actions );
        keys.forEach( (e)=> {
            let v: Node = this.actions[ e ];
            v.active = ( e == action );
        } );
        this.rootActions.active = true;
    }

    public setUiPlay() {
        // this.rootFoldCover.active = false;
        this.rootSelected.active = false;
        this.spriteTimer.node.active = true;
        this.spriteTimer.color = Color.GRAY;
        this.spriteTimer.fillRange = 1;
        this.spriteTimer.node.active = false;
        this.isFold = false;

        this.SetStatus( ENUM_STATUS_TYPE.NONE );
        this.clearUiAction();
    }

    public clearUiAction() {
        let keys = Object.keys( this.actions );
        keys.forEach ( (e)=> {
            let v: Node = this.actions[e];
            v.active = false;
        });
        this.rootActions.active = false;
    }

    public endTurn() {
        this.rootSelected.active = false;
        this.spriteTimer.node.active = false;
        this.spriteTimer.fillRange = 0;
        this.spriteTimer.node.active = false;
        this.labelWaitingTimer.node.active = false;
    }

    public setEscape() {
        // this.labelSitout.node.active = false;
        this.rootActions.active = false;
        this.hide();
    }

    public startTurn() {
        this.rootSelected.active = true;

        this.spriteTimer.node.active = true;
        this.spriteTimer.fillRange = 1;
        this.spriteTimer.color = TIMER_BEGIN_COLOR;
        this.spriteTimer.node.active = true;
    }

    public setUiFold( isFold: boolean ) {
        this.isFold = isFold;

        if ( isFold == true ) {
            this.clearUiAction();

            this.spriteTimer.fillRange = 0;
            this.spriteTimer.node.active = false;
            // this.rootFoldCover.active = true;
            this.rootSelected.active = false;

            this.SetStatus( ENUM_STATUS_TYPE.FOLD );
            this.setUiAction('fold');
        } else {
            this.SetStatus( ENUM_STATUS_TYPE.NONE );
            // this.rootFoldCover.active = false;
        }
    }

    public setUiWait() {
        // this.rootFoldCover.active = false;
        this.spriteTimer.node.active = false;
        this.spriteTimer.color = Color.GRAY;
        this.spriteTimer.fillRange = 1;
        this.spriteTimer.node.active = false;

        if ( this.entity.getIsUiSitOut() == true ) {
            this.SetStatus( ENUM_STATUS_TYPE.SITOUT );
        } else {
            this.SetStatus( ENUM_STATUS_TYPE.WAITING );
        }
    }

    public setUiAllin() {
        this.clearUiAction();

        this.spriteTimer.fillRange = 0;
        this.spriteTimer.node.active = false;
        this.rootSelected.active = false;

        this.setUiAction('allin');
    }

    public setUiSitout() {
        this.labelChips.node.active = true;
        // this.labelSitout.node.active = true;

        this.SetStatus(ENUM_STATUS_TYPE.SITOUT);
    }

    public setUiSitback() {
        this.labelChips.node.active = true;
        if ( this.isFold == true ) {
            this.SetStatus(ENUM_STATUS_TYPE.FOLD);
        } else {
            this.SetStatus(ENUM_STATUS_TYPE.NONE);
        }
        // this.labelSitout.node.active = false;
    }

    public setShowTimer( show: boolean ) {
        this.spriteTimer.node.active = show;
    }

    public setWaitingTimerColor(color: Color) {
        this.labelWaitingTimer.color = color;
    }

    public setWaitingTimer(delta: number) {
        this.labelWaitingTimer.string = Math.floor( delta ).toString();
        this.labelWaitingTimer.node.active = true;
    }

    public setWaitingTimerProgress( progress: number ) {
        this.spriteTimer.fillRange = progress;
        Color.lerp(this.spriteTimer.color, TIMER_END_COLOR, TIMER_BEGIN_COLOR, progress );
    }

    show() {
        this.node.active = true;
    }

    hide() {
        this.node.active = false;
    }

    SetStatus( type: ENUM_STATUS_TYPE ) {
        switch ( type ) {
            case ENUM_STATUS_TYPE.NONE:
                {
                    console.log('ENUM_STATUS_TYPE.NONE');
                    this.spriteDimmed.node.active = false;
                    this.spriteStatus.node.active = false;
                    this.rootStatus.active = false;                
                }
                break;
            case ENUM_STATUS_TYPE.FOLD:
                {
                    console.log('ENUM_STATUS_TYPE.FOLD');

                    this.spriteDimmed.node.active = true;
                    let sf: SpriteFrame = this.spriteFrameStatus[0];
                    this.spriteStatus.spriteFrame = sf;
                    this.spriteStatus.node.active = true;
                    this.rootStatus.active = true;
                }

                break;
            case ENUM_STATUS_TYPE.WAITING:
                {
                    console.log('ENUM_STATUS_TYPE.WAITING');

                    this.spriteDimmed.node.active = true;
                    let sf: SpriteFrame = this.spriteFrameStatus[1];
                    this.spriteStatus.spriteFrame = sf;
                    this.spriteStatus.node.active = true;
                    this.rootStatus.active = true;
                }

                break;
            case ENUM_STATUS_TYPE.SITOUT:
                {
                    console.log('ENUM_STATUS_TYPE.SITOUT');

                    this.spriteDimmed.node.active = true;
                    let sf: SpriteFrame = this.spriteFrameStatus[2];
                    this.spriteStatus.spriteFrame = sf;
                    this.spriteStatus.node.active = true;
                    this.rootStatus.active = true;
                }

                break;
            default:
                this.spriteDimmed.node.active = false;
                this.spriteStatus.node.active = false;
                this.rootStatus.active = false;
        }
    }

    childRegistered() {
        console.log('childRegistered');
        if ( this.isChildRegisted == true ) {
            return;
        }

        this.rootSelected = this.node.getChildByPath('SELECTED');
        if (this.rootSelected != null ) {
            this.rootSelected.active = false;
        }

        this.spriteAvatarProfile = this.node.getChildByPath('THUMBNAIL/SPRITE_AVATAR').getComponent(Sprite);
        if ( this.spriteAvatarProfile != null ) {
            this.spriteAvatarProfile.node.active = false;
        }

        // this.rootFoldCover = this.node.getChildByPath('THUMBNAIL/SPRITE_FOLD');
        // if ( this.rootFoldCover != null ) {
        //     this.rootFoldCover.active = false;
        // }

        this.spriteTimer = this.node.getChildByPath('SPRITE_TIMER').getComponent(Sprite);
        if ( this.spriteTimer != null ) {
            this.spriteTimer.node.active = false;
        }

        this.labelWaitingTimer = this.node.getChildByPath('LABEL_WAITING_TIMER').getComponent(Label);
        if ( this.labelWaitingTimer != null ) {
            this.labelWaitingTimer.node.active = false;
        }

        this.rootNameTag = this.node.getChildByPath('NAME_TAG');
        if ( this.rootNameTag != null ) {
            this.labelNickname = this.rootNameTag.getChildByPath('LABEL_NAME').getComponent(Label);
            this.labelChips = this.rootNameTag.getChildByPath('LABEL_CHIPS').getComponent(Label);
            // this.labelSitout = this.rootNameTag.getChildByPath('LABEL_SIT_OUT').getComponent(Label);

            this.rootNameTag.active = false;
        }

        this.rootActions = this.node.getChildByPath('ACTIONS');
        if ( this.rootActions != null ) {
            this.actions['call'] = this.rootActions.getChildByPath('CALL');
            this.actions['call'].active = false;

            this.actions['check'] = this.rootActions.getChildByPath('CHECK');
            this.actions['check'].active = false;

            this.actions['bet'] = this.rootActions.getChildByPath('BET');
            this.actions['bet'].active = false;

            this.actions['raise'] = this.rootActions.getChildByPath('RAISE');
            this.actions['raise'].active = false;

            this.actions['fold'] = this.rootActions.getChildByPath('FOLD');
            this.actions['fold'].active = false;

            this.actions['allin'] = this.rootActions.getChildByPath('ALLIN');
            this.actions['allin'].active = false;            

            this.rootActions.active = false;
        }

        this.rootStatus = this.node.getChildByPath('STATUS');
        if ( this.rootStatus != null ) {
            this.spriteDimmed = this.rootStatus.getChildByPath('DIMMED').getComponent(Sprite);
            if ( this.spriteDimmed != null ) {
                this.spriteDimmed.node.active = false;
            }

            this.spriteStatus = this.rootStatus.getChildByPath('SPRITE_STATUS').getComponent(Sprite);
            if ( this.spriteStatus != null ) {
                this.spriteStatus.node.active = false;
            }

            this.rootStatus.active = false;
        }

        this.isChildRegisted = true;
    }
}

