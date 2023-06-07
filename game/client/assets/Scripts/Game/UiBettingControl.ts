import { _decorator, Component, Node, Button, Slider, Label, EventHandler, math } from 'cc';
import { CommonUtil } from '../CommonUtil';
import { AudioController } from './AudioController';
const { ccclass, property } = _decorator;

export enum ENUM_BETTING_TYPE {
    None,
    Bet,
    Raise,
}

@ccclass('UiBettingControl')
export class UiBettingControl extends Component {
    @property(Button) buttonMinus: Button = null;
    @property(Button) buttonPlus: Button = null;
    @property(Button) buttonBet: Button = null;
    @property(Button) buttonRaise: Button = null;

    @property(Slider) sliderBetting: Slider = null;
    @property(Label) labelDisplayValue: Label = null;
    @property(Label) labelBetValue: Label = null;
    @property(Label) labelRaiseValue: Label = null;

    private betStart: number = 0;
    private betMax: number = 0;
    private value: number = 0;

    private displayValue: number = 0;    
    private valueRange: number = 0;
    private valueStart: number = 0;
    private CONST_BET_STEP = 0.0;
    private bb: number = 0;

    private type: ENUM_BETTING_TYPE = ENUM_BETTING_TYPE.None;
    private cbBet: ( result: any )=>void;

    init( cbBet: (resutlt: any)=>void ) {
        if ( cbBet != null ) {
            this.cbBet = cbBet;
        }

        this.labelDisplayValue.string = '-';
        this.labelBetValue.string = '-';
        this.labelRaiseValue.string = '-';

		const sliderEventHandler = new EventHandler();
		sliderEventHandler.target = this.node;
		sliderEventHandler.component = "UiBettingControl";
		sliderEventHandler.handler = "onSliderChangeBetValue";
		sliderEventHandler.customEventData = "???";
		this.sliderBetting?.slideEvents.push( sliderEventHandler );

        this.buttonMinus.node.off('click');
        this.buttonMinus.node.on('click', this.onCLICK_MINUS.bind( this ));
        
        this.buttonPlus.node.off('click');
        this.buttonPlus.node.on('click', this.onCLICK_PLUS.bind( this ));

        this.buttonBet.node.off('click');
        this.buttonBet.node.on('click', this.onCLICK_BET.bind( this ));
        this.buttonBet.node.active = false;

        this.buttonRaise.node.off('click');
        this.buttonRaise.node.on('click', this.onCLICK_RAISE.bind( this ));
        this.buttonRaise.node.active = false;

        this.sliderBetting.progress = 0.0;
        this.node.active = true;
    }

    public Set( isBet: boolean, minBet: number, minRaise: number, chips: number ) {

        if ( isBet == true ) {
            this.type = ENUM_BETTING_TYPE.Bet;
            this.buttonBet.node.active = true;
            this.buttonRaise.node.active = false;

            this.betStart = minBet;
            this.value = this.betStart;

            this.labelBetValue.string = CommonUtil.getKoreanNumber( this.value );
            this.labelDisplayValue.string = CommonUtil.getKoreanNumber( this.value );
        } else {
            this.type = ENUM_BETTING_TYPE.Raise;
            this.buttonBet.node.active = false;            
            this.buttonRaise.node.active = true;

            this.betStart = minRaise;
            this.value = this.betStart;

            this.labelRaiseValue.string = CommonUtil.getKoreanNumber( this.value );
            this.labelDisplayValue.string = CommonUtil.getKoreanNumber( this.value );
        }
    }

    public show( sb: number, bb: number, type: ENUM_BETTING_TYPE, valueStart: number, valueRange: number, pot: number, chips: number , cbBet: ( result: any )=> void ) {
        this.type = type;

        if ( cbBet != null ) {
            this.cbBet = cbBet;
        }

        this.valueStart = Math.min(valueStart, valueRange) ;
        this.valueRange = chips;

        // this.labelMaxValue.string = CommonUtil.getKoreanNumber( valueRange );

        let result: number = 0;
        result = pot;
        result = Math.max( result, this.valueStart );
        result = Math.min( result, this.valueRange);
        // this.labelFullValue.string = CommonUtil.getKoreanNumber(result);

        result = Math.floor(pot * 0.5);
        result = Math.max( result, this.valueStart );
        result = Math.min( result, this.valueRange);
        // this.labelHalfValue.string = CommonUtil.getKoreanNumber(result);

        result = Math.floor(pot * 0.25);
        result = Math.max( result, this.valueStart );
        result = Math.min( result, this.valueRange);
        // this.labelQuaterValue.string = CommonUtil.getKoreanNumber(result);

        this.setRatio(0);
        this.node.active = true;
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

    private onSliderChangeBetValue( slider: Slider ) {
        // this.setRatio( slider.progress );
	}

    hide() {
        this.node.active = false;
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

    private onCLICK_PLUS( button: Button ) {

    }

    private onCLICK_MINUS( button: Button ) {

    }

    private onCLICK_BET( button: Button ) {
        if ( this.cbBet != null ) {
            this.cbBet({
                type: this.type,
                value: this.value
            });
        }
    }

    private onCLICK_RAISE( button: Button ) {
        if ( this.cbBet != null ) {
            this.cbBet({
                type: this.type,
                value: this.value
            });
        }
    }
}


