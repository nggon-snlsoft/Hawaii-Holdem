import { _decorator, Component, Node, Sprite, SpriteFrame, Vec3, UITransform, tween, Tween, UIOpacity } from 'cc';
import { Board } from '../Board';
import { ResourceManager } from '../ResourceManager';
const { ccclass, property } = _decorator;

@ccclass('UiPotChips')
export class UiPotChips extends Component {
    @property(Node) digits: Node[] = [];

    private sprites: any[] = [];
    private value: number = 0;
    private numbers: any[] = [];
    private vecOriginal: Vec3 = null;

    init() {
        for ( let i: number = 0 ; i < this.digits.length ; i++ ) {
            let ss: Sprite[] = [];
            for ( let j: number = 0 ; j < 9 ; j++ ) {
                let s: Sprite = this.digits[i].getChildByPath( (j + 1).toString() ).getComponent( Sprite );
                if ( s != null ) {
                    ss.push(s);
                }
            }
            this.sprites.push( ss );
            this.digits[i].active = false;
        }

        this.vecOriginal = new Vec3( this.node.position.x, this.node.position.y, this.node.position.z );
        this.node.active = false;
    }

    show(num: number) {
        this.value = num;

        if ( num > 0) {
            this.setNumbers();
            this.setDigits();    
        }

        this.node.active = true;
    }

    private setNumbers() {
        this.numbers = [];
        let s: string = this.value.toString();
        let cnt: number = 0;

        for ( let i = 0 ; i < s.length ; i++ ) {
            let n: number = parseInt( s[i] );
            this.numbers.push( {
                number: n,
                digit: s.length - i,
            });

            cnt++;
            if ( cnt >= this.digits.length ) {
                break;
            }
        }
    }

    private setDigits() {
        for ( let i: number = 0 ; i < this.digits.length ; i++ ) {
            let s: any = this.sprites[i];

            for ( let j: number = 0 ; j < 9 ; j++ ) {
                let sf: SpriteFrame = ResourceManager.Instance().getChipImage( this.numbers[i].digit );
                s[j].spriteFrame = sf;
                if ( j < this.numbers[i].number ) {
                    s[j].node.active = true;
                } else {
                    s[j].node.active = false;
                }
            }
            this.digits[i].active = true;
        }

    }

    private reset() {
        for ( let i: number = 0; i < this.digits.length; i++ ) {
            this.digits[i].active = false;
        }
        this.value = 0;
    }

    public MovePotToEntity( from: Node, to: Node, value: number  ) {
        this.value = value;

        this.setNumbers();
        this.setDigits();

        let vecFrom = from.parent.getComponent( UITransform ).convertToWorldSpaceAR( from.position );
        vecFrom = this.node.parent.getComponent( UITransform ).convertToNodeSpaceAR( vecFrom );

        let vecTo = this.node.parent.getComponent( UITransform ).convertToWorldSpaceAR( this.vecOriginal );
        vecTo = this.node.getComponent( UITransform ).convertToNodeSpaceAR( vecTo );

        // this.node.position = new Vec3( vecFrom.x, vecFrom.y, vecFrom.z );
        this.node.active = true;

        let op: UIOpacity = this.node.getComponent( UIOpacity );
        if ( op != null ) {
            op.opacity = 255;
        }

        let tw = tween ( this.node )
        .set ({
            position: vecFrom,
        }).to ( 0.5 , {
            position: vecTo,
        }, {
            easing: this.easeOutQuad,
            onUpdate(target, ratio) {
                let o = 255 - ( 255 * ratio);
                if ( op != null ) {
                    op.opacity = o;
                }
            },
        })

        tw.call(()=>{
            this.node.position = new Vec3( this.vecOriginal.x, this.vecOriginal.y, this.vecOriginal.z);
            this.node.active = false;
        });

        tw.start();
    }

    hide() {
        this.reset();
        this.node.active = false;
    }

    easeOutBack(x: number ): number {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        
        return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    }

    easeOutQuad( x: number ): number {
        return 1 - (1 - x) * (1 - x);
    }
}

