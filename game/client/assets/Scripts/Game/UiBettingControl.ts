import { _decorator, Component, Node, Button, Slider, Label, EventHandler, math } from 'cc';
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
        this.CONST_BET_STEP = 1.0 / 20.0;

        this.nodeRoot.active = false;
    }

    public show(type: ENUM_BETTING_TYPE, valueStart: number, valueRange: number, pot: number, chips: number , cbConfirm: ( value: number )=> void ) {
        this.type = type;

        this.pot = pot;
        this.chips = chips;

        this.valueStart = valueStart;
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
                remain = Math.floor( ratio * this.valueRange ) % ( this.valueStart * 0.5 );
                result -= remain;
            }
		}

        result = Math.max( result, this.valueStart );
        this.sliderBetting.progress = result / this.valueRange;

        switch ( this.type) {
            case ENUM_BETTING_TYPE.None:
                break;

            case ENUM_BETTING_TYPE.Bet:
                this.displayValue = result + this.valueStart;

                break;

            case ENUM_BETTING_TYPE.Raise:
                this.displayValue = result + this.valueStart - this.myBet;
                break;
        }

        this.labelDisplayValue.string = CommonUtil.getNumberStringWithComma( this.displayValue );
    }

    private onClickBetMinus( button:Button ) {
        this.sliderBetting.progress -= this.CONST_BET_STEP;
        this.sliderBetting.progress = Math.min(this.sliderBetting.progress, 1.0);
        
        this.setRatio(this.sliderBetting.progress);
    }

    private onClickBetPlus( button: Button ) {
        this.sliderBetting.progress += this.CONST_BET_STEP;
        this.sliderBetting.progress = Math.max(this.sliderBetting.progress, 0.0);        

        this.setRatio(this.sliderBetting.progress);
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
        return {
            result: this.displayValue,
            type: this.type,
        };
    }
}


