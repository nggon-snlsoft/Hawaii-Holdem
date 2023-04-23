import { _decorator, Component, Node, Button, Label, Slider, EventHandler, sys } from 'cc';
import { CommonUtil } from './CommonUtil';
import { ENUM_BETTING_KIND, ENUM_BETTING_TYPE, UiBettingControl } from './Game/UiBettingControl';
import { ENUM_DEVICE_TYPE, GameManager } from './GameManager';
import { AudioController } from './Game/AudioController';
import { ENUM_BET_SOUND, ENUM_CARD_TYPE } from './HoldemDefines';
const { ccclass, property } = _decorator;

@ccclass('UiPlayerAction')
export class UiPlayerAction extends Component {
	@property (Node) NodeNativeContoller: Node = null;
	// @property (Node) NodeMobileContoller: Node = null;
	
	private uiBettingControl: UiBettingControl = null;

	private nodeRoot: Node = null;

	private isChildRegistered: boolean = false;

	private buttonFold: Button = null;    
	private buttonCheck: Button = null;

	private buttonCall: Button = null;

	private buttonBet: Button = null;
	private labelBet: Label = null;

	private buttonRaise: Button = null;
	private labelRaise: Label = null;

	private buttonConfirm: Button = null;

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




	// private numberTurnBet: number = 0;
	// private numberMyBet: number = 0;
	// private numberMyChips: number = 0;
	// private numberPot: number = 0;
	// private numberBetMin: number = 0;
	// private numberRaiseMin: number = 0;
	// private numberBetStart: number = 0;
	// private numberRaiseStart: number = 0;
	// private numberBetRange: number = 0;
	// private numberRaiseRange: number = 0;
	// private numberBetDisplayValue: number = 0;
	// private numberRaiseDisplayValue: number = 0;

	private buttonQuater: Button = null;
	private buttonHalf: Button = null;
	private buttonFull: Button = null;
	private buttonMax: Button = null;

	private labelCallValue: Label = null;
	private labelQuaterValue: Label = null;
	private labelHalfValue: Label = null;
	private labelFullValue: Label = null;
	private labelMaxValue: Label = null;

	private quaterValue: number = 0;
	private halfValue: number = 0;
	private fullValue: number = 0;
	private maxValue: number = 0;
	private betType: ENUM_BETTING_TYPE = ENUM_BETTING_TYPE.None;

	private sb: number = 0;
	private bb: number = 0;

	private rotateType: ENUM_DEVICE_TYPE = ENUM_DEVICE_TYPE.MOBILE_PORTRAIT;

	cbFold: () => void = null;
	cbCall: ( betValue: number) => void = null;
	cbCheck: () => void = null;
	cbBet: ( betValue: number, sound: ENUM_BET_SOUND ) => void = null;
	cbRaise: ( betValue: number, sound: ENUM_BET_SOUND ) => void = null;
	cbAllIn: ( betValue: number ) => void = null;
	cbBetAnnounce: ( kind: ENUM_BETTING_KIND )=> void = null;

    childRegistered() {
		if( true == this.isChildRegistered ) {
			return;
		}

		this.isChildRegistered = true;
		this.nodeRoot = this.NodeNativeContoller;

		this.buttonFold = this.nodeRoot.getChildByPath( "BUTTON_FOLD" )?.getComponent( Button );
		this.buttonFold?.node.on( "click", this.onClickFold.bind( this ), this );

		this.buttonCheck = this.nodeRoot.getChildByPath( "BUTTON_CHECK" )?.getComponent( Button );
		this.buttonCheck?.node.on( "click", this.onClickCheck.bind( this ), this );

		this.buttonCall = this.nodeRoot.getChildByPath( "BUTTON_CALL" )?.getComponent( Button );
		this.buttonCall?.node.on( "click", this.onClickCall.bind( this ), this );
		this.labelCallValue = this.buttonCall.node.getChildByPath('LABEL_VALUE').getComponent( Label );

		this.buttonBet = this.nodeRoot.getChildByPath( "BUTTON_BET" )?.getComponent( Button );
		this.buttonBet?.node.on( "click", this.onClickBet.bind( this ), this );
		this.labelBet = this.buttonBet.node.getChildByPath( "Label" )?.getComponent( Label );

		this.buttonRaise = this.nodeRoot.getChildByPath( "BUTTON_RAISE" )?.getComponent( Button );
		this.buttonRaise?.node.on( "click", this.onClickRaise.bind( this ), this );
		this.labelRaise = this.buttonRaise.node.getChildByPath( "Label" )?.getComponent( Label );

		this.buttonConfirm = this.nodeRoot.getChildByPath( "BUTTON_CONFIRM" )?.getComponent( Button );
		this.buttonConfirm.node.on('click', this.onClickConfirm.bind(this) );
		this.buttonConfirm.node.active = false;

		this.buttonAllIn = this.nodeRoot.getChildByPath( "BUTTON_ALLIN" )?.getComponent( Button );
		this.buttonAllIn?.node.on( "click", this.onClickAllin.bind( this ), this );

		let info = GameManager.Instance().GetInfo();
		this.rotateType = info.device;
		if ( this.rotateType == ENUM_DEVICE_TYPE.PC_LANDSCAPE ) {
			this.buttonQuater = this.nodeRoot.getChildByPath('BUTTON_QUATER').getComponent( Button );
			if ( this.buttonQuater != null ) {
				this.buttonQuater.node.on( 'click', this.onClickQuater.bind( this ), this );
				this.buttonQuater.node.active = false;
			}

			this.buttonHalf = this.nodeRoot.getChildByPath('BUTTON_HALF').getComponent( Button );
			if ( this.buttonHalf != null ) {
				this.buttonHalf.node.on( 'click', this.onClickHalf.bind( this ), this );
				this.buttonHalf.node.active = false;
			}

			this.buttonFull = this.nodeRoot.getChildByPath('BUTTON_FULL').getComponent( Button );
			if ( this.buttonFull != null ) {
				this.buttonFull.node.on( 'click', this.onClickFull.bind( this ), this );
				this.buttonFull.node.active = false;
			}

			this.buttonMax = this.nodeRoot.getChildByPath('BUTTON_MAX').getComponent( Button );
			if ( this.buttonMax != null ) {
				this.buttonMax.node.on( 'click', this.onClickMax.bind( this ), this );
				this.buttonMax.node.active = false;
			}			

			this.labelQuaterValue = this.nodeRoot.getChildByPath('BUTTON_QUATER/LABEL_VALUE').getComponent( Label );
			if ( this.labelQuaterValue != null ) {
				this.labelQuaterValue.string = '';
				this.labelQuaterValue.node.active = false;
			}

			this.labelHalfValue = this.nodeRoot.getChildByPath('BUTTON_HALF/LABEL_VALUE').getComponent( Label );
			if ( this.labelHalfValue != null ) {
				this.labelHalfValue.string = '';
				this.labelHalfValue.node.active = false;
			}

			this.labelFullValue = this.nodeRoot.getChildByPath('BUTTON_FULL/LABEL_VALUE').getComponent( Label );
			if ( this.labelFullValue != null ) {
				this.labelFullValue.string = '';
				this.labelFullValue.node.active = false;
			}

			this.labelMaxValue = this.nodeRoot.getChildByPath('BUTTON_MAX/LABEL_VALUE').getComponent( Label );
			if ( this.labelMaxValue != null ) {
				this.labelMaxValue.string = '';
				this.labelMaxValue.node.active = false;
			}
		}

		this.uiBettingControl = this.nodeRoot.getChildByPath('BETTING_CONTROL').getComponent(UiBettingControl);		
		if ( this.uiBettingControl != null ) {
			this.uiBettingControl.init();
		}

		this.nodeRoot.active = true;
	}

	onLoad() {
		this.childRegistered();
	}

	init( sb: number, bb: number ) {		
		this.sb = sb;
		this.bb = bb;
	}
    
	show( minBet: number, turnBet: number, minRaise: number, pot: number, myBet: number, myChips: number, maxChips:number, isLast : boolean, hasAction: boolean) {
		this.childRegistered();

		this.quaterValue  = 0;
		this.halfValue = 0;
		this.fullValue = 0;
		this.maxValue = 0;
		this.betType =  ENUM_BETTING_TYPE.None;

		this.uiBettingControl.hide();
		this.buttonConfirm.node.active = false;

		this.betMin = minBet;
		this.turnBet = turnBet;
		this.myBet = myBet;
		this.myChips = myChips;
		this.pot = pot;
		this.maxChips = maxChips;

		this.callValue = 0;

		if ( this.turnBet != 0 && this.myChips < 0 ) {
			this.buttonFold.node.active = false;
			this.buttonAllIn.node.active = false;

			this.buttonCheck.node.active = false;
			this.buttonCall.node.active = true;
			this.labelCallValue.string = '';

			this.buttonBet.node.active = false;
			this.buttonRaise.node.active = false;
			return;
		}

		this.buttonFold.node.active = true;
		if ( (this.turnBet == this.myBet) && ( hasAction == true ) ) {
			this.buttonCheck.node.active = true;
		} else {
			this.buttonCheck.node.active = false;
		}

		this.callValue = this.turnBet - this.myBet;

		if ( this.callValue > 0 ) {
			this.buttonCall.node.active = true;
		} else {
			this.buttonCall.node.active = false;
		}

		if ( this.buttonCall.node.active == true ) {
			if ( this.callValue >= this.myChips ) {
				this.buttonCall.node.active = false;
			} else {
				this.labelCallValue.string = CommonUtil.getKoreanNumber( this.callValue );
			}	
		}

		if ( this.rotateType == ENUM_DEVICE_TYPE.MOBILE_PORTRAIT ) {

			// this.buttonBet.node.active = ( 0 == turnBet );

			// this.numberBetStart = 0 == turnBet ? this.numberBetMin : turnBet * 2;
			// this.numberRaiseStart = 0 == turnBet ? this.numberRaiseMin : turnBet * 2;
	
			// this.numberBetRange = myChips;
			// this.numberRaiseRange = myChips;

			// this.buttonRaise.node.active = (0 != turnBet && this.numberRaiseRange >= 0) && false === isLast && true == hasAction;
			// this.buttonAllIn.node.active = (0 != turnBet && turnBet >= this.numberBetRange );

			// if (isLast == true) {
			// 	if (this.buttonCall.node.active == true) {
			// 		this.buttonAllIn.node.active = false;
			// 	}
			// }
	
			// if (hasAction == false) {
			// 	if ( this.buttonCall.node.active == true ) {
			// 		this.buttonAllIn.node.active = false;
			// 	}
			// }
	
			// if ( this.buttonAllIn.node.active == true ) {
			// 	this.buttonRaise.node.active = false;
			// 	this.buttonBet.node.active = false;
			// }

		} else {
			this.buttonBet.node.active = false;
			this.buttonRaise.node.active = false;
			this.buttonConfirm.node.active = false;

			if ( this.turnBet == 0 ) {
				this.betStart = this.betMin;
			} else {
				this.betStart = this.turnBet * 2;
			}

			this.betRange = Math.min( this.myChips, this.maxChips );

			if ( this.turnBet != 0 && this.turnBet >= this.betRange ) {
				this.buttonAllIn.node.active = true;
			} else {
				this.buttonAllIn.node.active = false;
			}
	
			if ( this.buttonAllIn.node.active == true ) {

				this.buttonQuater.node.active = false;
				this.buttonHalf.node.active = false;
				this.buttonFull.node.active = false;
				this.buttonMax.node.active = false;
				
			} else {

				let quater: number = 0;
				let half: number = 0;
				let full: number = 0;
				let max: number = 0;

				let currentPot = this.pot + this.callValue;
				quater = Math.floor( currentPot * 0.25 );
				half = Math.floor( currentPot * 0.5 );
				full = Math.floor( currentPot * 1.0 );
				max = this.betRange;

				this.quaterValue  = quater + this.callValue;
				this.halfValue = half + this.callValue;
				this.fullValue = full + this.callValue;
				this.maxValue = max + this.callValue;

				if ( this.isBet == true ) {
					this.betType = ENUM_BETTING_TYPE.Bet;
				} else {
					this.betType = ENUM_BETTING_TYPE.Raise;
				}

				this.labelQuaterValue.string = CommonUtil.getKoreanNumber( this.quaterValue );
				this.labelHalfValue.string = CommonUtil.getKoreanNumber( this.halfValue  );
				this.labelFullValue.string = CommonUtil.getKoreanNumber( this.fullValue );
				this.labelMaxValue.string = CommonUtil.getKoreanNumber( this.maxValue );

				this.labelQuaterValue.node.active = true;
				this.labelHalfValue.node.active = true;
				this.labelFullValue.node.active = true;
				this.labelMaxValue.node.active = true;

				this.buttonQuater.node.active = true;
				this.buttonHalf.node.active = true;
				this.buttonFull.node.active = true;
				this.buttonMax.node.active = true;				
			}

			if ( isLast == true ) {
				console.log('isLast == true');

				if (this.buttonCall.node.active == true) {
					this.buttonAllIn.node.active = false;

					this.buttonQuater.node.active = false;
					this.buttonHalf.node.active = false;
					this.buttonFull.node.active = false;
					this.buttonMax.node.active = false;
				}
			}
	
			if ( hasAction == false ) {
				console.log('hasAction == false');				

				if ( this.buttonCall.node.active == true ) {
					this.buttonAllIn.node.active = false;
				}
			}
		}
		
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
		if ( this.buttonCall.node.active == false ) {
			value = this.turnBet - this.myBet;
			if ( value > this.maxChips ) {
				value = this.myChips;
			}
			value = value + this.myChips;
			this.cbCall ( value );

		} else {
			this.cbAllIn( value );
		}
	}

    private onClickBet() {

		// this.buttonBet.node.active = false;
		// this.buttonConfirm.node.active = true;

		// this.uiBettingControl.show( this.sb, this.bb, ENUM_BETTING_TYPE.Bet, this.numberBetStart, this.numberBetRange, 
		// 	this.numberPot, this.numberMyChips, ( result: any )=>{

		// 		let sendValue = result.value + this.numberMyBet;
		// 		this.cbBet( sendValue );


		// 	} );
	}

    private onClickRaise() {

		// this.buttonRaise.node.active = false;
		// this.buttonConfirm.node.active = true;

		// this.uiBettingControl.show( this.sb, this.bb, ENUM_BETTING_TYPE.Raise, this.numberRaiseStart, this.numberRaiseRange, 
		// 	this.numberPot, this.numberMyChips, (result: any )=>{

		// 		let sendValue = result.value + this.numberMyBet;
		// 		this.cbRaise( sendValue );

		// 	} );
	}

	private onClickConfirm( button: Button ) {
		// let res = this.uiBettingControl.getResult();
		// let sendValue = res.result + this.numberMyBet;

		// if ( res.type == ENUM_BETTING_TYPE.Bet ) {
		// 	this.cbBet( sendValue );

		// } else if ( res.type == ENUM_BETTING_TYPE.Raise ) {
		// 	this.cbRaise( sendValue );
		// }
		// else {
		// 	console.log('error bet')
		// }
	}

	private onClickCheck() {
		this.cbCheck();
	}

	private onClickQuater( button: Button ) {
		let value = this.quaterValue + this.myBet;
		if ( this.isBet == true ) {
			this.cbBet( value, ENUM_BET_SOUND.BET_QUATER );
		} else {
			this.cbRaise( value, ENUM_BET_SOUND.BET_QUATER  );
		}
	}

	private onClickHalf( button: Button ) {
		let value = this.halfValue + this.myBet;
		if ( this.isBet == true ) {
			this.cbBet( value, ENUM_BET_SOUND.BET_HALF );
		} else {
			this.cbRaise( value, ENUM_BET_SOUND.BET_HALF );
		}
	}

	private onClickFull( button: Button ) {
		let value = this.fullValue + this.myBet;
		if ( this.isBet == true ) {
			this.cbBet( this.fullValue, ENUM_BET_SOUND.BET_FULL  );
		}  else {
			this.cbRaise( this.fullValue, ENUM_BET_SOUND.BET_FULL );
		}

		AudioController.instance.PlaySound('VOICE_BETTING_FULL');		
		// this.cbBetAnnounce( ENUM_BETTING_KIND.FULL );
	}

	private onClickMax( button: Button ) {
		let value = this.betRange + this.myBet;
		if ( this.isBet == true ) {
			this.cbBet( value, ENUM_BET_SOUND.BET_MAX );

		} else {
			this.cbRaise( value, ENUM_BET_SOUND.BET_MAX );
		}

		AudioController.instance.PlaySound('VOICE_ACTION_ALLIN');				
		// this.cbBetAnnounce( ENUM_BETTING_KIND.MAX );
	}
}