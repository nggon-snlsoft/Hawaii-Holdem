import { _decorator, Component, Node, Animation, AnimationClip, animation, Sprite, SpriteFrame } from 'cc';
import { ResourceManager } from '../ResourceManager';
const { ccclass, property } = _decorator;

@ccclass('UiCard')
export class UiCard extends Component {
    @property(AnimationClip) clip: AnimationClip = null;

    private anim: Animation = null;
    private sprite: Sprite = null;
    private card: number = -1;
    private cb: ()=> void;

    init() {
        this.anim = this.node.getComponent(Animation);
        if ( this.anim == null) {
            console.log('THERE IS NO ANIMATION CONTROLLER');
            return;
        }

        this.sprite = this.node.getComponent(Sprite);
        this.anim.on('finished', this.onCardFlipFinished.bind(this), this);

        this.node.active = false;
    }

    show( card: number, cb:()=>void,  delay: number = 0.0 ) {
        if ( cb != null ) {
            this.cb = cb;
        }

        this.card = card;
        this.sprite.spriteFrame = ResourceManager.Instance().getCardImage(0);
        this.node.active = true;

        this.scheduleOnce(()=>{
            this.anim.play();
        }, delay );
    }

    onCardFlipFinished() {
        if ( this.cb != null ) {
            this.cb();
        }
    }

    onCardFlippCenter() {
        let sf: SpriteFrame = ResourceManager.Instance().getCardImage(this.card);
        if ( sf != null ) {
            this.sprite.spriteFrame = sf;
        }
    }

    hide() {
        if ( this.cb != null ) {
            this.cb = null;
        }
        this.sprite.spriteFrame = null;
        this.node.active = false;
    }
}

