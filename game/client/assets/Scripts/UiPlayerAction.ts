import { _decorator, Component, Node, Button, Label, Slider, EventHandler, sys } from 'cc';
import { CommonUtil } from './CommonUtil';
import { ENUM_BETTING_TYPE, UiBettingControl } from './Game/UiBettingControl';
import { AudioController } from './Game/AudioController';
import { ENUM_BET_SOUND, ENUM_CARD_TYPE, ENUM_DEVICE_TYPE } from './HoldemDefines';
const { ccclass, property } = _decorator;

export enum ENUM_BETTING_KIND {
    NONE = 0,
    MAX = 1,
    FULL = 2,
    HALF = 3,
    QUATER = 4,
}

@ccclass('UiPlayerAction')
export class UiPlayerAction extends Component {
	@property(UiBettingControl) uiBettingControl: UiBettingControl = null;

	private isChildRegistered: boolean = false;
	private buttonFold: Button = null;    
	private buttonCheck: Button = null;
	private buttonCall: Button = null;

	private buttonAllIn: Button = null;

	private turnBet: number = 0;
	private myBet: number = 0;
	private myChips: number = 0;
	private pot: number = 0;
	private betMin: number = 0;
	private betStart: number = 0;
	private betRange: number = 0;
	private callValue: number = 0;
	private isBet: boolean = false;
	private maxChips: number = 0;

	private buttonQuater: Button = null;
	private buttonHalf: Button = null;
	private buttonFull: Button = null;
	private buttonMax: Button = null;

	private buttonCallDisable: Button = null;
	private buttonQuaterDisable: Button = null;
	private buttonHalfDisable: Button = null;
	private buttonFullDisable: Button = null;

	private labelCallValue: Label = null;
	private labelQuaterValue: Label = null;
	private labelHalfValue: Label = null;
	private labelFullValue: Label = null;
	private labelMaxValue: Label = null;

	private labelCallDisableValue: Label = null;
	private labelQuaterDisableValue: Label = null;
	private labelHalfDisableValue: Label = null;
	private labelFullDisableValue: Label = null;

	private quaterValue: number = 0;
	private halfValue: number = 0;
	private fullValue: number = 0;
	private maxValue: number = 0;
	private betType: ENUM_BETTING_TYPE = ENUM_BETTING_TYPE.None;

	private sb: number = 0;
	private bb: number = 0;

	cbFold: () => void = null;
	cbCall: ( betValue: number ) => void = null;
	cbCheck: () => void = null;
	cbBet: ( betValue: number, callValue:number, sound: ENUM_BET_SOUND ) => void = null;
	cbRaise: ( betValue: number, callValue: number, sound: ENUM_BET_SOUND ) => void = null;
	cbAllIn: ( betValue: number, callValue: number ) => void = null;
	cbBetAnnounce: ( kind: ENUM_BETTING_KIND )=> void = null;

    childRegistered() {
		if( true == this.isChildRegistered ) {
			return;
		}

		this.isChildRegistered = true;

		this.buttonFold = this.node.getChildByPath( "BUTTON_FOLD" )?.getComponent( Button );
		this.buttonFold?.node.on( "click", this.onClickFold.bind( this ), this );

		this.buttonCheck = this.node.getChildByPath( "BUTTON_CHECK" )?.getComponent( Button );
		this.buttonCheck?.node.on( "click", this.onClickCheck.bind( this ), this );

		this.buttonCall = this.node.getChildByPath( "BUTTON_CALL" )?.getComponent( Button );
		this.buttonCall?.node.on( "click", this.onClickCall.bind( this ), this );
		this.labelCallValue = this.buttonCall.node.getChildByPath('LABEL_VALUE').getComponent( Label );

		this.buttonAllIn = this.node.getChildByPath( "BUTTON_ALLIN" )?.getComponent( Button );
		this.buttonAllIn?.node.on( "click", this.onClickAllin.bind( this ), this );

		this.buttonQuater = this.node.getChildByPath('BUTTON_QUATER').getComponent( Button );
		if ( this.buttonQuater != null ) {
			this.buttonQuater.node.off('click');
			this.buttonQuater.node.on( 'click', this.onClickQuater.bind( this ), this );
			this.buttonQuater.node.active = false;
		}

		this.buttonHalf = this.node.getChildByPath('BUTTON_HALF').getComponent( Button );
		if ( this.buttonHalf != null ) {
			this.buttonHalf.node.off('click');				
			this.buttonHalf.node.on( 'click', this.onClickHalf.bind( this ), this );
			this.buttonHalf.node.active = false;
		}

		this.buttonFull = this.node.getChildByPath('BUTTON_FULL').getComponent( Button );
		if ( this.buttonFull != null ) {
			this.buttonFull.node.off('click');
			this.buttonFull.node.on( 'click', this.onClickFull.bind( this ), this );
			this.buttonFull.node.active = false;
		}

		this.buttonMax = this.node.getChildByPath('BUTTON_MAX').getComponent( Button );
		if ( this.buttonMax != null ) {
			this.buttonMax.node.off('click');
			this.buttonMax.node.on( 'click', this.onClickMax.bind( this ), this );
			this.buttonMax.node.active = false;
		}

		this.labelQuaterValue = this.node.getChildByPath('BUTTON_QUATER/LABEL_VALUE').getComponent( Label );
		if ( this.labelQuaterValue != null ) {
			this.labelQuaterValue.string = '';
			this.labelQuaterValue.node.active = false;
		}

		this.labelHalfValue = this.node.getChildByPath('BUTTON_HALF/LABEL_VALUE').getComponent( Label );
		if ( this.labelHalfValue != null ) {
			this.labelHalfValue.string = '';
			this.labelHalfValue.node.active = false;
		}

		this.labelFullValue = this.node.getChildByPath('BUTTON_FULL/LABEL_VALUE').getComponent( Label );
		if ( this.labelFullValue != null ) {
			this.labelFullValue.string = '';
			this.labelFullValue.node.active = false;
		}

		this.labelMaxValue = this.node.getChildByPath('BUTTON_MAX/LABEL_VALUE').getComponent( Label );
		if ( this.labelMaxValue != null ) {
			this.labelMaxValue.string = '';
			this.labelMaxValue.node.active = false;
		}

		this.buttonCallDisable = this.node.getChildByPath('BUTTON_CALL_DISABLE').getComponent( Button );
		if ( this.buttonCallDisable != null ) {
			this.buttonCallDisable.interactable = false;
			this.buttonCallDisable.node.active = false;
		}

		this.buttonQuaterDisable = this.node.getChildByPath('BUTTON_QUATER_DISABLE').getComponent( Button );
		if ( this.buttonQuaterDisable != null ) {
			this.buttonQuaterDisable.interactable = false;
			this.buttonQuaterDisable.node.active = false;
		}

		this.buttonHalfDisable = this.node.getChildByPath('BUTTON_HALF_DISABLE').getComponent( Button );
		if ( this.buttonHalfDisable != null ) {
			this.buttonHalfDisable.interactable = false;
			this.buttonHalfDisable.node.active = false;
		}

		this.buttonFullDisable = this.node.getChildByPath('BUTTON_FULL_DISABLE').getComponent( Button );
		if ( this.buttonFullDisable != null ) {
			this.buttonFullDisable.interactable = false;
			this.buttonFullDisable.node.active = false;
		}

		this.labelCallDisableValue = this.node.getChildByPath('BUTTON_CALL_DISABLE/LABEL_VALUE').getComponent( Label );
		if ( this.labelCallDisableValue != null ) {
			this.labelCallDisableValue.string = '-';
			this.labelCallDisableValue.node.active = true;
		}

		this.labelQuaterDisableValue = this.node.getChildByPath('BUTTON_QUATER_DISABLE/LABEL_VALUE').getComponent( Label );
		if ( this.labelQuaterDisableValue != null ) {
			this.labelQuaterDisableValue.string = '';
			this.labelQuaterDisableValue.node.active = false;
		}

		this.labelHalfDisableValue = this.node.getChildByPath('BUTTON_HALF_DISABLE/LABEL_VALUE').getComponent( Label );
		if ( this.labelHalfDisableValue != null ) {
			this.labelHalfDisableValue.string = '';
			this.labelHalfDisableValue.node.active = false;
		}

		this.labelFullDisableValue = this.node.getChildByPath('BUTTON_FULL_DISABLE/LABEL_VALUE').getComponent( Label );
		if ( this.labelFullDisableValue != null ) {
			this.labelFullDisableValue.string = '';
			this.labelFullDisableValue.node.active = false;
		}

		this.node.active = true;
	}

	onLoad() {		
		this.childRegistered();
	}

	init( sb: number, bb: number ) {		
		this.sb = sb;
		this.bb = bb;

		this.uiBettingControl.init( this.sb, this.bb, this.onCLICK_BETTING.bind(this) );
	}
    
	show( msg: any, minBet: number ) {
		this.childRegistered();

		this.betMin = minBet;
		this.turnBet = msg[ "maxBet" ];
		this.myBet = msg[ "currBet" ];
		this.myChips = msg['chips'];
		this.pot = msg['currPot'];
		this.maxChips = msg['maxChip'];
		let minRaise = msg['minRaise'];

		let hasAction = msg['action'];
		let isLast = msg['isLast'];
		let allin: boolean = false;
		let allinCall: boolean = false;

		this.quaterValue  = 0;
		this.halfValue = 0;
		this.fullValue = 0;
		this.maxValue = 0;
		this.betType =  ENUM_BETTING_TYPE.None;
		this.callValue = 0;

		this.buttonQuaterDisable.node.active = false;
		this.buttonHalfDisable.node.active = false;
		this.buttonFullDisable.node.active = false;
		this.buttonAllIn.node.active = false;

		if ( this.turnBet != 0 && this.myChips < 0 ) {
			this.buttonFold.node.active = false;

			this.buttonCheck.node.active = false;
			this.buttonCall.node.active = true;
			this.buttonCallDisable.node.active = false;

			this.labelCallValue.string = '0';
			return;
		}

		this.buttonFold.node.active = true;

		if ( (this.turnBet == this.myBet) && ( hasAction == true ) ) {
			this.buttonCheck.node.active = true;

			this.buttonCall.node.active = false;
			this.buttonCallDisable.node.active = false;
		} else {
			this.buttonCheck.node.active = false;
		}

		this.callValue = this.turnBet - this.myBet;
		this.labelCallValue.string = CommonUtil.getKoreanNumber( this.callValue );
		this.labelCallDisableValue.string = CommonUtil.getKoreanNumber( this.callValue );		

		if ( this.callValue > 0 ) {
			this.buttonCall.node.active = true;
			this.buttonCallDisable.node.active = false;

			this.buttonCheck.node.active = false;

			this.isBet = false;
		} else {
			this.buttonCall.node.active = false;
			this.buttonCallDisable.node.active = false;
			this.buttonCheck.node.active = true;
			this.isBet = true;
		}

		if ( this.buttonCall.node.active == true ) {
			if ( this.callValue >= this.myChips ) {
				this.buttonCall.node.active = false;
				this.buttonCallDisable.node.active = true;

				allin = true;
				allinCall = true;
			} 
		}

		if ( this.turnBet == 0 ) {
			this.betStart = this.callValue + this.betMin;
		} else {
			this.betStart = this.callValue + minRaise;
		}

		this.betRange = this.myChips;

		if ( this.turnBet != 0 && this.turnBet >= this.betRange ) {
			allin = true;
		} else {
			allin = false;
		}

		let quater: number = 0;
		let half: number = 0;
		let full: number = 0;

		let currentPot = this.pot + this.callValue;
		quater = Math.floor( currentPot * 0.25 );
		half = Math.floor( currentPot * 0.5 );
		full = Math.floor( currentPot * 1.0 );

		this.quaterValue  = quater + this.callValue;
		this.halfValue = half + this.callValue;
		this.fullValue = full + this.callValue;

		this.maxValue = this.maxChips;

		if ( this.isBet == true ) {
			this.betType = ENUM_BETTING_TYPE.Bet;
		} else {
			this.betType = ENUM_BETTING_TYPE.Raise;
		}

		this.labelQuaterValue.string = CommonUtil.getKoreanNumber( this.quaterValue );
		this.labelHalfValue.string = CommonUtil.getKoreanNumber( this.halfValue  );
		this.labelFullValue.string = CommonUtil.getKoreanNumber( this.fullValue );

		this.labelQuaterDisableValue.string = CommonUtil.getKoreanNumber( this.quaterValue );
		this.labelHalfDisableValue.string = CommonUtil.getKoreanNumber( this.halfValue  );
		this.labelFullDisableValue.string = CommonUtil.getKoreanNumber( this.fullValue );

		this.labelMaxValue.string = CommonUtil.getKoreanNumber( this.maxValue - this.myBet );

		if ( allin == true ) {
			this.buttonQuater.node.active = false;
			this.buttonHalf.node.active = false;
			this.buttonFull.node.active = false;

			this.buttonQuaterDisable.node.active = true;
			this.buttonHalfDisable.node.active = true;
			this.buttonFullDisable.node.active = true;
			
		} else {

			let m = this.maxValue - this.myBet;
			if ( this.quaterValue > m ) {
				this.labelQuaterValue.node.active = false;
				this.buttonQuater.node.active = false;

				this.labelQuaterDisableValue.node.active = true;
				this.buttonQuaterDisable.node.active = true;
			} else {
				this.labelQuaterValue.node.active = true;
				this.buttonQuater.node.active = true;

				this.labelQuaterDisableValue.node.active = false;
				this.buttonQuaterDisable.node.active = false;
			}

			if ( this.halfValue > m ) {
				this.labelHalfValue.node.active = false;
				this.buttonHalf.node.active = false;

				this.labelHalfDisableValue.node.active = true;
				this.buttonHalfDisable.node.active = true;
			} else {
				this.labelHalfValue.node.active = true;
				this.buttonHalf.node.active = true;

				this.labelHalfDisableValue.node.active = false;
				this.buttonHalfDisable.node.active = false;
			}

			if ( this.fullValue > m ) {
				this.labelFullValue.node.active = false;
				this.buttonFull.node.active = false;

				this.labelFullDisableValue.node.active = true;
				this.buttonFullDisable.node.active = true;
			} else {
				this.labelFullValue.node.active = true;
				this.buttonFull.node.active = true;

				this.labelFullDisableValue.node.active = false;
				this.buttonFullDisable.node.active = false;
			}

			this.labelMaxValue.node.active = true;
		}

		if ( isLast == true ) {

			if (this.buttonCall.node.active == true) {
				this.buttonCallDisable.node.active = false;

				allin = false;

				this.buttonQuater.node.active = false;
				this.buttonHalf.node.active = false;
				this.buttonFull.node.active = false;

				this.buttonQuaterDisable.node.active = true;
				this.buttonHalfDisable.node.active = true;
				this.buttonFullDisable.node.active = true;
			}
		}

		if ( hasAction == false ) {
			if ( this.buttonCall.node.active == true ) {
				this.buttonCallDisable.node.active = false;				
				allin = false;
			}
		}

		if ( allin = true ) {
			if ( this.maxValue >= this.betRange ) {
				this.buttonMax.node.active = false;
				this.buttonAllIn.node.active = true;
			} else {
				this.betRange = this.maxValue;				
				this.buttonMax.node.active = true;
				this.buttonAllIn.node.active = false;
			}

			if ( allinCall == true ) {
				this.buttonAllIn.node.active = true;				
				this.buttonMax.node.active = false;
			}

		} else {
			this.buttonMax.node.active = false;
			this.buttonAllIn.node.active = false;
		}

		if ( this.maxValue <= 0 ) {
			this.buttonMax.node.active = false;			
		}

		let enable = true;
		if ( this.betStart > this.myChips || this.betRange <= 0 || this.betRange <= this.betStart ) {
			enable = false;
		}

		if ( this.buttonQuater.node.active == true ) {
			if ( this.quaterValue < this.betStart ) {
				this.buttonQuater.node.active = false;
				this.buttonQuaterDisable.node.active = true;

				this.labelQuaterDisableValue.node.active = true;		
			}
		}

		if ( this.buttonHalf.node.active == true ) {
			if ( this.halfValue < this.betStart ) {
				this.buttonHalf.node.active = false;
				this.buttonQuaterDisable.node.active = true;

				this.labelHalfDisableValue.node.active = true;
			}
		}

		if ( this.buttonFull.node.active == false ) {
			if ( this.fullValue < this.betStart ) {
				this.buttonFull.node.active = false;
				this.buttonFullDisable.node.active = true;

				this.labelFullDisableValue.node.active = true;
			}
		}

		if ( hasAction == false ) {
			this.buttonQuater.node.active = false;
			this.buttonHalf.node.active = false;
			this.buttonFull.node.active = false;

			this.buttonQuaterDisable.node.active = true;
			this.buttonHalfDisable.node.active = true;
			this.buttonFullDisable.node.active = true;

			if ( this.myChips > this.callValue ) {
				this.buttonCall.node.active = true;
				this.buttonCallDisable.node.active = false;
				this.buttonAllIn.node.active = false;

			} else {
				this.buttonCall.node.active = false;
				this.buttonCallDisable.node.active = true;
				this.buttonAllIn.node.active = true;
			}
			enable = false;
		}

		this.uiBettingControl.Set(this.isBet, this.betMin, this.betStart, this.betRange, hasAction, enable );
		this.node.active = true;
	}

	hide() {
		this.node.active = false;
	}    

	private onClickFold() {
		if( null == this.cbFold){
			return;
		}

		this.cbFold();
	}

	private onClickCall() {
		let sendValue = this.callValue;
		if ( sendValue > this.myChips ) {
			sendValue = this.myChips;
		}

		sendValue = sendValue + this.myBet;
		this.cbCall( sendValue );
	}

    private onClickAllin() {
		let value = this.myChips + this.myBet;
		if ( value < this.betStart ) {
			this.cbCall( value );
		} else {
			this.cbAllIn( value, this.callValue );
		}
	}

	private onClickCheck() {
		this.cbCheck();
	}

	private onClickQuater( button: Button ) {
		let value = this.quaterValue + this.myBet;
		if ( this.isBet == true ) {
			this.cbBet( value, this.callValue, ENUM_BET_SOUND.BET_QUATER );
		} else {
			this.cbRaise( value, this.callValue, ENUM_BET_SOUND.BET_QUATER  );
		}
	}

	private onClickHalf( button: Button ) {
		let value = this.halfValue + this.myBet;
		if ( this.isBet == true ) {
			this.cbBet( value, this.callValue, ENUM_BET_SOUND.BET_HALF );
		} else {
			this.cbRaise( value, this.callValue, ENUM_BET_SOUND.BET_HALF );
		}
	}

	private onClickFull( button: Button ) {
		let value = this.fullValue + this.myBet;
		if ( this.isBet == true ) {
			this.cbBet( this.fullValue, this.callValue, ENUM_BET_SOUND.BET_FULL  );
		}  else {
			this.cbRaise( this.fullValue, this.callValue, ENUM_BET_SOUND.BET_FULL );
		}

		// AudioController.instance.PlaySound('VOICE_BETTING_FULL');
	}

	private onClickMax( button: Button ) {
		let value = this.maxValue;
		if ( this.isBet == true ) {
			this.cbBet( value, this.callValue, ENUM_BET_SOUND.BET_MAX );

		} else {
			this.cbRaise( value, this.callValue, ENUM_BET_SOUND.BET_MAX );
		}

		AudioController.instance.PlaySound('VOICE_ACTION_ALLIN');
	}

	private onCLICK_BETTING( result: any ) {
		let value = result.value + this.myBet;
		if ( result.type == ENUM_BETTING_TYPE.Bet ) {
			this.cbBet( value, this.callValue, ENUM_BET_SOUND.BET );
		} else {
			this.cbRaise( value, this.callValue, ENUM_BET_SOUND.RAISE );
		}
	}
}