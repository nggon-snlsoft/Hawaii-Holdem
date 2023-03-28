import { _decorator, Component, Node, Sprite } from 'cc';
import { Board } from '../Board';
const { ccclass, property } = _decorator;

@ccclass('UiPotChips')
export class UiPotChips extends Component {
    @property(Node) digits: Node[] = [];

    private sprites: any[] = [];
    private value: number = 0;
    private numbers: any[] = [];

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

        this.node.active = false;
    }

    show(num: number) {
        this.value = num;

        this.setNumbers();
        this.setDigits();

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
        for ( let i: number = 0; i < this.digits.length; i++ ) {
            this.digits[i].active = false;
        }

    }

    hide() {
        this.reset();
        this.node.active = false;
    }
}

