import { _decorator, Component, Node, director, Sprite, Vec3, Label, sys,
    instantiate, bezier, UITransform, tween, SpriteFrame, Color, Quat, Button, ConstantForce} from 'cc';
import { Board } from './Board';
import { NetworkManager } from './NetworkManager';

import * as PokerEvaluator from "./PokerEvaluator";
import { UiEntity } from './UiEntity';
import { UiPlayerAction } from './UiPlayerAction';
import { Pot, UiPot } from './UiPot';
import { UiSeats } from './UiSeats';
import { UiBuyIn} from "./Game/UiBuyIn";
import { UiControls} from "./Game/UiControls";
import { UiGameSystemPopup} from "./Game/UiGameSystemPopup";
import { CommonUtil } from './CommonUtil';
import { AudioController } from './Game/AudioController';
import { ENUM_RESERVATION_TYPE, UiPlayerActionReservation } from './Game/UiPlayerActionReservation';
import { EMOTICON_TYPE, UiGameChatting } from './Game/UiGameChatting';
import { UiWinEffect } from './Game/UiWinEffect';
import { UiPotChips } from './Game/UiPotChips';
import { UiRoundPotValue } from './Game/UiRoundPotValue';
import { ResourceManager } from './ResourceManager';
import { UiShowDownEffect } from './Game/UiShowDownEffect';
import { UiEffectShowRiver } from './Game/UiEffectShowRiver';
import { UiCommunityCards } from './Game/UiCommunityCards';
import { PlayerActionInformation } from './Game/PlayerActionInformation';
import { ENUM_BET_SOUND } from './HoldemDefines';
import { UiPopupGameProfile } from './Game/UiPopupGameProfile';

const { ccclass, property } = _decorator;

let totalCards: string[] = [
	"Ac", "Kc", "Qc", "Jc", "Tc", "9c", "8c", "7c", "6c", "5c", 
	"4c", "3c", "2c", "Ad", "Kd", "Qd", "Jd", "Td", "9d", "8d", 
	"7d", "6d", "5d", "4d", "3d", "2d",	"Ah", "Kh", "Qh", "Jh", 
	"Th", "9h", "8h", "7h", "6h", "5h", "4h", "3h", "2h", "As", 
	"Ks", "Qs", "Js", "Ts", "9s", "8s", "7s", "6s", "5s", "4s",
	"3s", "2s" ];

const GAME_STATE_SUSPEND: number = 0;
const GAME_STATE_READY: number = 1;
const GAME_STATE_PREPARE: number = 2;
const GAME_STATE_PREFLOP: number = 3;
const GAME_STATE_BET: number = 4;
const GAME_STATE_FLOP: number = 5;
const GAME_STATE_TURN: number = 6;
const GAME_STATE_RIVER: number = 7;
const GAME_STATE_RESULT: number = 8;
const GAME_STATE_SHOWDOWN: number = 9;
const GAME_STATE_CLEAR: number = 10;

const SHOWDOWN_NONE: number = 0;
const SHOWDOWN_START: number = 1;
const SHOWDOWN_FLOP: number = 2;
const SHOWDOWN_TURN: number = 3;
const SHOWDOWN_RIVER: number = 4;
const SHOWDOWN_END: number = 5;

@ccclass('UiTable')
export class UiTable extends Component {
    @property(UiSeats) uiSeats: UiSeats = null;
	@property(UiPot) uiPot : UiPot = null;
	@property(UiBuyIn) uiBuyIn: UiBuyIn = null;
	@property(UiPopupGameProfile) uiProfile: UiPopupGameProfile = null;	
	@property(UiPlayerActionReservation) uiPlayerActionReservation: UiPlayerActionReservation = null;
	@property(UiCommunityCards) uiCommunityCards: UiCommunityCards = null;

	@property(Node) nodeCardShuffleMessage: Node = null;
	@property(Button) buttonShowCard: Button = null;
	@property(Button) buttonSitout: Button = null;
	@property(Button) buttonSitoutCancel: Button = null;	
	@property(Button) buttonSitback: Button = null;
	@property(Button) buttonEmoticon: Button = null;
	@property(Button) buttonAddChips: Button = null;

	@property(UiGameChatting) uiGameChatting: UiGameChatting = null;
	@property(UiWinEffect) uiWinEffect: UiWinEffect = null;	
	@property(UiPotChips) uiPotChips: UiPotChips = null;
	@property(UiRoundPotValue) uiRoundPotValue: UiRoundPotValue = null;
	@property(UiShowDownEffect) uiShowDownEffect: UiShowDownEffect = null;
	@property(UiEffectShowRiver) uiEffectShowRiver: UiEffectShowRiver = null;

	@property(PlayerActionInformation) playerActionInformation: PlayerActionInformation = null;

	private GAME_STATE: number = GAME_STATE_SUSPEND;
	private SHOWDOWN_STATE: number = SHOWDOWN_NONE;

	private SEAT_PLAYERS: number[] = [];
    private PLAYER_CARDS: {} = null;
    private ENTITY_ELEMENTS: UiEntity[] = [];

    private roundState: string = "";
    private spritePotRoot: Sprite = null;

    private uiPlayerAction: UiPlayerAction = null;
    private nodeCardDispensingRoot: Node = null;

    private timerRoot: Node = null;
    private labelReadyMessage: Label = null;

    private objPotMoveToWinnerChips: {} = {};
    private objPotReturnChips: {} = {};

    private curPotValue: number = -1;
    private myChips: number = -1;
    private mySeat: number = -1;
	private myCards: number[] = [-1, -1];
    private myWaitStatus: boolean = false;

    private startBetFromServer: number = -1;
    private betMin: number = -1;
    private seatMax: number = 6;
    private enableSeats: number[] = [];

	private seatDealer: number = -1;
	private seatSB: number = -1;
	private seatBB: number = -1;

    private room: Colyseus.Room = null;
    private msgWINNERS: string = "";

    private isFold: boolean = false;
    private isAllIn: boolean = false;
	private isSitout: boolean = false;
	private isWait: boolean = false;

    private readyMessageHandler: number = -1;
    private countPlayers: number = -1;

	static seatMaxFromServer : number = 9;

	private isSitOutReservation: boolean = false;
	private labelCurrentPot: Label = null;

	private rootPotChips: Node = null;
	private labelSitout: Label = null;
	private labelSitback: Label = null;
	private isReserveSitout: boolean = false;
	private isSitoutable: boolean = false;
	private labelReservationSitout: Label = null;
	private rootCurrentPot: Node = null;
	private reserveLeave: boolean = false;
	private updateClinet: boolean = true;

    init() {
        this.seatMax = UiTable.seatMaxFromServer;
        globalThis.lib = {};

        PokerEvaluator.exportToGlobal(globalThis.lib);

        Board.table = this;
        
        this.childRegistered();

        this.uiSeats.init(this.seatMax, this.onClickSeatSelect.bind(this));
		this.uiBuyIn.init();
		this.uiProfile.init();

		this.uiGameChatting.init( this.onClickEmoticon.bind(this), this.onClickEmticonExit.bind(this));
		this.setEmoticonButtinInteractive(true);
		this.uiPlayerActionReservation.init();
		this.uiWinEffect.init();
		this.uiPotChips.init();
		this.uiRoundPotValue.init();
		this.uiShowDownEffect.Init();
		this.uiEffectShowRiver.Init();
		this.uiCommunityCards.Init();

		this.playerActionInformation.Init();

        if ( null == NetworkManager.Instance().room ) {
            return;
        }

        this.registRoomEvent(NetworkManager.Instance().room);

		UiControls.instance.setExitCallback( this.onCLICK_EXIT.bind(this) );
		UiControls.instance.show();

		let bg: Sprite = this.node.getChildByPath('SPRITE_BACKGROUND').getComponent(Sprite);
        if ( bg != null ) {
            ResourceManager.Instance().setBackgroundImage(bg);
            bg.node.active = true;
        }

        let tb: Sprite = this.node.getChildByPath('SPRITE_TABLE').getComponent( Sprite );
        if ( tb != null ) {
            ResourceManager.Instance().setTableImage(tb);
            tb.node.active = true;            
        }

		this.buttonEmoticon.node.on('click', this.onClickShowEmoticon.bind(this), this);
		this.buttonAddChips.node.on('click', this.onClickAddChips.bind(this), this);

		this.hide();
        this.sendMsg("ONLOAD", {

        });
    }

	onClickShowEmoticon(button: Button) {
		AudioController.instance.ButtonClick();		
		this.uiGameChatting.show();
	}

	onClickEmoticon( type: EMOTICON_TYPE, id: number ) {
		this.sendMsg("SHOW_EMOTICON", { 
			seat : this.mySeat, 
			type: type,
			id: id,
		});
		this.uiGameChatting.hide();		

		let uiEntity =  this.GetEntityFromSeat( this.mySeat );
		if ( uiEntity != null ) {
			uiEntity.setEmoticon(type, id)
		}
	}

	public setEmoticonButtinInteractive(enable: boolean) {
		this.buttonEmoticon.interactable = enable;
	}

	onClickEmticonExit() {

	}

    private childRegistered() {
		this.uiPlayerAction = this.node.getChildByPath( "PLAYER_ACTION" ).getComponent( UiPlayerAction );
		this.uiPlayerAction.hide();

		this.nodeCardDispensingRoot = this.node.getChildByPath( "CARD_DISPENSING_ROOT" );

		let entitiesRoot9 = this.node.getChildByPath( `ENTITIES_9` );
		let entitiesRoot6 = this.node.getChildByPath( `ENTITIES_6` );

		let entitiesRootPath = `ENTITIES_${ this.seatMax }`;

		if( entitiesRoot9.name === entitiesRootPath ) {
			entitiesRoot9.active = true;
			entitiesRoot6.active = false;
		}
		else {
			entitiesRoot9.active = false;
			entitiesRoot6.active = true;
		}

		this.ENTITY_ELEMENTS = [];
		let playerMe = this.node.getChildByPath( `${ entitiesRootPath }/ENTITY_ME` ).getComponent( UiEntity );
		if ( playerMe != null ) {
			playerMe.isMe = true;
			playerMe.Init();
			this.ENTITY_ELEMENTS.push( playerMe );
		}

		for( let i = 1; i < this.seatMax; i++ ) {
			let elem = this.node.getChildByPath( `${ entitiesRootPath }/ENTITY_${ i }` ).getComponent( UiEntity );
			if ( elem != null ) {
				elem.isMe = false;
				elem.Init();
				this.ENTITY_ELEMENTS.push( elem );				
			}
		}

		this.rootPotChips = this.node.getChildByPath('ROUND_POT/POT_CHIPS');

		for ( let i = 1; i < this.ENTITY_ELEMENTS.length; i++ ) {
			let entity = this.ENTITY_ELEMENTS[i];
			if (entity != null) {
				entity.SetEscape();
			}
		}

		this.spritePotRoot = this.node.getChildByPath( "POT" ).getComponent( Sprite );
		this.spritePotRoot.node.active = false;

		let winnerChips = this.node.getChildByPath( "WINNER_CHIPS" );
		let keys = Object.keys( this.objPotMoveToWinnerChips );
		keys.forEach( elem => {
			let obj = this.objPotMoveToWinnerChips[ elem ];
			for( let i = 0; i < obj.sprChips.length; i++ ) {
				let spr: Sprite = obj.sprChips[ i ];
				spr.node.destroy();
				spr.node.removeFromParent();
			}
			obj.sprChips = [];
		} );

		this.objPotMoveToWinnerChips = {};

		let originalSprChipsCount = winnerChips.children.length;
		for( let loopIdx: number = 0; loopIdx < 10; loopIdx++ ) {
			let cloneSprArray: Sprite[] = [];
			for( let i = 0; i < originalSprChipsCount; i++ ) {
				let node: Node = winnerChips.children[ i ];
				if( false == node.isValid ) {
					continue;
				}

				node.active = false;
				let newNode = instantiate( node );
				newNode.setParent( node.parent );
				newNode.position = new Vec3( node.position );
				newNode.scale = new Vec3( node.scale );
				newNode.name = `sprChip_${ loopIdx }_${ i }`;
				cloneSprArray.push( newNode.getComponent( Sprite ) );
			}

			this.objPotMoveToWinnerChips[ loopIdx ] = { sprChips: cloneSprArray };
		}

		let returnChips = this.node.getChildByPath("RETURN_CHIPS");
		let rKeys = Object.keys(this.objPotReturnChips);

		rKeys.forEach(elem => {
			let obj = this.objPotReturnChips[ elem ];
			for(let i = 0 ; i < obj.sprChips.length; i++){
				let spr : Sprite = obj.sprChips[i];
				spr.node.destroy();
				spr.node.removeFromParent();
			}

			obj.sprChips = [];
		})

		this.objPotReturnChips = {};
		
		let originSprReturnChipsCount = returnChips.children.length;
		for(let i = 0; i < 10;i++){
			let clone: Sprite[] = [];
			for(let j = 0; j < originSprReturnChipsCount; j++){
				let node : Node = returnChips.children[ j ];

				if(false == node.isValid){
					continue;
				}

				node.active = false;
				let newNode = instantiate(node);
				newNode.setParent(node.parent);
				newNode.position = new Vec3(node.position);
				newNode.scale = new Vec3(node.scale);
				newNode.name = `sprChip_${ i }_${ j }`;
				clone.push( newNode.getComponent( Sprite ) );
			}

			this.objPotReturnChips[ i ] = {sprChips : clone};
		}
		/////////////////////////

		this.labelReadyMessage = this.node.getChildByPath("LABLE_READY_MESSAGE").getComponent( Label );
		this.labelReadyMessage.string = "";
		this.labelReadyMessage.node.active = false;

		let isOn = true;

		this.buttonShowCard.node.off('click');
		this.buttonShowCard.node.on('click', this.onClickShowCard.bind(this));
		this.buttonShowCard.node.active = false;

		this.buttonSitout.node.off('click');
		this.buttonSitout.node.on('click', this.onClickSitout.bind(this));
		this.buttonSitout.node.active = false;

		this.labelSitout = this.buttonSitout.node.getChildByPath('LABEL').getComponent(Label);
		if ( this.labelSitout != null ) {
			this.labelSitout.string = '자리비움';
		}

		this.buttonSitback.node.off('click');
		this.buttonSitback.node.on('click', this.onClickSitback.bind(this));
		this.buttonSitback.node.active = false;

		this.labelSitback = this.buttonSitback.node.getChildByPath('LABEL').getComponent(Label);
		if ( this.labelSitback != null ) {
			this.labelSitback.string = '게임복귀';
		}

		this.nodeCardShuffleMessage.active = false;

		this.labelReservationSitout = this.node.getChildByPath('LABEL_RESERVATION_SITOUT').getComponent(Label);
		if ( this.labelReservationSitout != null ) {
			this.labelReservationSitout.node.active = false;
		}

		this.buttonSitoutCancel.node.off('click');
		this.buttonSitoutCancel.node.on('click', this.onClickSitCancel.bind(this));
		this.buttonSitoutCancel.node.active = false;

		this.rootCurrentPot = this.node.getChildByPath('CURRENT_POT');
		if ( this.rootCurrentPot != null ) {
			this.rootCurrentPot.active = false;

			this.labelCurrentPot = this.rootCurrentPot.getChildByPath('LABEL_CURRENT_POT').getComponent(Label);
			this.labelCurrentPot.string = '0';
			this.labelCurrentPot.node.active = false;
		}
    }

	private SetCurrentPot( value: number ) {
		let v = CommonUtil.getKoreanNumber( value );
		this.labelCurrentPot.string = v;

		this.labelCurrentPot.node.active = true;
		this.rootCurrentPot.active = true;		
	}

	private ResetCurrentPot() {
		this.labelCurrentPot.string = '0';
		this.rootCurrentPot.active = false;
	}

    private onClickSeatSelect(no: number)
    {
        this.sendMsg("SEAT_SELECT", {
            selected: no,
        });
    }

    private onSHOW_SELECT_SEAT(msg: any) {
        let limitTime = msg["limitTime"];
        this.uiSeats.startSeatsSelect(limitTime);

		this.node.active = false;
    }

    private onSELECT_SEAT_ERROR(msg: any) {
        this.uiSeats.onResultFail();
    }

    private onUPDATE_SELECT_SEAT(msg: any) {
        this.uiSeats.updateSeatInfo( msg["entities"], msg["seatInfo"], msg["bbSeat"], msg["sbSeat"], msg["dealerSeat"]);
    }

    public onClickSitout() {
		AudioController.instance.ButtonClick();
		this.buttonSitout.interactable = false;
		this.SetSitout();
	}

    public onClickSitback() {
		AudioController.instance.ButtonClick();
		this.buttonSitback.interactable = false;		
		this.SetSitback();
    }

	public onClickSitCancel( button: Button ) {
		AudioController.instance.ButtonClick();
		button.interactable = false;

		this.sendMsg("SIT_OUT_CANCEL", { 
			seat : this.mySeat 
		});		
	}

	private SetSitout() {
		this.sendMsg("SIT_OUT", { 
			seat : this.mySeat 
		});
	}

	private SetSitback() {
		this.sendMsg("SIT_BACK", {
			seat : this.mySeat
		});
	}

    onClickAddChips() {
		AudioController.instance.ButtonClick();
		this.sendMsg( "ADD_CHIPS_REQUEST", {seat: this.mySeat } );
    }

    onCLICK_EXIT() {

		let user = NetworkManager.Instance().GetUser();
		if ( this.uiSeats.node.active == true ) {
			UiGameSystemPopup.instance.showYesNoPopup("게임종료", "게임을 나가시겠습니까?", ()=>{

				this.sendMsg("EXIT_TABLE", {
					seat : this.mySeat,
					id : user.id,
				});

				UiGameSystemPopup.instance.closePopup();
			}, ()=>{
				UiGameSystemPopup.instance.closePopup();
			});
		} else {
			UiGameSystemPopup.instance.showYesNoPopup("게임종료", "게임을 나가시겠습니까?", ()=>{

				this.sendMsg("EXIT_TABLE", {
					seat : this.mySeat,
					id : user.id,
				});



				UiGameSystemPopup.instance.closePopup();
			}, ()=>{
				UiGameSystemPopup.instance.closePopup();
			});
		}
    }

    public show() {
        this.node.active = true;
    }

    public hide() {
		clearInterval(this.readyMessageHandler);        
        this.node.active = false;
    }

    registRoomEvent( room: Colyseus.Room ) {
        this.room = room;
        room.onMessage( "NEW_ENTITY", this.onNEW_ENTITY.bind( this ) );
		room.onMessage( "HANDLE_ESCAPEE", this.onHANDLE_ESCAPEE.bind( this ) );

		room.onMessage( "SUSPEND_ROUND", this.onSUSPEND_ROUND.bind( this ) );
		room.onMessage( "READY_ROUND", this.onREADY_ROUND.bind( this ) );
		room.onMessage( "PREPARE_ROUND", this.onPREPARE_ROUND.bind( this ) );        
        room.onMessage( "CARD_DISPENSING", this.onCARD_DISPENSING.bind( this ) );
		room.onMessage( "BLIND_BET", this.onBLIND_BET.bind( this ) );
		room.onMessage( "PRE_FLOP_END", this.onPRE_FLOP_END.bind( this ) );

		room.onMessage( "SHOW_FLOP", this.onSHOW_FLOP.bind( this ) );
		room.onMessage( "FLOP_END", this.onFLOP_END.bind( this ) );

		room.onMessage( "SHOW_TURN", this.onSHOW_TURN.bind( this ) );
		room.onMessage( "TURN_END", this.onTURN_END.bind( this ) );

		room.onMessage( "SHOW_RIVER", this.onSHOW_RIVER.bind( this ) );
		room.onMessage( "RIVER_END", this.onRIVER_END.bind( this ) );

		room.onMessage( 'SHOWDOWN_START', this.onSHOWDOWN_START.bind(this) );
		room.onMessage( 'SHOWDOWN_FLOP', this.onSHOWDOWN_FLOP.bind(this) );
		room.onMessage( 'SHOWDOWN_TURN', this.onSHOWDOWN_TURN.bind(this) );
		room.onMessage( 'SHOWDOWN_RIVER', this.onSHOWDOWN_RIVER.bind(this) );
		room.onMessage( "CLEAR_ROUND", this.onCLEAR_ROUND.bind( this ) );
        
        //PLAYER ACTION
		room.onMessage( "YOUR_TURN", this.onYOUR_TURN.bind( this ) );
		room.onMessage( "FOLD", this.onFOLD.bind( this ) );
		room.onMessage( "CHECK", this.onCHECK.bind( this ) );
		room.onMessage( "CALL", this.onCALL.bind( this ) );
		room.onMessage( "BET", this.onBET.bind( this ) );
		room.onMessage( "RAISE", this.onRAISE.bind( this ) );
		room.onMessage( "SHOW_CARD", this.onSHOW_CARD.bind( this ) );
		room.onMessage( "PLAYER_CARDS", this.onPLAYER_CARDS.bind( this ) );
		room.onMessage( "WINNERS", this.onWINNERS.bind( this ) );

        room.onMessage( "BUY_IN", this.onBUY_IN.bind( this ) );
		room.onMessage( "RES_BUY_IN", this.onRES_BUY_IN.bind( this ) );
		room.onMessage( "RES_RE_BUY", this.onRES_RE_BUY.bind( this ) );
		
		room.onMessage( "RE_BUY_IN", this.onRE_BUY_IN.bind( this ) );
		room.onMessage( "RES_ADD_CHIPS_REQUEST", this.onRES_ADD_CHIPS_REQUEST.bind( this ) );
		room.onMessage( "RES_ADD_CHIPS", this.onRES_ADD_CHIPS.bind( this ) );

		// room.onMessage( "RES_ADD_CHIPS_PEND", this.onRES_ADD_CHIPS_PEND.bind( this ) );

		room.onMessage( "SIT_OUT", this.onSIT_OUT.bind(this));
		room.onMessage( "SIT_OUT_PEND", this.onSIT_OUT_PEND.bind(this));
		room.onMessage( "SIT_OUT_CANCEL", this.onSIT_OUT_CANCEL.bind(this));		
		room.onMessage( "SIT_BACK", this.onSIT_BACK.bind(this));

        room.onMessage( "SHOW_SELECT_SEAT", this.onSHOW_SELECT_SEAT.bind(this));
        room.onMessage( "UPDATE_SELECT_SEAT", this.onUPDATE_SELECT_SEAT.bind(this));
		room.onMessage( "SELECT_SEAT_ERROR", this.onSELECT_SEAT_ERROR.bind(this));
		room.onMessage( "SHOW_EMOTICON", this.onSHOW_EMOTICON.bind(this));
		room.onMessage( "SHOW_PROFILE", this.onSHOW_PROFILE.bind(this));

		room.onMessage( "TOKEN_VERIFY", this.onTOKEN_VERIFY.bind(this));

		room.onMessage( "SYNC_TABLE", this.onSYNC_TABLE.bind(this));
		room.onMessage( "EXIT_TABLE", this.onEXIT_TABLE.bind(this));		

        
        this.room.onMessage( "JOIN", msg => {
            this.onJOIN(room, msg);
        });

        this.room.onMessage( "REJOIN", msg => {
            this.onRE_JOIN(room, msg);
        });

        room.onLeave((code)=>{
            this.leaveRoom(code);
            this.hide();

			if ( this.uiSeats.isSeatsSelectOpen() == true ) {
				this.uiSeats.leave();
			}

            NetworkManager.Instance().room.removeAllListeners();
            NetworkManager.Instance().leaveReason = code;

			director.loadScene("LobbyScene");
        });

        room.onMessage( "ping", this.onPING.bind( this ) );
    }

	private onSHOW_EMOTICON(msg) {
		let seat = msg['seat'];
		if ( seat == this.mySeat ) {
			return;
		}

		let type = msg['type'];
		let id = msg['id'];

		let uiEntity =  this.GetEntityFromSeat( seat );
		if ( uiEntity != null ) {
			if (type == 0 ) {
				uiEntity.setEmoticon(EMOTICON_TYPE.Emoticon, id);
			} else {
				uiEntity.setEmoticon(EMOTICON_TYPE.Chatting, id);
			}
		}
	}

	private onSHOW_PROFILE(msg) {

		let statics = msg['statics'];
		let entity = msg['entity']
		let seat = msg['seat'];

		let me = (this.mySeat == seat) ;

		if ( statics != null ) {
			this.uiProfile.show( entity, statics, me );
		} else {

			UiGameSystemPopup.instance.showOkPopup('프로필', '정보를 불러올 수 없습니다.', ()=>{
				UiGameSystemPopup.instance.closePopup();
			} );
		}
	}
	
	private onEXIT_TABLE( msg ) {
		this.uiSeats.end();
		this.room?.leave( false );
	}

	private onTOKEN_VERIFY( msg ) {
		let verify = msg['verify']
		if ( verify == true ) {

		} else {

		}
	}

	private onSYNC_TABLE( msg ) {
		return;

		this.GAME_STATE = msg['gameState'];
		this.SHOWDOWN_STATE = msg['showdownState'];

		this.uiCommunityCards.Reset();
		this.uiPot.maxPotRoot.active = false;
		this.labelCurrentPot.node.active = false;
		this.buttonShowCard.node.active = false;

		this.uiPot.Hide();
		this.uiPotChips.hide();
		this.uiRoundPotValue.hide();
		this.uiProfile.hide();

		this.msgWINNERS = '';

		this.uiPlayerAction.init( Board.small, Board.big );
		this.uiPlayerAction.hide();
		this.uiPlayerActionReservation.hide();

		let myEntity = msg["yourself"];		
		Board.balance = myEntity.balance;
		this.mySeat = myEntity.seat;
		this.myChips = myEntity.chips;
		this.myWaitStatus = myEntity.wait;
        this.isFold = false;
		this.isAllIn = false;
		this.isSitout = myEntity.isSitOut;

        let players: any = msg["entities"];
		this.countPlayers = players.length;
        this.SEAT_PLAYERS = [];

        for ( let i = 0; i < this.seatMax ; i++) {
            let seat = this.mySeat + i;
            this.SEAT_PLAYERS.push( seat % this.seatMax );
        }

        this.SetEntities( players );
		this.enableSeats = [];

		for( let i = 0; i < this.SEAT_PLAYERS.length; i++ ) {
			let seat = this.SEAT_PLAYERS[ i ];
			let entity =  msg[ "entities" ].find( elem => elem.seat == seat );
			let uiEntity = this.ENTITY_ELEMENTS[ i ];

			if( null == entity ) {
				uiEntity.SetEscape();
				continue;
			}

			this.enableSeats.push( entity.seat );
		}		

		if ( this.GAME_STATE == GAME_STATE_SUSPEND ) {

			this.labelReadyMessage.string = '다른 플레이어를 기다리고 있습니다';
			this.labelReadyMessage.node.active = true;

			this.uiPot.Hide();

		} else {
			this.seatDealer = msg["dealer"];
			let uiDealer = this.GetEntityFromSeat( this.seatDealer );
			if ( uiDealer != null ) {
				uiDealer.SetButtons('DEALER');
			}

			this.seatSB = msg['sb'];
			let uiSB = this.GetEntityFromSeat( this.seatSB );
			if ( uiSB != null ) {
				uiSB.SetButtons('SB');
			}

			this.seatBB = msg['bb'];
			let uiBB = this.GetEntityFromSeat( this.seatBB );
			if ( uiBB != null ) {
				uiBB.SetButtons('BB');
			}

			if ( this.GAME_STATE == GAME_STATE_PREFLOP ||
				 this.GAME_STATE == GAME_STATE_BET || 
				 this.GAME_STATE == GAME_STATE_FLOP ||
				 this.GAME_STATE == GAME_STATE_TURN ||
				 this.GAME_STATE == GAME_STATE_RIVER )
			{
				this.curPotValue = msg['pot'];
				this.uiPotChips.show( this.curPotValue );
				this.uiRoundPotValue.show( this.curPotValue );

				players.forEach( ( e )=> {
					let uiEntity = this.GetEntityFromSeat( e.seat );
					if ( uiEntity != null ) {
						if ( e.wait == true ) {
							uiEntity.SetWait();
						} else {
							if ( e.fold == true ) {
								uiEntity.SetFold();								
							} else {
								if ( e.seat != this.mySeat ) {
									uiEntity.ClearHands();
									uiEntity.SetShowHiddenCard();
									uiEntity.SetBetValue( e.roundBet );
								}
							}
						}
					}
				});

				this.curPotValue = msg['pot'];
				if ( this.curPotValue > 0 ) {
					this.labelCurrentPot.string = '현재 팟: ' + CommonUtil.getKoreanNumber(this.curPotValue);
				}
				this.uiPotChips.show( msg['initPot'] );
				this.uiRoundPotValue.show( msg['initPot'] );
				
				this.SetUiCommunityCards( msg[ "openCards" ] );
			} else if ( this.GAME_STATE == GAME_STATE_RESULT ) {
				let playerCards = msg['playerCards'];
				let winners = msg['winners'];

				this.SetUiCommunityCards( msg[ "openCards" ] );

				if ( playerCards != null ) {
					this.onPLAYER_CARDS(playerCards);
				}

				if ( winners != null ) {
					this.onWINNERS(winners);
				}

			} else if ( this.GAME_STATE == GAME_STATE_SHOWDOWN ) {
				let showdown = msg['showdown'];
				let winners = msg['winners'];
				
				this.ShowdownOpenHands(showdown);
				this.SetUiCommunityCards( msg[ "openCards" ] );
				this.UpdatePlayerHandRank();

				if ( this.SHOWDOWN_STATE == SHOWDOWN_END ) {
					if ( winners != null ) {
						this.onWINNERS( winners );
					}
				}
			}
		}
	}	

	public LoadLobby() {
		director.loadScene("LobbyScene");
	}

    private onPING() {

    }

    public onRE_JOIN(room, msg) {
		return;

		let myEntity = msg[ "yourself" ];

		Board.balance = myEntity.balance;
		Board.big = msg[ "big" ];
		Board.small = msg[ "small" ];
		Board.minStakePrice = msg["minStakePrice"];
		Board.maxStakePrice = msg["maxStakePrice"];
		Board.passPrice = msg[ "passPrice" ];

		this.timerRoot.active = msg["useTimePass"];

		this.room = room;
		this.mySeat = myEntity.seat;
		this.myChips = myEntity.chips;
		this.myWaitStatus = myEntity.wait;
		this.isFold = false;
		this.SEAT_PLAYERS = [];
		this.msgWINNERS = "";
		// this.playersCARD = null;
		this.isAllIn = false;
		this.curPotValue = msg["pot"];

		this.betMin = msg["minBet"];
		this.startBetFromServer = msg["minBet"];

		this.seatDealer = msg["dealer"];
		this.seatSB = msg["sb"];
		this.seatBB = msg["bb"];

		for( let i = 0; i < this.seatMax; i++ ) {
			let seat = this.mySeat + i;
			this.SEAT_PLAYERS.push( seat % this.seatMax );
		}

		if (true === myEntity.isSitOut) {
			this.buttonSitout.node.active = false;
			this.buttonSitback.node.active = true;
		} else {
			this.buttonSitout.node.active = true;
			this.buttonSitback.node.active = false;
		}

		this.buttonShowCard.node.active = false;
		let players: any = msg[ "entities" ];
		this.SetEntities( players );
		this.countPlayers = players.length;
		this.enableSeats = [];

		for( let i = 0; i < this.SEAT_PLAYERS.length; i++ ) {
			let seat = this.SEAT_PLAYERS[ i ];
			let entity =  msg[ "entities" ].find( elem => elem.seat == seat );
			let uiEntity = this.ENTITY_ELEMENTS[ i ];

			if( null == entity ) {
				uiEntity?.SetEscape();
				continue;
			}

			this.enableSeats.push( entity.seat );
		}		

		// this.setUiCommunityCards( msg[ "openCards" ] );

		// this.myPrimaryCardIndex = msg["primCard"];
		// this.mySecondaryCardIndex = msg["secCard"];

		// let uiEntity =  this.getUiEntityFromSeat(this.mySeat);
		// if (this.myPrimaryCardIndex != -1 && this.mySecondaryCardIndex != -1) {
		// 	let sf: SpriteFrame = ResourceManager.Instance().getCardImage(this.myPrimaryCardIndex + 1);
		// 	// this.setAniOpenHand(uiEntity.spriteHandCards[0], sf, () => {
		// 	// });

		// 	sf = ResourceManager.Instance().getCardImage( this.mySecondaryCardIndex + 1 );


		// 	// this.setAniOpenHand(uiEntity.spriteHandCards[1], sf, () => {
		// 	// 	let handRank = this.getHandRank(this.myPrimaryCardIndex, this.mySecondaryCardIndex, this.numberCommunityCards);
		// 	// 	uiEntity.setUiHandRank(handRank);
		// 	// });

		// 	if (myEntity.fold === true) {
		// 		uiEntity.setUiHandCardsFold();
		// 	}
		// }

		if (msg["centerCardState"] != 0) {
			msg["entities"].forEach(element => {
				let seatNumber = element.seat;
				let entity = this.GetEntityFromSeat(seatNumber);

				if (seatNumber === this.mySeat || true === element.wait) {
					return;
				}
				// entity.setShowHiddenCard( true );
			});
		}

		let uiDealer = this.GetEntityFromSeat( this.seatDealer );
		if ( uiDealer != null ) {
			uiDealer.SetButtons( 'DEALER');
		}

		let uiSB = this.GetEntityFromSeat( this.seatSB );
		if ( uiSB != null ) {
			uiSB.SetButtons('SB');
		}

		let uiBB = this.GetEntityFromSeat( this.seatBB );
		if ( uiBB != null ) {
			uiBB.SetButtons('BB');
		}

		this.uiPot.UpdatePotTotal(this.curPotValue);
		this.show();
    }

    public onJOIN( room, msg) {
		console.log('onJOIN');

		Board.big = msg["big"];
		Board.small = msg["small"];
		Board.minStakePrice = msg["minStakePrice"];
		Board.maxStakePrice = msg["maxStakePrice"];

        this.room = room;
		this.GAME_STATE = msg['gameState'];
		this.SHOWDOWN_STATE = msg['showdownState'];

		this.uiCommunityCards.Reset();
		this.uiPot.maxPotRoot.active = false;
		this.labelCurrentPot.node.active = false;
		this.buttonShowCard.node.active = false;

		this.uiPot.Hide();
		this.uiPotChips.hide();
		this.uiRoundPotValue.hide();
		this.uiProfile.hide();

		this.msgWINNERS = '';

		this.uiPlayerAction.init( Board.small, Board.big );
		this.uiPlayerAction.hide();
		this.uiPlayerActionReservation.hide();

		let myEntity = msg["yourself"];		
		Board.balance = myEntity.balance;
		this.mySeat = myEntity.seat;
		this.myChips = myEntity.chips;
		this.myWaitStatus = myEntity.wait;
        this.isFold = false;
		this.isAllIn = false;
		this.isSitout = myEntity.isSitOut;

        let players: any = msg["entities"];
		this.countPlayers = players.length;
        this.SEAT_PLAYERS = [];

        for ( let i = 0; i < this.seatMax ; i++) {
            let seat = this.mySeat + i;
            this.SEAT_PLAYERS.push( seat % this.seatMax );
        }

        this.SetEntities( players );
		this.enableSeats = [];

		for( let i = 0; i < this.SEAT_PLAYERS.length; i++ ) {
			let seat = this.SEAT_PLAYERS[ i ];
			let entity =  msg[ "entities" ].find( elem => elem.seat == seat );
			let uiEntity = this.ENTITY_ELEMENTS[ i ];

			if( null == entity ) {
				uiEntity.SetEscape();
				continue;
			}

			this.enableSeats.push( entity.seat );
		}		

		if ( this.GAME_STATE == GAME_STATE_SUSPEND ) {

			this.labelReadyMessage.string = '다른 플레이어를 기다리고 있습니다';
			this.labelReadyMessage.node.active = true;

			this.uiPot.Hide();

		} else {
			this.seatDealer = msg["dealer"];
			let uiDealer = this.GetEntityFromSeat( this.seatDealer );
			if ( uiDealer != null ) {
				uiDealer.SetButtons('DEALER');
			}

			this.seatSB = msg['sb'];
			let uiSB = this.GetEntityFromSeat( this.seatSB );
			if ( uiSB != null ) {
				uiSB.SetButtons('SB');
			}

			this.seatBB = msg['bb'];
			let uiBB = this.GetEntityFromSeat( this.seatBB );
			if ( uiBB != null ) {
				uiBB.SetButtons('BB');
			}

			if ( this.GAME_STATE == GAME_STATE_PREFLOP ||
				 this.GAME_STATE == GAME_STATE_BET || 
				 this.GAME_STATE == GAME_STATE_FLOP ||
				 this.GAME_STATE == GAME_STATE_TURN ||
				 this.GAME_STATE == GAME_STATE_RIVER )
			{
				this.curPotValue = msg['pot'];
				this.uiPotChips.show( this.curPotValue );
				this.uiRoundPotValue.show( this.curPotValue );

				players.forEach( ( e )=> {
					let uiEntity = this.GetEntityFromSeat( e.seat );
					if ( uiEntity != null ) {
						if ( e.wait == true ) {
							uiEntity.SetWait();
						} else {
							if ( e.fold == true ) {
								uiEntity.SetFold();								
							} else {
								if ( e.seat != this.mySeat ) {
									uiEntity.ClearHands();
									uiEntity.SetShowHiddenCard();
									uiEntity.SetBetValue( e.roundBet );
								}
							}
						}
					}
				});

				this.curPotValue = msg['pot'];
				if ( this.curPotValue > 0 ) {
					this.labelCurrentPot.string = '현재 팟: ' + CommonUtil.getKoreanNumber(this.curPotValue);
				}
				this.uiPotChips.show( msg['initPot'] );
				this.uiRoundPotValue.show( msg['initPot'] );
				
				this.SetUiCommunityCards( msg[ "openCards" ] );
			} else if ( this.GAME_STATE == GAME_STATE_RESULT ) {
				let playerCards = msg['playerCards'];
				let winners = msg['winners'];

				this.SetUiCommunityCards( msg[ "openCards" ] );

				if ( playerCards != null ) {
					this.onPLAYER_CARDS(playerCards);
				}

				if ( winners != null ) {
					this.onWINNERS(winners);
				}

			} else if ( this.GAME_STATE == GAME_STATE_SHOWDOWN ) {
				let showdown = msg['showdown'];
				let winners = msg['winners'];
				
				this.ShowdownOpenHands(showdown);
				this.SetUiCommunityCards( msg[ "openCards" ] );
				this.UpdatePlayerHandRank();

				if ( this.SHOWDOWN_STATE == SHOWDOWN_END ) {
					if ( winners != null ) {
						this.onWINNERS( winners );
					}
				}
			}
		}

		this.SetSitoutButtons( this.isSitout );

		this.scheduleOnce(()=>{
			AudioController.instance.PlaySound('VOICE_WELCOME');
		}, 0.5);

    }

    leaveRoom( code: any ) {
		console.log('leaveRoom');

        this.ClearEntities();
		this.ClearPot();

		this.uiPlayerAction.hide();
		this.uiBuyIn.node.active = false;

		this.unscheduleAllCallbacks();
		this.isAllIn = false;
		this.room = null;
    }

	private SetEntities( entities: any ) {
		if ( entities == null || entities.length == 0 ) {
			return;
		}

        for (let i = 0; i < this.SEAT_PLAYERS.length; i++ ) {
            let seat = this.SEAT_PLAYERS[i];

			let entity = entities.find( (e)=> {
				return e.seat == seat;
			} );

			if ( entity != null ) {
				let uiEntity = this.GetEntityFromSeat( seat );
				if ( uiEntity != null ) {
					uiEntity.SetEntity( entity, this.OpenProfile.bind(this), this.CloseProfile.bind(this) );
				}
			} else {

			}
        }
    }

    private ClearEntities() {
        for ( let i = 0; i < this.SEAT_PLAYERS.length; i++ ) {
            let seat = this.SEAT_PLAYERS[ i ];
            let uiEntity = this.GetEntityFromSeat( seat );
			if ( uiEntity != null ) {
				uiEntity.SetEntity( null, null, null );
			}
        }
    }

    private setUiPot(pots: any[]) {
		this.spritePotRoot.node.active = true;
		if (null !== pots || undefined !== pots) {
			this.uiPot.Show(pots);
		}
    }

    private ClearPot() {
		this.spritePotRoot.node.active = false;
		this.labelCurrentPot.node.active = false;
		this.uiPot.Hide();
    }

    private ClearEntitiesButtons() {
		this.ENTITY_ELEMENTS.forEach( element => element.ClearButtons() );        
    }

	private SetUiCommunityCards( cards: number[] ) {
		if ( cards != null ) {
			this.uiCommunityCards.SetCommunityCards( cards );
		}
	}

	private GetEntityFromSeat( seat: number ) {
		let idx = this.SEAT_PLAYERS.findIndex( ( element )=> (element == seat) );
		if ( idx == -1 ) {
			return;
		}
		return this.ENTITY_ELEMENTS[idx];
	}

	public GetHandsEval( hands: number[], communities: number[] ): string {
		if ( hands == null || hands.length != 2 || hands[0] < 0 || hands[1] < 0 || hands[0] == hands[1] ) {
			return;
		}

		if ( communities == null ) {
			return;
		}

		let array = [];

		hands.forEach( e => {
			if( -1 == e ) {
				return;
			}
			array.push( totalCards[ e ] );
		} );

		communities.forEach( e => {
			if( -1 == e ) {
				return;
			}
			
			let d = array.find( (element)=>{
				return element == totalCards[e];
			});

			array.push( totalCards[ e ] );
		} );

		let rs = array.join();
		let handRank = globalThis.lib[ "Hand" ].solve( rs.split( "," ) );
		return handRank;
	}

	private SetMyHandRank() {		
		if ( this.myCards[0] < 0 || this.myCards[1] < 0 ) {
			return;
		}

		let hand = this.myCards;
		let communities = this.uiCommunityCards.GetCommunityCards();

		let evaluate: any = this.GetHandsEval( hand, communities);
		let uiEntity = this.GetEntityFromSeat( this.mySeat );
		if ( uiEntity != null ) {
			uiEntity.SetHandRank( evaluate );
		}
    }

	private SetPlayerHandRank( cards: number[], uiEntity: any ) {
		if ( cards.length != 2) {
			return;
		}		

		let hand = cards;
		let communities = this.uiCommunityCards.GetCommunityCards();

		let evaluate: any = this.GetHandsEval( hand, communities);
		if ( uiEntity != null ) {
			uiEntity.SetHandRank( evaluate );
		}
	}

	private EndTurns() {
		this.ENTITY_ELEMENTS.forEach( element => {
			element.endTurn();
		} );
	}

	private ClearUiEntities() {
		this.ENTITY_ELEMENTS.forEach( element => {
			element.endTurn();
			element.clearUiAction();
			element.clearUiBetValue();			
		} );		
	}

    private clearUiEntitiesAction() {
		this.ENTITY_ELEMENTS.forEach( element => {
			element.clearUiAction();
		} );
    }

    private clearUiEntitiesBetValue() {
		this.ENTITY_ELEMENTS.forEach( element => {
			element.clearUiBetValue();
		} );
    }

    private isEnableSeat( seat: number ): boolean {
		return null != this.enableSeats.find( elem => elem == seat );
    }

    public sendMsg(key: string, msg: object) {
        this.room?.send(key, msg);
    }

    private onNEW_ENTITY( msg ) {
		let entity = msg[ "newEntity" ];
		if ( entity != null ) {
			let uiEntity = this.GetEntityFromSeat( entity.seat );
			if ( uiEntity != null ) {
				uiEntity.SetEntity( entity, this.OpenProfile.bind(this), this.CloseProfile.bind(this) );
			}
		} else {
			console.log('entity == null ');
		}
    }

    private onCARD_DISPENSING( msg ) {
		console.log('onCARD_DISPENSING');
		this.uiCommunityCards.Reset();

		this.myCards = [msg[ "primary" ], msg[ "secondary" ]];
		this.CardDispensing();
    }

    private onYOUR_TURN( msg ) {
		console.log('onYOUR_TURN');

		let seat = msg[ "player" ];
		let duration = msg["duration"];

		for( let i = 0; i < this.SEAT_PLAYERS.length; i++ ) {
			let uiEntity = this.ENTITY_ELEMENTS[ i ];
			if( seat == this.SEAT_PLAYERS[ i ] ) {
				uiEntity?.startTurn(duration);
				uiEntity?.StartActionTimer();
				continue;
			}
			uiEntity?.endTurn();
		}

		if( this.mySeat == seat ) {

			let curBet = msg[ "maxBet" ];
			let myBet = msg[ "currBet" ];
			let minRaise = msg[ "minRaise" ];
			let chips = msg[ "chips" ];
			let curPot = msg[ "currPot" ];
			let isLast = msg["isLast"];
			let hasAction = msg["action"];
			let maxChips = msg['maxChip'];

			AudioController.instance.PlaySound('MY_TURN');
			let reservation = this.uiPlayerActionReservation.checkReservation( myBet, curBet );
			if ( reservation != ENUM_RESERVATION_TYPE.RESERVATION_NONE ) {

				this.uiPlayerActionReservation.hide();
				this.uiPlayerAction.hide();

				this.ENTITY_ELEMENTS.forEach( element => element.endTurn() );					
				if ( reservation == ENUM_RESERVATION_TYPE.RESERVATION_FOLD ) {

					let obj = {
						seat: this.mySeat
					};

					this.uiPlayerActionReservation.reset( true );
					this.scheduleOnce(()=>{
						this.sendMsg( "FOLD", obj );
					}, 1);
					
				} else if ( reservation == ENUM_RESERVATION_TYPE.RESERVATION_CHECK ) {

					let obj = {
						seat: this.mySeat,
					};

					this.uiPlayerActionReservation.reset( true );
					this.scheduleOnce(()=>{
						this.sendMsg( "CHECK", obj );
					}, 1);
				}				
				return;

			} else {
				let uiEntity =  this.GetEntityFromSeat(this.mySeat);
				if ( uiEntity != null ) {
					uiEntity.StartActionTimer();
				}
			}
			this.uiPlayerActionReservation.hide();

			this.uiPlayerAction.show( this.betMin, curBet, minRaise, curPot, myBet, chips, maxChips, isLast, hasAction);
			// this.playerActionInformation.Set( this.betMin, msg );
			// this.playerActionInformation.Show();

			this.uiPlayerAction.cbCheck = () => {
				this.ENTITY_ELEMENTS.forEach( element => element.endTurn() );

				let obj = {
					seat: this.mySeat,
				};
				this.sendMsg( "CHECK", obj );
				this.uiPlayerAction.hide();
			};

			this.uiPlayerAction.cbCall = ( betValue ) => {
				this.ENTITY_ELEMENTS.forEach( element => element.endTurn() );

				let obj = {
					betAmount: betValue,
					seat: this.mySeat,
				};
				this.sendMsg( "CALL", obj );
				this.uiPlayerAction.hide();
			};

			this.uiPlayerAction.cbBet = ( betValue, callValue, sound ) => {
				this.ENTITY_ELEMENTS.forEach( element => element.endTurn() );

				let obj = {
					betAmount: betValue,
					callValue: callValue,					
					seat: this.mySeat,
					sound: sound
				};

				this.sendMsg( "BET", obj );
				this.uiPlayerAction.hide();
			};

			this.uiPlayerAction.cbRaise = ( betValue, callValue, sound ) => {
				this.ENTITY_ELEMENTS.forEach( element => element.endTurn() );

				let obj = {
					betAmount: betValue,
					callValue: callValue,
					seat: this.mySeat,
					sound: sound
				};

				this.sendMsg( "RAISE", obj );
				this.uiPlayerAction.hide();
			};

			this.uiPlayerAction.cbAllIn = ( betValue, callValue ) => {
				this.ENTITY_ELEMENTS.forEach( element => element.endTurn() );

				let obj = {
					betAmount: betValue,
					callValue: callValue,					
					seat: this.mySeat,
				};
				this.sendMsg( "ALLIN", obj );
				this.uiPlayerAction.hide();
			};

			this.uiPlayerAction.cbFold = () => {
				this.ENTITY_ELEMENTS.forEach( element => element.endTurn() );

				let obj = {
					seat: this.mySeat
				};
				this.sendMsg( "FOLD", obj );
				this.uiPlayerAction.hide();
			};
		}
		else {
			this.uiPlayerAction.hide();
			let isSitOutStatus: boolean = false;

			let uiEntity =  this.GetEntityFromSeat(this.mySeat);
			if ( uiEntity != null ) {
				if ( uiEntity.getIsUiSitOut() == true ) {
					isSitOutStatus = true;
				}

				if ( uiEntity.isFold == true || this.myWaitStatus == true ) {
					return;
				}

				let curBet = msg[ "maxBet" ];
				let myBet = msg[ "currBet" ];

				this.uiPlayerActionReservation.show( myBet, curBet);
			}
		}
    }

    private onBLIND_BET( msg ) {
		console.log('onBLIND_BET');

		this.roundState = "BLIND_BET";

		let PLAYERS = msg["player"];

		let sb = msg[ "sb" ];
		let bb = msg[ "bb" ];
		let missSb = msg["missSb"];
		let missBb = msg["missBb"];
		let ante: number = msg['ante'];
		this.betMin = msg[ "maxBet" ];

		this.clearUiEntitiesAction();
		this.clearUiEntitiesBetValue();

		this.uiPlayerActionReservation.reset();
		this.uiPlayerActionReservation.showCheck( false );

		for ( let i: number = 0 ; i < PLAYERS.length ; i++ ) {
			let seat = PLAYERS[i].seat;
			if ( seat < 0 ) {
				continue;
			}

			let uiEntity = this.GetEntityFromSeat( seat );
			if ( uiEntity != null ) {

				uiEntity.SetBetValue( PLAYERS[i].totalBet );

				if ( PLAYERS[i].seat == sb.seat ) {
					uiEntity.SetBlindBet( PLAYERS[i].chips, true, false);
				}

				if ( PLAYERS[i].seat == bb.seat ) {
					uiEntity.SetBlindBet( PLAYERS[i].chips, false, true )
				}

				if ( PLAYERS[i].seat != sb.seat && PLAYERS[i].seat != bb.seat ) {
					uiEntity.SetChips( PLAYERS[i].chips );
				}

				if ( seat == this.mySeat ) {
					this.myChips == PLAYERS[i].chips;
					if ( PLAYERS[i].isBB == true) {
						this.uiPlayerActionReservation.showCheck( true );						
					}					
				}

			// 	console.log('onBLIND_BET: uiEntity != null ');
			// 	let missBlind = 0;
			// 	let missedSb = missSb.find( (e)=>{
			// 		return e == seat;
			// 	});

			// 	let missedBB = missBb.find( (e)=>{
			// 		return e == seat;
			// 	});

			// 	if ( missedSb != null ) {
			// 		missBlind += missSb[i].chips;

			// 	}

			// 	if ( missedBB != null ) {
			// 		missBlind += missBb[i].chips;
			// 	}

			// 	// uiEntity.SetBetValue( sb.currBet + missBlind + ante );				

			// 	if ( seat == sb.seat ) {
			// 		uiEntity.SetBetValue( sb.currBet + missBlind + ante );
			// 		uiEntity.SetBlindBet( sb.chips, true, false );
			// 	} else if ( seat == bb.seat ) {
			// 		uiEntity.SetBetValue( bb.currBet + missBlind + ante );
			// 		uiEntity.SetBlindBet( bb.chips, false, true );
			// 	}

			// 	if ( seat == this.mySeat ) {
			// 		this.myChips == PLAYERS[i].chips;
			// 		if ( seat == bb.seat ) {
			// 			this.uiPlayerActionReservation.showCheck( true );
			// 		}
			// 	}
			}
		}

		this.curPotValue = msg[ "pot" ];
		this.uiPot.UpdatePotTotal(this.curPotValue);
		this.uiPotChips.show( 0 );
		this.uiRoundPotValue.show( 0 );

		this.SetCurrentPot( this.curPotValue );
    }

    private onSUSPEND_ROUND( msg ) {
		console.log('onSUSPEND_ROUND');
		clearInterval(this.readyMessageHandler);

		this.roundState = "SUSPEND_ROUND";
		this.labelReadyMessage.node.active = false;

		let entities = msg[ "entities" ];
		this.countPlayers = entities.length;

		this.enableSeats = [];

		this.labelReadyMessage.string = '다른 플레이어를 기다리고 있습니다';
		this.labelReadyMessage.node.active = true;

		this.nodeCardShuffleMessage.active = false;

		this.uiPot.Hide();
		this.labelCurrentPot.node.active = false;

		for( let i = 0; i < this.SEAT_PLAYERS.length; i++ ) {
			let seat = this.SEAT_PLAYERS[ i ];
			let entity = entities.find( elem => elem.seat == seat );
			let uiEntity = this.ENTITY_ELEMENTS[ i ];
			if ( uiEntity != null ) {
				if ( entity != null ) {
					uiEntity.SetPrepareRound( entity );
					if( seat == this.mySeat ) {
						this.myWaitStatus = entity.wait;
						// this.isSitout = 
						this.isFold = false;
					}
					this.enableSeats.push( entity.seat );		
				} else {
					uiEntity.SetEscape();	
				}	
			}
		}

		this.ResetCurrentPot();
    }

    private onREADY_ROUND( msg ) {
		console.log('onREADY_ROUND');		
		this.roundState = "READY_ROUND";
		clearInterval(this.readyMessageHandler);		

		let timeMs = msg[ "timeMS" ] / 1000;
		let lb:string = "새로운 게임이 " + timeMs + " 초 후에 시작합니다";

		this.labelReadyMessage.string = lb;
		this.labelReadyMessage.node.active = true;

		this.readyMessageHandler = setInterval(()=> {
			timeMs--;
			lb = "새로운 게임이 " + timeMs + " 초 후에 시작합니다";
			this.labelReadyMessage.string = lb;
			if (timeMs < 0) {
				this.labelReadyMessage.node.active = false;
				clearInterval(this.readyMessageHandler);
			}
		}, 1000);
    }

    private onPREPARE_ROUND( msg ) {
		console.log('onPREPARE_ROUND');
		this.roundState = "PREPARE_ROUND";

		this.nodeCardShuffleMessage.active = false;
		this.labelReadyMessage.node.active = false;

		this.seatDealer = msg['dealerSeatPos'];
		this.seatSB = msg['sbSeatPos'];
		this.seatBB = msg['bbSeatPos'];

		let entities = msg[ "entities" ];
		this.countPlayers = entities.length;

		this.startBetFromServer = msg[ "startBet" ];
		this.betMin = msg[ "startBet" ];

		this.enableSeats = [];
		this.isAllIn = false;

		for( let i = 0; i < this.SEAT_PLAYERS.length; i++ ) {
			let seat = this.SEAT_PLAYERS[ i ];
			let entity = entities.find( elem => elem.seat == seat );
			let uiEntity = this.ENTITY_ELEMENTS[ i ];

			if( null == entity ) {
				uiEntity.SetEscape();
				continue;
			}

			if( seat == this.mySeat ) {
				this.myWaitStatus = entity.wait;
				this.isFold = false;
			}

			if ( uiEntity != null ) {
				if ( entity.wait == true ) {
					uiEntity.setUiWait();
				}
				else {
					this.enableSeats.push( entity.seat );
					uiEntity.SetPrepareRound( entity );
				}
			}
		}

		this.ClearPot();
		this.ClearEntitiesButtons();
		this.uiCommunityCards.Ready();
		this.ResetCurrentPot();

		let uiDealer = this.GetEntityFromSeat( this.seatDealer );
		if ( uiDealer != null ) {
			uiDealer.SetButtons('DEALER');
		}

		let uiSB = this.GetEntityFromSeat( this.seatSB );
		if ( uiSB != null ) {
			uiSB.SetButtons('SB');
		}

		let uiBB = this.GetEntityFromSeat( this.seatBB );
		if ( uiBB != null ) {
			uiBB.SetButtons('BB');
		}
    }

    private onHANDLE_ESCAPEE( msg ) {
		let seat = msg[ "seat" ];
		let uiEntity = this.GetEntityFromSeat( seat );
		if ( uiEntity != null ) {
			uiEntity.SetEscape();
		}
    }

	private onPRE_FLOP_END( msg ) {
		console.log('onPRE_FLOP_END');
		let potValue = msg['pot'];

		let cnt = 0;

		for( let i: number = 0; i < this.SEAT_PLAYERS.length; i++ ) {
			let seat = this.SEAT_PLAYERS[ i ];

			if( this.isEnableSeat( seat ) == true ) {
				let uiEntity = this.GetEntityFromSeat(seat);
				if ( uiEntity != null ) {
					cnt++;
					uiEntity.setChipsMoveToPot( cnt, this.rootPotChips, ( idx: number )=>{
						uiEntity.clearUiBetValue();

						if ( (cnt) == idx) {
							this.uiPotChips.show( potValue );
							this.uiRoundPotValue.show( potValue );
						}
					});
				}
			}
		}
    }

    private onSHOW_FLOP( msg ) {
		console.log('onSHOW_FLOP');
		this.roundState = "SHOW_FLOP";

		this.uiPlayerActionReservation.resetCheck();

		this.clearUiEntitiesAction();

		let cards = msg[ "cards" ];

		this.uiCommunityCards.ShowFlopCards( cards, ()=>{
			if ( this.isEnableSeat( this.mySeat ) == true ) {
				this.SetMyHandRank();
			}
		} );

		this.curPotValue = msg['pot'];
		this.uiPot.UpdatePotTotal( this.curPotValue );
		this.uiPotChips.show( this.curPotValue );
		this.uiRoundPotValue.show( this.curPotValue );
		this.SetCurrentPot( this.curPotValue );
    }

	private onFLOP_END( msg ) {
		console.log('onFLOP_END');
		let potValue = msg['pot'];

		let cnt = 0;

		for( let i: number = 0; i < this.SEAT_PLAYERS.length; i++ ) {
			let seat = this.SEAT_PLAYERS[ i ];

			if( this.isEnableSeat( seat ) == true ) {
				let uiEntity = this.GetEntityFromSeat(seat);
				if ( uiEntity != null ) {
					cnt++;
					uiEntity.setChipsMoveToPot( cnt, this.rootPotChips, ( idx: number )=>{
						uiEntity.clearUiBetValue();

						if ( (cnt) == idx) {
							this.uiPotChips.show( potValue );
							this.uiRoundPotValue.updatePotVaule( potValue );
						}
					});
				}
			}
		}
    }

    private onSHOW_TURN( msg ) {
		console.log( 'onSHOW_TURN' );		
		this.roundState = "SHOW_TURN";

		this.uiPlayerActionReservation.resetCheck();
		this.clearUiEntitiesAction();

		let cards = msg[ "cards" ];

		this.uiCommunityCards.ShowTurnCard( cards, ()=>{
			if ( this.isEnableSeat( this.mySeat ) == true ) {
				this.SetMyHandRank();
			}
		} );

		this.curPotValue = msg['pot'];
		this.uiPot.UpdatePotTotal( this.curPotValue );
		this.uiPotChips.show( this.curPotValue );
		this.uiRoundPotValue.show( this.curPotValue );
		this.SetCurrentPot( this.curPotValue );
    }

	private onTURN_END( msg ) {
		console.log('onTURN_END');
		let potValue = msg['pot'];

		let cnt = 0;

		for( let i: number = 0; i < this.SEAT_PLAYERS.length; i++ ) {
			let seat = this.SEAT_PLAYERS[ i ];

			if( this.isEnableSeat( seat ) == true ) {
				let uiEntity = this.GetEntityFromSeat(seat);
				if ( uiEntity != null ) {
					cnt++;
					uiEntity.setChipsMoveToPot( cnt, this.rootPotChips, ( idx: number )=>{
						uiEntity.clearUiBetValue();

						if ( (cnt) == idx) {
							this.uiPotChips.show( potValue );
							this.uiRoundPotValue.updatePotVaule( potValue );
						}
					});
				}
			}
		}
    }	

    private onSHOW_RIVER( msg ) {
		console.log('onSHOW_RIVER');
		this.roundState = "SHOW_RIVER";

		this.uiPlayerActionReservation.resetCheck();
		this.clearUiEntitiesAction();

		let cards = msg[ "cards" ];

		this.uiCommunityCards.ShowRiverCard( cards, ()=>{
			if ( this.isEnableSeat( this.mySeat ) == true ) {
				this.SetMyHandRank();
			}
		});

		this.curPotValue = msg['pot'];
		this.uiPot.UpdatePotTotal( this.curPotValue );
		this.uiPotChips.show( this.curPotValue );
		this.uiRoundPotValue.show( this.curPotValue );
		this.SetCurrentPot( this.curPotValue );
    }

	private onRIVER_END( msg ) {
		console.log('onRIVER_END');
		let potValue = msg['pot'];

		this.clearUiEntitiesAction();

		let cnt = 0;

		for( let i: number = 0; i < this.SEAT_PLAYERS.length; i++ ) {
			let seat = this.SEAT_PLAYERS[ i ];

			if( this.isEnableSeat( seat ) == true ) {
				let uiEntity = this.GetEntityFromSeat(seat);
				if ( uiEntity != null ) {
					cnt++;
					uiEntity.setChipsMoveToPot( cnt, this.rootPotChips, ( idx: number )=>{
						uiEntity.clearUiBetValue();

						if ( (cnt) == idx) {
							this.uiPotChips.show( potValue );
							this.uiRoundPotValue.updatePotVaule( potValue );							
						}
					});
				}
			}
		}
    }

	private ShowdownOpenHands( msg ) {
		let pot: any = msg['pot'];
		this.uiRoundPotValue.show(pot);

		let hands = msg['hands'];
		let keys = Object.keys( hands );
		this.PLAYER_CARDS = {};

		keys.forEach( key => {
			let seat = Number.parseInt( key );

			if( false == this.isEnableSeat( seat ) ) {
				return;
			}

			this.PLAYER_CARDS[ seat ] = {
				cards: [ hands[key][0], hands[key][1] ],
			};
		} );
		this.ShowPlayersHand();
	}

	private onSHOWDOWN_START ( msg ) {
		console.log('onSHOWDOWN_START');

		let pot: any = msg['pot'];

		this.uiPlayerActionReservation.reset();
		this.uiPlayerAction.hide();
		this.ENTITY_ELEMENTS.forEach(element => element.endTurn());

		let hands = msg['hands'];
		let keys = Object.keys( hands );
		this.PLAYER_CARDS = {};

		keys.forEach( key => {
			let seat = Number.parseInt( key );

			if( false == this.isEnableSeat( seat ) ) {
				return;
			}

			this.PLAYER_CARDS[ seat ] = {
				cards: [ hands[key][0], hands[key][1] ],
			};
		} );

		this.ChipsMoveToPot( pot, ()=>{
			this.uiRoundPotValue.show(pot);
			this.uiShowDownEffect.Show(()=>{
				this.ShowPlayersHand();
			});
		});
	}

	private onSHOWDOWN_FLOP( msg ) {
		console.log('onSHOWDOWN_FLOP');
		let cards = msg['cards'];

		this.uiCommunityCards.ShowFlopCards( cards, ()=>{
			this.UpdatePlayerHandRank();
		});
	}

	private onSHOWDOWN_TURN( msg ) {
		console.log('onSHOWDOWN_TURN');
		let cards = msg['cards'];

		this.uiCommunityCards.ShowTurnCard( cards, ()=>{
			this.UpdatePlayerHandRank();			
		});
	}

	private onSHOWDOWN_RIVER( msg ) {
		console.log('onSHOWDOWN_RIVER');
		let cards = msg['cards'];
		let river = cards[0];

		this.uiEffectShowRiver.Show( river, ()=>{
			this.uiCommunityCards.ShowRiverCardImmediate( cards );
			this.UpdatePlayerHandRank();
		});
	}
	
	private ChipsMoveToPot( value, cbDone: ()=>void ) {
		let cnt = 0;

		for( let i: number = 0; i < this.SEAT_PLAYERS.length; i++ ) {
			let seat = this.SEAT_PLAYERS[ i ];

			if( this.isEnableSeat( seat ) == true ) {
				let uiEntity = this.GetEntityFromSeat(seat);
				if ( uiEntity != null ) {
					cnt++;
					uiEntity.setChipsMoveToPot( cnt, this.rootPotChips, ( idx: number )=>{
						uiEntity.clearUiBetValue();

						if ( (cnt) == idx) {
							this.uiPotChips.show( value );
							this.uiRoundPotValue.updatePotVaule( value );

							if ( cbDone != null ) {
								cbDone();
							}
						}
					});
				}
			}
		}		
	}

    private onCLEAR_ROUND( msg ) {
		console.log('onCLEAR_ROUND');

		this.uiCommunityCards.Reset();
		this.ResetCurrentPot();
		this.buttonShowCard.node.active = false;

		this.labelReadyMessage.node.active = false;
		this.nodeCardShuffleMessage.active = false;

		this.uiWinEffect.hide();
		this.uiPotChips.hide();
		this.uiRoundPotValue.hide();

		this.isAllIn = false;
		let entities = msg[ "entities" ];
		this.countPlayers = entities.length;

		this.uiPlayerActionReservation.reset();

		this.nodeCardShuffleMessage.active = true;
		AudioController.instance.PlaySound('CARD_SHUFFLE');

		for( let i = 0; i < this.SEAT_PLAYERS.length; i++ ) {
			let seat = this.SEAT_PLAYERS[ i ];
			let uiEntity = this.GetEntityFromSeat( seat );
			let entity = entities.find( elem => elem.seat == seat );

			if ( uiEntity != null && entity != null ) {
				uiEntity.SetClearRound( entity );
				if( seat == this.mySeat ) {
					this.myChips = entity.chips;
					this.isSitout = entity.isSitOut;
				}	
			} else {
				uiEntity.SetEscape();
			}
		}

		this.ClearPot();
		this.uiCommunityCards.Ready();

		let me = entities.find( elem => elem.seat == this.mySeat );

		if(me === null || me === undefined)	{
			return;
		}

		Board.balance = me.balance;
		if( me.enoughChip == false ) {

			let self = this;
			let leave: boolean = false;
			if( Board.balance + me.chips < Board.minStakePrice ) {

				this.scheduleOnce(()=>{
					if ( self != null ) {
						UiGameSystemPopup.instance.closePopup();
						self.room?.leave(false);						
					}

				}, 5 );

				UiGameSystemPopup.instance.showOkPopup('리 바이인', '최소 바이인을 할 수 없습니다.\r\n테이블에서 나갑니다.', ()=>{
					UiGameSystemPopup.instance.closePopup();
					self.room?.leave(false);
					self = null;
				} );

				return;
			}


			this.uiBuyIn.reBuyIn( Board.balance, this.myChips , (res)=>{
				this.sendMsg('RE_BUY', {
					seat: this.mySeat,
					amount: res,
				});
			}, ()=>{
				self.room?.leave();
			});
		}

		//
    }

    private onCHECK( msg ) {
		console.log('onCHECK');

		this.curPotValue = msg[ "pot" ];
		this.labelCurrentPot.string = CommonUtil.getKoreanNumber( this.curPotValue );
		this.uiPot.UpdatePotTotal(this.curPotValue);

		AudioController.instance.PlaySound('VOICE_ACTION_CHECK');
		this.uiPlayerActionReservation.showCheck( true );

		let seat = msg[ "seat" ];
		let uiEntity = this.GetEntityFromSeat( seat );
		if ( uiEntity != null ) {
			uiEntity.endTurn();
			uiEntity.SetAction( "check" );			
		}

		this.SetCurrentPot( this.curPotValue );
    }

    private onRAISE( msg ) {
		this.curPotValue = msg[ "pot" ];
		this.uiPlayerActionReservation.showCheck( false );
		let seat = msg[ "seat" ];
		let chips = Number.parseInt( msg[ "chips" ] );
		let sound = Number.parseInt( msg['sound'] );

		let uiEntity = this.GetEntityFromSeat( seat );
		if ( uiEntity != null ) {
			uiEntity.endTurn();
			uiEntity?.SetChips( chips );

			if( this.mySeat == seat ) {
				this.myChips = chips;
			}

			if( true == msg[ "allin" ] ) {
				uiEntity.SetAllIn();			
				AudioController.instance.PlaySound('VOICE_ACTION_ALLIN');				
			}
			else {
				uiEntity.SetAction( "raise" );
				switch ( sound) {
					case Number( ENUM_BET_SOUND.BET_QUATER ) :	//quater
						AudioController.instance.PlaySound('VOICE_BETTING_QUATER');					
						break;
					case Number( ENUM_BET_SOUND.BET_HALF) :	//half
						AudioController.instance.PlaySound('VOICE_BETTING_HALF');					
						break;
					case Number( ENUM_BET_SOUND.BET_FULL) :	//full
						AudioController.instance.PlaySound('VOICE_BETTING_FULL');
					break;
	
					case Number( ENUM_BET_SOUND.BET_MAX) :	//max
						AudioController.instance.PlaySound('VOICE_ACTION_ALLIN');
					break;
	
					default:
						AudioController.instance.PlaySound('BET_CHIPS');
				}
			}
			uiEntity.SetBetValue( msg[ "bet" ] );
		}

		this.setUiPot(msg["dpPot"]);
		this.uiPot.UpdatePotTotal(this.curPotValue);
		this.SetCurrentPot( this.curPotValue );
    }

    private onFOLD( msg ) {
		AudioController.instance.PlaySound('VOICE_ACTION_DIE');

		let seat = msg[ "seat" ];
		let uiEntity = this.GetEntityFromSeat( seat );
		if ( uiEntity != null ) {
			uiEntity.endTurn();
			uiEntity.clearUiAction();

			if( this.mySeat != seat ) {
				uiEntity.ClearHandRank();
			}
			else {
				this.isFold = true;
			}
			uiEntity.SetFold();
		}
    }

    private onCALL ( msg ) {

		this.curPotValue = msg[ "pot" ];
		let chips = Number.parseInt( msg[ "chips" ] );
		let seat = msg[ "seat" ];

		let uiEntity = this.GetEntityFromSeat( seat );
		if ( uiEntity != null ) {
			uiEntity.endTurn();
			uiEntity.SetChips( chips );

			if( true == msg[ "allin" ] ) {
				uiEntity?.SetAllIn();
				AudioController.instance.PlaySound('VOICE_ACTION_ALLIN');
			}
			else {
				uiEntity?.SetAction( "call" );
				AudioController.instance.PlaySound('VOICE_ACTION_CALL');
			}
			uiEntity.SetBetValue( msg[ "bet" ] );
		}

		if( this.mySeat == seat ) {
			this.myChips = chips;
		}

		this.uiPot.UpdatePotTotal(this.curPotValue);
		this.SetCurrentPot( this.curPotValue );
    }

    private onBET ( msg ) {

		this.curPotValue = msg[ "pot" ];
		this.uiPlayerActionReservation.showCheck( false );

		let seat = msg[ "seat" ];
		let sound = Number.parseInt( msg['sound'] );
		let chips = Number.parseInt( msg[ "chips" ] );

		let uiEntity = this.GetEntityFromSeat( seat );
		if ( uiEntity != null ) {
			uiEntity.endTurn();
			uiEntity.SetChips( chips );
			if ( seat == this.mySeat ) {
				this.myChips = chips;
			}

			if ( msg['allin'] == true ) {
				uiEntity.SetAllIn();
				AudioController.instance.PlaySound('VOICE_ACTION_ALLIN');
			} else {
				uiEntity.SetAction( "bet" );
				switch ( sound) {
					case Number( ENUM_BET_SOUND.BET_QUATER ) :	//quater
						AudioController.instance.PlaySound('VOICE_BETTING_QUATER');					
						break;
					case Number( ENUM_BET_SOUND.BET_HALF) :	//half
						AudioController.instance.PlaySound('VOICE_BETTING_HALF');					
						break;
					case Number( ENUM_BET_SOUND.BET_FULL) :	//full
						AudioController.instance.PlaySound('VOICE_BETTING_FULL');
					break;
	
					case Number( ENUM_BET_SOUND.BET_MAX) :	//max
						AudioController.instance.PlaySound('VOICE_ACTION_ALLIN');
					break;
	
					default:
						AudioController.instance.PlaySound('BET_CHIPS');
				}
			}
			uiEntity.SetBetValue( msg[ "bet" ] );
		}

		this.uiPot.UpdatePotTotal(this.curPotValue);
		this.SetCurrentPot( this.curPotValue );
    }

    private onSIT_OUT( msg: any ) {
		console.log('onSIT_OUT');

		let seat = msg['seat'];

		if( seat == null || seat == undefined ){
			return;
		}

		let uiEntity = this.GetEntityFromSeat( seat );
		if ( uiEntity != null ) {
			uiEntity.endTurn();
			uiEntity.SetSitout();
		}

		if ( seat == this.mySeat ) {
			this.buttonSitout.interactable = true;
			this.buttonSitout.node.active = false;

			this.buttonSitback.interactable = true;
			this.buttonSitback.node.active = true;

			this.labelReservationSitout.node.active = false;
			this.buttonSitoutCancel.interactable = true;
			this.buttonSitoutCancel.node.active = false;
		}
    }

	private onSIT_OUT_PEND( msg: any ) {
		console.log('onSIT_OUT_PEND');

		this.buttonSitout.interactable = true;
		this.buttonSitout.node.active = false;
		this.buttonSitback.node.active = false;

		this.buttonSitoutCancel.interactable = true;
		this.buttonSitoutCancel.node.active = true;
		this.labelReservationSitout.node.active = true;
    }

	private onSIT_OUT_CANCEL( msg: any ) {
		this.buttonSitoutCancel.interactable = true;
		this.buttonSitoutCancel.node.active = false;

		this.buttonSitout.interactable = true;
		this.buttonSitout.node.active = true;

		this.labelReservationSitout.node.active = false;
	}

    private onSIT_BACK( msg: any ) {
		console.log('onSIT_BACK');		
		let seat = msg['seat'];
		
		if ( seat == null || seat == undefined ) {
			return;
		}

		let uiEntity = this.GetEntityFromSeat( seat );
		if ( uiEntity != null ) {
			uiEntity.SetSitback();
		}

		if ( seat == this.mySeat ) {
			this.buttonSitback.interactable = true;
			this.buttonSitback.node.active = false;

			this.buttonSitout.interactable = true;
			this.buttonSitout.node.active = true;

			this.labelReservationSitout.node.active = false;
			this.buttonSitoutCancel.node.active = false;
		}
    }

    private onSHOW_CARD( msg ) {
		let seat = msg[ "seat" ];
		let cards = msg[ "cards" ];

		if ( seat == this.mySeat ) {

		} else {
			let uiEntity = this.GetEntityFromSeat( seat );
			if ( uiEntity != null ) {
				uiEntity.HideHiddenCard();

				let hands: number[] = [cards[0], cards[1]];
				uiEntity.ShowHands( hands, ()=>{
					this.SetPlayerHandRank( hands, uiEntity );
					AudioController.instance.PlaySound('CARD_SHOW');
				});
			}
		}
    }

    private onPLAYER_CARDS( msg ) {
		console.log( 'onPLAYER_CARDS ');

		let allin = msg[ "allin" ];

		if ( allin == true ) {
			return;
		}

		let cards = msg[ "cards" ];
		let keys = Object.keys( cards );
		this.PLAYER_CARDS = {};

		keys.forEach( key => {
			let seat = Number.parseInt( key );

			if( false == this.isEnableSeat( seat ) ) {
				return;
			}

			this.PLAYER_CARDS[ seat ] = {
				cards: [ cards[key][0], cards[key][1] ],
			};
		} );

		this.ShowPlayersHand();
		this.ClearUiEntities();
    }

    private onWINNERS ( msg ) {
		console.log('onWINNERS');

		this.msgWINNERS = msg;
		this.uiPlayerActionReservation.reset();
		this.uiPlayerAction.hide();

		this.EndTurns();
		this.SetWinners();

		let folders = msg['folders'];
		let folder = folders.find( (e)=>{
			return e == this.mySeat;
		});

		if ( folder != null ) {
			this.buttonShowCard.node.active = true;
		} else {
			this.buttonShowCard.node.active = false;			
		}
    }

    private onClickShowCard( button: Button ) {
		button.node.active = false;
		AudioController.instance.ButtonClick();
		if(null == this.msgWINNERS){
			return;
		}

		let obj = {
			seat: this.mySeat
		};

		this.sendMsg( "SHOW_CARD", obj );
    }

    private SetWinners() {
		let entities = this.msgWINNERS[ "winners" ];

		if ( this.msgWINNERS['skip'] == true ) {
			let cnt: number = 0;
			let potValue = this.msgWINNERS['pot'];

			for( let i: number = 0; i < this.SEAT_PLAYERS.length; i++ ) {
				let seat = this.SEAT_PLAYERS[ i ];

				if( this.isEnableSeat( seat ) == true ) {
					let uiEntity = this.GetEntityFromSeat(seat);
					if ( uiEntity != null ) {
						cnt++;
						uiEntity.setChipsMoveToPot( cnt, this.uiRoundPotValue.node , ( idx: number )=>{
							uiEntity.clearUiBetValue();

							if ( ( cnt ) == idx) {
								this.uiPotChips.show( potValue );
								this.uiRoundPotValue.show( potValue );

								this.scheduleOnce(()=>{
									this.ResultSkipAnimation( entities, this.msgWINNERS["dpPot"] );
								}, 1.0 );
							}
						});
					}
				}
			}
		} else {
			this.ResultPotAnimation( entities, this.msgWINNERS["dpPot"]).then(() =>{
				this.setAniPotUiFadeOut();
			});
		}
    }

	private async ResultSkipAnimation ( winners: any[], pot: any[] ) {
		let uiPots : Pot[] = this.uiPot.GetPots();		
		for(let i = 0; i < winners.length; i++){
			let winner = winners[i];

			let uiEntity = this.GetEntityFromSeat( winner.seat );

			uiEntity?.setUiPlay();
			this.uiPot.UpdatePotTotal( winner.winAmount );

			let isReturn : boolean = winner.fold;
			if ( isReturn == false ) {
				uiEntity.SetWinner( this.uiRoundPotValue.node , winner.winAmount );
				AudioController.instance.PlaySound('WIN');
			}
		}
		
		uiPots.forEach(element => {
			element.ClearCallback();
		});

		this.uiPot.UpdatePotTotal(0);
		this.uiPot.HidePotInfo();
		await new Promise(ret => setTimeout(ret, 2000));
	}

    private async ResultPotAnimation(winners: any[], pot: any[] ) {

		let uiPots : Pot[] = this.uiPot.GetPots();
		
		this.setUiPot(pot);

		let svPots : any[] = this.uiPot.svPots;

		let returnPot : any[] = [];
		let showPot : any[] = [];

		let totalPotValue = 0;

		svPots.forEach(element => {
			totalPotValue += element.total;

			if(element.players.length <= 1){
				returnPot.push(element);
				return;
			}

			showPot.push(element);
		});

		let potCount = showPot.length;

		this.uiPot.UpdatePotTotal(totalPotValue);
		this.uiPot.SetPotCount(potCount);

		let retAnimCount = 0;

		for (let i = 0; i < returnPot.length; i++) {
			let pot: any = returnPot[i];

			if (pot.players.length > 1) {
				continue;
			}

			totalPotValue = pot.total;

			this.uiPot.UpdatePotTotal(totalPotValue);

			let uiEntity = this.GetEntityFromSeat(pot.players[0]);

			uiEntity?.setUiPlay();	
			uiEntity?.SetReturn( pot.total );
			retAnimCount++;
		}

		await new Promise( ret => setTimeout(ret, 1500) );

		for(let i = 0; i < showPot.length; i++){
			let pot = showPot[i];

			let info: any = null;
			for(let j = 0; j < pot.winner.length; j++){
				let chip = Number(pot.total) / Number(pot.winner.length);
				
				let uiEntity = this.GetEntityFromSeat( pot.winner[j] );
				
				if(uiEntity != null ){
					uiEntity?.setUiPlay();
					uiEntity.SetWinner( this.uiRoundPotValue.node , chip );
				}
			}

			let wns: any[] = [];
			for ( let w: number = 0 ; w < pot.winner.length ; w++ ) {
				let e = winners.find ( (elem) => { 
					return elem.seat == pot.winner[w];
				});

				if ( e != null ) {
					wns.push(e);
				}
			}

			info = winners.find((elem) => {return elem.seat == pot.winner[0];});
			if ( info != null ) {
				let cards: any = this.msgWINNERS['cards'];

				let ev = this.GetHandsEval( wns[0].cards, cards );
				this.uiWinEffect.show( wns, info.eval.handType, ev );
			}

			this.ShowWinningCards(wns);
			AudioController.instance.PlaySound('WIN');

			potCount--;
			this.uiPot.SetPotCount(potCount);

			totalPotValue =  pot.total;

			this.uiPot.UpdatePotTotal(totalPotValue);

			let count = i + 1;

			for(let j = 0; j < uiPots.length; j++){
				let ui = uiPots[j];
				ui.ClearCallback();
				
				if(count >= showPot.length){
					ui.showRoot.active = false;
					continue;
				}

				let potInfo = showPot[count];

				ui.showRoot.active = true;
				ui.valueLabel.string = CommonUtil.getKoreanNumber(potInfo.total);
				count++;
			}

			this.uiPot.HidePotInfo();
			await new Promise(ret => setTimeout(ret, 2500));
		}
    }

	private ShowWinningCards( wns: any ) {
		let cards: any = this.msgWINNERS['cards'];

		let pools: number[] = [];
		wns.forEach( ( e )=>{
			let c: any = this.GetHandsEval( e.cards, cards )['cards'];
			c.forEach( (elem)=> {
				let name = elem.value + elem.suit;
				let num = this.ConvertCardNameToIndex( name );

				pools.push(num);
			});

			this.uiCommunityCards.SetWinCards( pools );

			let uiEntity = this.GetEntityFromSeat(e.seat);
			if ( uiEntity != null ) {
				uiEntity.SetWinCards(pools);
			}
		});
	}

	private ConvertCardNameToIndex( name: string ): number {
		let n: number = -1;
		for ( let i: number = 0 ; i < totalCards.length; i++ ) {
			if ( name == totalCards[i] ) {
				n = i;
				break;
			}
		}
		return n;
	}

	private CardDispensing() {
		let seats: number[] = [];
		for( let i: number = 0; i < this.SEAT_PLAYERS.length; i++ ) {
			let seat = this.SEAT_PLAYERS[ i ];

			if ( this.isEnableSeat ( seat) == false ) {
				continue;
			}

			seats.push(i);
			let uiEntity = this.ENTITY_ELEMENTS[i];
			if ( uiEntity != null ) {

				uiEntity.PrepareDispensingCards();
			}
		}

		this.SetDispensingAnimation( seats, 0, ()=>{
			this.SetDispensingAnimation( seats, 1, ()=>{

				if ( this.isEnableSeat ( this.mySeat ) == true ) {
					this.ShowMyHands();
				}
			});
		});
	}

	private SetDispensingAnimation( seats: any, card: number, cb: ()=> void ) {
		let interval = 0.1;
		let duration = 0.2;

		for ( let i: number = 0 ; i < seats.length; i++ ) {
			let uiEntity = this.ENTITY_ELEMENTS[ seats[i] ];
			if (uiEntity != null ) {

				uiEntity.CardDispensing( card, i, duration, i * interval, (idx)=>{
					if ( (seats.length - 1 ) == idx ) {
						if ( cb != null ) {
							cb();
						}
					}
				});
			}
		}
	}

	private ShowPlayersHand() {
		let keys = Object.keys( this.PLAYER_CARDS );
		keys.forEach( key => {
			let seat = Number.parseInt( key );

			if ( seat != this.mySeat ) {
				let uiEntity = this.GetEntityFromSeat( seat );
				if ( uiEntity != null ) {
					uiEntity.HideHiddenCard();

					uiEntity.ShowHands( this.PLAYER_CARDS[key].cards, ()=>{
						this.SetPlayerHandRank( this.PLAYER_CARDS[key].cards, uiEntity );
					} );
				}
			}
		} );
	}

	private UpdatePlayerHandRank() {
		let keys = Object.keys( this.PLAYER_CARDS );
		keys.forEach( key => {
			let seat = Number.parseInt( key );

			if ( seat != this.mySeat ) {
				let uiEntity = this.GetEntityFromSeat( seat );
				if ( uiEntity != null ) {
					this.SetPlayerHandRank( this.PLAYER_CARDS[key].cards, uiEntity );
				}
			}
			else {
				this.SetMyHandRank();
			}
		} );
	}

	private ShowMyHands() {

		let uiEntity = this.GetEntityFromSeat( this.mySeat );
		if ( uiEntity != null ) {

			uiEntity.ShowHands( this.myCards, ()=>{
				AudioController.instance.PlaySound('CARD_FLIP');
				this.SetMyHandRank();
			} );
		}
	}
    
    private setAniPotMoveToWinner( startNode: Node, seat: number, movingChipsIdx: number, chips: number, 
        isPlaySound: boolean, isReturn: boolean, duration: number = 1) {

			let obj = false === isReturn ?  this.objPotMoveToWinnerChips[ movingChipsIdx ] : this.objPotReturnChips[ movingChipsIdx ];
			let uiEntity = this.GetEntityFromSeat( seat );
	
			if(null == uiEntity){
				return;
			}
	
			if (true === isReturn) {
	
				for (let i = 0; i < obj.sprChips.length; i++) {
					let moveTarget = obj.sprChips[i];
					let delay = i * 0.05;
	
					let fromNode = null === startNode || undefined === startNode ? this.uiPot.maxPotRoot : startNode;
	
					let pos = fromNode.parent.getComponent(UITransform).convertToWorldSpaceAR(fromNode.position);
					pos = moveTarget.node.parent.getComponent(UITransform).convertToNodeSpaceAR(pos);
	
					let to = uiEntity.node.parent.getComponent(UITransform).convertToWorldSpaceAR(uiEntity.node.position);
					to = uiEntity.node.parent.getComponent(UITransform).convertToNodeSpaceAR(to);
	
					let isLast = i == obj.sprChips.length - 1;
					let dur = 0.8;
					this.setTweenMoveFromTo(moveTarget, new Color(Color.WHITE), pos, to, delay, dur, this.easeOutQuart, () => {
						if (true == isPlaySound) {
							AudioController.instance.PlaySound('CHIP_START');

						}
					}, isLast ? () => {
						uiEntity?.SetChips(chips);
						if (true == isPlaySound) {
							AudioController.instance.PlaySound('CHIP_END');

						}
					} : () => {
						if (true == isPlaySound) {
							AudioController.instance.PlaySound('CHIP_END');
						}
					});
				}
	
				return;
			}
	
			let bezierPathNodes: Node[] = [];
			bezierPathNodes.push( null=== startNode || undefined === startNode ? this.uiPot.maxPotRoot : startNode);
	
			uiEntity.bezierPoints.forEach(elem => bezierPathNodes.push(elem));
	
			bezierPathNodes.push(uiEntity.node);
	
			for( let i = 0; i < obj.sprChips.length; i++ ) {
				let moveTarget = obj.sprChips[ i ];
				let delay = i * 0.05;
	
				let bezierPts = [];
				for( let i = 0; i < bezierPathNodes.length; i++ ) {
					let pos = bezierPathNodes[ i ].parent.getComponent( UITransform ).convertToWorldSpaceAR( bezierPathNodes[ i ].position );
					pos = moveTarget.node.parent.getComponent( UITransform ).convertToNodeSpaceAR( pos );
					bezierPts.push( pos );
				}
	
				let isLast = i == obj.sprChips.length - 1;
	
				this.setTweenFadeInOutFromToMove( moveTarget, new Color( Color.WHITE ), bezierPts, delay, duration, this.easeOutQuart, () => {
					if( true == isPlaySound ) {
						AudioController.instance.PlaySound('CHIP_START');
					}
				}, isLast ? () => {
					uiEntity?.SetChips( chips );
					if( true == isPlaySound ) {
						AudioController.instance.PlaySound('CHIP_END');
					}
				} : () => {
					if( true == isPlaySound ) {
						AudioController.instance.PlaySound('CHIP_END');
					}
				} );
			}
    }

    private setAniPotUiFadeOut() {
		if (this.spritePotRoot != null ) {
			this.spritePotRoot.node.active = false;
		}
    }

    setTweenMoveFromTo( sprite: Sprite, originalColor, from: Vec3, to: Vec3, delay: number,
        duration: number, easingFunc: ( k: number )=> number, onStart: ()=>void, onFinished: ()=>void ) {

			sprite.node.active = true;
			sprite.color = new Color( originalColor.r, originalColor.g, originalColor.b, 0 );
	
			let tw = tween( sprite.node )
				.set( {
					position: from
				} )
				.delay( delay );
	
			if( null != onStart ) {
				tw.call( onStart );
			}
	
			tw.to( duration, {
				position: to,
			}, {
				onUpdate: ( target: Node, ratio: number ) => {
	
					let tv = bezier( 0, 0.25, 0.25, 1, ratio );
	
					let a = bezier( 255, 255, 255, 0, tv );
					if( a > originalColor.a ) {
						a = originalColor.a;
					}
					sprite.color = new Color( originalColor.r, originalColor.g, originalColor.b, a );
				},
			} );
	
			if( null != onFinished ) {
				tw.call( onFinished );
			}
	
			tw.union();
			tw.start();
    }

	setTweenFadeInOutFromToMove( sprite: Sprite, originalColor: Color, bezierPath: Vec3[], delay: number,
		duration: number, easingFunc: ( k: number ) => number, onStart: () => void, onFinished: () => void ) {

		sprite.node.active = true;

		sprite.color = new Color( originalColor.r, originalColor.g, originalColor.b, 0 );

		let tw = tween( sprite.node )
			.set( {
				position: bezierPath[ 0 ]
			} )
			.delay( delay );

		if( null != onStart ) {
			tw.call( onStart );
		}

		tw.to( duration, {
			// position: to,
		}, {
			onUpdate: ( target: Node, ratio: number ) => {

				let tv = bezier( 0, 0.25, 0.25, 1, ratio );
				let x = bezier( bezierPath[ 0 ].x, bezierPath[ 1 ].x, bezierPath[ 2 ].x, bezierPath[ 3 ].x, tv );
				let y = bezier( bezierPath[ 0 ].y, bezierPath[ 1 ].y, bezierPath[ 2 ].y, bezierPath[ 3 ].y, tv );
				sprite.node.position = new Vec3( x, y, 0 );

				let a = bezier( 255, 255, 255, 0, tv );
				if( a > originalColor.a ) {
					a = originalColor.a;
				}
				sprite.color = new Color( originalColor.r, originalColor.g, originalColor.b, a );
			},
		} );

		if( null != onFinished ) {
			tw.call( onFinished );
		}

		tw.union();
		tw.start();
	}


    easeOutQuart( x: number ): number {
		return 1 - Math.pow( 1 - x, 4 );        
    }

	getBezierSampleValue( points: Vec3[], t: number ): Vec3 {
		let x = bezier( points[ 0 ].x, points[ 1 ].x, points[ 2 ].x, points[ 3 ].x, t );
		let y = bezier( points[ 0 ].y, points[ 1 ].y, points[ 2 ].y, points[ 3 ].y, t );
		return new Vec3( x, y, 0 );
	}

    private onBUY_IN( msg ) {

		Board.balance = Number.parseInt( msg[ "balance" ] );
		Board.small = Number.parseInt( msg[ "small" ] );
		Board.big = Number.parseInt( msg[ "big" ] );
		Board.id = Number.parseInt( msg[ "id" ] );
		Board.passPrice = msg[ "passPrice" ];
		Board.minStakePrice = msg["minStakePrice"];
		Board.maxStakePrice = msg["maxStakePrice"];

		let self =this;
		this.uiBuyIn.buyIn((res)=>{
			Board.room.send( "BUY_IN", { id: Board.id, buyInAmount: res } );
			this.uiBuyIn.closePopup();

		}, ()=>{
			self.room.send('CANCEL_BUY_IN');
			this.uiSeats.onResultFail();
			this.uiBuyIn.closePopup();
		});
    }

    private onRES_BUY_IN( msg ) {
        let ret: number = msg["ret"];
        if (ret === -1) {

        } else {
			this.uiBuyIn.buyInDone();
            this.uiSeats.end();
            this.show();

			if ( ret != 0 ) {
				this.room?.leave();
				return;
			}
        }
    }

    private onRES_RE_BUY( msg ) {

		if ( 0 != msg['resultCode'] ) {
			return;
		}

		Board.balance = Number.parseInt( msg['balance ']);
		let uiEntity = this.GetEntityFromSeat( this.mySeat );
		let chips = Number.parseInt( msg ['chips'] );

		uiEntity.SetChips( chips);
		this.myChips = chips;
    }

    private onRE_BUY_IN( msg ) {

    }

    private onRES_ADD_CHIPS_REQUEST( msg ) {
		let code = msg["code"];

		if ( code === -1 ) {
			return;
		}

		if ( code > 0 ) {
			let message: string = this.getAddChipsErrorMessage(code);
			UiGameSystemPopup.instance.showOkPopup('칩 추가', message, ()=>{
				UiGameSystemPopup.instance.closePopup();

			});
		} else {

			let balance: number = msg["balance"];
			let chips: number = msg["initChips"];
			let amount:number = msg["amount"];

			this.uiBuyIn.addChips( balance, amount, (res)=>{
				if ( res > 0 ) {
					this.sendMsg('ADD_CHIPS', {
						seat: this.mySeat,
						amount: res,
					});
				} else {
					UiGameSystemPopup.instance.showOkPopup('칩 추가', '칩 추가가 취소되었습니다', ()=>{
						UiGameSystemPopup.instance.closePopup();
					});
				}
			});
		}
    }

    private onRES_ADD_CHIPS( msg ) {
		this.uiSeats.end();
		let code: number = msg[ "code" ];
		if ( 0 === code ) {
			let pending: boolean = msg["pending"];
			let balance = msg[ "balance" ];
			let chips = msg[ "chips" ];
			let amount = msg[ "amount" ];
			if ( true === pending ) {
				let message: string = "칩은 현재 핸드가 종료된 다음에 적용됩니다.";
				UiGameSystemPopup.instance.showOkPopup('칩 추가', message, ()=>{
					UiGameSystemPopup.instance.closePopup();
				});

			} else {
				let uiEntity = this.GetEntityFromSeat( this.mySeat );
				Board.balance = balance;
				uiEntity.SetChips( chips );
				this.myChips = chips;

				let message: string = CommonUtil.getNumberStringWithComma(amount) + " 칩이 추가되었습니다.";
				UiGameSystemPopup.instance.showOkPopup('칩 추가', message, ()=>{
					UiGameSystemPopup.instance.closePopup();
				});
			}
		} else {
			let message: string = this.getAddChipsErrorMessage(code);
			UiGameSystemPopup.instance.showOkPopup('칩 추가', message, ()=>{
				UiGameSystemPopup.instance.closePopup();
			});
		}
    }

    private RES_ADD_CHIPS_PEND( msg ) {
		let code: number = msg[ "code" ];
		if ( 0 === code ) {
			let uiEntity = this.GetEntityFromSeat( this.mySeat );
			let balance = msg[ "balance" ];
			let chips = msg[ "chips" ];
			let amount = msg[ "amount" ];

			Board.balance = balance;
			uiEntity.SetChips( chips );
			this.myChips = chips;

			let tableBuyInAmount = msg["tableBuyInAmount"];
			let tableBuyInCount = msg["tableBuyInCount"];

			let message: string = CommonUtil.getNumberStringWithComma(amount) + " 칩이 추가되었습니다.";
			UiGameSystemPopup.instance.showOkPopup('칩 추가', message, ()=>{
				UiGameSystemPopup.instance.closePopup();
			});
		} else {
			let message: string = this.getAddChipsErrorMessage(code);
			UiGameSystemPopup.instance.showOkPopup('칩 추가', message, ()=>{
				UiGameSystemPopup.instance.closePopup();
			});
		}
    }

    private onPing ( msg ) {
		this.room.send( "pong", { seat: this.mySeat } );
    }

    public leave() {
		if ( this.uiProfile != null ) {
			this.uiProfile.hide();
		}
		this.room?.leave();
    }

    private getAddChipsErrorMessage( code: number ) : string {
		let ret: string = "UNKNOWN MESSAGE";
		switch (code) {
			case -1:
				ret = "플레이어 정보가 없거나 잘못되었습니다";
				break;
			case 1:
				ret = "바이인 할 수 없습니다. 다시 신청해주세요";
				break;
			case 2:
				ret = "이미 바이인 요청이 있습니다.";
				break;
			case 3:
 				ret = "더 이상 바이인을 할 수 없습니다.";
				break;
			case 4:
				ret = "바이인할 칩이 없습니다.";
				break;
			case 5:
				ret = "더 이상 바이인 할 수 없습니다.";
				break;
			case 6:
				ret = "최대 바이인 횟수에 도달했습니다.";
				break;

		}
		return ret;
    }

	public OpenUserProfile( id :number, seat: number ) {
		this.sendMsg("SHOW_PROFILE", { 
			id: id,
			seat: seat,
		});
	}

	public onEVENT_FOREGROUND() {
		if ( this.uiSeats != null && this.uiSeats.node.active == true) {
			return;
		}

		this.updateClinet = true;
		this.sendMsg("FORE_GROUND", { 
			seat: this.mySeat,
		});
	}

	public onEVENT_BACKGROUND() {
		if ( this.uiSeats != null && this.uiSeats.node.active == true) {
			return;
		}
				
		this.updateClinet = false;		
		this.sendMsg("BACK_GROUND", { 
			seat: this.mySeat,			
		});
	}

	private SetSitoutButtons( isSitout: boolean, reservable: boolean = false ) {
		if ( isSitout == true ) {
			this.buttonSitout.node.active = false;

			this.buttonSitback.node.active = true;
			this.labelSitback.string = '자리복귀';			
		} else {			
			if ( reservable == true ) {

			}
			this.buttonSitback.node.active = false;

			this.buttonSitout.node.active = true;
			this.labelSitout.string = '자리비움';
		}
	}

	private OpenProfile(id: number, seat: number) {
		this.OpenUserProfile(id, seat )
	}

	private CloseProfile( seat: number ) {

	}
}


