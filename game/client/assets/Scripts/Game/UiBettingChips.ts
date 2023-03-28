import { _decorator, Component, Node, SpriteFrame, Sprite, Color, Tween, tween, easing, UIOpacity, Vec3, UITransform } from 'cc';
import { Board } from '../Board';
import { UiTable } from '../UiTable';
const { ccclass, property } = _decorator;

@ccclass('UiBettingChips')
export class UiBettingChips extends Component {
    @property(Node) digits: Node[] = [];
    @property(Node) targets: Node[] = [];

    private sprites: any[] = [];
    private value: number = 0;
    private positions: Vec3[] = [];
    private numbers: any[] = [];

    private cb: ()=>void = null;

    public init() {

        for ( let i: number = 0; i < this.digits.length; i ++ ) {
            let ss: Sprite[] = [];
            for ( let j: number = 0 ; j < 9 ; j++ ) {
                let s: Sprite = this.digits[i].getChildByPath( (j+1).toString() ).getComponent(Sprite);
                if ( s != null ) {
                    ss.push( s );
                }
            }

            this.sprites.push( ss );
            this.positions.push( new Vec3(this.digits[i].position) );
            this.digits[i].active = false;
        }

        this.node.active = false;
    }

    public show( num: number, cb: ()=>void ) {
        this.value = num;
        if ( cb != null ) {
            this.cb = cb;
        }

        this.setNumbers();
        this.setDigits();
        this.reset();

        for ( let i: number = 0 ; i < this.digits.length ; i++ ) {
            this.move( i, this.digits[i], this.targets[i], i * 0.1 );
        }

        this.node.active = true;
    }

    public moveChipsToPot( to: Node, cb:()=>void ) {
        let idx: number = 0;
        for ( let i: number = 0 ; i < this.digits.length; i++ ) {
            if ( this.digits[i] != null ) {
                idx++;
                this.moveToPot(i, this.digits[i], to, 0.5 + idx * 0.1, ()=>{
                    this.reset();
                    cb();
                });
            }
        }
    }

    private setNumbers() {
        this.numbers = [];
        let s: string = this.value.toString();
        let cnt: number = 0;
        for ( let i = 0 ; i < s.length; i ++ ) {
            let n: number = parseInt( s[i] );
            this.numbers.push( {
                number: n,
                digit: s.length - i,
            } );
            cnt++;
            if ( cnt >= this.digits.length ) {
                break;
            }
        }
    }

    private setDigits() {
        for ( let i: number = 0 ; i < this.digits.length; i ++ ) {

            let s: any = this.sprites[i];
            for ( let j: number = 0 ; j < 9; j++ ) {
                s[j].spriteFrame = Board.table.getChipImage( this.numbers[i].digit );
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
        for ( let i: number = 0 ; i < this.digits.length; i ++ ) {
            this.digits[i].setPosition( new Vec3 ( this.positions[i]) );
            this.digits[i].active = false;
        }
    }

    public hide() {
        this.reset();
        this.node.active = false;
    }

    private move( index: number, from: Node, to: Node, delay: number ) {
        if ( from == null || to == null ) {
            return;
        }

        let op: UIOpacity = from.getComponent(UIOpacity);
        if ( op != null ) {
            op.opacity = 0;
        }
        
        from.active = true;

        let duration = 0.2;
        let tw = tween( from )
        .delay(delay)
        .set ({
            position: from.position,

        }).to ( duration, {
            position: to.position,
        }, {
            easing: this.easeOutQuad,
            onUpdate: ( target: Node, ratio: number )=> {
                let o = 255 * ratio;
                op.opacity = o;
            },
        });

        tw.call( ()=>{
            if ( (index + 1) == this.numbers.length ) {
                if ( this.cb != null ) {
                    this.cb();
                }
            }
        } );
        tw.start();
    }

    private moveToPot( index: number, from: Node, to: Node, delay: number, cb:()=>void ) {

        let vecTo = to.parent.getComponent(UITransform).convertToWorldSpaceAR(to.position);
        vecTo = from.parent.getComponent(UITransform).convertToNodeSpaceAR( vecTo );

        let duration = 0.2;
        let tw = tween( from )
        .delay(delay)
        .set ({
            position: from.position,

        }).to ( duration, {
            position: vecTo,
        }, {
            easing: this.easeOutQuad,
            onUpdate: ( target: Node, ratio: number )=> {
                // let o = 255 * ratio;
                // op.opacity = o;
            },
        });

        tw.call( ()=>{
            if ( (index + 1) == this.numbers.length ) {
                if ( cb != null ) {
                    cb();
                }
            }
        } );

        tw.start();
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

