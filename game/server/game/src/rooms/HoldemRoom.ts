import { Room, ServerError, Client } from "colyseus";
import { EntityState, RoomState } from "./schema/HoldemState";
import { PotCalculation } from "../modules/PotCalculation";
import { DealerCalculation } from "../modules/DealerCalculation";
import * as fs from 'fs';
import * as path from 'path';
import { ENUM_RESULT_CODE } from "../arena.config";
import { ClientUserData } from "../controllers/ClientUserData";
import { SalesReport } from "../modules/SalesReport";
import * as PokerEvaluator from 'poker-evaluator-ts';
import { HandHistoryController } from "../modules/HandHistotyController";
import { error } from "../util/logger";

const moment = require('moment')
const timeZone = 'Asia/Tokyo';
const logger = require( "../util/logger" );

enum eGameState {
	Suspend,	//0
	Ready,		//1
	Prepare,	//2
	PreFlop,	//3
	Bet,		//4
	Flop,		//5
	Turn,		//6
	River,		//7
	Result,		//8	
	ShowDown,	//9
	ClearRound	//10
}

export enum eCommunityCardStep {
	PREPARE,
	PRE_FLOP,
	FLOP,
	TURN,
	RIVER,
	RESULT
}

export enum ENUM_SHOWDOWN_STEP {
	NONE,
	SHOWDOWN_START,
	SHOW_FLOP,
	SHOW_TURN,
	SHOW_RIVER,
	SHOWDOWN_END,
}

export enum ENUM_LOG_TYPE {
	LOG_NONE,
	LOG_INFO,
	LOG_ERROR,
	LOG_CRITICAL,
}

export class HoldemRoom extends Room<RoomState> {
	totalCards: string[] = [ "Ac", "Kc", "Qc", "Jc", "Tc", "9c", "8c", "7c", "6c", "5c", "4c", "3c", "2c", "Ad", "Kd",
		"Qd", "Jd", "Td", "9d", "8d", "7d", "6d", "5d", "4d", "3d", "2d", "Ah", "Kh",
		"Qh", "Jh", "Th", "9h", "8h", "7h", "6h", "5h", "4h", "3h", "2h", "As", "Ks", "Qs", "Js", "Ts", "9s", "8s",
		"7s", "6s", "5s", "4s", "3s", "2s" ];

	totalCards2: string[] = [ "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15",
		"16", "17", "18", "19", "20", "21", "22", "23", "24", "25",
		"26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43",
		"44", "45", "46", "47", "48", "49", "50", "51" ];

	maxClients = 9;
	showdownTime: number = 0;
	bufferTimerID: any = null;
	pingTimerID: any = null;
	cardPickPos: number = 0;
	elapsedTick: number = 0;
	elapsedSuspend: number = 0;
	betSeat: number = 0;
	endSeat: number = 0;
	communityCardString: string[] = [];
	communityCardIndex: number[] = [];
	centerCardState: eCommunityCardStep = eCommunityCardStep.PREPARE;
	_dao: any = null;
	_buyInWaiting: any = {};
	_rejoinWaiting : any = {};
	tableSize: string = "full";
	secondTick: number = 0;
	conf: { [ index: string ]: any } = {};

	_PotCalculator : PotCalculation = null;
	_DealerCalculator: DealerCalculation = null;
	_SalesReporter: SalesReport = null;
	_HandHistoryController: HandHistoryController = null;

	seatWaitingList : string[] = [];
	_roomConf: any = null;
	_initPot: number = 0;
	_id: number = -1;
	_tableIdString: string = '';

	private participants: any[] = [];
	private lastBet: any = null;

	private SHOWDOWN_STATE: ENUM_SHOWDOWN_STEP = ENUM_SHOWDOWN_STEP.NONE;

	async onCreate( options: any ) : Promise<any> {
		this._tableIdString = '[TABLE:' + options.serial + ']';
		logger.info( this._tableIdString + "[ onCreate ] options : %s", options);
		this.maxClients = options.clientLimit;

		this.tableSize = "full";
		this._dao = options["dao"];

		let confFile = await fs.readFileSync(path.join(__dirname, "../config/roomConf.json"), {encoding : 'utf8'});
		let confJson = JSON.parse( confFile.toString() );
		this.conf = confJson[this.tableSize as keyof typeof confJson];
		console.log(this.conf);

		await this.setPrivate(options["private"]);

		let onDBFinish : (err : any, res : any) => void = (err: any, res: any) => {

			if (!!err) {
				logger.error( this._tableIdString + "[ onCreate::selectRoomByUID ] query error : %s", err);
			} else {
				if (res.length <= 0) {
					logger.error( this._tableIdString + "[ onCreate ] invalid room id");
				} else {
					let roomInfo = res;

					this.conf["tableID"] = roomInfo["id"];
					this.conf["adminID"] = roomInfo["recommender"];
					this.conf["maxClient"] = roomInfo["maxPlayers"];
					this.conf["betTimeLimit"] = roomInfo["betTimeLimit"] * 1000;
					this.conf["smallBlind"] = roomInfo["smallBlind"];
					this.conf["bigBlind"] = roomInfo["bigBlind"];
					this.conf["minStakePrice"] = roomInfo["minStakePrice"];
					this.conf["maxStakePrice"] = roomInfo["maxStakePrice"];
					this.conf["passTerm"] = roomInfo["timePassTerm"] * 60 * 1000;					
					this.conf["passPrice"] = roomInfo["timePassPrice"];
					this.conf["private"] = options["private"];
					this.conf['longSitoutTerm'] = 60000 * 3;
					this.conf["useTimePass"] = roomInfo["useTimePass"] == 1;
					this.conf["useRake"] = roomInfo["useRake"] == 1;
					this.conf["useRakeCap"] = roomInfo["useRakeCap"] == 1;
					this.conf["rakePercentage"] = roomInfo["rake"] * 0.0001;
					this.conf['rakeBackPercentage'] = roomInfo['rake_back'] * 0.0001;
					this.conf["rakeCap"] = [roomInfo["rakeCap1"],roomInfo["rakeCap2"],roomInfo["rakeCap3"]];
					this.conf["flopRake"] = roomInfo["useFlopRake"] == 1;
					this.conf["ante"] = roomInfo['ante'];
					this.conf['hands'] = roomInfo['hands'];
					// this.conf['timeoutUnit'] = confJson['timeoutUnit'];
				}

				this.maxClients = this.conf["maxClient"];

				for (let i = 0; i < this.maxClients; i++) {
					this.seatWaitingList.push("");
				}

				this.setState(new RoomState());
				this._DealerCalculator = new DealerCalculation();
				this._HandHistoryController = new HandHistoryController( this.conf["tableID"], this.conf['maxClient'], this.conf['hands'] );
				if ( this._HandHistoryController != null ) {
					this._HandHistoryController.Init();
				}

				this.init();

				this.setSimulationInterval((deltaTime) => this.update(deltaTime));

				// register message handlers
				this.onMessage("ONLOAD", this.onLOAD_DONE.bind(this));
				this.onMessage("BUY_IN", this.onBUY_IN.bind(this));
				this.onMessage("CHECK", this.onCHECK.bind(this));
				this.onMessage("CALL", this.onCALL.bind(this));
				this.onMessage("BET", this.onBET.bind(this));
				this.onMessage("RAISE", this.onRAISE.bind(this));
				this.onMessage("ALLIN", this.onALLIN.bind(this));
				this.onMessage("FOLD", this.onFOLD.bind(this));
				this.onMessage("RE_BUY", this.onRE_BUY.bind(this));
				this.onMessage("ADD_CHIPS_REQUEST", this.onADD_CHIPS_REQUEST.bind(this));
				this.onMessage("ADD_CHIPS", this.onADD_CHIPS.bind(this));
				this.onMessage("PONG", this.onPONG.bind(this));
				this.onMessage("SHOW_CARD", this.onSHOW_CARD.bind(this));
				this.onMessage("SIT_OUT", this.onSIT_OUT.bind(this));
				this.onMessage("SIT_OUT_CANCEL", this.onSIT_OUT_CANCEL.bind(this));
				this.onMessage("SIT_BACK", this.onSIT_BACK.bind(this));
				this.onMessage("SEAT_SELECT", this.onSEAT_SELECT.bind(this));
				this.onMessage("CANCEL_BUY_IN", this.onCANCEL_BUY_IN.bind(this));
				this.onMessage("SHOW_EMOTICON", this.onSHOW_EMOTICON.bind(this));
				this.onMessage("SHOW_PROFILE", this.onSHOW_PROFILE.bind(this));
				this.onMessage("EXIT_TABLE", this.onEXIT_TABLE.bind(this));
				this.onMessage('SYNC_TABLE', this.onSYNC_TABLE.bind(this));
				this.onMessage('FORE_GROUND', this.onFORE_GROUND.bind(this));
				this.onMessage('BACK_GROUND', this.onBACK_GROUND.bind(this));

				this._PotCalculator = new PotCalculation( this.conf["useRake"], this.conf["rakePercentage"], this._tableIdString );
				this._SalesReporter = new SalesReport( this._dao, this._tableIdString );

				this.pingTimerID = setInterval(() => this.ping(), 2000);
				this._id = options["serial"];

				this.participants = [];
			}
		};

		try {
			await this._dao.SELECT_TABLES_ByTABLE_ID( options["serial"], onDBFinish);
		} catch (error) {
			logger.error( this._tableIdString + error );
		}
	}

	init() {
		this.state.gameState = eGameState.Suspend;

		this.state.dealerSeat = this._DealerCalculator.init(this.maxClients, this._tableIdString);
		this.state.sbSeat = -1;
		this.state.bbSeat = -1;

		this.state.startBet = this.conf[ "bigBlind" ];
		this.state.maxBet = 0;
		this.state.minRaise = 0;
		this.state.shuffle = "";
		this.state.pot = 0;
		this.pingTimerID = 0;

		this.elapsedSuspend = 0;
		this.elapsedTick = 0;

		this.participants = [];
		this.lastBet = null;
	}

	onAuth( client: Client, options: any, request: any ): Promise<any> {
		logger.info( this._tableIdString + "[ onAuth ] sid(%s), options(%s)", client.sessionId, options );	

		return new Promise( ( resolve, reject ) => {
			let self = this;

			this._dao.SELECT_USERS_ByACTIVE_SESSION_ID( client.sessionId, function( err: any, res: any ) {				
				if( !!err ) {
					reject( new ServerError( 400, "bad access token" ) );
				}
				else {

					if( res.length <= 0 ) {
						reject( new ServerError( 400, "bad session id" ) );
						return;
					}
					else {
						let entity = self.state.entities.find( e => e.id == res[ 0 ][ "id" ] );
						if( undefined !== entity ) {
							if( false === entity.leave ) {
								logger.warn( "[ onAuth ] duplicate login. seat : %s // leave state : %s",
									entity.seat, entity.leave );
								entity.leave = true;

								reject( new ServerError( 400, "Duplicate login" ) );
								return;
							}							
							reject( new ServerError( 400, "Duplicate login" ) );
							return;							
						}

						logger.info( "[ onAuth ] succeed. sid(%s)", client.sessionId );
						res[ 0 ].reconnected = false;						
						resolve( res[ 0 ] );
					}
				}
			} );
		} );
	}

	checkDuplication( id: number ) {
		const idx = this.state.entities.findIndex( function( e ) {
			return e.id === id;
		} );

		return idx > -1;
	}

	async onJoin( client: Client, options?: any, auth?: any ) {

		try {
			this._dao.UPDATE_USER_ACTIVE_SESSION_ID( client.sessionId, function( err: any, result: any ) {
				if( !!err ) {
					logger.error( "[ onJoin ] updateActiveSessionID error : %s", err );
				}
			} );			
		} catch (error) {
			console.log( this._tableIdString + error);			
		}

		this.playerJoin( client, options, auth );
	}

	reJoin( client: Client, options?: any, auth?: any ) {
		logger.info( "[ reJoin ]==============================" );
		this._rejoinWaiting[ client.sessionId ] = auth;
		// logger.info( "[ reJoin ] _rejoinWaiting : %s", JSON.stringify( this._rejoinWaiting ) );
		
	}

	async playerJoin( client: Client, option: any, auth: any ) {
		logger.info(  this._tableIdString + "[ playerJoin ]" );
		this._buyInWaiting[ client.sessionId ] = auth;
		// logger.info( "[ playerJoin ] waiting list : %s", JSON.stringify( this._buyInWaiting ) );

		let entity = new EntityState();
		entity.assign( {
			sid: client.sessionId,
			id: auth.id || client.id,
			uid: auth.login_id,
			avatar: auth.avatar,
			nickname: auth.nickname,
			balance: auth.balance,
			chips: auth.chip,
			rake: auth.rake,
			wait: true,
			isDealer: false,
			isSb: false,
			isBb: false,
			ante: this.conf['ante'],
			hasAction: true,
			seat: -1,
			currBet: 0,
			roundBet: 0,
			totalBet: 0,
			fold: false,
			allIn: 0,
			isSitOut: false,
			isSitBack: false,
			isNew: true,
			primaryCard: "",
			secondaryCard: "",
			cardIndex: [],
			dealable: false,
			missSb: false,
			missBb: false,
			longSitOut: false,
			banned: false,
			sitoutTimestamp: 0,
			oldChips: auth.chip,			
			oldRake: auth.rake,			
			reBuyCount: 0,
			pendReBuy: 0,
			tableInitChips: 0,
			tableBuyInAmount: 0,
			tableBuyInCount: 0,
			pendSitout: false,
			rake_back_rate: auth.rake_back_rate * 0.0001,
			connected: true,
		} );

		entity.seat = -2;
		entity.client = client;
		entity.lastPingTime = Date.now();
		entity.initRoundChips = auth.chip;

		let statics: any = await this.LoadStatics( entity.id );
		if ( statics.code == ENUM_RESULT_CODE.SUCCESS ) {
			let _statics = ClientUserData.getClientStaticsData(statics.statics);
			entity.statics = _statics;
		}

		logger.info(  this._tableIdString + "[ playerJoin ] seat : %s / sid : %s / id: %s / nickname: %s", entity.seat, client.sessionId, entity.id, entity.nickname );
		this.state.entities.push( entity );
		return;
	}

	OnLoadDoneFirstJoin(client : Client, auth : any){

		if(null == auth || undefined == auth){

			logger.error( this._tableIdString + " OnLoadDone -  Auth is null session ID : " + client.sessionId);
			return;
		}

		client.send("SHOW_SELECT_SEAT",{
			limitTime: this.conf["selectSeatLimitTime"],
			useLog : this.conf["useLog"]
		});

		this.UpdateSeatInfo();
	}

	skipBuyIn(client : Client, seat : number){
		let entity = this.findEntityBySessionID(client.sessionId);

		if(null == entity){
			return;
		}

		entity.seat = seat;

		let openCards: number[] = [];
		switch (this.centerCardState) {
			case eCommunityCardStep.FLOP:
				openCards = this.communityCardIndex.slice(0, 3);
				break;

			case eCommunityCardStep.TURN:
				openCards = this.communityCardIndex.slice(0, 4);
				break;

			case eCommunityCardStep.RIVER:
			case eCommunityCardStep.RESULT:
				openCards = this.communityCardIndex;
				break;
		}

		this.UpdateSeatInfo();

		client.send("RES_BUY_IN", {
			ret: 0,
			amount: 0,
			message: "SUCCEED",
			tableBuyInAmount: 0,
			tableBuyInCount: 0,
		});

		entity.tableInitChips = entity.chips;
		entity.initRoundChips = entity.chips;

		let hands: number = 0;
		if ( this._HandHistoryController != null ) {
			hands = this._HandHistoryController.GetHands();
		}

		client.send("JOIN", {
			yourself: entity,
			buyIn: 0,
			entities: this.state.entities,
			gameState: this.state.gameState,
			betSeat: this.betSeat,
			endSeat: this.endSeat,
			maxBet: this.state.maxBet,
			minRaise: this.state.minRaise,
			pot: this.state.pot,			
			centerCardState: this.centerCardState,
			openCards: openCards,
			small: this.conf["smallBlind"],
			big: this.conf["bigBlind"],
			minStakePrice: this.conf["minStakePrice"],
			maxStakePrice: this.conf["maxStakePrice"],
			dealer: this._DealerCalculator.getDealer(),
			sb : this._DealerCalculator.getSb(),
			bb : this._DealerCalculator.getBb(),
			tableInitChips: entity.tableInitChips,
			tableBuyInAmount: entity.tableBuyInAmount,
			tableBuyInCount: entity.tableBuyInCount,
			initPot: this._initPot,
			hands: hands
		});

		if ( eGameState.Suspend === this.state.gameState ) {
			logger.info( this._tableIdString + "[ onBuyPass ] Now suspend state");
			entity.isNew = false;
			let isStart = this.checkStartCondition();
			if (true === isStart) {
				this.changeState(eGameState.Ready);
			}
		} else if (eGameState.Ready === this.state.gameState) {
			entity.isNew = false;
		}

		this.broadcast("NEW_ENTITY", { newEntity: entity });
	}
	
	UpdateSeatInfo() {
		
		let clients : Client[] = [];

		for(let i = 0; i < this.state.entities.length;i++){
			let ent = this.state.entities[i];

			let waiting = this._buyInWaiting[ent.client.sessionId];

			if(null == waiting || undefined == waiting){
				continue;
			}

			clients.push(ent.client);
		}

		let seatInfo : number[] = [];

		for(let i = 0; i < this.seatWaitingList.length; i++){

			let sessionID = this.seatWaitingList[i];
			if(sessionID === ""){
				let seatUser = null;
				for( let j = 0; j < this.state.entities.length; j++ ) {
					if(  i === this.state.entities[ j ].seat ) {
						seatUser = this.state.entities[ j ];
						break;
					}
				}
	
				if(null != seatUser){
					seatInfo.push(2);
					continue;
				}

				seatInfo.push(0);
				continue;
			}

			seatInfo.push(1);
		}

		clients.forEach((elem) => {
			elem.send("UPDATE_SELECT_SEAT",{
				entities : this.state.entities,
				seatCount : this.maxClients,
				bbSeat : this.state.bbSeat,
				sbSeat : this.state.sbSeat,
				dealerSeat : this.state.dealerSeat,
				seatInfo : seatInfo,
			});
		});
	}

	OnLoadDoneRejoin(client : Client, auth : any){

		delete this._rejoinWaiting[ client.sessionId ];

		let entity = this.state.entities.find( elem => elem.id === auth.id );
		if( undefined === entity ) {
			logger.error(  this._tableIdString + "[ reJoin ] why?? fatality error." );
			return;
		}

		logger.info(  this._tableIdString + "[ reJoin ] entity state : %s", JSON.stringify( entity ) );
		entity.lastPingTime = Date.now();
		entity.sid = client.sessionId;
		entity.client = client;

		if (entity.seat < 0) {
			//return to firstLogin
			this._buyInWaiting[client.sessionId] = auth;
			client.send("SHOW_SELECT_SEAT",
			{ 
				limitTime: this.conf["selectSeatLimitTime"],
			});

			this.UpdateSeatInfo();
			return;
		}

		logger.info( this._tableIdString +  "[ reJoin ] seat : %s", entity.seat );
		let openCards: number[] = [];

		switch( this.centerCardState ) {
			case eCommunityCardStep.FLOP:
				openCards = this.communityCardIndex.slice( 0, 3 );
				break;

			case eCommunityCardStep.TURN:
				openCards = this.communityCardIndex.slice( 0, 4 );
				break;

			case eCommunityCardStep.RIVER:
			case eCommunityCardStep.RESULT:
				openCards = this.communityCardIndex;
				break;
		}

		let prim = entity.cardIndex.length > 0 ? entity.cardIndex[0] : -1;
		let sec = entity.cardIndex.length > 1 ? entity.cardIndex[1] : -1;

		logger.info(  this._tableIdString + "[ reJoin ] send reconnection succeed" );

		client.send( "REJOIN", {
			yourself: entity,
			entities: this.state.entities,
			gameState: this.state.gameState,
			betSeat: this.betSeat,
			endSeat: this.endSeat,
			maxBet: this.state.maxBet,
			minRaise: this.state.minRaise,
			minBet: this.state.startBet,
			pot: this.state.pot,			
			centerCardState: this.centerCardState,
			openCards: openCards,
			small: this.conf[ "smallBlind" ],
			big: this.conf[ "bigBlind" ],
			minStakePrice: this.conf["minStakePrice"],
			maxStakePrice: this.conf["maxStakePrice"],
			primCard : prim,
			secCard : sec,
			dealer: this._DealerCalculator.getDealer(),
			sb : this._DealerCalculator.getSb(),
			bb : this._DealerCalculator.getBb(),
			tableInitChips: entity.tableInitChips,
			tableBuyInAmount: entity.tableBuyInAmount,
			tableBuyInCount: entity.tableBuyInCount,
			useLog : this.conf["useLog"],
			rake_back_rate: auth.rake_back_rate * 0.0001,			
		} );
	}

	private GetPlayerCards(): any {
		let cards: any = {};
		let isWinners: any = {};

		for( let i = 0; i < this.state.entities.length; i++ ) {
			if( true === this.state.entities[ i ].wait ) {
				continue;
			}

			if(true === this.state.entities[i].fold) {
				continue;
			}

			cards[ this.state.entities[ i ].seat ] = this.state.entities[ i ].cardIndex;
			isWinners[ this.state.entities[ i ].seat ] = false;
			let winner = this._PotCalculator.IsWinner(this.state.entities[i].seat);
			isWinners[ this.state.entities[ i ].seat ] = winner;
		}

		return {
			cards: cards,
			winners: isWinners,
			communities: this.communityCardIndex,
		};
	}

	private GetWinners( skip : boolean, isAllIn : boolean): any {

		let pots = this._PotCalculator.GetPots(true);
		let winners = [];
		let folders: number[] = [];

		for(let i = 0; i < pots.length; i++){
			let pot : any = pots[i];
			let potWinners : any[] = pot.winner;
			let potAmount = pot.rake == undefined ? pot.total : pot.total - pot.rake;
			let winAmount = potAmount / potWinners.length;

			for(let j = 0; j < potWinners.length; j++){
				let entity = this.getEntity(potWinners[j]);

				if(null === entity || undefined === entity){
					continue;
				}
				
				let chips = entity.chips + winAmount;
				let amount = entity.winAmount + winAmount;

				winners.push( {
					seat: entity.seat,
					cards: entity.cardIndex,
					nickname: entity.nickname,
					eval: entity.eval,
					chips: chips,
					winAmount: amount,
					fold : entity.fold
				} );
			}
		}

		for( let i = 0; i < this.state.entities.length; i++ ) {
			if( true === this.state.entities[ i ].wait ) {
				continue;
			}

			if(true === this.state.entities[i].fold) {
				folders.push(this.state.entities[i].seat);
			}
		}

		let playerCards: any = {};
		for( let i = 0; i < this.state.entities.length; i++ ) {
			if( true === this.state.entities[ i ].wait ) {
				continue;
			}

			if(true === this.state.entities[i].fold) {
				continue;
			}

			playerCards[ this.state.entities[ i ].seat ] = this.state.entities[ i ].cardIndex;
		}
		
		return {
			skip: skip,
			winners: winners,
			pot: this.state.pot,
			dpPot : pots,
			cards: this.communityCardIndex,
			playerCards: playerCards,
			folders: folders,
			isAllInMatch : isAllIn
		}
	}

	private GetShowdown(): any {
		let folders: number[] = [];
		for( let i = 0; i < this.state.entities.length; i++ ) {
			if( true === this.state.entities[ i ].wait ) {
				continue;
			}

			if(true === this.state.entities[i].fold) {
				folders.push(this.state.entities[i].seat);
			}
		}

		let hands: any = {};
		for( let i = 0; i < this.state.entities.length; i++ ) {
			if( true === this.state.entities[ i ].wait ) {
				continue;
			}

			if(true === this.state.entities[i].fold) {
				continue;
			}

			hands[ this.state.entities[ i ].seat ] = this.state.entities[ i ].cardIndex;
		}

		return {
			pot: this.state.pot,
			hands: hands,
			folders: folders,
		}
	}	

	checkReBuyCondition( e: any, max: number, reBuy: boolean) :number {
		const MAX_BUY_IN: number = this.conf["maxStakePrice"];
		const MAX_RE_BUY_COUNT: number = this.conf["limitReBuyCount"];
		logger.info( this._tableIdString + "seat:%d, amount:%d, reBuy: %d", e.seat, max, reBuy);

		if ( null === e || undefined === e) {
			logger.error( this._tableIdString + "checkReBuyCondition null" );
			return -1;
		} else {
			if ( this.conf["useReBuy"] == true ) {
				if ( e.pendReBuy > 0 ) {
					return 2;
				} else if ( e.initRoundChips > MAX_BUY_IN ) {
					return 3;
				} else if ( e.balance <= 0 ) {
					return 4;
				} else if ( max <= 0 ) {
					return 5;
				} else if ( MAX_RE_BUY_COUNT != 0 && e.reBuyCount > MAX_RE_BUY_COUNT ) {
					return 6;
				}
			}
			else {
				return 1;
			}
			return  0;
		}
	}

	async onLeave( client: Client, consented?: boolean ) {
		logger.info(  this._tableIdString + "[ onLeave ] sessionID(%s), consented(%s)", client.sessionId, consented );		
		let entity = this.findEntityBySessionID( client.sessionId );
		if ( entity == null ) {
			logger.error( this._tableIdString +  "[ onLeave ] entity is null" );
			return;
		}

		entity.connected = false;
		try {
			if ( consented == true ) {
				throw new Error('concented leave');
			}
			await this.allowReconnection( client, 60 );
			
			console.log('[onLEAVE] CLIENT RETURN');
			entity.connected = true;

		} catch ( e ) {

			logger.error( this._tableIdString +  "[ onLeave ] CLIENT LEAVE" );
			delete this._buyInWaiting[ client.sessionId ];
			delete this._rejoinWaiting[ client.sessionId ];

			for(let i =0; i < this.seatWaitingList.length; i++){
				if(this.seatWaitingList[i] != client.sessionId){
					continue;
				}
				this.seatWaitingList[i] = "";
			}

			if( entity == null ) {
				logger.error( this._tableIdString +  "[ onLeave ] entity is null" );
				return;
			}

			entity.leave = true;
			if ( entity.fold == true || entity.wait == true ) {
				this.handleEscapee();			
				return;
			}

			if( eGameState.Suspend === this.state.gameState ) {
				this.handleEscapee();
				return;
			}

		}

		// delete this._buyInWaiting[ client.sessionId ];
		// delete this._rejoinWaiting[ client.sessionId ];

		// for(let i =0; i < this.seatWaitingList.length; i++){
		// 	if(this.seatWaitingList[i] != client.sessionId){
		// 		continue;
		// 	}
		// 	this.seatWaitingList[i] = "";
		// }

		// let runaway = this.findEntityBySessionID( client.sessionId );
		// if( null === runaway || undefined === runaway ) {
		// 	logger.error( this._tableIdString +  "[ onLeave ] entity is null" );
		// 	return;
		// }

		// logger.info(  this._tableIdString + "[ onLeave ] seat(%s), nickname(%s), balance(%s), chips(%s)", 
		// 	runaway.seat, runaway.nickname, runaway.balance, runaway.chips );

		// runaway.leave = true;
		// if ( runaway.fold == true || runaway.wait == true ) {
		// 	this.handleEscapee();			
		// 	return;
		// }

		// if( eGameState.Suspend === this.state.gameState ) {
		// 	this.handleEscapee();
		// 	return;
		// }
	}

	findEntityBySessionID( sid: string ) {
		let entity = this.state.entities.find( elem => elem.sid == sid );
		if( null === entity || undefined === entity ) {
			logger.error(  this._tableIdString + "[ findEntityBySessionID ] entity is null" );
			return null;
		}

		return entity;
	}

	findEntityBySeatNumber( seat: number ) {
		let entity = this.state.entities.find( elem => elem.seat == seat );
		if( null === entity || undefined === entity ) {
			return null;
		}

		return entity;
	}

	onDispose(): void | Promise<any> {
		logger.error(  this._tableIdString + "[ onDISPOSE ] Room is dispose: " + this._id );

		try {
			this.onUPDATE_ROLLING();
			this._SalesReporter.UpdateReportByUser( this._dao, this.participants );
			this.participants = [];

		} catch ( error ) {
			console.log( this._tableIdString +  error );
		}

		clearInterval(this.pingTimerID);
		clearTimeout(this.bufferTimerID);

		this.state.entities.forEach( (e) => {
			this._dao.UPDATE_USERS_ACTIVE_SESSION_ID( e.id, '' );
			this._dao.UPDATE_USERS_PENDING_SESSION_ID( e.id, '' );
		});

		this.state.entities.forEach( (e) => {
			let data = {
				table_id: -1,
				id : e.id
			}

			this._dao.UPDATE_USERS_TABLE_ID_ByUSER( data , (err: any, res: boolean) => {
				if (null != err) {
					logger.error( this._tableIdString + err);
				}
			});

			this._dao.CHIP_OUT(e.chips, e.id);
			e.chips = 0;

			this._dao.UPDATE_STATICS( e.id, e.statics, ( err: any, res: boolean  )=> {
				if ( err != null ) {
					logger.error(  this._tableIdString + err );
				} else {

				}
			});
		});

		this._dao.UPDATE_USERS_CLEAR_TABLE_ID( this._id, -1, ( err: any, res: boolean )=>{
			if ( err != null ) {
				logger.error(  this._tableIdString + err );
			} else {

			}
		});

		let handsCount: number = 0;
		if ( this._HandHistoryController != null ) {
			handsCount = this._HandHistoryController.GetHands();
		}

		this._dao.UPDATE_TABLES_HANDS_COUNT( this._id, handsCount, ( err: any, res: boolean )=>{
			if ( err != null ) {
				logger.error(  this._tableIdString + err );
			} else {
				logger.error(  this._tableIdString + 'LAST HANDS: %s' + handsCount );
			}
		});
	}

	update( dt: any ) {

		for ( let i = 0; i < this.state.entities.length; i++ ) {
			let entity = this.state.entities[i];
			if( entity != null ) {
				if( entity.chips != entity.oldChips ) {
					this._dao.UPDATE_USERS_CHIP(entity.id, entity.chips, (err: any, res: any) => {
						if (!!err) {
							logger.error( this._tableIdString + "[ update ] updateChip query error : %s", err.sqlMessage);
						}
					});
					logger.error( this._tableIdString + "[ update ] id: %s, name: %s, oldChips: %s, chips: %s", entity.id, entity.nickname, entity.oldChips, entity.chips );					
					entity.oldChips = entity.chips;
				}
			}
		}

		this.secondTick += dt;

		if( eGameState.Bet === this.state.gameState ) {
			this.elapsedTick += dt;
			let self = this;

			const pos = this.state.entities.findIndex( function( et ) {
				return et.seat === self.betSeat;
			} );

			if( pos > -1 ) {
				let entity = this.state.entities[ pos ];
				if( false === entity.fold && true === entity.leave ) {
					logger.info(  this._tableIdString + "[ update ] runaway user fold." );
					let next = this.funcFold( this.betSeat );
					if( next ) {
						this.broadTurn();
					}
					this.elapsedTick = 0;
					return;
				}
			}

			if( this.elapsedTick >= this.conf[ "betTimeLimit" ] ) {
				this.elapsedTick = 0;
				logger.info(  this._tableIdString + "[ update ] seat %s bet timeout. call fold", this.betSeat );

				let next = this.funcFold( this.betSeat );
				let player = this.getEntity( this.betSeat );

				if( next ) {
					this.broadTurn();
				}

				if ( player != null ) {
					player.timeLimitCount += 1;
					player.isSitOut = true;
					player.wait = true;
					player.sitoutTimestamp = Number( Date.now() );
					player.pendSitout = false;

					this.UpdateSeatInfo();
					logger.error( this._tableIdString + " [ onSIT_OUT ] The seat " + player.seat + ' is SIT_OUT');						
					this.broadcast("SIT_OUT", { seat : player.seat });
				}
			}
		}
		else if( eGameState.Result === this.state.gameState ) {
			this.elapsedTick += dt;
			if( this.elapsedTick >= this.showdownTime ) {
				logger.info( this._tableIdString +  "[ update ] RESULT STATE TIME OVER. duration : %s", this.showdownTime );
				this.elapsedTick = 0;
				this.changeState( eGameState.ClearRound );
			}
		}
		else if( eGameState.ShowDown === this.state.gameState ) {
			this.elapsedTick += dt;
			if( this.elapsedTick >= this.showdownTime ) {

			}
		}		
		else if( eGameState.ClearRound === this.state.gameState ) {
			this.elapsedTick += dt;

			if( this.elapsedTick >= this.conf[ "clearTerm" ] ) {				
				logger.info( this._tableIdString +  "[ update ] CLEAR_ROUND STATE TIME OVER. duration : %s", this.conf[ "clearTerm" ] );
				this.elapsedTick = 0;

				this.state.entities.forEach( (e)=>{
					if ( e != null ) {
						if ( e.isSitOut == true ) {
							let pasteTime = Number( Date.now() ) - e.sitoutTimestamp;
							if ( pasteTime > this.conf['longSitoutTerm'] ) {
								e.leave = true;
								e.longSitOut = true;
							}
						}	
					}
				});

				this.handleEscapee();
				this.updatePlayerEligible();
				let isSTART = this.checkStartCondition();
				if ( isSTART == true ) {
					this.updateButtons();
					isSTART = this.checkStartCondition();
					if ( isSTART == true ) {
						logger.info(  this._tableIdString + "[ update ] GAME STATE TO PREPARE" );
						this.changeState( eGameState.Prepare );
					} else {
						logger.info(  this._tableIdString + "[ update ] GAME STATE TO SUSPEND" );
						this.changeState( eGameState.Suspend );
					}
				} else {
					logger.info(  this._tableIdString + this._tableIdString +  "[ update ] GAME STATE TO SUSPEND" );
					this.changeState( eGameState.Suspend );
				}
			}
		} else if ( eGameState.Ready === this.state.gameState ) {

			this.elapsedTick += dt;
			if (this.elapsedTick >= this.conf["readyTerm"] ) {
				logger.info(  this._tableIdString + "[ update ] READY STATE TIME OVER. duration : %s", this.conf[ "readyTerm" ] );
				this.elapsedTick = 0;
				this.handleEscapee();
				this.updatePlayerEligible();

				let isStart = this.checkStartCondition();
				if ( isStart == true) {
					this.updateButtons();
					this.changeState( eGameState.ClearRound );

				} else {
					this.changeState( eGameState.Suspend );
				}
			}
		} else if ( eGameState.Suspend === this.state.gameState ) {
			this.elapsedSuspend += dt;
			if ( this.elapsedSuspend >= 10000 ) {
				let term = this.conf['longSitoutTerm'];

				this.state.entities.forEach( (e)=>{
					if ( e != null ) {
						if ( e.isSitOut == true ) {
							let pasteTime: number = Number( Date.now() ) - e.sitoutTimestamp;
							if ( pasteTime > term ) {
								e.leave = true;
								e.longSitOut = true;
							}
						}	
					}
					this.KickDisablePlayer( e );
				});

				this.handleEscapee();
				this.elapsedSuspend = 0;
			}
		}
	}

	isEnoughChip( chip: number ) {
		let b = chip >= this.conf[ "bigBlind" ] * 2;// * 10;
		return b;//chip >= START_BET * 10;
	}

	handleEscapee() {
		let escapees = [];
		for( let l = 0; l < this.state.entities.length; l++ ) {
			if( true === this.state.entities[ l ].leave ) {
				this.broadcast( "HANDLE_ESCAPEE", { seat: this.state.entities[ l ].seat, user_id: this.state.entities[ l ].id } );
				escapees.push( {
					seat: this.state.entities[ l ].seat,
					id: this.state.entities[ l ].id,
				});

				this._dao.CLEAR_USERS_TABLE_ID_ByUSER( this.state.entities[ l ].id, ( err: any, res: boolean )=>{

				} );

				// this._dao.UPDATE_USERS_PENDING_SESSION_ID( this.state.entities[ l ].id, '' );

				// let data = {
				// 	table_id: -1,
				// 	id : this.state.entities[ l ].id
				// }

				// this._dao.UPDATE_USERS_TABLE_ID_ByUSER(data, (err: any, res: boolean) => {
				// 	if (null != err) {
				// 		logger.error( this._tableIdString + err);
				// 	}
				// });

				this._dao.CHIP_OUT( this.state.entities[l].chips, this.state.entities[l].id );
				this.state.entities[l].chips = 0;

				this._dao.UPDATE_STATICS( this.state.entities[l].id, this.state.entities[l].statics, ( err: any, res: boolean  )=> {
					if ( err != null ) {
						logger.error(  this._tableIdString + err );
					} else {

					}
				})
			}			
		}

		for( let m = 0; m < escapees.length; m++ ) {
			let s = escapees[ m ];
			if ( s.seat > -1 ) {
				const idx = this.state.entities.findIndex( function( e ) {
					return e.seat === s.seat;
				} );

				if( idx > -1 ) {
					let entity = this.state.entities[idx];
					if ( entity != null ) {
						if ( entity.longSitOut == true ) {
							entity.longSitOut = false;
							let sessionId = entity.client.sessionId;
							this.kickPlayer( sessionId, 4001 );
						}
						else if ( entity.banned == true ) {
							entity.banned = false;
							let sessionId = entity.client.sessionId;						
							this.kickPlayer( sessionId, 4002 );
						} 
						else {
							this.state.entities.splice( idx, 1 );
						}
					}
				}
				else {
					logger.error(  this._tableIdString + "[ handleEscapee ] why??. seat : %s", s );
				}

			} else {
				const idx = this.state.entities.findIndex( function( e ) {
					return e.id === s.id;
				} );

				if ( idx > -1 ) {
					let entity = this.state.entities[idx];
					if ( entity != null ) {
						this.state.entities.splice( idx, 1 );						
					}				 	
				} else {
					logger.error(  this._tableIdString + "[ handleEscapee ] why??. seat : %s", s );					
				}				
			}
		}
		this.UpdateSeatInfo();
	}

	updatePlayerEligible() {
		for( let i = 0; i < this.state.entities.length; i++ ) {
			let e = this.state.entities[ i ];
			if ( e != null ) {
				e.enoughChip = this.isEnoughChip( e.chips );
				if ( e.enoughChip === true && e.isSitOut === false ) {
					e.wait = false;
				} else {
					e.wait = true;
				}
	
				if (this.state.gameState == eGameState.Ready) {
					e.isNew = false;
					e.missSb = false;
					e.missBb = false;
				}	
			}
		}
	}

	updateButtons() {
		let buttons = this._DealerCalculator.moveButtons( this.state.entities );
		this.state.dealerSeat = buttons[0];
		this.state.sbSeat = buttons[1];
		this.state.bbSeat = buttons[2];
	}

	updatePlayableSeats() {
		for( let i = 0; i < this.state.entities.length; i++ ) {
			let e = this.state.entities[ i ];

			if ( null === e || undefined === e) {
				continue;
			}

			if ( e.wait == true) {
				continue;
			}

			let playable: boolean = true;
			playable = this._DealerCalculator.IsPlayableSeat( this.state.entities, e.seat );
			if ( playable === false ) {
				e.wait = true;
			}
		}
	}

	processReBuyInRequest() {
		for( let i = 0; i < this.state.entities.length; i++ ) {
			let e = this.state.entities[ i ];

			if ( null === e || undefined === e ) {
				continue;
			}

			e.enoughChip = this.isEnoughChip( e.chips );
		}
	}

	processPendingAddChips() {
		const MAX_BUY_IN: number = this.conf["maxStakePrice"];
		for( let i = 0; i < this.state.entities.length; i++ ) {
			let e = this.state.entities[ i ];

			if ( null === e || undefined === e ) {
				continue;
			}

			if ( e.pendReBuy > 0) {
				let amount = 0;
				let beforeBalance = e.balance;
				let beforeChips = e.chips;
				let chips = e.chips + e.pendReBuy;
				if ( e.chips >= MAX_BUY_IN ) {
					amount = 0;
				} else if ( chips > MAX_BUY_IN ) {
					chips = MAX_BUY_IN;
					amount = MAX_BUY_IN - e.chips;
				} else {
					amount = e.pendReBuy;
				}

				e.pendReBuy = 0;
				if ( amount > 0 ) {
					e.balance -= amount;
					logger.error( this._tableIdString + "[ addchips ] id: %s, name: %s, oldChips: %s, chips: %s", e.id, e.nickname, e.chips, chips );					
					e.chips = chips;
					e.initRoundChips = e.chips;
					e.tableInitChips += amount;
					e.tableBuyInCount++;

					e.client.send( "RES_ADD_CHIPS_PEND" , {
						code: 0,
						balance: e.balance,
						amount: amount,
						chips: e.chips,
						tableBuyInAmount: e.tableBuyInAmount,
						tableBuyInCount: e.tableBuyInCount,
					});

					this._dao.SELECT_BALANCE_ByUSER_ID(e.id, (err: any, res : any) => {
						if (!!err) {
							logger.error( this._tableIdString + "[ processPendingAddChips ] selectBalanceByUID query error : %s", err);
						} else {
							this._dao.BUY_IN(e.id, this.conf["tableID"], beforeBalance, e.balance, beforeChips, e.chips, amount, (err: any, res : any) => {
								if (!!err) {
									logger.error( this._tableIdString + "[ processPendingAddChips ] buyIn query error : %s", err);
								} else {
								}
							});

							this._dao.UPDATE_USERS_BALANCE(e.id, e.balance, (err: any, res: any) => {
								if (!!err) {
									logger.error( this._tableIdString + "[ processPendingAddChips ] updateBalance query error : %s", err);
								} else {

								}
							});
						}
					});
				}
			}
		}
	}

	processPendingAddChipsBySeat(e: any) {
		if ( null === e || undefined === e ) {
			return;
		}

		if ( e.pendReBuy > 0 ) {
			const MAX_BUY_IN: number = this.conf["maxStakePrice"];
			this._dao.SELECT_BALANCE_ByUSER_ID( e.id, (err: any, res : any ) => {
				if (!!err) {
					logger.error( this._tableIdString + "[ processPendingAddChips ] selectBalanceByUID query error : %s", err);
				} else {
					if (res.length <= 0) {
						logger.error( this._tableIdString + "[ processPendingAddChips ] selectBalanceByUID invalid user id");
					} else {

						e.balance = res[0]["balance"];
						let oldBalance = e.balance;
						let oldChips = e.chips;

						let chips = e.chips + e.pendReBuy;
						let reBuyAmount = 0;
						let balance = e.balance;

						if ( e.chips >= MAX_BUY_IN ) {
							reBuyAmount = 0;
						} else if ( chips > MAX_BUY_IN ) {
							chips = MAX_BUY_IN;
							reBuyAmount = MAX_BUY_IN - e.chips;
						} else {
							reBuyAmount = e.pendReBuy;
						}

						e.pendReBuy = 0;
						balance -= reBuyAmount;

						if ( reBuyAmount > 0 ) {
							e.balance = balance;
							logger.error( this._tableIdString + "[ addchips ] id: %s, name: %s, oldChips: %s, chips: %s", e.id, e.nickname, e.chips, chips );												
							e.chips = chips;
							e.initRoundChips = e.chips;
							e.tableBuyInAmount += reBuyAmount;
							e.tableBuyInCount++;

							e.client.send("RES_ADD_CHIPS_PEND", {
								code: 0,
								balance: e.balance,
								amount: reBuyAmount,
								chips: e.chips,
								tableBuyInAmount: e.tableBuyInAmount,
								tableBuyInCount: e.tableBuyInCount,
							});

							this._dao.BUY_IN(e.id, this.conf['tableID'], oldBalance, e.balance, oldChips, e.chips, reBuyAmount, (err: any, res : any) => {
									if (!!err) {
										logger.error( this._tableIdString + "[ processPendingAddChips ] buyIn query error : %s", err);
									}
								});

							this._dao.UPDATE_USERS_BALANCE( e.id, e.balance, (err: any, res : any) => {
								if (!!err) {
									logger.error( this._tableIdString + "[ processPendingAddChips ] updateBalance query error : %s", err);
								}
							});
						}
					}
				}
			});
		}
	}

	checkStartCondition():boolean {
		let cnt: number = 0;
		let ret: boolean = false;
		for (let i = 0; i < this.state.entities.length; i++ ) {
			let e = this.state.entities[ i ];
			if ( null === e || undefined === e) {
				continue;
			}

			e.enoughChip = this.isEnoughChip( e.chips );

			if ( true == e.enoughChip && false == e.isSitOut ) {
				cnt++
			}
		}

		if ( cnt >= this.conf["minPlayer"] ) {
			ret = true;
		}
		return ret;
	}

	//------------------------------------
	// STATE HANDLER
	//------------------------------------
	changeState( state: eGameState ) {
		if( null !== this.bufferTimerID ) {
			clearTimeout( this.bufferTimerID );
			this.bufferTimerID = null;
		}

		switch( state ) {
			case eGameState.Suspend:
				this.SHOWDOWN_STATE = ENUM_SHOWDOWN_STEP.NONE;
				this.elapsedTick = 0;
				this.elapsedSuspend = 0;

				this.broadcast( "SUSPEND_ROUND", {
					entities: this.state.entities,
					dealerPos: this.state.dealerSeat,
				} );
				break;

			case eGameState.Ready:
				this.SHOWDOWN_STATE = ENUM_SHOWDOWN_STEP.NONE;

				this.broadcast( "READY_ROUND", {
					msg: "READY_ROUND", timeMS: this.conf[ "readyTerm" ], entities: this.state.entities
				} );
				break;

			case eGameState.Prepare: // reset room, set dealer pos, card shuffle, pick community cards
				logger.info(  this._tableIdString + "[ changeState ] PREPARE" );
				this.SHOWDOWN_STATE = ENUM_SHOWDOWN_STEP.NONE;
				this._PotCalculator.Clear();
				this.prepareRound();
				this.cardDispensing();
				this.UpdateSeatInfo();
				break;

			case eGameState.PreFlop: // card draw, blind bet
				logger.info(  this._tableIdString + "[ changeState ] PRE_FLOP" );
				this.centerCardState = eCommunityCardStep.PRE_FLOP;
				this._PotCalculator.UpdateCenterCard(this.centerCardState);

				this.blindBet();

				this.bufferTimerID = setTimeout( () => {
					this.changeState( eGameState.Bet );
				}, 1000 );
				break;

			case eGameState.Bet:
				logger.info(  this._tableIdString + "[ changeState ] BET." );
				if( null !== this.bufferTimerID ) {
					clearTimeout( this.bufferTimerID );
					this.bufferTimerID = null;
				}

				if( eCommunityCardStep.PRE_FLOP !== this.centerCardState ) {
					this.setTurnBet();
				}

				if( eCommunityCardStep.PRE_FLOP === this.centerCardState ) {
					this.betSeat = this.state.bbSeat;
					this.endSeat = this.state.bbSeat;
				}
				else {
					this.betSeat = this.state.dealerSeat;
					this.endSeat = this.state.dealerSeat;
				}

				this.broadTurn();
				this.updateEndSeat( this.betSeat );
				break;

			case eGameState.Flop:
				this._PotCalculator.CalculatePot();
				
				logger.info(  this._tableIdString + "[ changeState ] FLOP. card : %s", this.communityCardIndex.slice( 0, 3 ).toString() );

				this._initPot = this.state.pot;
				this.broadcast( "SHOW_FLOP", 
				{ 
					cards: this.communityCardIndex.slice( 0, 3 ), 
					dpPot : this._PotCalculator.GetPots(false), 
					pot : this.state.pot,
				});

				this.bufferTimerID = setTimeout( () => {
					this.changeState( eGameState.Bet );
				}, 1000 );
				break;

			case eGameState.Turn:
				logger.info(  this._tableIdString + "[ changeState ] TURN. card : %s", this.communityCardIndex.slice( 3, 4 ).toString() );
				this._initPot = this.state.pot;
				this.broadcast( "SHOW_TURN", { 
					cards: this.communityCardIndex.slice( 3, 4 ), 
					dpPot : this._PotCalculator.GetPots(false),
					pot: this.state.pot,
				} );

				this.bufferTimerID = setTimeout( () => {
					this.changeState( eGameState.Bet );
				}, 1000 );

				break;

			case eGameState.River:
				logger.info(  this._tableIdString + "[ changeState ] RIVER. card : %s", this.communityCardIndex.slice( 4 ).toString() );
				this._initPot = this.state.pot;
				this.broadcast( "SHOW_RIVER", { 
					cards: this.communityCardIndex.slice( 4 ), 
					dpPot : this._PotCalculator.GetPots(false),
					pot: this.state.pot,
				} );

				this.bufferTimerID = setTimeout( () => {
					this.changeState( eGameState.Bet );
				}, 1000 );

				break;
			case eGameState.Result:
				logger.info( this._tableIdString +  "[ changeState ] RESULT" );
				this.showdownTime = 5500;//this.conf[ "showDownTerm" ];
				let isAllIn = false;
				let allFold = this.isAllFold();

				if( allFold == true ) {
					// this.allFoldProc();

				} else {
					let pots : any[] = this._PotCalculator.GetPots(true);

					if( eCommunityCardStep.RESULT !== this.centerCardState ) {
						isAllIn = true;

						this.elapsedTick = 0;
						this.changeState( eGameState.ShowDown );
						return;

					} else {
						this.showdownTime += pots.length * 3000;
						this.broadPlayerCards( isAllIn );
					}

				}
				this.finishProc( this.isAllFold(), isAllIn );

				this.elapsedTick = 0;
				break;
			case eGameState.ShowDown:
				this.ShowdownProcedure();
				break;

			case eGameState.ClearRound:
				this.state.entities.forEach( (e)=>{
					if ( e != null ) {
						if ( e.isSitOut == true && e.wait == false ) {
							e.isSitBack = false;
							e.isSitOut = true;
							e.wait = true;
							e.pendSitout = false;
							e.sitoutTimestamp = Number( Date.now() );
	
							this.broadcast( 'SIT_OUT', { seat: e.seat });
						} else if ( e.pendSitout == true ) {
							e.isSitBack = false;
							e.isSitOut = true;
							e.pendSitout = false;
							e.wait = true;
							e.sitoutTimestamp = Number( Date.now() );
	
							this.broadcast( 'SIT_OUT', { seat: e.seat });						
						}
	
						this.KickDisablePlayer( e );
					}

				});

				this.processPendingAddChips();
				this.processReBuyInRequest();

				this.SHOWDOWN_STATE = ENUM_SHOWDOWN_STEP.NONE;
				this.participants = [];
				this.lastBet = null;

				this.broadcast( "CLEAR_ROUND", {
					msg: "CLEAR_ROUND", timeMS: this.conf[ "clearTerm" ] * 1000, entities: this.state.entities
				} );

				this.UpdateSeatInfo();
				break;
		}

		this.state.gameState = state;
	}

	ChangeShowdownState() {
		if( null !== this.bufferTimerID ) {
			clearTimeout( this.bufferTimerID );
			this.bufferTimerID = null;
		}

		switch ( this.SHOWDOWN_STATE ) {
			case ENUM_SHOWDOWN_STEP.NONE:
				break;

			case ENUM_SHOWDOWN_STEP.SHOWDOWN_START:
				{
					let delay = 0;
					let next: any = null;
					if ( this.centerCardState == eCommunityCardStep.PRE_FLOP ) {

						next = ENUM_SHOWDOWN_STEP.SHOW_FLOP;
						delay = 4000;

					} else if ( this.centerCardState == eCommunityCardStep.FLOP ) {						

						next = ENUM_SHOWDOWN_STEP.SHOW_TURN;
						delay = 4000;

					} else if ( this.centerCardState == eCommunityCardStep.TURN ) {

						next = ENUM_SHOWDOWN_STEP.SHOW_RIVER;
						delay = 4000;

					} else if ( this.centerCardState == eCommunityCardStep.RIVER ) {

						next = ENUM_SHOWDOWN_STEP.SHOWDOWN_END;
						delay = 4000;
					}

					this.bufferTimerID = setTimeout( () => {
						this.SHOWDOWN_STATE = next;						
						this.ChangeShowdownState();
					}, delay );
				}
				break;

			case ENUM_SHOWDOWN_STEP.SHOW_FLOP:
				{
					this.broadcast( 'SHOWDOWN_FLOP', {
						msg: "SHOWDOWN_FLOP",
						cards: this.communityCardIndex.slice( 0, 3 ),
					} );

					let delay = 1500;
					this.bufferTimerID = setTimeout( () => {
						this.SHOWDOWN_STATE = ENUM_SHOWDOWN_STEP.SHOW_TURN;						
						this.ChangeShowdownState();
					}, delay );
				}

				break;

			case ENUM_SHOWDOWN_STEP.SHOW_TURN:
				{
					this.broadcast( 'SHOWDOWN_TURN', {
						msg: "SHOWDOWN_TURN",
						cards: this.communityCardIndex.slice( 3, 4 ),
					} );
					
					let delay = 1500;
					this.bufferTimerID = setTimeout( () => {
						this.SHOWDOWN_STATE = ENUM_SHOWDOWN_STEP.SHOW_RIVER;						
						this.ChangeShowdownState();
					}, delay );										
				}
				break;

			case ENUM_SHOWDOWN_STEP.SHOW_RIVER:
				{
					this.broadcast( 'SHOWDOWN_RIVER', {
						msg: "SHOWDOWN_RIVER",
						cards: this.communityCardIndex.slice( 4 ),
					} );

					let delay = 4000;
					this.bufferTimerID = setTimeout( () => {
						this.SHOWDOWN_STATE = ENUM_SHOWDOWN_STEP.SHOWDOWN_END;						
						this.ChangeShowdownState();
					}, delay );
				}
				break;

			case ENUM_SHOWDOWN_STEP.SHOWDOWN_END:
				let pots : any[] = this._PotCalculator.GetPots(true);
				this.finishProc( false, true);

				this.elapsedTick = 0;

				this.showdownTime = 3000; //this.conf[ "showDownTerm" ];
				this.showdownTime += ( pots.length * 2500 );
				this.state.gameState = eGameState.Result;
				break;
		}
	}

	onPRE_FLOP_END() {

		let rakePercentage = this.conf['rakePercentage'];
		this.participants.forEach ( ( e )=>{
			if ( e.roundBet > 0 ) {
				let rolling =  e.roundBet;
				let rake_back = Math.trunc( rolling * e.rake_back_rate );
				let rolling_rake = Math.trunc( rolling * rakePercentage ) - rake_back;
	
				e.rolling += rolling;
				e.rolling_rake += rolling_rake;
				e.rake_back += rake_back;
				e.totalBet += rolling;
				e.roundBet = 0;
	
				this.UPDATE_ROLLINGS({
					id: e.id,
					rolling: rolling,
					rake_back: rake_back,
					rolling_rake: rolling_rake,
				});	
			}
		} );

		this.ResetRoundBets();
		this.lastBet = null;

		this.broadcast( "PRE_FLOP_END", {
			msg: "PRE_FLOP_END",
			pot: this.state.pot,
		} );
	}

	onUPDATE_ROLLING() {
		if ( this.participants == null || this.participants.length == 0 ) {
			return;
		}
		let rakePercentage = this.conf['rakePercentage'];

		this.participants.forEach ( (e)=>{
			if ( e.roundBet > 0 ) {
				let rolling = e.roundBet;
				let rake_back = this.SafeNUMBER( rolling * e.rake_back_rate );
				let rolling_rake = this.SafeNUMBER(rolling * rakePercentage - rake_back);

				e.rolling += rolling;
				e.rolling_rake += rolling_rake;				
				e.rake_back += rake_back;
				e.totalBet += rolling;				
				e.roundBet = 0;
	
				this.UPDATE_ROLLINGS({
					id: e.id,
					rolling: rolling,
					rake_back: rake_back,
					rolling_rake: rolling_rake,
				});	
			}
		} );

		this.ResetRoundBets();
		this.lastBet = null;
	}

	onFLOP_END() {
		let rakePercentage = this.conf['rakePercentage'];		
		this.participants.forEach ( (e)=>{
			if ( e.roundBet > 0 ) {
				let rolling = e.roundBet;
				let rake_back = Math.trunc( rolling * e.rake_back_rate );
				let rolling_rake = Math.trunc( rolling * rakePercentage ) - rake_back;			
	
				e.rolling += rolling;
				e.rolling_rake += rolling_rake;
				e.rake_back += rake_back;
				e.totalBet += rolling;						
				e.roundBet = 0;
	
				this.UPDATE_ROLLINGS({
					id: e.id,
					rolling: rolling,
					rake_back: rake_back,
					rolling_rake: rolling_rake,				
				});	
			}
		} );

		this.ResetRoundBets();
		this.lastBet = null;

		this.broadcast( "FLOP_END", {
			msg: "FLOP_END",
			pot: this.state.pot,					
		} );
	}

	onTURN_END() {
		let rakePercentage = this.conf['rakePercentage'];

		this.participants.forEach ( (e)=>{
			if ( e.roundBet > 0 ) {
				let rolling = e.roundBet;
				let rake_back = Math.trunc( rolling * e.rake_back_rate );
				let rolling_rake = Math.trunc( rolling * rakePercentage ) - rake_back;			
	
				e.rolling += rolling;
				e.rolling_rake += rolling_rake;			
				e.rake_back += rake_back;
				e.totalBet += rolling;		
				e.roundBet = 0;
	
				this.UPDATE_ROLLINGS({
					id: e.id,
					rolling: rolling,
					rake_back: rake_back,
					rolling_rake: rolling_rake,				
				});	
			}
		} );

		this.ResetRoundBets();
		this.lastBet = null;
				
		this.broadcast( "TURN_END", {
			msg: "TURN_END",
			pot: this.state.pot,					
		} );
	}
	
	onRIVER_END() {
		console.log(this._tableIdString + 'onRIVER_END');
		let rakePercentage = this.conf['rakePercentage'];

		this.participants.forEach ( ( e )=>{
			if ( e.roundBet > 0 ) {
				let rolling = e.roundBet;
				let rake_back = Math.trunc( rolling * e.rake_back_rate );
				let rolling_rake = Math.trunc( rolling * rakePercentage ) - rake_back;
	
				e.rolling += rolling;
				e.rolling_rake += rolling_rake;			
				e.rake_back += rake_back;
				e.totalBet += rolling;
				e.roundBet = 0;
	
				this.UPDATE_ROLLINGS({
					id: e.id,
					rolling: rolling,
					rake_back: rake_back,
					rolling_rake: rolling_rake,				
				});	
			}
		} );

		this.ResetRoundBets();
		this.lastBet = null;
				
		this.broadcast( "RIVER_END", {
			msg: "RIVER_END",
			pot: this.state.pot,
		} );
	}
	
    private async UPDATE_ROLLINGS( data: any  ) {
		let log = 'id: ' + data.id + ' / rolling: ' + data.rolling + ' ,' + ' / rolling_rake: ' + data.rolling_rake + ' / rake_back: ' + data.rake_back;
		logger.info( this._tableIdString +  "[ UPDATE_ROLLINGS] %s",  log);

		try {
            	this._dao.UPDATE_ROLLINGS( data, (err: any, res: any)=>{

			});			
		} catch (error) {
			console.log(this._tableIdString + error);
		}
    }	

	changeCenterCardState() {
		switch( this.centerCardState ) {
			case eCommunityCardStep.PRE_FLOP:
				this.onPRE_FLOP_END();

				this.bufferTimerID = setTimeout( () => {
					this.centerCardState = eCommunityCardStep.FLOP;
					this._PotCalculator.UpdateCenterCard(this.centerCardState);
					this._PotCalculator.CalculatePot();					
					this.changeState( eGameState.Flop );
				}, 1000 );

				break;
			case eCommunityCardStep.FLOP:
				this.onFLOP_END();

				this.bufferTimerID = setTimeout( () => {
					this.centerCardState = eCommunityCardStep.TURN;
					this._PotCalculator.UpdateCenterCard(this.centerCardState);
					this._PotCalculator.CalculatePot();
					this.changeState( eGameState.Turn );
				}, 1000 );

				break;
			case eCommunityCardStep.TURN:
				this.onTURN_END();

				this.bufferTimerID = setTimeout( () => {
					this.centerCardState = eCommunityCardStep.RIVER;
					this._PotCalculator.UpdateCenterCard(this.centerCardState);
					this._PotCalculator.CalculatePot();
					this.changeState( eGameState.River );	
				}, 1000 );

				break;
			case eCommunityCardStep.RIVER:
				this.onRIVER_END();

				this.bufferTimerID = setTimeout( () => {
					this.centerCardState = eCommunityCardStep.RESULT;
					this._PotCalculator.UpdateCenterCard(this.centerCardState);
					this._PotCalculator.CalculatePot();
					this.changeState( eGameState.Result );
				}, 1000 );
				break;
			default:
				logger.error(  this._tableIdString + "[ changeCenterCardState ] invalid state : %s", this.centerCardState );
				break;
		}
	}

	//------------------------------------
	// PREPARE
	//------------------------------------
	// button, sb, bb seat update.
	// card shuffle
	// entity`s state reset
	prepareRound() {
        let entryPlayerCount : number = 0;

        this.state.entities.forEach(element => {
			if( element.wait === false ){
				entryPlayerCount++;
			}
		});

		logger.info( this._tableIdString +  "[ entryPlayerCount %s",  entryPlayerCount);

		this._PotCalculator.SetRoundPlayerCount(entryPlayerCount);

		this.state.maxBet = 0;
		this.state.minRaise = 0;
		this.state.pot = 0;
		this.state.shuffle = "";
		this.bufferTimerID = null; // 구현 편이 및 테스트를 위한 버퍼
		this.cardPickPos = 0;
		this.elapsedTick = 0;
		this.betSeat = 0;
		this.endSeat = 0;
		this.communityCardString = [];
		this.communityCardIndex = [];
		this.centerCardState = eCommunityCardStep.PREPARE;

		logger.info(  this._tableIdString + "[ card shuffle ]");

		// card shuffle
		for( let i = 0; i < 10; i++ ) {
			for( let index = this.totalCards2.length - 1; index > 0; index-- ) {
				const randomPosition = Math.floor( Math.random() * ( index + 1 ) );
				const temporary = this.totalCards2[ index ];
				this.totalCards2[ index ] = this.totalCards2[ randomPosition ];
				this.totalCards2[ randomPosition ] = temporary;
			}
		}

		// this.totalCards2 = [];
		// this.totalCards2 = ['35', '10', '45', '39', '50', '2', '11', '32', '36', '27', '49', '1', '18', '31', '16', '24', '28', '15', '42', '19', '25', '0', '17', '48', '23', '37', '26', '41', '44', '33', '3', '8', '30', '34', '51', '21', '12', '46', '40', '5', '7', '43', '22', '14', '38', '20', '6', '47', '29', '9', '13', '4'  ];
		
		let shuStr = "";
		for( let i = 0; i < this.totalCards2.length; i++ ) {
			let temp = this.totalCards2[ i ];
			shuStr = shuStr + temp + " ";
		}

		logger.info(  this._tableIdString + "[ prepareRound ] shuffle : %s ", shuStr );

		// community card pick.
		for( this.cardPickPos = 0; this.cardPickPos < this.conf[ "communityCard" ]; this.cardPickPos++ ) {
			let card = this.totalCards[ parseInt( this.totalCards2[ this.cardPickPos ] ) ];
			this.communityCardString.push( card );
			this.communityCardIndex.push( parseInt( this.totalCards2[ this.cardPickPos ] ) );
		}

		logger.info(  this._tableIdString + "[ prepareRound ] community cards : %s ", this.communityCardString );

		this.resetEntities();

		this.broadcast( "PREPARE_ROUND", {
			dealerSeatPos: this.state.dealerSeat,
			sbSeatPos: this.state.sbSeat,
			bbSeatPos: this.state.bbSeat,
			entities: this.state.entities,
			startBet: this.state.startBet,
			dealer: this.state.dealerSeat
		} );

		this.bufferTimerID = setTimeout( () => {
			this.changeState( eGameState.PreFlop );
		}, 1000 );
	}

	resetEntities() {
		this.state.entities.forEach( e => {
			e.currBet = 0;
			e.roundBet = 0;
			e.fold = false;
			e.hasAction = true;
			e.allIn = 0;
			e.primaryCard = "";
			e.secondaryCard = "";
			e.cardIndex = [];
			e.eval = null;
			e.winHandRank = "";
			e.winAmount = 0;
			e.totalBet = 0;
			e.initRoundChips = e.chips;
		} );
	}

	ResetRoundBets() {
		this.state.entities.forEach( e => {
			e.roundBet = 0;
		} );
	}	

	//------------------------------------
	// PRE_FLOP
	//------------------------------------
	cardDispensing() {

		let handsCount: number = 0; 
		if ( this._HandHistoryController != null ) {
			this._HandHistoryController.Set(null);

			handsCount = this._HandHistoryController.GetHands();
			logger.info( this._tableIdString + '[CARD_DISPENSING] HANDS ID: %s' + handsCount.toString() );
		}

		for( let i = 0; i < this.state.entities.length; i++ ) {
			let entity = this.state.entities[ i ];

			if ( -1 === entity.seat || entity == null ) {
				continue;
			}

			if( true === entity.wait || true === entity.fold ) {
				entity.client.send( "CARD_DISPENSING", {
					primary: -1, 
					secondary: -1,
					hands: handsCount,
				} );
				continue;
			}

			if ( entity.isSitOut == true ) {
				logger.info( this._tableIdString + '[CARD_DISPENSING]SITOUT PLAYER CARD DISPENCING');
			}

			let primary = parseInt( this.totalCards2[ this.cardPickPos++ ] );
			entity.primaryCard = this.totalCards[ primary ];
			entity.cardIndex.push( primary );

			let secondary = parseInt( this.totalCards2[ this.cardPickPos++ ] );
			entity.secondaryCard = this.totalCards[ secondary ];
			entity.cardIndex.push( secondary );

			entity.eval = PokerEvaluator.evalHand(
				[ entity.primaryCard, entity.secondaryCard,
					this.communityCardString[ 0 ], this.communityCardString[ 1 ], this.communityCardString[ 2 ],
					this.communityCardString[ 3 ], this.communityCardString[ 4 ] ] );
			
			entity.client.send( "CARD_DISPENSING", {
				primary: primary,
				secondary: secondary,
				hands: handsCount,
			} );

			let hands: number = entity.statics.hands;
			entity.statics.hands = hands + 1;

			logger.info(  this._tableIdString + "[DISPENSING] id: %s / nickname: %s / seat : %s", entity.id, entity.nickname, entity.seat );
			logger.info(  this._tableIdString + "[DISPENSING] primary : %s // secondary : %s", entity.primaryCard, entity.secondaryCard );
			if ( entity.eval == null ) {
				logger.info(  this._tableIdString + "[DISPENSING ] eval is null why?" );
				console.error( this._tableIdString + entity );
			} else {
				logger.info(  this._tableIdString + "[DISPENSING ] eval: %s ", entity.eval );
			}
		}
	}

	blindBet() {
		let sb = this.getEntity( this.state.sbSeat );
		let bb = this.getEntity( this.state.bbSeat );
		let missSb: any[] = [];
		let missBb: any[] = [];
		this.participants = [];
		this.lastBet = null;

		let sbBet: number = this.conf["smallBlind"];

		if ( sb != null ) {
			if( sb.chips > sbBet &&
				sb.wait === false ) {
				sb.currBet = sbBet;
				sb.roundBet = sbBet;
				sb.totalBet = sbBet;
				sb.isSb = true;
				logger.info( this._tableIdString + "[ blindBet-sb] id: %s, name: %s, seat: %s, oldChips: %s, newChips: %s", sb.id, sb.nickname, sb.seat, sb.chips, sb.chips - sb.currBet );
				sb.chips -= sb.currBet;
				sb.ante = 0;
				this.state.pot += sb.currBet;

				try {
					this._PotCalculator.SetBet( this.state.sbSeat, sb.totalBet, sb.eval.value, false);
				} catch (error) {
					console.error( this._tableIdString + error );
				}
			}
		}

		if ( null != bb ) {
			if( bb.chips > this.state.startBet &&
				bb.wait === false ) {
				bb.currBet = this.state.startBet;
				bb.roundBet = this.state.startBet;
				bb.totalBet = this.state.startBet;
				bb.isBb = true;
				bb.ante = 0;
				logger.info( this._tableIdString + "[ blindBet-bb] id: %s, name: %s, seat: %s, oldChips: %s, newChips: %s", bb.id, bb.nickname, bb.seat, bb.chips, bb.chips - bb.currBet );				
				bb.chips -= bb.currBet;
				this.state.pot += bb.currBet;

				try {
					this._PotCalculator.SetBet( this.state.bbSeat, bb.totalBet, bb.eval.value, false);					
				} catch (error) {
					logger.error( this._tableIdString + error );
				}
			}
		}

		// for( let i = 0; i < this.state.entities.length; i++ ) {
		// 	let e = this.state.entities[ i ];
		// 	if ( null === e || undefined === e ) {
		// 		continue;
		// 	}

		// 	if ( true === e.wait) {
		// 		continue;
		// 	}
		// }

		let player: any[] = [];
		let ante: number = this.conf['ante'];		
		for( let i = 0; i < this.state.entities.length; i++ ) {
			let e = this.state.entities[ i ];
			if ( null === e || undefined === e ) {
				continue;
			}

			if ( true === e.wait ) {
				continue;
			}

			if ( e.isSb != true && e.isBb != true ) {
				this.state.pot += ante;
				e.currBet = ante;
				e.roundBet = ante;				
				e.totalBet = ante;
				e.ante = ante;
				logger.info( this._tableIdString + "[ blindBet-ante] id: %s, name: %s, seat: %s, oldChips: %s, newChips: %s", e.id, e.nickname, e.seat, e.chips, e.chips - ante );								
				e.chips -= e.ante;
				
				try {
					this._PotCalculator.SetAnte( e.seat, e.totalBet, e.eval.value, false );					
				} catch (error) {
					logger.error(  this._tableIdString + error );
				}

			}
			player.push( e );
		}

		player.forEach( (p)=>{
			logger.info( this._tableIdString + "[participants] id: %s, name: %s, seat: %s, chips: %s, rake_back_rate: %s", p.id, p.nickname, p.seat, p.chips, p.rake_back_rate );
			this.participants.push({
				id: p.client.auth.id,
				seat: p.seat,
				store_id: p.client.auth.store_id,
				distributor_id: p.client.auth.distributor_id,
				partner_id: p.client.auth.partner_id,
				login_id: p.client.auth.login_id,
				nickname: p.client.auth.nickname,
				roundBet: p.roundBet,
				rolling_rake: 0,
				totalBet: 0,
				win: 0,
				rake: 0,
				rake_back: 0,
				rake_back_rate: p.rake_back_rate,
				rolling: 0,
			});
		});

		// this._HandHistoryController.

		this.state.maxBet = this.state.startBet;
		this.state.minRaise = this.state.maxBet;
		this._initPot = this.state.pot;

		this.broadcast( "BLIND_BET", {
			sb: sb,
			bb: bb,
			maxBet: this.state.maxBet,
			pot: this.state.pot,
			missSb: missSb,
			missBb: missBb,
			player: player,
			ante: this.conf['ante'],
		} );
	}

	//------------------------------------
	// BET
	//------------------------------------
	setTurnBet() {
		this.state.maxBet = 0;
		this.state.minRaise = this.state.maxBet;
		for( let i = 0; i < this.state.entities.length; i++ ) {
			this.state.entities[ i ].currBet = 0;
			this.state.entities[ i ].hasAction = true;
		}
	}

	broadTurn() {

		// find next seat
		let locSeat = this.betSeat;
		let find = false;

		while( !find ) {
			locSeat += 1;
			if( locSeat >= this.maxClients ) {
				locSeat = 0;
			}

			const pos = this.state.entities.findIndex( function( et ) {
				return et.seat === locSeat;
			} );

			if( pos > -1 ) {
				let entity = this.state.entities[ pos ];

				// leave proc.
				if( true === entity.leave &&//true === entity.waitReconnection || true === entity.leave &&
					false === entity.wait &&
					false === entity.fold ) {
					logger.info(  this._tableIdString + "[ broadTurn ] seat %s is leave. fold", entity.seat );
					let next = this.funcFold( entity.seat );
					if( false === next ) {
						console.log(this._tableIdString + 'false === next');
						return;
					}
				}

				if( true === entity.wait )
                {
                    this.betSeat = locSeat;
                    this.elapsedTick = 0;

                    let isLastTurn : boolean = this.isLastTurn(locSeat);

                    if(true === isLastTurn){
                        this.changeCenterCardState();
                        return;
                    }

                    this.broadTurn();
                    return;
                }

				if( false === entity.fold &&
					0 === entity.allIn &&
					false === entity.wait ) {
					find = true;
				}
			}
			else {
			}
		}

		this.betSeat = locSeat;
		this.elapsedTick = 0;

		let currPlayer = null;

		let locIndex = 0;
		for( let i = 0; i < this.state.entities.length; i++ ) {
			if( this.betSeat === this.state.entities[ i ].seat ) {
				currPlayer = this.state.entities[ i ];
				locIndex = i;
				break;
			}
		}

		if( null === currPlayer ) {
			logger.error(  this._tableIdString + "[ broadTurn ] %s seat player is null", this.betSeat );
			return;
		}

		logger.info(  this._tableIdString + "[ broadTurn ] seat : %s // player index : %s // currBet : %s // chips : %s // maxBet : %s // minRaise : %s // allin : %s",
			this.betSeat, locIndex, currPlayer.currBet, currPlayer.chips, this.state.maxBet, this.state.minRaise, currPlayer.allIn );

		// find max chip
		let maxChip = -1;

		let finishedCount = 0;

		for( let i = 0; i < this.state.entities.length; i++ ) {

			let locE = this.state.entities[ i ];

			if( locE.seat == currPlayer.seat ) {
				continue;
			}

			if( true == locE.wait ) {
				finishedCount++;
				continue;
			}

			if( true == locE.fold ) {
				finishedCount++;
				continue;
			}

			if( 1 == locE.allIn ) {
				finishedCount++;
				continue;
			}

			let sumChip = locE.chips - currPlayer.currBet + locE.currBet;
			// (this.state.maxBet - currPlayer.currBet);
			//  + locE.currBet;

			if( maxChip < sumChip ) {
				maxChip = sumChip;
			}
		}

		let mine = currPlayer.chips + currPlayer.currBet;
		// logger.info( "[ broadTurn ] max [ %s ] larger than my [ %s ] then max is mine [ %s ]", maxChip, mine, mine );
		if( maxChip > mine ) {
			maxChip = mine;
		}

		if( -1 == maxChip ) {
			maxChip = 0;
		}

		logger.info(  this._tableIdString + "[ broadTurn ] seat : %s // maxChip : %s", currPlayer.seat, maxChip );
		console.log('betTimeUnit: this.conf:' + this.conf['timeoutUnit'], );

		this.broadcast( "YOUR_TURN", {
			player: currPlayer.seat,
			currBet: currPlayer.currBet,
			chips: currPlayer.chips,
			action: currPlayer.hasAction,
			maxBet: this.state.maxBet,
			minRaise: this.state.minRaise,
			currPot: this.state.pot,
			maxChip: maxChip,			
			duration: this.conf["betTimeLimit"],
			betTimeUnit: this.conf['timeoutUnit'],
			isLast : finishedCount == (this.state.entities.length - 1),
		} );
	}

	private ReOpenAction() {
		for( let i = 0; i < this.state.entities.length; i++ ) {
			if( false === this.state.entities[ i ].fold &&
				false === this.state.entities[ i ].wait &&
				0 === this.state.entities[ i ].allIn ) {
				this.state.entities[ i ].hasAction = true;
			}
		}
	}

	funcFold( seat: number ) {
		let e = this.getEntity( seat );
		if ( e == null ) {
			return;
		}

		e.fold = true;

		this.processPendingAddChipsBySeat(e);
		e.initRoundChips = e.chips;

		if ( e.eval == null || e.eval.value == null ) {
			logger.error( this._tableIdString + 'e.eval == null || e.eval.value == null is critical');
			this.broadcast( "FOLD", {
				seat: seat
			} );
			return;
		}

		try {
			this._PotCalculator.SetBet( e.seat, e.totalBet, e.eval.value, true );
		} catch (error) {
			logger.info(  this._tableIdString + error );
		}

		this.broadcast( "FOLD", {
			seat: seat
		} );

		let fold = e.statics.fold;
		e.statics.fold = fold + 1;

		switch ( this.centerCardState ) {
			case eCommunityCardStep.PRE_FLOP:
			{
				let fold_preflop = e.statics.fold_preflop;
				e.statics.fold_preflop = fold_preflop + 1;
			}
			break;
			case eCommunityCardStep.FLOP:
			{
				let fold_flop = e.statics.fold_flop;
				e.statics.fold_flop = fold_flop + 1;
			}
			break;
			case eCommunityCardStep.TURN:
			{
				let fold_turn = e.statics.fold_turn;
				e.statics.fold_turn = fold_turn + 1;
			}
			break;
			case eCommunityCardStep.RIVER:
			{
				let fold_river = e.statics.fold_river;
				e.statics.fold_river = fold_river + 1;
			}
			break;		
		}

		if ( e.isSitOut == true && e.wait == false ) {
			e.wait = true;
			e.pendSitout = false;
			e.sitoutTimestamp = Number ( Date.now() );
			this.UpdateSeatInfo();
			logger.info(  this._tableIdString + "[ SIT_OUT ] %s", e.seat );			
			this.broadcast( "SIT_OUT", { seat : e.seat } );
		}

		if( this.isAllFold() ) {
			logger.info(  this._tableIdString + "[ funcFold ] all fold" );
			this.bufferTimerID = setTimeout( () => {
				this.changeState( eGameState.Result );
			}, 1000 );
			return false;
		}

		if( this.checkCount() < 1 ) {
			logger.info(  this._tableIdString + "[ funcFold ] not player." );
			this.bufferTimerID = setTimeout( () => {
				this.changeState( eGameState.Result );
			}, 1000 );
			return false;
		}

		if( true == this.isLastTurn( seat ) ) {

			if( this.checkCount() <= 1 ) {
				logger.info(  this._tableIdString + "[ funcFold ] this is last turn" );
				this.bufferTimerID = setTimeout( () => {
					this.changeState( eGameState.Result );
				}, 1000 );
			}
			else {
				this.changeCenterCardState();
			}

			return false;
		}
		else
		{
			if(this.checkCount() <= 1 && this.state.maxBet <= 0){
				logger.info(  this._tableIdString + "[FUNC-FOLD] this.checkCount(): %s, this.state.maxBet: %s", this.checkCount(), this.state.maxBet);

				let last = this.getEntity( this.endSeat );
				if ( last != null ) {
					try {
						this._PotCalculator.SetBet( last.seat, last.totalBet, last.eval.value, false );
					} catch (error) {
						logger.info(  this._tableIdString + error );
					}
				}

				this.bufferTimerID = setTimeout(() => {
					this.changeState(eGameState.Result);
				}, 1000);

				return false;
			} 
		}

		return true;
	}

	broadPlayerCards( isAllIn : boolean ) {
		let cards: any = {};
		let isWinners: any = {};

		for( let i = 0; i < this.state.entities.length; i++ ) {
			if( true === this.state.entities[ i ].wait ) {
				continue;
			}

			if(true === this.state.entities[i].fold) {
				continue;
			}

			cards[ this.state.entities[ i ].seat ] = this.state.entities[ i ].cardIndex;
			isWinners[ this.state.entities[ i ].seat ] = false;

			if (false == isAllIn) {
				let winner = this._PotCalculator.IsWinner(this.state.entities[i].seat);
				isWinners[ this.state.entities[ i ].seat ] = winner;
				if (false === winner) {
				}
			}
		}

		this.broadcast( "PLAYER_CARDS", { allin: isAllIn, cards: cards, winners: isWinners,
		communities: this.communityCardIndex } );
	}

	private ShowdownProcedure() {
		let folders: number[] = [];
		for( let i = 0; i < this.state.entities.length; i++ ) {
			if( true === this.state.entities[ i ].wait ) {
				continue;
			}

			if(true === this.state.entities[i].fold) {
				folders.push(this.state.entities[i].seat);
			}
		}

		let hands: any = {};
		for( let i = 0; i < this.state.entities.length; i++ ) {
			if( true === this.state.entities[ i ].wait ) {
				continue;
			}

			if(true === this.state.entities[i].fold) {
				continue;
			}

			hands[ this.state.entities[ i ].seat ] = this.state.entities[ i ].cardIndex;
		}


		this.broadcast( "SHOWDOWN_START", {
			pot: this.state.pot,
			hands: hands,
			folders: folders,
		} );

		this.SHOWDOWN_STATE = ENUM_SHOWDOWN_STEP.SHOWDOWN_START;
		this.ChangeShowdownState();
	}

	private finishProc( skip : boolean, isAllIn : boolean ) {
		
		let pots = this._PotCalculator.GetPots(true);
		let winners: any[] = [];
		let folders: number[] = [];

		let _winners: any[] = [];

		let rakePercent = this.conf['rakePercentage'];

		for(let i = 0; i < pots.length; i++) {
			let pot : any = pots[i];
			let potWinners : any[] = pot.winner;

			let potPlayers: any = pot.players.length;
			let isReturn: boolean = false;
			if ( skip == false && potPlayers == 1) {
				isReturn = true;
			}

			let isDraw: boolean = false;
			let wc: number = pot.winner.length;
			if ( wc > 1 ) {
				isDraw = true;
			}

			let potAmount: number = 0;
			let winAmount: number = 0;
			let rake: number = 0;

			if ( skip == true ) {
				potAmount = pot.total;
				winAmount = Math.trunc( potAmount / wc );
				winAmount = Math.max( winAmount, 0 );
				if ( this.lastBet != null && this.lastBet.seat == pot.winner[0] ) {
					if ( this.lastBet.bet > 0 ) {
						logger.info( this._tableIdString + '[LASTBET: %s] bet: %s', this.lastBet.seat, this.lastBet.bet );
						rake = Math.trunc( (potAmount - this.lastBet.bet) * rakePercent / wc );
						if ( rake < 0 ) {
							logger.info( this._tableIdString + '[RAKE] RAKE < 0 Why?? rake: %s', rake );
							rake = Math.trunc( (potAmount) * rakePercent / wc );;
						}
					} else {
						rake = Math.trunc( winAmount * rakePercent );
					}
				} else {
					rake = Math.trunc( winAmount * rakePercent );
				}
			} else {
				potAmount = pot.total;
				winAmount = Math.trunc( potAmount / wc );
				if ( isReturn == true ) {
					rake = 0;
				} else {
					rake = Math.trunc( winAmount * rakePercent );
				}				
			}

			winAmount -= rake;
			logger.info( this._tableIdString + '[-----------------]');
			logger.info( this._tableIdString + '[POT: %s] total: %s / player: %s / winner: %s / winAmount rake: %s / estimate rake: %s ', i, potAmount, pot.players, pot.winner, winAmount, rake );

			for(let j = 0; j < pot.winner.length ; j++){
				let entity = this.getEntity( pot.winner[j] );

				if ( entity !== null && entity !== undefined ) {
					logger.info( this._tableIdString + "[WINNERS] id: %s, name: %s, seat: %s, chips: %s, win: %s, newChips: %s", entity.id, entity.nickname, entity.seat, entity.chips, winAmount, entity.chips + winAmount );
					entity.chips += winAmount;
					entity.winAmount += winAmount;
					if ( entity.eval == null || entity.eval.handName == null ) {
						entity.winHandRank = '';
					} else {
						entity.winHandRank = entity.eval.handName;
					}

					let store_id: number = -1;
					if ( entity.client != null && entity.client.auth != null && entity.client.auth.store_id != null ) {
						store_id = entity.client.auth.store_id;
					}

					let _w = _winners.find( ( w )=>{						
						return w.seat = entity.seat;
					});

					if ( _w == null ) {
						_winners.push({
							id: entity.id,
							seat: entity.seat,
							store_id: store_id,
							winAmount: entity.winAmount,
							rake: rake,
							return: isReturn,
							draw: isDraw							
						})
					} else {
						_w.winAmount = entity.winAmount;
						_w.rake += rake;
						_w.return = isReturn;
						_w.draw = isDraw;
					}
	
					winners.push( {
						id: entity.id,
						seat: entity.seat,
						store_id: store_id,
						potNo: i,
						cards: entity.cardIndex,
						nickname: entity.nickname,
						eval: entity.eval,
						chips: entity.chips,
						winAmount: entity.winAmount,
						rake: rake,
						fold : entity.fold,
						return: isReturn,
						draw: isDraw
					} );
				}
			}
		}

		for( let i = 0; i < this.state.entities.length; i++ ) {
			if( true === this.state.entities[ i ].wait ) {
				continue;
			}

			if(true === this.state.entities[i].fold) {
				folders.push(this.state.entities[i].seat);
			}
		}

		let playerCards: any = {};
		for( let i = 0; i < this.state.entities.length; i++ ) {
			if( true === this.state.entities[ i ].wait ) {
				continue;
			}

			if(true === this.state.entities[i].fold) {
				continue;
			}

			playerCards[ this.state.entities[ i ].seat ] = this.state.entities[ i ].cardIndex;
		}

		this.broadcast( "WINNERS", {
			skip: skip,
			winners: winners,
			pot: this.state.pot,
			dpPot : pots,
			cards: this.communityCardIndex,
			playerCards: playerCards,
			folders: folders,
			isAllInMatch : isAllIn
		} );

		let mainPot: number = 0;
		
		if (pots[mainPot] != null &&  pots[mainPot].winner != null && winners != null ) 
		{
			pots[mainPot].winner.forEach( (e: any)=> {

				let w = winners.find( (element )=>{
					return ( element.seat == e ) && ( element.potNo == mainPot );
				} );
	
				if ( w != null ) {
					let seat = w.seat;
					let entity = this.getEntity(  seat );
					if ( entity != null && entity.statics != null ) {
						if ( w.draw == true ) {
							let c = entity.statics.draw;
							entity.statics.draw = c + 1;						
						} else {
							let c = entity.statics.win;
							entity.statics.win = c + 1;						
						}

						if ( entity.isDealer == true ) {
							entity.statics.win_dealer += 1;
						}

						if ( entity.isSb == true ) {
							entity.statics.win_smallBlind += 1;
						}

						if ( entity.isBb == true ) {
							entity.statics.win_bigBlind += 1;
						}
	
						if ( skip == true ) {
	
						} else {
	
							if ( this.SHOWDOWN_STATE != ENUM_SHOWDOWN_STEP.NONE ) {
								entity.statics.win_allin += 1;
							}
	
							let best_rank = entity.statics.best_rank;
							let handValue: number = -1;

							if ( w.eval == null || w.eval.value == null ) {
								handValue = -1;
							} else {
								handValue = w.eval.value;															
							}
	
							if ( handValue > best_rank ) {
								entity.statics.best_rank = handValue;
	
								let cards: string[] = [];
								this.communityCardString.forEach( (cc)=>{
									cards.push ( cc );
								} );
	
								w.cards.forEach( (cc: any )=>{
									cards.push( this.totalCards[cc] );
								});
	
								let s = cards.toString();
								entity.statics.best_hands = s;
							}
						}
	
						switch( this.centerCardState ) {
							case eCommunityCardStep.PRE_FLOP:
								entity.statics.win_preflop += 1;
								break;
							case eCommunityCardStep.FLOP:
								entity.statics.win_flop += 1;
								break;
							case eCommunityCardStep.TURN:
								entity.statics.win_turn += 1;
								break;
							case eCommunityCardStep.RIVER:
								entity.statics.win_river += 1;
								break;
						}
	
						let ws = winners.filter( (elem )=>{
							return (w.seat == elem.seat);
						});
	
						let ta: number = 0;
						ws.forEach( ( l )=>{
							ta += l.winAmount;
						});
	
						let amount = ta - entity.totalBet;
						let maxPots = entity.statics.maxPots;
	
						if ( amount > maxPots ) {
							entity.statics.maxPots = amount;
						}
					}
				}
			});
		}

		this.state.entities.forEach( (et)=>{
			let entity = this.getEntity( et.seat );
			if ( entity != null ) {
				try {
					if ( entity.seat > -1 ) {
						logger.info( this._tableIdString + "[HAND-END] id: %s, name: %s, seat: %s, balance: %s, chips: %s", entity.id, entity.nickname, entity.seat, entity.balance, entity.chips );
					}

					this._dao.UPDATE_STATICS( entity.id, entity.statics, ( err: any, res: any )=>{

					});

				} catch (error) {
					console.log( this._tableIdString + error );
				}
			}
		} );

		_winners.forEach( ( w )=>{
			let p = this.participants.find( (player)=> {
				return w.seat == player.seat;
			});

			if ( p != null ) {
				p.rake += w.rake;
				p.win += w.winAmount;

				if ( w.return == true ) {
					p.totalBet -= w.winAmount;
					p.totalBet = this.SafeNUMBER(p.totalBet);
					p.roundBet -= w.winAmount;
					p.roundBet = this.SafeNUMBER(p.roundBet);
					p.win -= w.winAmount;
					p.win = this.SafeNUMBER(p.roundBet);
					
				}
				else {
					if ( skip == true ) {
						if ( this.lastBet != null && this.lastBet.seat == p.seat ) {
							if ( this.lastBet.bet != null && this.lastBet.bet > 0 ) {
								p.roundBet = Math.max ( p.roundBet - this.lastBet.bet, 0 );
								p.totalBet = Math.max ( p.totalBet - this.lastBet.bet, 0 );
								p.win = Math.max ( p.win - this.lastBet.bet, 0 );
							}
						}
					}
				}
			}
		});

		try {
			let rakePercentage = this.conf['rakePercentage'];
			this._SalesReporter.UpdateUser( this._dao, this.participants, rakePercentage );
			this._SalesReporter.UpdateReportByUser( this._dao, this.participants );
			this.participants = [];

		} catch ( error ) {
			console.log( this._tableIdString + error );
		}
	}

	updateEndSeat( currBetSeat: number ) {
		// if ( this.checkCount() <= 1 ) {
		// 	return;
		// }

		logger.info(  this._tableIdString + "[ updateEndSeat ] [ BET ] previous seat : %s // curr seat : %s", this.betSeat, currBetSeat );
		this.betSeat = currBetSeat;
		let locBetSeat: number = this.betSeat;
		let find = false;

		while( !find ) {
			locBetSeat -= 1;
			if( locBetSeat < 0 ) {
				locBetSeat = this.maxClients;// - 1;
			}

			if( locBetSeat === this.betSeat ) {
				logger.error(  this._tableIdString + "[ updateEndSeat ] what happening?!" );
				// this.changeState(eGameState.Result);
				// break;
			}

			const idx = this.state.entities.findIndex( function( e ) {
				return e.seat === locBetSeat;
			} );

			if( idx > -1 ) {
				let entity = this.state.entities[ idx ];
				if( false === entity.fold &&
					0 === entity.allIn &&
					false === entity.wait ) {
					find = true;
				}
			}
		}

		logger.info(  this._tableIdString + "[ updateEndSeat ] bet seat : %s // end seat [ %s ] to [ %s ]", this.betSeat, this.endSeat, locBetSeat );
		this.endSeat = locBetSeat;
	}

	isLastTurn( seat: number ) {
		return seat === this.endSeat;
	}

	isFinishedRound() {
		let c = 0;
		for( let i = 0; i < this.state.entities.length; i++ ) {
			if( false === this.state.entities[ i ].fold &&
				false === this.state.entities[ i ].wait ) {
				c += 1;
			}
		}

		return c <= 1;
	}

	isAllFold() {
		let r = 0;
		for( let i = 0; i < this.state.entities.length; i++ ) {
			if( false === this.state.entities[ i ].wait &&
				false === this.state.entities[ i ].fold ) {
				r += 1;
			}
		}

		return r <= 1;
	}

	checkCount() {
		let r = 0;
		for( let i = 0; i < this.state.entities.length; i++ ) {
			if( false === this.state.entities[ i ].fold &&
				false === this.state.entities[ i ].wait &&
				0 === this.state.entities[ i ].allIn ) {
				r += 1;
			}
		}
		logger.info(  this._tableIdString + "[ checkCount ] remain player : %s", r );
		return r;
	}

	getEntity( seat: number ) {
		for( let i = 0; i < this.state.entities.length; i++ ) {
			if( seat === this.state.entities[ i ].seat ) {
				return this.state.entities[ i ];
			}
		}

		logger.error( this._tableIdString +  "[ getEntity ] no entity" );
		return null;
	}

	ping() {
		this.broadcast( "ping", {} );
	}


	kickPlayer(sessionId : string, returnCode : number){
		
		if(returnCode < 4000){
			console.error( this._tableIdString + "returnCode Is Already took by system please use < 4000");
			return;
		}

		logger.info( this._tableIdString + "Kick Player SessionID : " + sessionId + "  returnCode : " + returnCode);

		delete this._buyInWaiting[ sessionId ];
		delete this._rejoinWaiting[ sessionId ];

		for(let i =0; i < this.seatWaitingList.length; i++){
			if(this.seatWaitingList[i] != sessionId){
				continue;
			}

			this.seatWaitingList[i] = "";
		}

		let runaway = this.findEntityBySessionID( sessionId );
		if( null === runaway || undefined === runaway ) {
			logger.error(  this._tableIdString + "[ kickPlayer ] entity is null" );
			return;
		}

		runaway.client?.leave( returnCode );
		runaway.leave = true;

		this.handleEscapee();
	}

	public getEntitiesInfo() : any[]{
		let result : any[] = []

		this.state.entities.forEach(element => {
			if(element.seat < 0){
				return;
			}
	
			result.push({
				seat : element.seat,
				chips : element.chips,
				nickname : element.nickname,
			});
		});
		
		return result;
	}

	public isUserReconnecting(id : number) : boolean{
		let entity = this.state.entities.find( e => e.id == id);
		if( undefined == entity ) {
			return false;
		}

		if( false === entity.leave ) {
			return false;
		}

		return true;
	}

	public cancelRejoin(userID : number){
		let entity = this.state.entities.find((e) => {
			return e.id == userID;
		});

		if(null == entity || entity.leave != true){
			return;
		}

		this.broadcast( "HANDLE_ESCAPEE", { seat: entity.seat } );

		if (false == this.conf["private"]) {
			let data = {
				table_id: -1,
				id : entity.id
			}

			this._dao.UPDATE_USERS_TABLE_ID_ByUSER(data, (err: any, res: boolean) => {
				if (null != err) {
					logger.error( this._tableIdString + err);
				}
			});

			this._dao.CHIP_OUT(entity.chips, entity.id);
			entity.chips = 0;
		}

		const idx = this.state.entities.findIndex( function( e ) {
			return e.seat === entity.seat;
		});

		if( idx > -1 ) {
			this.state.entities.splice( idx, 1 );
		}
		else {
			logger.error(  this._tableIdString + "[ handleEscapee ] why??. seat : %s", entity.seat);
		}

		this.UpdateSeatInfo();
	}

	private async LoadStatics(id: any) {
		return new Promise ( (resolve, reject )=>{
			this._dao.SELECT_STATICS_ByUSER_ID( id, (err: any, res: any )=>{
				if (!!err) {
					reject( {
						code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
						msg: 'BAD_ACCESS_TOKEN',
					});
					return;
				}

				resolve( {
					code: ENUM_RESULT_CODE.SUCCESS,
					statics: res,
				} );
			});
		});
	}

	//MESSAGE HANDLER
	onLOAD_DONE( client : Client, msg : any ){
		let auth : any = this._buyInWaiting[client.sessionId];

		if(null != auth && undefined != auth){
			this.OnLoadDoneFirstJoin(client, auth);
			logger.info( this._tableIdString + " OnLoadDone - _buyInWaiting : " + client.sessionId);
			return;
		}

		auth = this._rejoinWaiting[client.sessionId];
		
		if(null != auth && undefined != auth){
			this.OnLoadDoneRejoin(client, auth);
			logger.info( this._tableIdString + " OnLoadDone - _rejoinWaiting : " + client.sessionId);
			return;
		}

		logger.error( this._tableIdString + "OnLoadDone - Player Call LoadDone But No waiting exist");
	}

	onBUY_IN( client: Client, msg: any ) {
		try {
			logger.info(  this._tableIdString + "[ onBuyIn ] msg : %s", msg );

			let entity = this.findEntityBySessionID( client.sessionId );
			if( null === entity || undefined === entity ) {
				logger.error(  this._tableIdString + "[ onBuyIn ] entity is null" );
				return;
			}

			let seatPos : number = -1;
			for(let i = 0; i < this.seatWaitingList.length; i++){
				
				if(this.seatWaitingList[i] == client.sessionId){
					seatPos = i;
					this.seatWaitingList[i] = "";
					break;
				}
			}
			if(seatPos == -1){
				return;
			}
			entity.seat = seatPos;

			this._dao.SELECT_BALANCE_ByUSER_ID( entity.id, ( err: any, res: any ) => {
				if( !!err ) {
					logger.error( this._tableIdString +  "[ onBuyIn ] selectBalanceByUID query error : %s", err );
					return;
				}

				if( res.length <= 0 ) {
					logger.error(  this._tableIdString + "[ onBuyIn ] selectBalanceByUID invalid user id" );
					return;
				}
				else {
					entity.balance = res[0]["balance"];

					let oldBalance = entity.balance;
					let oldChips = entity.chips;

					let buyInAmount = msg[ "buyInAmount" ];
					let bal = entity.balance - buyInAmount;
					if( bal <= 0 ) {
						buyInAmount = entity.balance;
						bal = 0;
					}
			
					entity.balance = bal;
					entity.chips += buyInAmount;
					entity.initRoundChips = entity.chips;

					entity.tableBuyInAmount += buyInAmount;
					entity.tableBuyInCount++;

					this._dao.BUY_IN( entity.id, this.conf["tableID"], oldBalance, 
					entity.balance, oldChips, entity.chips, buyInAmount, ( err: any, res: any ) => 
					{
						if( !!err ) {
							logger.error(  this._tableIdString + "[ onBuyIn ] buyIn query error : %s", err );
						}
					} );

					this._dao.UPDATE_USERS_BALANCE( entity.id, entity.balance, ( err: any, res: any ) => {
						if( !!err ) {
							logger.error(  this._tableIdString + "[ onBuyIn ] updateBalance query error : %s", err );
						}
					} );

					logger.info(  this._tableIdString + "[ onBuyIn ] balance(%s), chips(%s), buyInAmount(%s)", entity.balance, entity.chips, buyInAmount );

					let openCards: number[] = [];
					switch( this.centerCardState ) {
						case eCommunityCardStep.FLOP:
							openCards = this.communityCardIndex.slice( 0, 3 );
							break;

						case eCommunityCardStep.TURN:
							openCards = this.communityCardIndex.slice( 0, 4 );
							break;

						case eCommunityCardStep.RIVER:
						case eCommunityCardStep.RESULT:
							openCards = this.communityCardIndex;
							break;
					}

					this.UpdateSeatInfo();

					entity.tableInitChips = oldChips;
					entity.tableBuyInAmount = buyInAmount;
					entity.tableBuyInCount = 1;

					client.send("RES_BUY_IN", {
						ret: 0,
						amount: buyInAmount,
						message: "SUCCEED.",
						tableBuyInAmount: entity.tableBuyInAmount,
						tableBuyInCount: entity.tableBuyInCount,
					});

					let playerCards = null;
					let winners = null;
					let showdown = null;

					if ( this.state.gameState == eGameState.Result )
					{
						playerCards = this.GetPlayerCards();
						winners = this.GetWinners( this.isAllFold(), false );
					}

					if ( this.SHOWDOWN_STATE != ENUM_SHOWDOWN_STEP.NONE ) {
						showdown = this.GetShowdown();
						winners = this.GetWinners( false, true );

						switch ( this.SHOWDOWN_STATE ) {				
							case ENUM_SHOWDOWN_STEP.SHOWDOWN_START:
								openCards = [];
								break;
				
							case ENUM_SHOWDOWN_STEP.SHOW_FLOP:
								openCards = this.communityCardIndex.slice( 0, 3 );
								break;
				
							case ENUM_SHOWDOWN_STEP.SHOW_TURN:
								openCards = this.communityCardIndex.slice( 0, 4 );
								break;
				
							case ENUM_SHOWDOWN_STEP.SHOW_RIVER:
								openCards = this.communityCardIndex;
								break;
				
							case ENUM_SHOWDOWN_STEP.SHOWDOWN_END:
								openCards = this.communityCardIndex;							
								winners = this.GetWinners( false, true );
								break;
						}						
					}

					let hands: number = 0;
					if ( this._HandHistoryController != null ) {
						hands = this._HandHistoryController.GetHands();
					}
		
					client.send( "JOIN", {
						yourself: entity,
						entities: this.state.entities,
						gameState: this.state.gameState,
						showdownState: this.SHOWDOWN_STATE,
						betSeat: this.betSeat,
						endSeat: this.endSeat,
						maxBet: this.state.maxBet,
						minRaise: this.state.minRaise,
						pot: this.state.pot,						
						centerCardState: this.centerCardState,
						openCards: openCards,
						small: this.conf[ "smallBlind" ],
						big: this.conf[ "bigBlind" ],
						minStakePrice: this.conf["minStakePrice"],
						maxStakePrice: this.conf["maxStakePrice"],
						dealer: this._DealerCalculator.getDealer(),
						sb : this._DealerCalculator.getSb(),
						bb : this._DealerCalculator.getBb(),
						tableInitChips: entity.tableInitChips,
						tableBuyInAmount: entity.tableBuyInAmount,
						tableBuyInCount: entity.tableBuyInCount,
						initPot: this._initPot,
						playerCards: playerCards,
						showdown: showdown,
						winners: winners,
						hands: hands,
					} );

					if( eGameState.Suspend === this.state.gameState ) {
						entity.isNew = false;
						let isStart = this.checkStartCondition();
						if ( true === isStart ) {
							this.changeState( eGameState.Ready );
						}
					} else if (eGameState.Ready === this.state.gameState) {
						entity.isNew = false;
					}

					this.broadcast( "NEW_ENTITY", { newEntity: entity } );
				}
			} );
		} catch( e ) {
			if( e === undefined ) {
				e = "error";
			}

			client.send("RES_BUY_IN", {
				ret: -1,
				amount: 0,
				message: e,
				tableBuyInAmount: 0,
				tableBuyInCount: 0,
			});
		}
	}

	onCHECK( client: Client, msg: any ) {
		if( eGameState.Bet !== this.state.gameState ) {
			logger.error(  this._tableIdString + "[ onCheck ] INVALID CALL. seat : %s // now state : %s", msg[ "seat" ], this.state.gameState );
			return;
		}

		let e = this.getEntity( msg[ "seat" ] );
		logger.info(  this._tableIdString + "[ onCHECK ] seat: %s // name %s // chips %s // send msg : %s", e.seat, e.nickname, e.chips, msg );

		if(e.fold === true){
			logger.error( this._tableIdString + "onCheck - player " + msg["seat"] + " is fold but try Check");
			return;
		}

		e.hasAction = false;
		e.timeLimitCount = 0;

		this._PotCalculator.CalculatePot();

		this.broadcast( "CHECK", {
			seat: this.betSeat,
			pot : this.state.pot,
		} );

		this.elapsedTick = 0;

		if( true === this.isLastTurn( this.betSeat ) ) {
			logger.info( this._tableIdString +  "[ onCheck ] this is last turn" );
			this.changeCenterCardState();
			return;
		}

		this.broadTurn();
	}

	onCALL( client: Client, msg: any ) {
		if( eGameState.Bet !== this.state.gameState ) {
			logger.error(  this._tableIdString + "[ onCall ] INVALID CALL. seat : %s // now state : %s", msg[ "seat" ], this.state.gameState );
			return;
		}

		let amount = msg["betAmount"];
		let e = this.getEntity( msg[ "seat" ] );
		if(e.fold === true){
			logger.error( this._tableIdString + "onCall - player " + msg["seat"] + " is fold but try Call");
			return;
		}

		let bet = amount - e.currBet;
		let isAllIn = bet >= e.chips;

		if( true == isAllIn ) {
			logger.info(  this._tableIdString + "[ onCall ] all-in" );
			bet = e.chips;

			if( msg[ "betAmount" ] > this.state.maxBet ) {
				logger.info(  this._tableIdString + "[ onCall ] all-in max bet updated!" );				
				this.updateEndSeat( e.seat );
				this.state.maxBet = msg[ "betAmount" ];
			}
			e.allIn = 1;
		}

		logger.info(  this._tableIdString + "[ onCALL ] seat: %s // name %s // oldChips %s // newChips %s // send msg : %s", e.seat, e.nickname, e.chips, e.chips - bet, msg );

		e.currBet += bet;
		e.roundBet += bet;
		e.totalBet += bet;
		e.chips -= bet;
		e.hasAction = false;

		e.timeLimitCount = 0;

		this.state.pot += bet;

		try {
			this._PotCalculator.SetBet(e.seat, e.totalBet, e.eval.value, false);			
		} catch (error) {
			logger.error( this._tableIdString + error );
		}

		let p = this.participants.find( (player)=>{
			return e.seat == player.seat;
		});

		if ( p != null ) {
			p.totalBet = e.totalBet;
			p.roundBet = e.roundBet;
		}

		this.lastBet = null;

		this.broadcast( "CALL", {
			seat: this.betSeat,
			chips: e.chips,
			bet: msg[ "betAmount" ],
			pot: this.state.pot,
			allin: e.allIn,
		} );

		this.elapsedTick = 0;

		if( true === this.isLastTurn( this.betSeat ) ) {
			if( this.checkCount() <= 1 ) {
				logger.info( this._tableIdString +  "[ onCall ] round finished." );
				this.bufferTimerID = setTimeout( () => {
					this.changeState( eGameState.Result );
				}, 500 );
			}
			else {
				this.changeCenterCardState();
			}
			this.elapsedTick = 0;
			return;
		}

		this.broadTurn();
	}

	onBET( client: Client, msg: any ) {

		if( eGameState.Bet !== this.state.gameState ) {
			logger.error(  this._tableIdString + "[ onBet ] INVALID CALL. seat : %s // now state : %s", msg[ "seat" ], this.state.gameState );
			return;
		}

		if( msg[ "betAmount" ] < this.state.startBet ) {
			logger.error(  this._tableIdString + "[ onBet ] bet amount is larger than startBet??" );
		}

		let e = this.getEntity( msg[ "seat" ] );
		if(e.fold === true){
			logger.error( this._tableIdString + "onBet - player " + msg["seat"] + " is fold but try bet");
			return;
		}

		if( msg[ "betAmount" ] > e.chips + e.currBet ) {
			logger.error( this._tableIdString +  "[ onBet ] bet > stack!!!" );
			msg[ "betAmount" ] = e.chips + e.currBet;
		}

		let callValue = msg['callValue'];
		let betValue = msg[ "betAmount" ];
		logger.info(  this._tableIdString + "[ onBET ] seat: %s // name %s // chips %s // amount %s // newChips %s // send msg : %s", e.seat, e.nickname, e.chips, msg[ "betAmount" ], e.chips - betValue, msg );
		e.chips -= betValue;

		if( e.chips <= 0 ) {
			logger.info(  this._tableIdString + "[ onBet ] allin" );
			e.chips = 0;
			e.allIn = 1;
		}

		e.currBet += betValue;
		e.roundBet += betValue;
		e.totalBet += betValue;

		this.lastBet = null;
		this.lastBet = {
			seat: e.seat,
			call: callValue,
			bet: betValue - callValue
		};

		e.timeLimitCount = 0;

		this.ReOpenAction();
		e.hasAction = false;

		this.state.pot += parseInt( msg[ "betAmount" ] );

		if( msg[ "betAmount" ] > this.state.maxBet ) {
			this.state.maxBet = msg[ "betAmount" ];
		}

		if( this.state.maxBet > this.state.minRaise ) {
			this.state.minRaise = this.state.maxBet;
		}

		try {
			this._PotCalculator.SetBet(e.seat, e.totalBet, e.eval.value, false);			
		} catch (error) {
			logger.error(  this._tableIdString + error );
		}

		let p = this.participants.find( (player)=>{
			return e.seat == player.seat;
		});

		if ( p != null ) {
			p.totalBet = e.totalBet;
			p.roundBet = e.roundBet;
		}

		this.broadcast( "BET", {
			seat: this.betSeat,
			chips: e.chips,
			bet: msg[ "betAmount" ],
			pot: this.state.pot,
			allin: e.allIn,
			sound: msg['sound']
		} );

		this.updateEndSeat( e.seat );
		this.broadTurn();

		this.elapsedTick = 0;
	}

	onRAISE( client: Client, msg: any ) {

		if( eGameState.Bet !== this.state.gameState ) {
			logger.error(  this._tableIdString + "[ onRaise ] INVALID RAISE. seat : %s // now state : %s", msg[ "seat" ], this.state.gameState );
			return;
		}
		let e = this.getEntity( msg[ "seat" ] );

		if(e.fold === true){
			logger.error( this._tableIdString + "onRaise - player " + msg["seat"] + " is fold but try Raise");
			return;
		}

		let betValue = msg['betAmount'];
		let callValue = msg['callValue'];
		
		let locBet = betValue;

		let locChangeEndSeat = false;

		this.state.maxBet = locBet;
		this.state.minRaise = this.state.maxBet;
		locChangeEndSeat = true;

		let bet = this.state.maxBet - e.currBet;

		if( bet >= e.chips ) {
			logger.info( this._tableIdString + "[ onRAISE ] ALLIN" );
			e.allIn = 1;
			bet = e.chips;
		}

		logger.info(  this._tableIdString + "[ onRAISE ] seat: %s // name %s // chips %s // amount %s // newChips %s // send msg : %s", e.seat, e.nickname, e.chips, msg[ "betAmount" ], e.chips - bet, msg );
		e.chips -= bet;
		e.currBet += bet;
		e.roundBet += bet;
		e.totalBet += bet;
		e.timeLimitCount = 0;

		this.lastBet = null;
		this.lastBet = {
			seat: e.seat,
			call: callValue,
			bet: bet - callValue
		};

		this.ReOpenAction();
		e.hasAction = false;

		this.state.pot = this.state.pot + bet;

		if( e.chips <= 0 ) {
			e.chips = 0;
		}

		try {
			this._PotCalculator.SetBet( e.seat, e.totalBet, e.eval.value, false );			
		} catch (error) {
			logger.info(  this._tableIdString + "[onRAISE] SET BET ERROR WHY?" );			
		}

		let p = this.participants.find( (player)=>{
			return e.seat == player.seat;
		});

		if ( p != null ) {
			p.totalBet = e.totalBet;
			p.roundBet = e.roundBet;
		}

		this.broadcast( "RAISE", {
			seat: this.betSeat,
			chips: e.chips,
			bet: msg[ "betAmount" ],
			pot: this.state.pot,
			allin: e.allIn,
			sound: msg['sound']			
		} );

		if( this.checkCount() < 1 ) {
			logger.info(  this._tableIdString + "[ onRaise ] round finished." );
			this.bufferTimerID = setTimeout( () => {
				this.changeState( eGameState.Result );
			}, 500 );
			this.elapsedTick = 0;
			return;
		}

		if( locChangeEndSeat ) {
			logger.info(  this._tableIdString + "[ onRaise ] max bet updated. change end seat??" );
			this.updateEndSeat( e.seat );
		}

		if( true === this.isLastTurn( this.betSeat ) ) {
			logger.info(  this._tableIdString + "[ onRaise ] this is last turn" );

			if( this.checkCount() <= 1 ) {
				logger.info( this._tableIdString + "[ onRaise ] round finished." );
				this.bufferTimerID = setTimeout( () => {
					this.changeState( eGameState.Result );
				}, 1000 );
			}
			else {
				this.changeCenterCardState();
			}
			this.elapsedTick = 0;
			return;
		}

		this.broadTurn();
		this.elapsedTick = 0;
	}

	onALLIN( client: Client, msg: any ) {
		if( eGameState.Bet !== this.state.gameState ) {
			logger.error(  this._tableIdString + "[ onRaiseShort ] INVALID RAISE_SHORT. seat : %s // now state : %s",
				msg[ "seat" ], this.state.gameState );
			return;
		}

		let e = this.getEntity( msg[ "seat" ] );
		if(e.fold === true){
			logger.error( this._tableIdString + "onAllIn - player " + msg["seat"] + " is fold but try AllIn");
			return;
		}

		let locBet = msg[ "betAmount" ];
		let callValue = msg['callValue'];		
		let locChangeEndSeat = true;
		this.state.maxBet = locBet;
		this.state.minRaise = this.state.maxBet;

		let bet = locBet - e.currBet;
		if( bet >= e.chips ) {
			e.allIn = 1;
			bet = e.chips;
		}

		if ( bet < callValue ) {
			callValue = bet;
		}

		logger.info(  this._tableIdString + "[ onALLIN ] seat: %s // name %s // chips %s // amount %s // newChips %s // send msg : %s", e.seat, e.nickname, e.chips, msg[ "betAmount" ], e.chips - bet, msg );		

		e.chips -= bet;
		e.currBet += bet;
		e.roundBet += bet;
		e.totalBet += bet;

		this.ReOpenAction();
		e.hasAction = false;

		e.timeLimitCount = 0;

		this.lastBet = null;
		this.lastBet = {
			seat: e.seat,
			call: callValue,
			bet: bet - callValue
		};
		
		this.state.pot = this.state.pot + bet;
		if( e.chips <= 0 ) {
			e.chips = 0;
		}

		try {
			this._PotCalculator.SetBet( e.seat, e.totalBet, e.eval.value, false);			
		} catch (error) {
			logger.error(  this._tableIdString + error );
		}

		let p = this.participants.find( (player)=>{
			return e.seat == player.seat;
		});

		if ( p != null ) {
			p.totalBet = e.totalBet;
			p.roundBet = e.roundBet;
		}

		this.broadcast( "RAISE", {
			seat: this.betSeat,
			chips: e.chips,
			bet: msg[ "betAmount" ],
			pot: this.state.pot,
			allin: e.allIn,
		} );

		if( this.checkCount() < 1 ) {
			this.bufferTimerID = setTimeout( () => {
				this.changeState( eGameState.Result );
			}, 1000 );
			this.elapsedTick = 0;
			return;
		}

		if( locChangeEndSeat ) {
			logger.info( this._tableIdString +  " this._tableIdString + [ onALLLIN ] max bet updated. change end seat" );
			this.updateEndSeat( e.seat );
		}

		if( true === this.isLastTurn( this.betSeat ) ) {
			logger.info(  this._tableIdString + " this._tableIdString + [ onALLLIN ] this is last turn" );

			if( this.checkCount() <= 1 ) {
				logger.info( " this._tableIdString + [ onALLLIN ] round finished." );
				this.bufferTimerID = setTimeout( () => {
					this.changeState( eGameState.Result );
				}, 1000 );
			}
			else {
				this.changeCenterCardState();
			}
			this.elapsedTick = 0;
			return;
		}

		this.broadTurn();

		this.elapsedTick = 0;
	}

	onFOLD( client: Client, msg: any ) {
		if( eGameState.Bet !== this.state.gameState ) {
			logger.error(  this._tableIdString + "[ onFold ] INVALID CALL. seat : %s // now state : %s", msg[ "seat" ], this.state.gameState );
			return;
		}

		let e = this.getEntity(  msg[ "seat" ] );
		logger.info(  this._tableIdString + "[ onFOLD ] seat: %s // name %s // chips %s // send msg : %s", e.seat, e.nickname, e.chips, msg );		

		if ( e != null ) {
			if(e.fold === true){
				logger.error( this._tableIdString + " onFold - player " + e.seat + " is fold but try fold");
				return;
			}
			
			let next = this.funcFold( msg[ "seat" ] );
			if( next ) {
				this.broadTurn();
			}
			this.elapsedTick = 0;
		}
	}

	onRE_BUY( client: Client, msg: any ) {
		logger.info(  this._tableIdString + "[ onReBuy ] msg : %s", msg );
		let locSeatIndex = msg[ "seat" ];
		let locBuyAmount = msg[ "amount" ];
		let code = -1;
		let message = "SUCCEED";
		let chips = 0;
		let e:any = null;
		const idx = this.state.entities.findIndex( function( e ) {
			return e.seat === locSeatIndex;
		} );

		if( idx > -1 ) {
			e = this.state.entities[ idx ];
		}
		if( null === e ) {
			logger.error(  this._tableIdString + "[ onReBuy ] entity is null. seat(%s), msg(%s)", locSeatIndex, JSON.stringify( msg ) );
			return client.send( "RES_RE_BUY", {
				resultCode: -1,
				amount: 0,
				msg: "seat user is not existed",
				tableBuyInAmount: -1,
				tableBuyInCount: -1,
			} );
		} else {
			this._dao.SELECT_BALANCE_ByUSER_ID( e.id, ( err: any, res: any ) => {
				if( !!err ) {
					logger.error(  this._tableIdString + "[ onReBuy ] selectBalanceByUID query error : %s", err );
				}
				else {
					if( res.length <= 0 ) {
						logger.error( this._tableIdString +  "[ onReBuy ] selectBalanceByUID invalid user id" );
					}
					else {
						e.balance = res[0]["balance"];
						let oldBalance = e.balance;
						let oldChips = e.chips;

						logger.info(  this._tableIdString + "[ onReBuy ] seat : %s // wait : %s // balance : %s // buy amount : %s",
							locSeatIndex, e.wait, e.balance, locBuyAmount );
		
						//check chips
						if( e.chips >= this.conf[ "minStakePrice" ] ) {
							logger.warn(  this._tableIdString + "[ onReBuy ] already enough chips. your chip : %s // min stake : %s", e.chips, this.conf[ "minStakePrice" ] );
							message = "You can't stack any more chips.";
							code = 1;
						}
						else if( e.fold === false && ( this.state.gameState >= eGameState.Prepare &&
								this.state.gameState <= eGameState.Result ) &&
							e.wait === false ) {
							logger.warn( this._tableIdString +  "[ onReBuy ] You can't buy chips during the game. gameState : %s", this.state.gameState );
							message = "You can only purchase chips in a fold or wait state.";
							code = 1;
						}
						else if( e.balance <= 0 ) {
							logger.warn( this._tableIdString +  "[ onReBuy ] not enough balance. balance : %s", e.balance );
							code = 1;
							message = "not enough balance.";
						}
						else if( e.balance <= locBuyAmount ) {
							logger.warn(  this._tableIdString + "[ onReBuy ] It has less balance than the chip you want to purchase. balance : %s // desired chips : %s",
								e.balance, locBuyAmount );
							code = 0;
							chips = e.balance;// entity.chips = entity.balance;
							e.balance = 0;
						}
						else {
							code = 0;
							e.balance -= locBuyAmount;
							chips = locBuyAmount;// entity.chips = locBuyAmount;
			
							logger.info(  this._tableIdString + "[ onReBuy ] succeed. balance : %s // chips : %s", e.balance, chips );
						}
			
						if( 0 === code ) {
							e.chips = e.chips + chips;
							e.initRoundChips = e.chips;
							logger.info(  this._tableIdString + "[ onReBuy ] entity state. chips : %s // enough chip : %s // wait : %s", e.chips, e.enoughChip, e.wait );
				
							if( eGameState.Suspend === this.state.gameState ) {
								e.isNew = false;
								let isStart = this.checkStartCondition();
								if ( true === isStart ) {
									logger.info(  this._tableIdString + "[ onReBuy ] GAME STATE TO READY" );
									this.changeState( eGameState.Ready );
								}
							} else if ( eGameState.Ready === this.state.gameState ) {
								e.isNew = false;
							}
						}
			
						this._dao.BUY_IN( e.id, this.conf["tableID"], oldBalance, e.balance, oldChips, e.chips, locBuyAmount, ( err: any, res: any ) => {
							if( !!err ) {
								logger.error(  this._tableIdString + "[ onReBuy ] buyIn query error : %s", err );
							}
						} );
				
						this._dao.UPDATE_USERS_BALANCE( e.id, e.balance, ( err: any, res: any ) => {
							if( !!err ) {
								logger.error(  this._tableIdString + "[ onReBuy ] updateBalance query error : %s", err );
							}
						} );
				
						logger.info( this._tableIdString +  "[ onReBuy ] done. send packet to client. result code : %s // msg : %s", code, message );

						e.tableBuyInAmount += locBuyAmount;
						e.tableBuyInCount ++;

						client.send( "RES_RE_BUY", {
							resultCode: code,
							msg: message,
							balance: e.balance,
							chips: e.chips,
							resultChip: e.chips,
							tableBuyInAmount: e.tableBuyInAmount,
							tableBuyInCount: e.tableBuyInCount,
						} );
					}
				}
			});
		}
	}

	onADD_CHIPS_REQUEST( client: Client, msg: any ) {
		logger.info( this._tableIdString + "onAddChipsRequest : msg(%s)", msg);
		const MAX_BUY_IN: number = this.conf["maxStakePrice"];
		let res: number = -1;

		let seat = msg["seat"];
		let max = 0;

		let e = this.findEntityBySeatNumber(seat);
		if ( null === e || undefined === e ) {
			client.send( "RES_ADD_CHIPS_REQUEST", {
				code: -1,
				balance: -1,
				chips: -1,
				amount: -1
			});
		} else {
			this._dao.SELECT_BALANCE_ByUSER_ID(e.id, (err: any, res : any) => {
				if (!!err) {
					logger.error( this._tableIdString + "[ onAddChipsRequest ] selectBalanceByUID query error : %s", err);
				}
				else {
					if (res.length <= 0) {
						logger.error( this._tableIdString + "[ onAddChipsRequest ] selectBalanceByUID invalid user id");
					}
					else {
						e.balance = res[0]["balance"];

						max = MAX_BUY_IN - e.initRoundChips;
						if ( e.balance < max ) {
							max = e.balance;
						}

						res = this.checkReBuyCondition(e, max, false );
						logger.error( this._tableIdString + "checkReBuyCondition res:%d, initChip: %d", res, e.initRoundChips);
						client.send( "RES_ADD_CHIPS_REQUEST", {
							code: res,
							balance: e.balance,
							initChips: e.initRoundChips,
							chips: e.chips,
							amount: max
						});
					}
				}
			});
			
		}
	}

	onADD_CHIPS( client: Client, msg: any ) {
		logger.info( this._tableIdString +  "[ onAddChips ] msg(%s)", msg );
		const MAX_BUY_IN: number = this.conf["maxStakePrice"];

		let seat = msg[ "seat" ];
		let amount = msg[ "amount" ];
		let code = -1;
		let e: any = null;

		const idx = this.state.entities.findIndex( function( e ) {
			return e.seat === seat;
		} );

		if( idx > -1 ) {
			e = this.state.entities[ idx ];
			if ( null === e || undefined === e ) {
				code = -1;
			} else {
				this._dao.SELECT_BALANCE_ByUSER_ID( e.id, (err: any, res : any ) => {
					if (!!err) {
						logger.error( this._tableIdString + "[ onAddChips ] selectBalanceByUID query error : %s", err);
					}
					else {
						if (res.length <= 0) {
							logger.error( this._tableIdString + "[ onAddChips ] selectBalanceByUID invalid user id");
						}
						else {
							e.balance = res[0]["balance"];
							let oldBalance = e.balance;
							let oldChips = e.chips;
	
							let gap = MAX_BUY_IN - (e.initRoundChips + amount);
							logger.info(  this._tableIdString + "[ onAddChips ] e.initRoundChips: %d, gap : %d", e.initRoundChips, gap );
			
							if ( gap < 0) {
								amount = amount + gap;
							}
			
							code = this.checkReBuyCondition(e, amount, true );
							logger.info(  this._tableIdString + "[ onAddChips ] amount: %d, code : %d", amount, code );
			
							let pending: boolean = false;
							if ( -1 === code || null === e || undefined === e) {
								logger.error(  this._tableIdString + "[ onAddChips ] why??" );
								client.send( "RES_ADD_CHIPS", {
									code: -1,
									balance: -1,
									chips: -1,
									amount: 0,
									pending: pending,
									tableBuyInAmount: -1,
									tableBuyInCount: -1,
								});
								return;
							} else {
								if ( true  === e.wait || true === e.fold ||
									eGameState.Suspend === this.state.gameState || eGameState.Ready === this.state.gameState ||
									eGameState.ClearRound === this.state.gameState) {
									pending = false;
			
									if ( e.balance < amount ) {
										amount = e.balance;
									}
									e.balance -= amount;
									e.chips = e.chips + amount;
									e.initRoundChips = e.chips;
									e.tableBuyInAmount += amount;
									e.tableBuyInCount++;
			
									this._dao.BUY_IN(e.id, this.conf["tableID"], oldBalance, e.balance, oldChips, e.chips, amount, (err: any, res : any) => {
										if (!!err) {
											logger.error( this._tableIdString + "[ onAddChips ] buyIn query error : %s", err);
										}
									});
					
									this._dao.UPDATE_USERS_BALANCE(e.id, e.balance, (err: any, res : any) => {
										if (!!err) {
											logger.error( this._tableIdString + "[ onAddChips ] updateBalance query error : %s", err);
										}
									});
								} else {
									pending = true;
									e.pendReBuy = amount;
								}
							}
			
							client.send( "RES_ADD_CHIPS", {
								code: code,
								balance: e.balance,
								chips: e.chips,
								amount: amount,
								pending: pending,
								tableBuyInAmount: e.tableBuyInAmount,
								tableBuyInCount: e.tableBuyInCount,
							});
						}
					}
				});
			}
		}
		else {
			code = -1;
		}
	}

	onPONG( client: Client, msg: any ) {
		let entity = this.state.entities.find( e => e.seat === msg[ "seat" ] );
		if( undefined === entity ) {
			return;
		}

		let time = Date.now();
		let elapsed = time - entity.lastPingTime;
		if( elapsed >= 5000 ) {
			return;
		}
		entity.lastPingTime = time;
	}

	onSHOW_CARD(client: Client, msg: any){
		let seat = msg["seat"];
		logger.info( this._tableIdString + "OnShowCard - Seat : " + seat);
		if(eGameState.Result != this.state.gameState){
			logger.error( this._tableIdString + "OnShowCard GameState is Not ShowDown");
			return;
		}
		
		let entity = this.getEntity(seat);

		if(null == entity){
			logger.error( this._tableIdString + "OnShowCard entity is null SeatNumber : " + seat);
			return;
		}
		this.broadcast( "SHOW_CARD", { seat: entity.seat, cards: entity.cardIndex } );
	}

	private onSIT_OUT(client : Client, msg : any){
		let seat: number = msg['seat'];
		if ( seat == null ) {
			logger.error( this._tableIdString + " [ onSIT_OUT ] Seat number is null!" + msg);
			return;
		}

		let player = this.getEntity( seat );
		if ( player == null ) {
			logger.error( this._tableIdString + " [ onSIT_OUT ] Can't find player!" + msg);
			return;
		}

		if ( player.isSitOut == true ) {
			logger.error( this._tableIdString + " [ onSIT_OUT ] The seat " + seat + ' is already sitout but try sit-out again');			
		}

		if ( player.wait == true || player.fold == true ) {
			player.isSitOut = true;
			player.pendSitout = false;
			player.sitoutTimestamp = Number( Date.now() );
			logger.error( this._tableIdString + " [ onSIT_OUT ] The seat " + player.seat + ' is SIT_OUT');
			this.broadcast("SIT_OUT", { seat : player.seat });
			this.UpdateSeatInfo();
			return;
		}
		
		if( this.state.gameState === eGameState.Suspend || this.state.gameState === eGameState.Ready || this.state.gameState === eGameState.ClearRound ) {
			player.wait = true;
			player.isSitOut = true;
			player.pendSitout = false;
			player.sitoutTimestamp = Number( Date.now() );
			logger.error( this._tableIdString + " [ onSIT_OUT ] The seat " + player.seat + ' is SIT_OUT');			
			this.broadcast("SIT_OUT", { seat : player.seat });
			this.UpdateSeatInfo();

		} else {
			player.pendSitout = true;
			client.send("SIT_OUT_PEND",	{ 

			});
		}
	}

	private onSIT_OUT_CANCEL(client : Client, msg : any){
		let seat: number = msg["seat"];
		if ( seat == null ) {
			logger.error( this._tableIdString + " [ onSIT_OUT ] onSIT_OUT fail seat is null " + msg);
		}

		let player = this.getEntity( seat );
		if ( player == null ) {
			logger.error( this._tableIdString + " [ onSIT_OUT ] onSIT_OUT fail can't find player " + msg);			
		}

		player.pendSitout = false;
		this.UpdateSeatInfo();
		client.send('SIT_OUT_CANCEL', {

		});
	}

	private onSIT_BACK( client : Client, msg : any ){
		let seat : number = msg["seat"];
		if ( seat == null ) {
			logger.error( this._tableIdString + " [ onSIT_BACK ] onSIT_BACK fail seat is null " + msg);
		}

		let player = this.getEntity(seat);
		if ( player == null ) {
			logger.error( this._tableIdString + " [ onSIT_BACK ] onSIT_BACK fail can't find player " + msg);
			return;
		}

		if ( player.isSitOut == false ) {
			logger.error( this._tableIdString + " [ onSIT_BACK ] The seat " + seat + ' is not sitback but try sitback again');			
		}

		player.isSitOut = false;
		player.isSitBack = true;
		player.sitoutTimestamp = 0;
		player.wait = true;

		if( eGameState.Suspend === this.state.gameState ) {
			player.isSitBack = false;
			player.isSitOut = false;
			player.sitoutTimestamp = 0;

			this.UpdateSeatInfo();
			this.broadcast("SIT_BACK", { 
				seat: player.seat,
				wait: true,
				fold: false, 
			});

			let isSTART = this.checkStartCondition();
			if ( true === isSTART ) {
				logger.info(  this._tableIdString + "[ onSitBack ] GAME STATE TO READY" );
				this.changeState( eGameState.Ready );
			}
		} 
		else if ( eGameState.Ready === this.state.gameState || eGameState.ClearRound === this.state.gameState) {
			player.isSitBack = false;
			player.isSitOut = false;
			player.pendSitout = false;
			player.sitoutTimestamp = 0;
			this.UpdateSeatInfo();
			this.broadcast("SIT_BACK", { 
				seat: player.seat,
				wait: true,
				fold: false
			});

		}
		else {
			player.sitoutTimestamp = 0;
			this.UpdateSeatInfo();
			this.broadcast("SIT_BACK", { 
				seat: player.seat,
				wait: true,
				fold: player.fold
			});
		}
	}

	onSEAT_SELECT(client : Client, msg : any){
		let auth = this._buyInWaiting[client.sessionId];
		if(null == auth || undefined == auth){
			client.send("SELECT_SEAT_ERROR", {
				message : "you are not joined User" 
			});
			return;
		}

		let selected = msg.selected;

		let seatEntity = this.state.entities.find((elem) => {
			return elem.seat === selected;
		})
		
		if(selected < 0 || selected >= this.seatWaitingList.length || null != seatEntity){
			//Already tacked or already waiting
			client.send("SELECT_SEAT_ERROR", {
				message : "is Already Took by someone" 
			});
			
			this.UpdateSeatInfo();
			return;
		}

		//Check Chips Already got ?

		let myEntity = this.findEntityBySessionID(client.sessionId);

		if(null == myEntity){
			return;
		}

		let minBuyIn : number = this.conf["minStakePrice"];

		if(myEntity.chips >= minBuyIn){
			this.skipBuyIn(client, selected);
			return;
		}

		minBuyIn = minBuyIn - myEntity.chips;
		if ( myEntity.balance < minBuyIn ) {
			client.send("RES_BUY_IN", {
				ret: -1,
				amount: 0,
				message: "Not Enough Balance",
				tableBuyInAmount: 0,
				tableBuyInCount: 0,
			});
			return;
		}

		this.seatWaitingList[selected] = client.sessionId;
		this.UpdateSeatInfo();

		client.send( "BUY_IN", {
			id: auth.id,
			nickname: auth.nickname,
			balance: auth.balance,
			tableSize: this.tableSize,
			small: this.conf[ "smallBlind" ],
			big: this.conf[ "bigBlind" ],
			turnTimeMS: this.conf[ "betTimeLimit" ],
			minStakePrice: this.conf[ "minStakePrice" ],
			maxStakePrice: this.conf[ "maxStakePrice" ],
			myChips : myEntity.chips,
		} );
	}

	onCANCEL_BUY_IN(client : Client, msg : any){
		let seatPos : number = -1;

		for(let i = 0; i < this.seatWaitingList.length; i++){
			
			if(this.seatWaitingList[i] == client.sessionId){
				seatPos = i;
				this.seatWaitingList[i] = "";
				break;
			}
		}

		this.UpdateSeatInfo();
	}

	onSHOW_EMOTICON( client: Client, msg: any ) {
		this.broadcast( "SHOW_EMOTICON", { seat: msg['seat'],
		type: msg['type'],
		id: msg['id']} );
	}

	onSHOW_PROFILE( client: Client, msg: any ) {
		let id = msg['id'];
		let seat = msg['seat'];
		let _statics: any = null;

		let entity = this.getEntity( seat );
		if ( entity != null ) {
			_statics = entity.statics;
		}

		client.send( "SHOW_PROFILE", {
			id: id,
			seat: seat,
			entity: entity,
			statics: _statics,
		} );
	}

	onEXIT_TABLE( client: Client, msg: any ) {
		let id = msg['id'];
		let seat = msg['seat'];

		let reserve = false;
		let leave = true;

		if ( seat < 0 ) {
			if ( id != null && id > 0 ) {
				this._dao.UPDATE_USERS_ACTIVE_SESSION_ID (id, '');
				this._dao.UPDATE_USERS_PENDING_SESSION_ID (id, '');
				this._dao.UPDATE_USERS_TABLE_ID_ByUSER( {
					table_id: -1,
					id: id
				}, (err: any, res: boolean) => {
					if (null != err) {
						logger.error( this._tableIdString + err);
					}
				});
			}

			client.send( "EXIT_TABLE", {
				reserve: reserve,
				leave: leave,
			} );
		}
		else {
			let entity = this.getEntity( seat );
			if ( entity != null ) {
				if ( entity.fold == true || entity.wait == true || entity.isSitOut == true ) {
					// entity.leave = true;

					// reserve = true;
					// leave = false;
				} else {
					reserve = true;
					leave = false;
					// entity.leave = true;
				}
			} else {
				reserve = false;
				leave = true;
			}

			client.send('EXIT_TABLE', {
				reserve: reserve,
				leave: leave,
			});
		}
	}

	onSYNC_TABLE ( client: Client, msg: any ) {
		let seat = msg['seat'];
		let entity = this.state.entities.find( elem => elem.seat == seat );
		if( undefined === entity ) {
			return;
		}

		entity.lastPingTime = Date.now();
		entity.sid = client.sessionId;
		entity.client = client;

		let openCards: number[] = [];

		switch( this.centerCardState ) {
			case eCommunityCardStep.FLOP:
				openCards = this.communityCardIndex.slice( 0, 3 );
				break;

			case eCommunityCardStep.TURN:
				openCards = this.communityCardIndex.slice( 0, 4 );
				break;

			case eCommunityCardStep.RIVER:
			case eCommunityCardStep.RESULT:
				openCards = this.communityCardIndex;
				break;
		}

		let prim = entity.cardIndex.length > 0 ? entity.cardIndex[0] : -1;
		let sec = entity.cardIndex.length > 1 ? entity.cardIndex[1] : -1;

		client.send( "SYNC_TABLE", {
			yourself: entity,
			entities: this.state.entities,
			gameState: this.state.gameState,
			betSeat: this.betSeat,
			endSeat: this.endSeat,
			maxBet: this.state.maxBet,
			minRaise: this.state.minRaise,
			minBet: this.state.startBet,

			pot: this.state.pot,			
			centerCardState: this.centerCardState,
			openCards: openCards,
			small: this.conf[ "smallBlind" ],
			big: this.conf[ "bigBlind" ],
			minStakePrice: this.conf["minStakePrice"],
			maxStakePrice: this.conf["maxStakePrice"],
			primCard : prim,
			secCard : sec,
			dealer: this._DealerCalculator.getDealer(),
			sb : this._DealerCalculator.getSb(),
			bb : this._DealerCalculator.getBb(),
			tableInitChips: entity.tableInitChips,
			tableBuyInAmount: entity.tableBuyInAmount,
			tableBuyInCount: entity.tableBuyInCount,
			initPot: this._initPot
		} );
	}
	
	onFORE_GROUND( client: Client, msg: any ) {
		let seat = msg['seat'];
		if ( seat > -1 ) {
			let entity = this.getEntity( seat );
			if ( entity != null ) {
				entity.background = false;
				entity.backgroundTimestamp = 0;
			}
		}

		// this.onSYNC_TABLE( client, msg);
	}

	onBACK_GROUND( client: Client, msg: any ) {
		let seat = msg['seat'];
		if ( seat > -1 ) {
			let entity = this.getEntity( seat );
			if ( entity != null ) {
				entity.background = true;
				entity.backgroundTimestamp = Date.now();
			}
		} 
	}

	private async reqTOKEN_VERIFY( user_id: string, token: string  ) {
        return new Promise( (resolve, reject )=>{
            this._dao.SELECT_USERS_BY_USER_ID_TOKEN ( user_id, token, function(err: any, res: any ) {
                if ( !!err ) {
                    reject({
                        code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
                        msg: 'BAD_ACCESS_TOKEN'
                    });
                } else {
                    resolve ( res );
                }
            });
        });
    }

	private SafeNUMBER( num: any ): number {
		let ret = 0;
		if ( isNaN( num ) == true ) {
			ret = Math.max( num, 0 );
			ret = Math.trunc(ret);
		}
		return ret;
	}

	private KickDisablePlayer( entity: any  ) {
		if ( entity != null ) {
			this._dao.SELECT_USERS_DISABLE_ByUSER_ID( entity.id, (err: any, res: any)=>{

				if ( err == null && res != null ) {
					if ( res.disable == 1 && entity.leave == 0 ) {
						logger.error(  this._tableIdString + "[ KickDisablePlayer ] id: %s, name: %s", entity.id, entity.nickname );
						entity.leave = true;
						entity.banned = true;
					}
				}
			} );
		}
	}

	public REMOTE_CALL_KICK_PLAYER( args: any[] ): any {
		let id: any = args.user_id;
		let msg: string = '';

		let entity = this.state.entities.find( elem => elem.id == id );
		if ( entity != null ) {
			if ( entity.seat < 0 ) {
				let sessionId = entity.client.sessionId;
				this.kickPlayer( sessionId, 4005 );
				msg = 'PLAYER_FORCE_KICK'
			} else {
				entity.leave = true;

				if ( eGameState.Suspend === this.state.gameState ) {
					msg = 'PLAYER_FORCE_KICK'					
					this.handleEscapee();
				} else {
					msg = 'PLAYER_PENDING_LEAVE'
				}
			}
		} else {
			msg = 'PLAYER_NOT_FOUND'
		}
		logger.error(  this._tableIdString + "[ REMOTE_CALL_KICK_PLAYER ] id: %s, name: %s, msg: %s", entity.id, entity.nickname, msg );
		return msg;
	}

	public REMOTE_CALL_EXIST_PLAYER( args: any[] ): boolean {
		let id: any = args.user_id;

		let ret = false;
		let entity = this.state.entities.find( elem => elem.id == id );
		if ( entity != null ) {
			ret = true;
		}
		return ret;
	}
}