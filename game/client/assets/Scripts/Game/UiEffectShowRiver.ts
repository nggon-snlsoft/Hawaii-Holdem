import { _decorator, Component, Node, Sprite, SpriteFrame, Animation } from 'cc';
import { ResourceManager } from '../ResourceManager';
import { AudioController } from './AudioController';
const { ccclass, property } = _decorator;

@ccclass('UiEffectShowRiver')
export class UiEffectShowRiver extends Component {

    private sprite: Sprite = null;
    private animation: Animation = null;
    private value: number = -1;

    private done: ()=>void = null;

    public Init() {
        this.sprite = this.node.getChildByPath('CARD').getComponent(Sprite);
        if ( this.sprite != null ) {
            this.sprite.node.active = false;
        }

        this.animation = this.node.getComponent(Animation);
        if ( this.animation != null ) {
            this.animation.on('finished', this.onFinished.bind(this), this);
        }

        this.node.active = false;
    }

    public Show(value: number, done:()=>void ) {
        if ( done != null ) {
            this.done = done;
        }

        let sf: SpriteFrame = ResourceManager.Instance().getCardImage( 0 );
        if ( sf != null ) {
            this.sprite.spriteFrame = sf;
        }

        this.value = value;
        this.scheduleOnce(()=>{
            this.animation.node.active = true;
            this.sprite.node.active = true;
    
            this.node.active = true;            
            this.animation.play();
        }, 0.5);
    }

    public Hide() {
        if ( this.done != null ) {
            this.done = null;
        }
        this.node.active = false;
    }

    onChangeCard() {
        let sf: SpriteFrame = ResourceManager.Instance().getCardImage( this.value + 1 );
        if ( sf != null ) {
            this.sprite.spriteFrame = sf;
        }
    }

    onFinished() {
        this.scheduleOnce(()=>{
            if ( this.done != null ) {
                this.done();
            }
    
            this.Hide();
        }, 0.5);
    }
}

