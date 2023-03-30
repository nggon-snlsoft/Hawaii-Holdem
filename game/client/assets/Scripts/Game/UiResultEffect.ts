import { _decorator, Component, Node, Sprite, Vec3, Label, Tween, tween, Color, Quat, bezier, Animation } from 'cc';
import { CommonUtil } from '../CommonUtil';
const { ccclass, property } = _decorator;

@ccclass('UiResultEffect')
export class UiResultEffect extends Component {
    private spriteWinAnimation1: Sprite = null;
    private spriteWinAnimation2: Sprite = null;
    private spriteWinAnimation3: Sprite = null;

    private vecWinAnimation3: Vec3 = new Vec3();    

    private spriteEffectWin: Sprite = null;
    private spriteEffectDraw: Sprite = null;
    private spriteEffectReturn: Sprite = null;

    private AnimationWinEffect: Animation = null;
    private AnimationDrawEffect: Animation = null;
    private AnimationReturnEffect: Animation = null;

    private labelEffectValue: Label = null;
    private winTweens: Tween<Node>[] = [];

    private isChildRegisted: boolean = false;

    Init() {
        this.childedRegisted();
        this.node.active = false;
    }

    ResetResultEffect() {
        this.spriteEffectWin.node.active = false;
        this.spriteEffectDraw.node.active = false;
        this.spriteEffectReturn.node.active = false;

        this.labelEffectValue.string = '';
        this.labelEffectValue.node.active = false;

        this.node.active = false;
    }

    SetWinEffect( value: number ) {
        this.ResetResultEffect();

        this.labelEffectValue.string = '+' + CommonUtil.getKoreanNumber( value );
        this.labelEffectValue.node.active = true;

        this.spriteEffectWin.node.active = true;
        this.node.active = true;

        this.AnimationWinEffect.play();

        this.WinTweenEffect();        
    }

    public SetDrawEffect( value: number ) {
        this.ResetResultEffect();

        this.labelEffectValue.string = '+' + CommonUtil.getKoreanNumber( value );
        this.labelEffectValue.node.active = true;

        this.spriteEffectDraw.node.active = true;
        this.node.active = true;

        this.AnimationDrawEffect.play();
    }

    public SetReturnEffect( value: number ) {
        this.ResetResultEffect();

        this.labelEffectValue.string = '+' + CommonUtil.getKoreanNumber( value );
        this.labelEffectValue.node.active = true;

        this.spriteEffectReturn.node.active = true;
        this.node.active = true;

        this.AnimationReturnEffect.play();
    }

    private WinTweenEffect() {
        this.winTweens.forEach( elem => elem.stop() );
        this.winTweens = [];

        this.spriteWinAnimation1.node.active = true;
        this.spriteWinAnimation2.node.active = true;
        this.spriteWinAnimation3.node.active = true;
        
        this.node.active = true;

        let ani1Tween = tween(this.spriteWinAnimation1.node)
        .set( {

        })
        .call( () => {
            this.spriteWinAnimation1.color = new Color(255,255,255,1);
            this.spriteWinAnimation1.node.active = false;
        })
        .to( 0.5, {}, {
            onUpdate: (target?: object, ratio?: number) => 
            {
                let a = 255 * ratio;
                if( a > 255 ) {
                    a = 255;
                }

                if( 1 > a ){
                    a = 1;
                }

                this.spriteWinAnimation1.color = new Color(255,255,255,a);
            },
        }).union();

        let ani3Tween = tween(this.spriteWinAnimation3.node)
        .call( () => {
            this.spriteWinAnimation3.color = new Color(255,255,255,1);
            this.spriteWinAnimation3.node.position = new Vec3(this.vecWinAnimation3);

            this.spriteWinAnimation3.node.active = false;
        })
        .set( { 
            position: new Vec3(this.vecWinAnimation3),
            scale: new Vec3(0.5, 0.5, 0.5)
        } )
        .to( 0.5, {
            scale: new Vec3(1,1,1)
        }, {
            easing: 'backOut',
            onUpdate: (target?: object, ratio?: number) =>
            {
                let a = 255 * ratio;
                if( a > 255 ) {
                    a = 255;
                }

                if( 1 > a ){
                    a = 1;
                }

                this.spriteWinAnimation3.color = new Color(255,255,255,a);
            }
        })
        .to (3, {
            // position: new Vec3(this.vecWinAni3.x+20,this.vecWinAni3.y,this.vecWinAni3.z),
        }, {
            easing: "linear",
            onUpdate: (target?: object, ratio?: number) => 
            {
                let a = 255 * (1 - ratio);
                if( a > 255 ) {
                    a = 255;
                }

                if( 1 > a ){
                    a = 1;
                }

                this.spriteWinAnimation3.color = new Color(255,255,255,a);
                this.spriteWinAnimation1.color = new Color(255,255,255,a);
            },
        }).union();

        let dest: Quat = Quat.IDENTITY.clone();

        let ani2Tween = tween( this.spriteWinAnimation2.node)
        .call( () => {
            this.spriteWinAnimation2.color = new Color(255,255,255,1);
            // this.sprWinAni2.node.scale = new Vec3( 0.5, 0.5, 0.5);
            this.spriteWinAnimation2.node.scale = new Vec3(1.15,1.15,1.15);
            this.spriteWinAnimation2.node.setRotation(dest);
            this.spriteWinAnimation2.node.active = false;
        })
        .to( 2, {
            scale: new Vec3(0.7,0.7,0.7)
        }, {
            // easing: 'backOut',
            onUpdate: (target?: object, ratio?: number) =>
            {
                Quat.fromEuler( dest, 0, 0, 360 * 12 * ratio);
                this.spriteWinAnimation2.node.setRotation(dest);
            
                let a = bezier(0,500,255,0,ratio);
                let max: number = 255 * 0.7;
                if( a > max ){
                    a = max;
                }

                if( 1 > a ){
                    a = 1;
                }

                this.spriteWinAnimation2.color = new Color( 255,255,255, a); 
            },
        }).union();

        ani1Tween.start();
        ani3Tween.start();
        ani2Tween.start();

        this.winTweens.push(ani1Tween);
        this.winTweens.push(ani2Tween);
        this.winTweens.push(ani3Tween);
    }

    private onFinishedResultEffect() {
        this.ResetResultEffect();
    }

    childedRegisted() {
        if ( this.isChildRegisted == true ) {
            return;
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

        this.spriteEffectWin = this.node.getChildByPath('SPRITE_WIN').getComponent(Sprite);
        if ( this.spriteEffectWin != null ) {
            this.spriteEffectWin.node.active = false;
        }
        
        this.spriteEffectDraw = this.node.getChildByPath('SPRITE_DRAW').getComponent(Sprite);
        if ( this.spriteEffectDraw != null ) {
            this.spriteEffectDraw.node.active = false;
        }

        this.spriteEffectReturn = this.node.getChildByPath('SPRITE_RETURN').getComponent(Sprite);
        if ( this.spriteEffectReturn != null ) {
            this.spriteEffectReturn.node.active = false;
        }

        this.labelEffectValue = this.node.getChildByPath('LABEL_VALUE').getComponent(Label);
        if ( this.labelEffectValue != null ) {
            this.labelEffectValue.string = '0';
            this.labelEffectValue.node.active = false;
        }

        this.AnimationWinEffect = this.node.getChildByPath('SPRITE_WIN').getComponent( Animation );
        if ( this.AnimationWinEffect != null ) {
            this.AnimationWinEffect.on('finished', this.onFinishedResultEffect.bind(this), this );
        }

        this.AnimationDrawEffect = this.node.getChildByPath('SPRITE_DRAW').getComponent( Animation );
        if ( this.AnimationDrawEffect != null ) {
            this.AnimationDrawEffect.on('finished', this.onFinishedResultEffect.bind(this), this );
        }

        this.AnimationReturnEffect = this.node.getChildByPath('SPRITE_RETURN').getComponent( Animation );
        if ( this.AnimationReturnEffect != null ) {
            this.AnimationReturnEffect.on('finished', this.onFinishedResultEffect.bind(this), this );
        }
    }
}

