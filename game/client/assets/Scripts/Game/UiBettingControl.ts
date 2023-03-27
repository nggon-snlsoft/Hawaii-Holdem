import { _decorator, Component, Node, Button, Slider, Label, EventHandler, math, ConeCollider } from 'cc';
import { CommonUtil } from '../CommonUtil';
const { ccclass, property } = _decorator;

export enum ENUM_BETTING_TYPE {
    None,
    Bet,
    Raise,
}

@ccclass('UiBettingControl')
export class UiBettingControl extends Component {
    @property(Button) buttonBetMinus: Button = null;
    @property(Button) buttonBetPlus: Button = null;
    @property(Button) buttonBetHalf: Button = null;
    @property(Button) buttonBetTwoThird: Button = null;
    @property(Button) buttonBetPot: Button = null;
    @property(Button) buttonBetMax: Button = null;
    @property(Button) buttonInputBet: Button = null;
    @property(Slider) sliderBetting: Slider = null;
    @property(Label) labelDisplayValue: Label = null;
    @property(Node) nodeRoot: Node = null;

    private valueTurn: number = 0;
    private myBet: number = 0;
    private chips: number = 0;
    private pot: number = 0;
    private displayValue: number = 0;    
    private valueRange: number = 0;
    private valueStart: number = 0;
    private CONST_BET_STEP = 0.0;
    private sb: number = 0;
    private bb: number = 0;

    private type: ENUM_BETTING_TYPE = ENUM_BETTING_TYPE.None;

    init() {

        this.labelDisplayValue.string = (0).toString();

		const sliderEventHandler = new EventHandler();
		sliderEventHandler.target = this.node;
		sliderEventHandler.component = "UiBettingControl";
		sliderEventHandler.handler = "onSliderChangeBetValue";
		sliderEventHandler.customEventData = "???";
		this.sliderBetting?.slideEvents.push( sliderEventHandler );

        this.buttonBetMinus.node.on('click', this.onClickBetMinus.bind(this));
        this.buttonBetPlus.node.on('click', this.onClickBetPlus.bind(this));
        this.buttonBetHalf.node.on('click', this.onClickBetHalf.bind(this));
        this.buttonBetTwoThird.node.on('click', this.onClickBetTwoThird.bind(this));
        this.buttonBetPot.node.on('click', this.onClickBetPot.bind(this));
        this.buttonBetMax.node.on('click', this.onClickBetMax.bind(this));
        this.buttonInputBet.node.on('click', this.onClickInputBet.bind(this));

        this.sliderBetting.progress = 0.0;
        this.CONST_BET_STEP = 0;

        this.nodeRoot.active = false;
    }

    public show( sb: number, bb: number, type: ENUM_BETTING_TYPE, valueStart: number, valueRange: number, pot: number, chips: number , cbConfirm: ( value: number )=> void ) {
        this.type = type;

        this.pot = pot;
        this.chips = chips;

        this.sb = sb;
        this.bb = bb;

        this.CONST_BET_STEP = this.bb;

        this.valueStart = Math.min(valueStart, valueRange) ;
        this.valueRange = valueRange;

        this.setRatio(0);
        this.nodeRoot.active = true;
    }

    private setRatio( ratio: number ) { 
		let result: number = 0;
		let remain: number = 0;

		if ( ratio >= 1) {
			ratio = 1;
            result = Math.floor( ratio * this.valueRange );
            this.buttonBetPlus.interactable = false;
            this.buttonBetMinus.interactable = true;            
		} else {
            this.buttonBetPlus.interactable = true;

            if ( ratio <= 0) {
                result = this.valueStart;
                this.buttonBetMinus.interactable = false;
            }
            else {
                this.buttonBetMinus.interactable = true;
                result = Math.floor( ratio * this.valueRange );
                remain = Math.floor( ratio * this.valueRange ) % ( this.CONST_BET_STEP );
                result -= remain;
            }
		}

        result = Math.max( result, this.valueStart );
        this.sliderBetting.progress = result / this.valueRange;

        this.displayValue = result;
        this.labelDisplayValue.string = CommonUtil.getKoreanNumber( this.displayValue );

        // switch ( this.type) {
        //     case ENUM_BETTING_TYPE.None:
        //         break;

        //     case ENUM_BETTING_TYPE.Bet:
        //         this.displayValue = result + this.valueStart;
        //         break;

        //     case ENUM_BETTING_TYPE.Raise:
        //         this.displayValue = result + this.valueStart - this.myBet;
        //         break;
        // }

        // this.labelDisplayValue.string = CommonUtil.getKoreanNumber( this.displayValue );
    }

    private onClickBetMinus( button:Button ) {
        console.log('onClickBetMinus');
        let r = this.displayValue - this.CONST_BET_STEP;
        this.displayValue = Math.max (r, this.valueStart);

        console.log('this.displayValue: ' + this.displayValue.toString() );

        let rf = Math.fround(this.displayValue / this.valueRange);

        console.log((this.displayValue / this.valueRange).toString())
        

        this.setRatio(this.displayValue / this.valueRange);
    }

    private onClickBetPlus( button: Button ) {
        console.log('onClickBetPlus');        
        let r = this.displayValue + this.CONST_BET_STEP;
        this.displayValue = Math.min( r, this.valueRange);
        this.setRatio( this.displayValue / this.valueRange );
    }

    private onClickBetHalf( button: Button ) {
        this.setRatio (( this.pot * 0.5 ) / this.valueRange);
    }

    private onClickBetTwoThird( button: Button ) {
        this.setRatio (( this.pot * 2 / 3 ) / this.valueRange);
    }

    private onClickBetPot( button: Button ) {
        this.setRatio( this.pot / this.valueRange );
    }

    private onClickBetMax( button: Button ) {
        this.setRatio(1);
    }

    private onClickInputBet( button: Button ) {

    }

    private onSliderChangeBetValue( slider: Slider ) {
        this.setRatio( slider.progress );
	}

    hide() {
        this.nodeRoot.active = false;
    }

    public getResult(): any {
        let result = 0;
        switch ( this.type) {
            case ENUM_BETTING_TYPE.None:
                break;

            case ENUM_BETTING_TYPE.Bet:
                result = this.displayValue;
                break;

            case ENUM_BETTING_TYPE.Raise:
                result = this.displayValue;
                break;
        }

        return {
            result: result,
            type: this.type,
        };
    }
}


