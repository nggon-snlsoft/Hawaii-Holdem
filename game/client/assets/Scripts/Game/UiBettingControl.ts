import { _decorator, Component, Node, Button, Slider, Label, EventHandler, math } from 'cc';
import { CommonUtil } from '../CommonUtil';
import { AudioController } from './AudioController';
const { ccclass, property } = _decorator;

export enum ENUM_BETTING_TYPE {
    None,
    Bet,
    Raise,
}

export enum ENUM_BETTING_KIND {
    NONE = 0,
    MAX = 1,
    FULL = 2,
    HALF = 3,
    QUATER = 4,
}

@ccclass('UiBettingControl')
export class UiBettingControl extends Component {
    @property(Button) buttonBetMinus: Button = null;
    @property(Button) buttonBetPlus: Button = null;
    @property(Button) buttonBetPot: Button = null;
    @property(Button) buttonBetHalf: Button = null;
    @property(Button) buttonBetQuater: Button = null;
    @property(Button) buttonBetMax: Button = null;
    @property(Slider) sliderBetting: Slider = null;
    @property(Label) labelDisplayValue: Label = null;
    @property(Node) nodeRoot: Node = null;

    @property(Label) labelMaxValue: Label = null;
    @property(Label) labelFullValue: Label = null;
    @property(Label) labelHalfValue: Label = null;
    @property(Label) labelQuaterValue: Label = null;

    private pot: number = 0;
    private displayValue: number = 0;    
    private valueRange: number = 0;
    private valueStart: number = 0;
    private CONST_BET_STEP = 0.0;
    private bb: number = 0;

    private type: ENUM_BETTING_TYPE = ENUM_BETTING_TYPE.None;
    private cbBetting: ( result: any )=>void;

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
        this.buttonBetQuater.node.on('click', this.onClickBetQuater.bind(this));
        this.buttonBetPot.node.on('click', this.onClickBetPot.bind(this));
        this.buttonBetMax.node.on('click', this.onClickBetMax.bind(this));

        this.labelMaxValue.string = '';
        this.labelFullValue.string = '';
        this.labelHalfValue.string = '';
        this.labelQuaterValue.string = '';

        this.sliderBetting.progress = 0.0;
        this.CONST_BET_STEP = 0;

        this.nodeRoot.active = false;
    }

    public show( sb: number, bb: number, type: ENUM_BETTING_TYPE, valueStart: number, valueRange: number, pot: number, chips: number , cbConfirm: ( result: any )=> void ) {
        this.type = type;

        if ( cbConfirm != null ) {
            this.cbBetting = cbConfirm;
        }

        this.pot = pot;
        this.bb = bb;

        this.CONST_BET_STEP = this.bb;

        this.valueStart = Math.min(valueStart, valueRange) ;
        this.valueRange = chips;

        this.labelMaxValue.string = CommonUtil.getKoreanNumber( valueRange );

        let result: number = 0;
        result = pot;
        result = Math.max( result, this.valueStart );
        result = Math.min( result, this.valueRange);
        this.labelFullValue.string = CommonUtil.getKoreanNumber(result);

        result = Math.floor(pot * 0.5);
        result = Math.max( result, this.valueStart );
        result = Math.min( result, this.valueRange);
        this.labelHalfValue.string = CommonUtil.getKoreanNumber(result);

        result = Math.floor(pot * 0.25);
        result = Math.max( result, this.valueStart );
        result = Math.min( result, this.valueRange);
        this.labelQuaterValue.string = CommonUtil.getKoreanNumber(result);

        this.setRatio(0);
        this.nodeRoot.active = true;
    }

    private setRatio( ratio: number ) {
		let result: number = 0;
		let remain: number = 0;

		if ( ratio >= 1) {
			ratio = 1;
            result = Math.floor( ratio * this.valueRange );
		} else {

            if ( ratio <= 0 ) {
                result = this.valueStart;
            }
            else {
                result = Math.floor( ratio * this.valueRange );
                remain = result % ( this.CONST_BET_STEP );
                result -= remain;
            }
		}

        result = Math.max( result, this.valueStart );

        this.sliderBetting.progress = result / this.valueRange;

        this.displayValue = result;
        this.labelDisplayValue.string = CommonUtil.getKoreanNumber( this.displayValue );
    }

    private onClickBetMinus( button:Button ) {
		AudioController.instance.ButtonClick();        
        let r = this.displayValue - this.CONST_BET_STEP;
        this.setValue( r );
    }

    private setValue( value ) {
		let result: number = 0;
		let remain: number = 0;

        result = value;
        remain = result % ( this.CONST_BET_STEP );
        result -= remain;
        result = Math.max( result, this.valueStart );

        this.sliderBetting.progress = result / this.valueRange;
        this.displayValue = Math.min( result, this.valueRange);

        this.labelDisplayValue.string = CommonUtil.getKoreanNumber( this.displayValue );        
    }

    private setPotValue( value ) {
		let result: number = 0;
        result = Math.floor(value);
        result = Math.max( result, this.valueStart );

        this.sliderBetting.progress = result / this.valueRange;
        this.displayValue = Math.min( result, this.valueRange);

        this.labelDisplayValue.string = CommonUtil.getKoreanNumber( this.displayValue );        
    }

    private onClickBetPlus( button: Button ) {
        let r = this.displayValue + this.CONST_BET_STEP;
		AudioController.instance.ButtonClick();
        this.setValue( r );
    }

    private onClickBetHalf( button: Button ) {
        let r = this.pot * 0.5;
        this.setPotValue( r );

        if ( this.cbBetting != null ) {
            this.cbBetting ({
                kind: ENUM_BETTING_KIND.HALF,
                value: this.displayValue,
            });
        }
    }

    private onClickBetQuater( button: Button ) {
        let r = this.pot * 0.25;
        this.setPotValue( r );

        if ( this.cbBetting != null ) {
            this.cbBetting ({
                kind: ENUM_BETTING_KIND.QUATER,
                value: this.displayValue,
            });
        }
    }

    private onClickBetPot( button: Button ) {
        let r = this.pot;
        this.setPotValue( this.pot );

        if ( this.cbBetting != null ) {
            this.cbBetting ({
                kind: ENUM_BETTING_KIND.FULL,
                value: this.displayValue,
            });
        }
    }

    private onClickBetMax( button: Button ) {
        this.setRatio(1);
		AudioController.instance.ButtonClick();
        if ( this.cbBetting != null ) {
            this.cbBetting ({
                kind: ENUM_BETTING_KIND.MAX,
                value: this.displayValue,
            });
        }
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


