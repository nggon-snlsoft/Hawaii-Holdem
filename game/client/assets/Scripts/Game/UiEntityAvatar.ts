import { _decorator, Component, Node, Label, Color, native, Sprite, Vec3 } from 'cc';
import { CommonUtil } from '../CommonUtil';
const { ccclass, property } = _decorator;

const TIMER_BEGIN_COLOR: Color = Color.YELLOW;
const TIMER_END_COLOR: Color = Color.RED;

@ccclass('UiEntityAvatar')
export class UiEntityAvatar extends Component {
    private entity: any = null;

    private rootSelected: Node = null;
    private rootNameTag: Node = null;
    private rootActions: Node = null;
    private rootFoldCover: Node = null;

    private rootResultEffect: Node = null;

    private spriteAvatarProfile: Sprite = null;
    private spriteTimer: Sprite = null;

    private spriteWinAnimation1: Sprite = null;
    private spriteWinAnimation2: Sprite = null;
    private spriteWinAnimation3: Sprite = null;

    private spriteEffectWin: Sprite = null;
    private spriteEffectDraw: Sprite = null;
    private spriteEffectReturn: Sprite = null;

    private labelNickname: Label = null;
    private labelChips: Label = null;
    private labelSitout: Label = null;
    private labelWaitingTimer: Label = null;
    private labelEffectValue: Label = null;

    private vecWinAnimation3: Vec3 = new Vec3();

    private actions: {} = {};

    private isChildRegisted: boolean = false;

    init() {
        this.childRegistered();
        this.node.active = false;
    }

    setAvatar(entity: any ) {
        this.entity = entity;

        this.setNickname( entity.nickname );
        this.setUiChips( entity.chips, false );
        this.setAvatarProfile();

        this.rootNameTag.active = true;

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
        this.rootFoldCover.active = false;
        this.rootSelected.active = false;
        this.spriteTimer.node.active = true;
        this.spriteTimer.color = Color.GRAY;
        this.spriteTimer.fillRange = 1;
        this.spriteTimer.node.active = false;

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
        this.labelSitout.node.active = false;
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
        if ( isFold == true ) {
            this.clearUiAction();

            this.spriteTimer.fillRange = 0;
            this.spriteTimer.node.active = false;
            this.rootFoldCover.active = true;
            this.rootSelected.active = false;

            this.setUiAction('fold');
        } else {
            this.rootFoldCover.active = false;
        }
    }

    public setUiWait() {
        this.rootFoldCover.active = false;
        this.spriteTimer.node.active = false;
        this.spriteTimer.color = Color.GRAY;
        this.spriteTimer.fillRange = 1;
        this.spriteTimer.node.active = false;
    }

    public setUiAllin() {
        this.clearUiAction();

        this.spriteTimer.fillRange = 0;
        this.spriteTimer.node.active = false;
        this.rootSelected.active = false;

        this.setUiAction('allin');
    }

    public setUiSitout() {
        this.labelChips.node.active = false;
        this.labelSitout.node.active = true;
    }

    public setUiSitback() {
        this.labelChips.node.active = true;
        this.labelSitout.node.active = false;        
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

    childRegistered() {
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

        this.rootFoldCover = this.node.getChildByPath('THUMBNAIL/SPRITE_FOLD');
        if ( this.rootFoldCover != null ) {
            this.rootFoldCover.active = false;
        }

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
            this.labelSitout = this.rootNameTag.getChildByPath('LABEL_SIT_OUT').getComponent(Label);

            this.rootNameTag.active = false;
        }

        this.rootActions = this.node.getChildByPath('ACTIONS');
        if ( this.rootActions != null ) {
            console.log('this.rootActions is not null');
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

        this.spriteWinAnimation1 = this.node.getChildByPath('SPRITE_WIN_ANI1').getComponent(Sprite);
        if ( this.spriteWinAnimation1 != null ) {
            this.spriteWinAnimation1.node.active = false;
        }

        this.spriteWinAnimation2 = this.node.getChildByPath('SPRITE_WIN_ANI2').getComponent(Sprite);
        if ( this.spriteWinAnimation2 != null ) {
            this.spriteWinAnimation2.node.active = false;
        }

        this.spriteWinAnimation3 = this.node.getChildByPath('SPRITE_WIN_ANI3').getComponent(Sprite);
        if ( this.spriteWinAnimation3 != null ) {
            this.spriteWinAnimation3.node.active = false;

            this.vecWinAnimation3 = new Vec3( this.spriteWinAnimation3.node.position );
        }

        this.rootResultEffect = this.node.getChildByPath('RESULT_EFFECT');
        if ( this.rootResultEffect != null ) {
            this.spriteEffectWin = this.rootResultEffect.getChildByPath('SPRITE_WIN').getComponent(Sprite);
            if ( this.spriteEffectWin != null ) {
                this.spriteEffectWin.node.active = false;
            }
            
            this.spriteEffectDraw = this.rootResultEffect.getChildByPath('SPRITE_DRAW').getComponent(Sprite);
            if ( this.spriteEffectDraw != null ) {
                this.spriteEffectDraw.node.active = false;
            }

            this.spriteEffectReturn = this.rootResultEffect.getChildByPath('SPRITE_RETURN').getComponent(Sprite);
            if ( this.spriteEffectReturn != null ) {
                this.spriteEffectReturn.node.active = false;
            }

            this.labelEffectValue = this.rootResultEffect.getChildByPath('LABEL_VALUE').getComponent(Label);
            if ( this.labelEffectValue != null ) {
                this.labelEffectValue.string = '0';
                this.labelEffectValue.node.active = false;
            }
        }

        this.isChildRegisted = true;
    }
}

