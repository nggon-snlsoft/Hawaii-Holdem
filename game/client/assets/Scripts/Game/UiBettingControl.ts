import { _decorator, Component, Node, Button, Slider, Label, EventHandler, math, MATH_FLOAT_ARRAY } from 'cc';
import { CommonUtil } from '../CommonUtil';
import { AudioController } from './AudioController';
const { ccclass, property } = _decorator;

export enum ENUM_BETTING_TYPE {
    None,
    call,
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

    @property(Button) buttonMinusDisable: Button = null;
    @property(Button) buttonPlusDisable: Button = null;
    @property(Button) buttonBetDisable: Button = null;
    @property(Button) buttonRaiseDisable: Button = null;
    @property(Node) sliderBettingDisable: Node = null;

    private betStart: number = 0;
    private betRange: number = 0;
    private value: number = 0;
    private betMin: number = 0;
    private sb: number = 0;

    private type: ENUM_BETTING_TYPE = ENUM_BETTING_TYPE.None;
    private cbBet: ( result: any )=>void;

    init( sb: number, bb: number, cbBet: (resutlt: any)=>void ) {
        if ( cbBet != null ) {
            this.cbBet = cbBet;
        }
        this.sb = sb;

        this.labelDisplayValue.string = '-';

		const sliderEventHandler = new EventHandler();
		sliderEventHandler.target = this.node;
		sliderEventHandler.component = "UiBettingControl";
		sliderEventHandler.handler = "onSLIDE_CHANGE";
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

    public Set( isBet: boolean, betMin: number, betStart: number, betRange: number, hasAction: boolean, enable: boolean ) {
        this.betMin = betMin;

        if ( enable == true ) {
            this.onENABLE();

            this.sliderBetting.progress = 0.0;
            this.SetValue( this.sliderBetting.progress );

            if ( isBet == true ) {
                this.type = ENUM_BETTING_TYPE.Bet;
                this.buttonBet.node.active = true;
                this.buttonRaise.node.active = false;
    
                this.betStart = betStart;
                this.betRange = betRange;
                this.value = this.betStart;
            } else {
                this.type = ENUM_BETTING_TYPE.Raise;
                this.buttonBet.node.active = false;            
                this.buttonRaise.node.active = true;
    
                this.betStart = betStart;
                this.betRange = betRange;
                this.value = this.betStart;
            }

            this.buttonMinus.node.active = false;
            this.buttonMinusDisable.node.active = true;
            this.labelDisplayValue.string = CommonUtil.getKoreanNumber( this.value );

        } else {
            this.onDISABLE();
            if ( isBet == true ) {
                this.type = ENUM_BETTING_TYPE.Bet;
                this.buttonBetDisable.node.active = true;
                this.buttonRaiseDisable.node.active = false;
    
                this.betStart = betStart;
                this.betRange = betRange;

                this.value = Math.min(this.betStart, this.betRange );
    
                this.labelDisplayValue.string = CommonUtil.getKoreanNumber( this.value );
            } else {
                this.type = ENUM_BETTING_TYPE.Raise;
                this.buttonBetDisable.node.active = false;            
                this.buttonRaiseDisable.node.active = true;
    
                this.betStart = betStart;
                this.betRange = betRange;
                this.value = this.betStart;
                
                this.labelDisplayValue.string = CommonUtil.getKoreanNumber( this.value );
            }    
        }
    }

    private onENABLE() {
        this.buttonMinusDisable.node.active = false;
        this.buttonPlusDisable.node.active = false;
        this.buttonBetDisable.node.active = false;
        this.buttonRaiseDisable.node.active = false;
        
        this.sliderBettingDisable.active = false;

        this.buttonMinus.node.active = true;
        this.buttonPlus.node.active = true;
        this.buttonBet.node.active = true;
        this.buttonRaise.node.active = true;

        this.sliderBetting.node.active = true;
    }

    private onDISABLE() {
        this.buttonMinus.node.active = false;
        this.buttonPlus.node.active = false;
        this.buttonBet.node.active = false;
        this.buttonRaise.node.active = false;

        this.sliderBetting.node.active = false;

        this.buttonMinusDisable.node.active = true;
        this.buttonPlusDisable.node.active = true;
        this.buttonBetDisable.node.active = true;
        this.buttonRaiseDisable.node.active = true;
        
        this.sliderBettingDisable.active = true;
    }

    private SetValue( ratio: number ) {
        let result = 0;
        if ( ratio <= 0 ) {
            this.sliderBetting.progress = 0.0;
            this.value = this.betStart;

            this.buttonMinus.node.active = false;
            this.buttonMinusDisable.node.active = true;

        } else if ( ratio >= 1.0 ) {
            this.sliderBetting.progress = 1.0;
            this.value = this.betRange;

            this.buttonPlus.node.active = false;
            this.buttonPlusDisable.node.active = true;

        } else {

            result = this.betStart + Math.floor( ratio * (this.betRange - this.betStart) );
            let remain = result % this.sb;
            result -= remain;
            result = Math.max( result, this.betStart );

            this.value = result;
        }

        this.labelDisplayValue.string = CommonUtil.getKoreanNumber( this.value );
        this.SetSlide( this.value );

        if ( this.value > this.betStart ) {
            this.buttonMinus.node.active = true;
            this.buttonMinusDisable.node.active = false;
        }

        if ( this.value < this.betRange ) {
            this.buttonPlus.node.active = true;
            this.buttonPlusDisable.node.active = false;
        }
    }

    private onSLIDE_CHANGE( slider: Slider ) {
        this.SetValue( slider.progress );
	}

    private SetSlide( value: number ) {
        if ( this.betRange - this.betStart <= 0 ) {
            return;
        }

        if ( value - this.betStart <= 0 ) {
            this.sliderBetting.progress = 0.0;
        }
        else {
            this.sliderBetting.progress = ( value - this.betStart ) / ( this.betRange - this.betStart );            
        }
    }

    hide() {
        this.node.active = false;
    }

    private onCLICK_PLUS( button: Button ) {
        this.value += this.betMin;

        if ( this.value >= this.betRange ) {
            this.value = this.betRange;
            this.buttonPlus.node.active = false;
            this.buttonPlusDisable.node.active = true;
        }

        if ( this.value > this.betStart ) {
            this.buttonMinus.node.active = true;
            this.buttonMinusDisable.node.active = false;
        }

        this.labelDisplayValue.string = CommonUtil.getKoreanNumber( this.value );
        this.SetSlide( this.value );
    }

    private onCLICK_MINUS( button: Button ) {
        this.value -= this.betMin;

        if ( this.value <= this.betStart ) {
            this.value = this.betStart;
            this.buttonMinus.node.active = false;
            this.buttonMinusDisable.node.active = true;
        }

        if ( this.value < this.betRange ) {
            this.buttonPlus.node.active = true;
            this.buttonPlusDisable.node.active = false;
        }

        this.labelDisplayValue.string = CommonUtil.getKoreanNumber( this.value );

        this.SetSlide( this.value );
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


