import { Room, ServerError, Client } from "colyseus";
import { EntityState, RoomState } from "./schema/HoldemState";
import { PotCalculation } from "../modules/PotCalculation";
import { DealerCalculation } from "../modules/DealerCalculation";
import * as fs from 'fs';
import * as path from 'path';


const logger = require( "../util/logger" );
const PokerEvaluator = require( "poker-evaluator" );

enum eGameState {
	Suspend,
	Ready,
	Prepare,
	PreFlop,
	Bet,
	Flop,
	Turn,
	River,
	ShowDown,
	ClearRound
}

export enum eCommunityCardStep {
	PREPARE,
	PRE_FLOP,
	FLOP,
	TURN,
	RIVER,
	SHOWDOWN
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

	maxClients = 10;
	showdownTime: number = 0;
	bufferTimerID: any = null; // 구현 편이 및 테스트를 위한 버퍼
	pingTimerID: any = null;
	cardPickPos: number = 0;
	elapsedTick: number = 0;
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

	potCalc : PotCalculation = null;
	dealerCalc: DealerCalculation = null;

	seatWaitingList : string[] = [];
	_roomConf: any = null;

	async onCreate( options: any ) : Promise<any> {

		logger.info("[ onCreate ] options : %s", options);
		this.tableSize = "full"; //options[ "ts" ];
		this._dao = options["dao"];

		let confFile = await fs.readFileSync(path.join(__dirname, "../config/roomConf.json"), {encoding : 'utf8'});

		let confJson = JSON.parse(confFile.toString());

		this.conf = confJson[this.tableSize as keyof typeof confJson];

		await this.setPrivate(options["private"]);

		let onDBFinish : (err : any, res : any) => void = (err: any, res: any) => {
			if (!!err) {
				logger.error("[ onCreate::selectRoomByUID ] query error : %s", err);
			} else {
				if (res.length <= 0) {
					logger.error("[ onCreate ] invalid room id");
				} else {

					let roomInfo = res[0];

					this.conf["roomID"] = roomInfo["id"];
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

					this.conf["useTimePass"] = roomInfo["useTimePass"] == 1;
					this.conf["useRake"] = roomInfo["useRake"] == 1;
					this.conf["useRakeCap"] = roomInfo["useRakeCap"] == 1;
					this.conf["rakePercentage"] = roomInfo["rake"] * 0.0001;
					this.conf["rakeCap"] = [roomInfo["rakeCap1"],roomInfo["rakeCap2"],roomInfo["rakeCap3"]];
					this.conf["flopRake"] = roomInfo["useFlopRake"] == 1;

					logger.info("[ onCreate ] res : %s", res[0]);
				}
				this.maxClients = this.conf["maxClient"];

				for (let i = 0; i < this.maxClients; i++) {
					this.seatWaitingList.push("");
				}

				this.setState(new RoomState());
				this.dealerCalc = new DealerCalculation();
				this.init();

				this.setSimulationInterval((deltaTime) => this.update(deltaTime));

				// register message handlers
				this.onMessage("ONLOAD", this.OnLoadDone.bind(this));
				this.onMessage("BUY_IN", this.onBuyIn.bind(this));
				this.onMessage("BUY_PASS", this.onBuyPass.bind(this));
				this.onMessage("CHECK", this.onCheck.bind(this));
				this.onMessage("CALL", this.onCall.bind(this));
				this.onMessage("BET", this.onBet.bind(this));
				this.onMessage("RAISE", this.onRaise.bind(this));
				this.onMessage("ALLIN", this.onAllIn.bind(this));
				this.onMessage("FOLD", this.onFold.bind(this));
				this.onMessage("RE_BUY", this.onReBuy.bind(this));

				this.onMessage("ADD_CHIPS_REQUEST", this.onAddChipsRequest.bind(this));
				this.onMessage("ADD_CHIPS", this.onAddChips.bind(this));

				this.onMessage("pong", this.onPong.bind(this));
				this.onMessage("SHOW_CARD", this.onShowCard.bind(this));
				this.onMessage("SIT_OUT", this.OnSitOut.bind(this));
				this.onMessage("SIT_BACK", this.OnSitBack.bind(this));
				this.onMessage("SEAT_SELECT", this.OnSelectSeat.bind(this));
				this.onMessage("CANCEL_BUY_IN", this.onCancelBuyIn.bind(this));
				this.onMessage("SHOW_EMOTICON", this.onShowEmoticon.bind(this));

				this.potCalc = new PotCalculation(this.conf["useRake"], this.conf["rakePercentage"], this.conf["rakeCap"], this.conf["flopRake"]);
				this.pingTimerID = setInterval(() => this.ping(), 2000);
			}
		};

		if(options["private"] == true){
			this._dao.selectRoomByUID(options["serial"], onDBFinish);
		}
		else{
			logger.info("private");
			this._dao.selectRoom(options["serial"], onDBFinish);
		}
	}

	init() {
		this.state.gameState = eGameState.Suspend;

		this.state.dealerSeat = this.dealerCalc.init(this.maxClients);
		this.state.sbSeat = -1;
		this.state.bbSeat = -1;

		this.state.startBet = this.conf[ "bigBlind" ];
		this.state.maxBet = 0;
		this.state.minRaise = 0;
		this.state.shuffle = "";
		this.state.pot = 0;
		this.pingTimerID = 0;
	}

	onAuth( client: Client, options: any, request: any ): Promise<any> {
		logger.info( "[ onAuth ] sid(%s), options(%s)", client.sessionId, options );
		let locPrice = this.conf[ "passPrice" ];
		return new Promise( ( resolve, reject ) => {
			let self = this;

			this._dao.selectAccountByPendingID( client.sessionId, function( err: any, res: any ) {
				if( !!err ) {
					logger.error( "[ onAuth ] query error : %s", err );
					reject( new ServerError( 400, "bad access token" ) );
				}
				else {
					if( res.length <= 0 ) {
						logger.error( "[ onAuth ] invalid session id" );
						reject( new ServerError( 400, "bad session id" ) );
					}
					else {
						res[ 0 ].reconnected = false;

						let entity = self.state.entities.find( e => e.id == res[ 0 ][ "id" ] );
						if( undefined !== entity ) {
							if( false === entity.leave ) {
								logger.warn( "[ onAuth ] duplicate login. seat : %s // leave state : %s",
									entity.seat, entity.leave );
								reject( new ServerError( 400, "Duplicate login." ) );
								return;
							}

							logger.info( "[ onAuth ] reconnection. seat : %s // previous sid : %s // curr. sid : %s",
								entity.seat, entity.sid, client.sessionId );
							
							entity.leave = false;
							res[ 0 ].reconnected = true;
						}

						logger.info( "[ onAuth ] succeed. sid(%s)", client.sessionId );
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
		this._dao.updateActiveSessionID( client.sessionId, function( err: any, result: any ) {
			if( !!err ) {
				logger.error( "[ onJoin ] updateActiveSessionID error : %s", err );
			}
		} );

		if( true === auth[ "reconnected" ] ) {
			this.reJoin( client, options, auth );
			return;
		}

		await this.playerJoin( client, options, auth );
	}

	reJoin( client: Client, options?: any, auth?: any ) {
		logger.info( "[ reJoin ]==============================" );
		this._rejoinWaiting[ client.sessionId ] = auth;
		logger.info( "[ reJoin ] _rejoinWaiting : %s", JSON.stringify( this._rejoinWaiting ) );
		
	}

	playerJoin( client: Client, option: any, auth: any ) {
		logger.info( "[ playerJoin ]" );
		this._buyInWaiting[ client.sessionId ] = auth;
		logger.info( "[ playerJoin ] waiting list : %s", JSON.stringify( this._buyInWaiting ) );

		let entity = new EntityState();

		// assign entity
		entity.assign( {
			sid: client.sessionId,
			id: auth.id || client.id,
			uid: auth.phone,
			avatar: auth.avatar,
			name: auth.firstName || client.sessionId,
			fullName: auth.firstName + " " + auth.lastName,
			balance: auth.balance,
			chips: this.conf["private"] ? auth.chip : auth.publicChip,
			rake: auth.rake,
			wait: true,
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
			savedRemainTime: this.conf["private"] ? auth.remainTime : auth.publicRemainTime,
			remainTimeMS: -1,
			cardIndex: [],
			dealable: false,
			missSb: false,
			missBb: false,
			longSitOut: false,
			oldChips: this.conf["private"] ? auth.chip : auth.publicChip,			
			oldRake: auth.rake,			
			reBuyCount: 0,
			pendReBuy: 0,
			tableInitChips: 0,
			tableBuyInAmount: 0,
			tableBuyInCount: 0,
		} );

		entity.seat = -2;
		entity.client = client;
		entity.lastPingTime = Date.now();
		entity.initRoundChips = this.conf["private"] ? auth.chip : auth.publicChip;

		logger.info( "[ playerJoin ] seat : %s // sid : %s", entity.seat, client.sessionId );

		this.state.entities.push( entity );
		return;
	}

	OnLoadDone(client : Client, msg : any){
		let auth : any = this._buyInWaiting[client.sessionId];

		if(null != auth && undefined != auth){
			this.OnLoadDoneFirstJoin(client, auth);
			logger.info(" OnLoadDone - _buyInWaiting : " + client.sessionId);
			return;
		}

		auth = this._rejoinWaiting[client.sessionId];
		
		if(null != auth && undefined != auth){
			this.OnLoadDoneRejoin(client, auth);
			logger.info(" OnLoadDone - _rejoinWaiting : " + client.sessionId);
			return;
		}

		logger.error("OnLoadDone - Player Call LoadDone But No waiting exist");
	}

	OnLoadDoneFirstJoin(client : Client, auth : any){

		if(null == auth || undefined == auth){

			logger.error(" OnLoadDone -  Auth is null session ID : " + client.sessionId);
			return;
		}

		client.send("SHOW_SELECT_SEAT",{
			limitTime: this.conf["selectSeatLimitTime"],
			balanceRatio: this.conf["balanceRatio"],
			balanceFraction: this.conf["balanceFraction"],
			chipsRatio: this.conf["chipsRatio"],
			chipsFraction: this.conf["chipsFraction"],
			useTimePass : this.conf["useTimePass"],
			useLog : this.conf["useLog"]
		});

		this.UpdateSeatInfo();
	}

	public getPlayer() {

	}


	OnSelectSeat(client : Client, msg : any){
		// selected : number
		let auth = this._buyInWaiting[client.sessionId];
		if(null == auth || undefined == auth){
			// not Joined User
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

		//add to waiting
		this.seatWaitingList[selected] = client.sessionId;
		this.UpdateSeatInfo();

		client.send( "BUY_IN", {
			id: auth.id,
			name: auth.firstName,
			balance: auth.balance,
			tableSize: this.tableSize,
			small: this.conf[ "smallBlind" ],
			big: this.conf[ "bigBlind" ],
			turnTimeMS: this.conf[ "betTimeLimit" ],
			passPrice: this.conf[ "passPrice" ],
			minStakePrice: this.conf[ "minStakePrice" ],
			maxStakePrice: this.conf[ "maxStakePrice" ],
			myChips : myEntity.chips,
		} );
	}

	skipBuyIn(client : Client, seat : number){
		let entity = this.findEntityBySessionID(client.sessionId);

		if(null == entity){
			return;
		}

		entity.seat = seat;

		if (false === this.conf["useTimePass"]) {
			entity.remainTimeMS = 180000;//this.conf["passTerm"];
		} else {
			entity.remainTimeMS = entity.savedRemainTime * 1000;
		}

		let openCards: number[] = [];
		switch (this.centerCardState) {
			case eCommunityCardStep.FLOP:
				openCards = this.communityCardIndex.slice(0, 3);
				break;

			case eCommunityCardStep.TURN:
				openCards = this.communityCardIndex.slice(0, 4);
				break;

			case eCommunityCardStep.RIVER:
			case eCommunityCardStep.SHOWDOWN:
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

		client.send("JOIN", {
			yourself: entity,
			buyIn: 0,
			entities: this.state.entities,
			gameState: this.state.gameState,
			betSeat: this.betSeat,
			endSeat: this.endSeat,
			maxBet: this.state.maxBet,
			minRaise: this.state.minRaise,
			pot: this.state.pot - this.potCalc.rakeTotal,
			centerCardState: this.centerCardState,
			openCards: openCards,
			small: this.conf["smallBlind"],
			big: this.conf["bigBlind"],
			minStakePrice: this.conf["minStakePrice"],
			maxStakePrice: this.conf["maxStakePrice"],
			passPrice: this.conf["passPrice"],
			remainTimeMS: entity.remainTimeMS,
			dealer: this.dealerCalc.getDealer(),
			sb : this.dealerCalc.getSb(),
			bb : this.dealerCalc.getBb(),
			tableInitChips: entity.tableInitChips,
			tableBuyInAmount: entity.tableBuyInAmount,
			tableBuyInCount: entity.tableBuyInCount,
			balanceRatio: this.conf["balanceRatio"],
			balanceFraction: this.conf["balanceFraction"],
			chipsRatio: this.conf["chipsRatio"],
			chipsFraction: this.conf["chipsFraction"]
		});

		if ( true === this.conf["useTimePass"] && entity.remainTimeMS <= 0 ) {
			client.send("BUY_PASS", {
				balance: entity.balance,
				passPrice: this.conf["passPrice"],
				passTerm: this.conf["passTerm"],
				chips: entity.chips
			});
		}
		else {
			if (eGameState.Suspend === this.state.gameState) {
				logger.info("[ onBuyPass ] Now suspend state");
				entity.isNew = false;
				let isStart = this.checkStartCondition();
				if (true === isStart) {

					this.changeState(eGameState.Ready);
				}
			} else if (eGameState.Ready === this.state.gameState) {
				entity.isNew = false;
			}

		}

		this.broadcast("NEW_ENTITY", { newEntity: entity });
	}

	
	UpdateSeatInfo(){
		
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
			logger.error( "[ reJoin ] why?? fatality error." );
			return;
		}

		logger.info( "[ reJoin ] entity state : %s", JSON.stringify( entity ) );
		entity.lastPingTime = Date.now();
		entity.sid = client.sessionId;
		entity.client = client;

		if (entity.seat < 0) {
			//return to firstLogin
			this._buyInWaiting[client.sessionId] = auth;
			client.send("SHOW_SELECT_SEAT",{ limitTime: this.conf["selectSeatLimitTime"],
				balanceRatio: this.conf["balanceRatio"], chipsRatio: this.conf["chipsRatio"],
				balanceFraction: this.conf["balanceFraction"], chipsFraction: this.conf["chipsFraction"],
			});

			this.UpdateSeatInfo();
			return;
		}

		logger.info( "[ reJoin ] seat : %s", entity.seat );
		let openCards: number[] = [];

		switch( this.centerCardState ) {
			case eCommunityCardStep.FLOP:
				openCards = this.communityCardIndex.slice( 0, 3 );
				break;

			case eCommunityCardStep.TURN:
				openCards = this.communityCardIndex.slice( 0, 4 );
				break;

			case eCommunityCardStep.RIVER:
			case eCommunityCardStep.SHOWDOWN:
				openCards = this.communityCardIndex;
				break;
		}

		let prim = entity.cardIndex.length > 0 ? entity.cardIndex[0] : -1;
		let sec = entity.cardIndex.length > 1 ? entity.cardIndex[1] : -1;

		logger.info( "[ reJoin ] send reconnection succeed" );

		client.send( "REJOIN", {
			yourself: entity,
			entities: this.state.entities,
			gameState: this.state.gameState,
			betSeat: this.betSeat,
			endSeat: this.endSeat,
			maxBet: this.state.maxBet,
			minRaise: this.state.minRaise,
			minBet: this.state.startBet,
			pot: this.state.pot - this.potCalc.rakeTotal,
			centerCardState: this.centerCardState,
			openCards: openCards,
			small: this.conf[ "smallBlind" ],
			big: this.conf[ "bigBlind" ],
			minStakePrice: this.conf["minStakePrice"],
			maxStakePrice: this.conf["maxStakePrice"],
			passPrice: this.conf[ "passPrice" ],
			remainTimeMS: entity.remainTimeMS,
			primCard : prim,
			secCard : sec,
			dealer: this.dealerCalc.getDealer(),
			sb : this.dealerCalc.getSb(),
			bb : this.dealerCalc.getBb(),
			tableInitChips: entity.tableInitChips,
			tableBuyInAmount: entity.tableBuyInAmount,
			tableBuyInCount: entity.tableBuyInCount,
			balanceRatio: this.conf["balanceRatio"],
			balanceFraction: this.conf["balanceFraction"],
			chipsRatio: this.conf["chipsRatio"],
			chipsFraction: this.conf["chipsFraction"],
			useTimePass : this.conf["useTimePass"],
			useLog : this.conf["useLog"]
		} );
	}

	onBuyIn( client: Client, msg: any ) {
		try {
			logger.info( "[ onBuyIn ] msg : %s", msg );

			let entity = this.findEntityBySessionID( client.sessionId );
			if( null === entity || undefined === entity ) {
				logger.error( "[ onBuyIn ] entity is null" );
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
				//not selected?! fatal
				return;
			}
			entity.seat = seatPos;

			this._dao.selectBalanceByUID( entity.id, ( err: any, res: any ) => {
				if( !!err ) {
					logger.error( "[ onBuyIn ] selectBalanceByUID query error : %s", err );
					return;
				}
				else {
					if( res.length <= 0 ) {
						logger.error( "[ onBuyIn ] selectBalanceByUID invalid user id" );
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

						this._dao.buyIn( entity.id, this.conf["adminID"], this.conf["roomID"], entity.fullName, 
							oldBalance, entity.balance, oldChips, entity.chips, buyInAmount, ( err: any, res: any ) => {
							if( !!err ) {
								logger.error( "[ onBuyIn ] buyIn query error : %s", err );
							}
						} );

						this._dao.updateBalance( entity.id, entity.balance, ( err: any, res: any ) => {
							if( !!err ) {
								logger.error( "[ onBuyIn ] updateBalance query error : %s", err );
							}
						} );

						if(false === this.conf["useTimePass"]){
							entity.remainTimeMS = 180000;//this.conf["passTerm"];
						} else {
							entity.remainTimeMS = entity.savedRemainTime * 1000;
						}

						logger.info( "[ onBuyIn ] balance(%s), chips(%s), buyInAmount(%s)", entity.balance, entity.chips, buyInAmount );

						let openCards: number[] = [];
						switch( this.centerCardState ) {
							case eCommunityCardStep.FLOP:
								openCards = this.communityCardIndex.slice( 0, 3 );
								break;

							case eCommunityCardStep.TURN:
								openCards = this.communityCardIndex.slice( 0, 4 );
								break;

							case eCommunityCardStep.RIVER:
							case eCommunityCardStep.SHOWDOWN:
								openCards = this.communityCardIndex;
								break;
						}

						this.UpdateSeatInfo();

						entity.tableInitChips = oldChips;
						entity.tableBuyInAmount = buyInAmount;
						entity.tableBuyInCount = 1;

						// send & broadcast
						client.send("RES_BUY_IN", {
							ret: 0,
							amount: buyInAmount,
							message: "SUCCEED.",
							tableBuyInAmount: entity.tableBuyInAmount,
							tableBuyInCount: entity.tableBuyInCount,
						});

						client.send( "JOIN", {
							yourself: entity,
							entities: this.state.entities,
							gameState: this.state.gameState,
							betSeat: this.betSeat,
							endSeat: this.endSeat,
							maxBet: this.state.maxBet,
							minRaise: this.state.minRaise,
							pot: this.state.pot - this.potCalc.rakeTotal,
							centerCardState: this.centerCardState,
							openCards: openCards,
							small: this.conf[ "smallBlind" ],
							big: this.conf[ "bigBlind" ],
							minStakePrice: this.conf["minStakePrice"],
							maxStakePrice: this.conf["maxStakePrice"],
							passPrice: this.conf[ "passPrice" ],
							remainTimeMS: entity.remainTimeMS,
							dealer: this.dealerCalc.getDealer(),
							sb : this.dealerCalc.getSb(),
							bb : this.dealerCalc.getBb(),
							tableInitChips: entity.tableInitChips,
							tableBuyInAmount: entity.tableBuyInAmount,
							tableBuyInCount: entity.tableBuyInCount,
							balanceRatio: this.conf["balanceRatio"],
							balanceFraction: this.conf["balanceFraction"],
							chipsRatio: this.conf["chipsRatio"],
							chipsFraction: this.conf["chipsFraction"]
						} );
						
						if (true === this.conf["useTimePass"] && entity.remainTimeMS <= 0) {
							client.send("BUY_PASS", {
								balance: entity.balance,
								passPrice: this.conf["passPrice"],
								passTerm: this.conf["passTerm"],
								chips: entity.chips
							});
						}
						else {
							if( eGameState.Suspend === this.state.gameState ) {
								logger.info( "[ onBuyPass ] Now suspend state" );
								entity.isNew = false;
								let isStart = this.checkStartCondition();
								if ( true === isStart ) {
									logger.info( "[ onBuyPass ] GAME STATE TO READY" );
									this.changeState( eGameState.Ready );
								}
							} else if (eGameState.Ready === this.state.gameState) {
								entity.isNew = false;
							}

						}

						this.broadcast( "NEW_ENTITY", { newEntity: entity } );
					}
				}
			} );
		} catch( e ) {
			if( e === undefined ) {
				e = "error";
			}
			logger.error( "[ onBuyIn ] catch : %s", e );

			client.send("RES_BUY_IN", {
				ret: -1,
				amount: 0,
				message: e,
				tableBuyInAmount: 0,
				tableBuyInCount: 0,
			});
		}
	}

	onCancelBuyIn(client : Client, msg : any){
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

	onShowEmoticon(client: Client, msg: any) {
		this.broadcast( "SHOW_EMOTICON", { seat: msg['seat'],
		type: msg['type'],
		id: msg['id']} );
	}

	onBuyPass( client: Client, msg: any ) {
		let locSeatIndex = msg[ "seat" ];
		let entity: any = null;
		let before = 0;
		let after = 0;
		const idx = this.state.entities.findIndex( function( e ) {
			return e.seat === locSeatIndex;
		} );

		if( idx > -1 ) {
			entity = this.state.entities[idx];
		}
		if( null === entity ) {
			logger.error( "[ onBuyPass ] entity is null. seat(%s), msg(%s)", locSeatIndex, JSON.stringify( msg ) );
			return client.send( "RES_BUY_PASS", { resultCode: -1, msg: "seat user is not existed." } );
		} else {
			logger.info( "[ onBuyPass ] seat : %s // sid : %s", entity.seat, client.sessionId );
			if( entity.remainTimeMS < 0 ) {
				entity.remainTimeMS = -1;
			}

			this._dao.selectBalanceByUID( entity.id, ( err: any, res: any ) => {
				if (!!err) {
					logger.error("[ onReBuy ] selectBalanceByUID query error : %s", err);
				} else {
					if (res.length <= 0) {
						logger.error("[ onReBuy ] selectBalanceByUID invalid user id");
					} else {
						entity.balance = res[0].balance;
						let oldBalance = entity.balance;
						let oldChips = entity.chips;

						if (entity.chips < this.conf["passPrice"]) {
							logger.warn("[ onBuyPass ] chips is not enough. chip : %s", entity.chips);
							return client.send("RES_BUY_PASS", {resultCode: -1, msg: "Not enough chips."});
						}

						entity.chips -= this.conf["passPrice"];
						if (entity.chips <= 0) {
							entity.chips = 0;
						}

						entity.initRoundChips = entity.chips;
						after = entity.chips;

						entity.remainTimeMS = this.conf["passTerm"];
						let term = this.conf["passTerm"] * 0.001;

						this._dao.timePurchase(entity.id, this.conf["adminID"], this.conf["roomID"], entity.fullName, 
							oldBalance, entity.balance, oldChips, entity.chips, this.conf["passPrice"], term, (err: any, res: any) => {
								if (!!err) {
									logger.error("[ onBuyPass ] timePurchase query error : %s", err);
								}
							});

						client.send("RES_BUY_PASS", {
							resultCode: 0,
							msg: "SUCCEED",
							balance: entity.balance,
							chips: entity.chips,
							remainTimeMS: entity.remainTimeMS
						});

						if (true == this.conf["private"]) 
						{
							this._dao.updateRemainTime(entity.id, entity.remainTimeMS, (err: any, res: any) => {
								if (!!err) {
									logger.error("[ onBuyPass ] updateRemainTime query error : %s", err);
								}
							});
						}
						else 
						{
							this._dao.updatePublicRemainTime(entity.id, entity.remainTimeMS, (err: any, res: any) => {
								if (!!err) {
									logger.error("[ onBuyPass ] updatePublicRemainTime query error : %s", err);
								}
							});
						}

						if (eGameState.Suspend === this.state.gameState) {
							logger.error("[ checkStartCondition ]");
							entity.isNew = false;
							let isStart = this.checkStartCondition();
							if (true == isStart) {
								this.changeState(eGameState.Ready);
							}
						} else if (eGameState.Ready === this.state.gameState) {
							entity.isNew = false;
						}
					}
				}
			} );
		}
	}

	onReBuy( client: Client, msg: any ) {
		logger.info( "[ onReBuy ] msg : %s", msg );
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
			logger.error( "[ onReBuy ] entity is null. seat(%s), msg(%s)", locSeatIndex, JSON.stringify( msg ) );
			return client.send( "RES_RE_BUY", {
				resultCode: -1,
				amount: 0,
				msg: "seat user is not existed",
				tableBuyInAmount: -1,
				tableBuyInCount: -1,
			} );
		} else {
			this._dao.selectBalanceByUID( e.id, ( err: any, res: any ) => {
				if( !!err ) {
					logger.error( "[ onReBuy ] selectBalanceByUID query error : %s", err );
				}
				else {
					if( res.length <= 0 ) {
						logger.error( "[ onReBuy ] selectBalanceByUID invalid user id" );
					}
					else {
						e.balance = res[0]["balance"];
						let oldBalance = e.balance;
						let oldChips = e.chips;

						logger.info( "[ onReBuy ] seat : %s // wait : %s // balance : %s // buy amount : %s",
							locSeatIndex, e.wait, e.balance, locBuyAmount );
		
						//check chips
						if( e.chips >= this.conf[ "minStakePrice" ] ) {
							logger.warn( "[ onReBuy ] already enough chips. your chip : %s // min stake : %s", e.chips, this.conf[ "minStakePrice" ] );
							message = "You can't stack any more chips.";
							code = 1;
						}
						else if( e.fold === false && ( this.state.gameState >= eGameState.Prepare &&
								this.state.gameState <= eGameState.ShowDown ) &&
							e.wait === false ) {
							logger.warn( "[ onReBuy ] You can't buy chips during the game. gameState : %s", this.state.gameState );
							message = "You can only purchase chips in a fold or wait state.";
							code = 1;
						}
						else if( e.balance <= 0 ) {
							logger.warn( "[ onReBuy ] not enough balance. balance : %s", e.balance );
							code = 1;
							message = "not enough balance.";
						}
						else if( e.balance <= locBuyAmount ) {
							logger.warn( "[ onReBuy ] It has less balance than the chip you want to purchase. balance : %s // desired chips : %s",
								e.balance, locBuyAmount );
							code = 0;
							chips = e.balance;// entity.chips = entity.balance;
							e.balance = 0;
						}
						else {
							code = 0;
							e.balance -= locBuyAmount;
							chips = locBuyAmount;// entity.chips = locBuyAmount;
			
							logger.info( "[ onReBuy ] succeed. balance : %s // chips : %s", e.balance, chips );
						}
			
						if( 0 === code ) {
							e.chips = e.chips + chips;
							e.initRoundChips = e.chips;
							logger.info( "[ onReBuy ] entity state. chips : %s // enough chip : %s // wait : %s", e.chips, e.enoughChip, e.wait );
				
							if( eGameState.Suspend === this.state.gameState ) {
								e.isNew = false;
								let isStart = this.checkStartCondition();
								if ( true === isStart ) {
									logger.info( "[ onReBuy ] GAME STATE TO READY" );
									this.changeState( eGameState.Ready );
								}
							} else if ( eGameState.Ready === this.state.gameState ) {
								e.isNew = false;
							}
						}
			
						this._dao.buyIn( e.id, this.conf["adminID"], this.conf["roomID"], e.fullName,
							oldBalance, e.balance, oldChips, e.chips, locBuyAmount, ( err: any, res: any ) => {
							if( !!err ) {
								logger.error( "[ onReBuy ] buyIn query error : %s", err );
							}
						} );
				
						this._dao.updateBalance( e.id, e.balance, ( err: any, res: any ) => {
							if( !!err ) {
								logger.error( "[ onReBuy ] updateBalance query error : %s", err );
							}
						} );
				
						logger.info( "[ onReBuy ] done. send packet to client. result code : %s // msg : %s", code, message );

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

	onAddChips( client: Client, msg: any ) {
		logger.info( "[ onAddChips ] msg(%s)", msg );
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
				this._dao.selectBalanceByUID(e.id, (err: any, res : any) => {
					if (!!err) {
						logger.error("[ onAddChips ] selectBalanceByUID query error : %s", err);
					}
					else {
						if (res.length <= 0) {
							logger.error("[ onAddChips ] selectBalanceByUID invalid user id");
						}
						else {
							e.balance = res[0]["balance"];
							let oldBalance = e.balance;
							let oldChips = e.chips;
	
							let gap = MAX_BUY_IN - (e.initRoundChips + amount);
							logger.info( "[ onAddChips ] e.initRoundChips: %d, gap : %d", e.initRoundChips, gap );
			
							if ( gap < 0) {
								amount = amount + gap;
							}
			
							code = this.checkReBuyCondition(e, amount, true );
							logger.info( "[ onAddChips ] amount: %d, code : %d", amount, code );
			
							let pending: boolean = false;
							if ( -1 === code || null === e || undefined === e) {
								logger.error( "[ onAddChips ] why??" );
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
									eGameState.Prepare === this.state.gameState || eGameState.ClearRound === this.state.gameState) {
									pending = false;
			
									if ( e.balance < amount ) {
										amount = e.balance;
									}
									e.balance -= amount;
									e.chips = e.chips + amount;
									e.initRoundChips = e.chips;
									e.tableBuyInAmount += amount;
									e.tableBuyInCount++;
			
									this._dao.buyIn(e.id, this.conf["adminID"], this.conf["roomID"], e.fullName,
										oldBalance, e.balance, oldChips, e.chips, amount, (err: any, res : any) => {
										if (!!err) {
											logger.error("[ onAddChips ] buyIn query error : %s", err);
										}
									});
					
									this._dao.updateBalance(e.id, e.balance, (err: any, res : any) => {
										if (!!err) {
											logger.error("[ onAddChips ] updateBalance query error : %s", err);
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

	onAddChipsRequest( client: Client, msg: any ) {
		logger.info("onAddChipsRequest : msg(%s)", msg);
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
			this._dao.selectBalanceByUID(e.id, (err: any, res : any) => {
				if (!!err) {
					logger.error("[ onAddChipsRequest ] selectBalanceByUID query error : %s", err);
				}
				else {
					if (res.length <= 0) {
						logger.error("[ onAddChipsRequest ] selectBalanceByUID invalid user id");
					}
					else {
						e.balance = res[0]["balance"];

						max = MAX_BUY_IN - e.initRoundChips;
						if ( e.balance < max ) {
							max = e.balance;
						}

						res = this.checkReBuyCondition(e, max, false );
						logger.error("checkReBuyCondition res:%d, initChip: %d", res, e.initRoundChips);
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

	checkReBuyCondition( e: any, max: number, reBuy: boolean) :number {
		const MAX_BUY_IN: number = this.conf["maxStakePrice"];
		const MAX_RE_BUY_COUNT: number = this.conf["limitReBuyCount"];
		logger.info("seat:%d, amount:%d, reBuy: %d", e.seat, max, reBuy);
		// res code
		// 0: no error
		// 1: use Re-Buy = false
		// 2: already Request Re-Buy
		// 3: already Enough Chips
		// 4: re-Buy Count Over
		// 5: not Enough Balance

		if ( null === e || undefined === e) {
			logger.error("checkReBuyCondition null" );
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
		logger.info( "[ onLeave ] sessionID(%s), consented(%s)", client.sessionId, consented );

		delete this._buyInWaiting[ client.sessionId ];
		delete this._rejoinWaiting[ client.sessionId ];

		for(let i =0; i < this.seatWaitingList.length; i++){
			if(this.seatWaitingList[i] != client.sessionId){
				continue;
			}

			this.seatWaitingList[i] = "";
		}

		let runaway = this.findEntityBySessionID( client.sessionId );
		if( null === runaway || undefined === runaway ) {
			logger.error( "[ onLeave ] entity is null" );
			return;
		}

		logger.info( "[ onLeave ] seat(%s), name(%s), balance(%s), chips(%s)", 
			runaway.seat, runaway.fullName, runaway.balance, runaway.chips );

		if (true == this.conf["private"]) {
			this._dao.updateAccountBalanceByID({
				id: runaway.id,
				chip: runaway.chips
			}, function (err: any, res: any) {
				if (!!err) {
					logger.error("[ processLeave ] update query error : %s", err);
				}
			});

			if (runaway.seat >= 0) {
				this._dao.updateRemainTime(runaway.id, runaway.remainTimeMS, (err: any, res: any) => {
					if (!!err) {
						logger.error("[ update ] updateRemainTime query error : %s", err.sqlMessage);
					}
				});
			}
		}

		runaway.leave = true;

		if (this.conf["useTimePass"] === true) {
			if (runaway.remainTimeMS <= 0) {
				this.handleEscapee();
			}
		}
		
		if( eGameState.Suspend === this.state.gameState ) {
			this.handleEscapee();
			return;
		}
	}

	findEntityBySessionID( sid: string ) {
		let entity = this.state.entities.find( elem => elem.sid == sid );
		if( null === entity || undefined === entity ) {
			logger.error( "[ findEntityBySessionID ] entity is null" );
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
		logger.info( "[ onDispose ]" );
		clearInterval(this.pingTimerID);
		clearTimeout(this.bufferTimerID);

		this.state.entities.forEach(elem => {
			//console.error(elem.id);
			this._dao.clearActiveSessionID(elem.id);
		});

		if (false == this.conf["private"]) {
			this.state.entities.forEach(element => {
				let data = {
					publicRoomID: -1,
					id : element.id
				}
				this._dao.updatePublicRoomID(data, (err: any, res: boolean) => {
					if (null != err) {
						logger.error(err);
					}
				});
	
				this._dao.publicChipOut(element.chips, element.id);
				element.chips = 0;
			});
		}
	}

	onPong( client: Client, msg: any ) {
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

	update( dt: any ) {

		for (let i = 0; i < this.state.entities.length; i++) {
			let entity = this.state.entities[i];
			if(entity != null) {
				if(entity.chips != entity.oldChips) {
					if (true == this.conf["private"]) {
						this._dao.updateChip(entity.id, entity.chips, (err: any, res: any) => {
							if (!!err) {
								logger.error("[ update ] updateChip query error : %s", err.sqlMessage);
							}
						});
					}
					else {
						this._dao.updatePublicChip(entity.id, entity.chips, (err: any, res: any) => {
							if (!!err) {
								logger.error("[ update ] updateChip query error : %s", err.sqlMessage);
							}
						});
					}


					entity.oldChips = entity.chips;
				}
			}
		}

		for (let i = 0; i < this.state.entities.length; i++) {
			let entity = this.state.entities[i];
			if(entity != null) {
				if(entity.rake != entity.oldRake) {
					this._dao.updateRake( entity.id, entity.rake, ( err: any, res: any ) => {
						if( !!err ) {
							logger.error( "[ update ] updateRake query error : %s", err.sqlMessage );
						}
					} );

					entity.oldRake = entity.rake;
				}
			}
		}

		this.secondTick += dt;

		if (true === this.conf["useTimePass"]) {
			if (this.secondTick >= 1000) {
				if (this.state.gameState !== eGameState.Suspend && this.state.gameState !== eGameState.Ready ) {
					for (let i = 0; i < this.state.entities.length; i++) {
						if (0 < this.state.entities[i].remainTimeMS) {
							this.state.entities[i].remainTimeMS -= this.secondTick;

							let locEntity = this.state.entities[i];
							locEntity.client.send("REMAIN_TIME", {
								timer: this.state.entities[i].remainTimeMS
							});

							if (this.state.entities[i].remainTimeMS <= 0) {
								this.state.entities[i].remainTimeMS = -1;
								logger.info("[ update ] time over. seat : %s", this.state.entities[i].seat);

								if (this.state.gameState === eGameState.Suspend) {
									this.updateEntityPass();
								}
							}
						}
					}
				}
				this.secondTick = 0;
			}
		}

		if( eGameState.Bet === this.state.gameState ) {
			this.elapsedTick += dt;
			let self = this;

			const pos = this.state.entities.findIndex( function( et ) {
				return et.seat === self.betSeat;
			} );

			if( pos > -1 ) {
				let entity = this.state.entities[ pos ];
				if( false === entity.fold &&
					true === entity.leave ) {
					logger.info( "[ update ] runaway user fold." );
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
				logger.info( "[ update ] seat %s bet timeout. call fold", this.betSeat );

				let next = this.funcFold( this.betSeat );
				if( next ) {
					this.broadTurn();
				}

				let timeoutPlayer = this.getEntity(this.betSeat);

				if(null != timeoutPlayer){
					timeoutPlayer.timeLimitCount += 1;

					if(timeoutPlayer.timeLimitCount == this.conf["timeoutExitLimit"]){
						timeoutPlayer.isSitOut = true;
						timeoutPlayer.wait = true;
						this.broadcast("SIT_OUT", {seat : timeoutPlayer.seat});
						this.UpdateSeatInfo();

						//logger.error("Player " + this.betSeat + " is over fold limit send 4000 exit code and set client leave");
						//this.kickPlayer(timeoutPlayer.client.sessionId ,4000);
						//this.onLeave(timeoutPlayer.client);
					}
				}
			}
		}
		else if( eGameState.ShowDown === this.state.gameState ) {
			this.elapsedTick += dt;
			if( this.elapsedTick >= this.showdownTime ) {
				logger.info( "[ update ] SHOWDOWN STATE TIME OVER. duration : %s", this.showdownTime );
				this.elapsedTick = 0;
				this.changeState( eGameState.ClearRound );
			}
		}
		else if( eGameState.ClearRound === this.state.gameState ) {
			this.elapsedTick += dt;
			if( this.elapsedTick >= this.conf[ "clearTerm" ] ) {
				logger.info( "[ update ] CLEAR_ROUND STATE TIME OVER. duration : %s", this.conf[ "clearTerm" ] );
				this.elapsedTick = 0;

				this.handleEscapee();
				this.updatePlayerEligible();
				let isStart = this.checkStartCondition();
				if ( true == isStart ) {
					this.updateButtons();
					this.state.entities.forEach( e => {
						if ( e.isSitBack === true && e.wait === false) {
							logger.info("EXIT_SIT_OUT");
							e.isSitBack = false;
							e.isSitOut = false;
							this.broadcast("SIT_BACK", { seat: e.seat });
							return;
						}
					} );

					this.state.entities.forEach( e => {
						if ( e.longSitOut === true) {
							e.longSitOut = false;
							this.kickPlayer(e.client.sessionId, 4001);
							return;
						}
					} );

					isStart = this.checkStartCondition();
					if ( isStart == true ) {
						logger.info( "[ update ] GAME STATE TO PREPARE" );
						this.changeState( eGameState.Prepare );
					} else {
						logger.info( "[ update ] GAME STATE TO SUSPEND" );
						this.changeState( eGameState.Suspend );
					}
				} else {
					logger.info( "[ update ] GAME STATE TO SUSPEND" );
					this.changeState( eGameState.Suspend );
				}
			}
		} else if ( eGameState.Ready === this.state.gameState ) {
			this.elapsedTick += dt;
			if (this.elapsedTick >= this.conf["readyTerm"] ) {
				logger.info( "[ update ] READY STATE TIME OVER. duration : %s", this.conf[ "readyTerm" ] );
				this.elapsedTick = 0;
				this.handleEscapee();
				this.updatePlayerEligible();

				let isStart = this.checkStartCondition();
				if ( true === isStart ) {
					this.updateButtons();
					this.changeState( eGameState.ClearRound );
					// this.changeState( eGameState.Prepare );
				} else {
					this.changeState( eGameState.Suspend );
				}
			}
		}
	}

	isEnoughChip( chip: number ) {
		let b = chip >= this.conf[ "bigBlind" ] * 2;// * 10;
		// logger.info( "[ isEnoughChip ] chip : %s // b : %s", chip, b );
		return b;//chip >= START_BET * 10;
	}

	handleEscapee() {
		let escapees = [];
		for( let l = 0; l < this.state.entities.length; l++ ) {
			if( true === this.state.entities[ l ].leave ) {
				logger.info( "[ handleEscapee ] escapee fold" );
				this.broadcast( "HANDLE_ESCAPEE", { seat: this.state.entities[ l ].seat } );
				escapees.push( this.state.entities[ l ].seat );

				this._dao.clearActiveSessionID(this.state.entities[ l ].id);

				if (false == this.conf["private"]) {
					let data = {
						publicRoomID: -1,
						id : this.state.entities[ l ].id
					}
					this._dao.updatePublicRoomID(data, (err: any, res: boolean) => {
						if (null != err) {
							logger.error(err);
						}
					});

					this._dao.publicChipOut(this.state.entities[l].chips, this.state.entities[l].id);
					this.state.entities[l].chips = 0;
				}
			}
		}

		for( let m = 0; m < escapees.length; m++ ) {
			let s = escapees[ m ];
			const idx = this.state.entities.findIndex( function( e ) {
				return e.seat === s;
			} );
			if( idx > -1 ) {
				this.state.entities.splice( idx, 1 );
			}
			else {
				logger.error( "[ handleEscapee ] why??. seat : %s", s );
			}
		}
		this.UpdateSeatInfo();
	}

	updateEntityPass() {

		if(false === this.conf["useTimePass"]){
			return;
		}

		logger.info( "[ updateEntityPass ] updateEntityPass" );
		for( let i = 0; i < this.state.entities.length; i++ ) {
			if( this.state.entities[ i ].remainTimeMS <= 0 && this.state.entities[i].seat >= 0) {
				let locEntity = this.state.entities[ i ];
				locEntity.wait = true;

				logger.info( "[ updateEntityPass ] seat : %s // chip : %s // price : %s", locEntity.seat, locEntity.chips, this.conf[ "passPrice" ] );
				let enoughChip = true;
				if( locEntity.chips < this.conf[ "passPrice" ] ) {
					enoughChip = false;
				}

				locEntity.client.send( "TIME_OVER", {
					enoughChip: enoughChip,
					chips: locEntity.chips,
					time: locEntity.remainTimeMS,
					balance: locEntity.balance,
					passPrice: this.conf[ "passPrice" ],
					passTerm: this.conf[ "passTerm" ]
				} );
			}
		}

		this.state.entities.forEach( e =>{
			if ( e.seat >= 0) {
				if (true == this.conf["private"]) {
					this._dao.updateRemainTime(e.id, e.remainTimeMS, (err: any, res: any) => {
						if (!!err) {
							logger.error("[ updateRemainTime ] updateRemainTime query error : %s", err);
						}
					});
				}
				else{
					this._dao.updatePublicRemainTime(e.id, e.remainTimeMS, (err: any, res: any) => {
						if (!!err) {
							logger.error("[ updateRemainTime ] updateRemainTime query error : %s", err);
						}
					});
				}
			}
		});
	}

	updatePlayerEligible() {
		for( let i = 0; i < this.state.entities.length; i++ ) {
			let e = this.state.entities[ i ];

			e.enoughChip = this.isEnoughChip( e.chips );
			if ( e.enoughChip === true && e.remainTimeMS > 0 && e.isSitOut === false) {
			//if ( e.enoughChip === true && e.remainTimeMS > 0) {
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

	updateButtons() {
		let buttons = this.dealerCalc.moveButtons(this.state.entities);
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
			playable = this.dealerCalc.IsPlayableSeat(this.state.entities, e.seat);
			if ( playable === false ) {
				e.wait = true;
			}
		}
	}

	processReBuyInRequest() {
		// const MAX_BUY_IN: number = this.conf["maxStakePrice"];
		// const MIN_BUY_IN: number = this.conf["minStakePrice"];

		for( let i = 0; i < this.state.entities.length; i++ ) {
			let e = this.state.entities[ i ];

			if ( null === e || undefined === e ) {
				continue;
			}

			e.enoughChip = this.isEnoughChip(e.chips);
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

					this._dao.selectBalanceByUID(e.id, (err: any, res : any) => {
						if (!!err) {
							logger.error("[ processPendingAddChips ] selectBalanceByUID query error : %s", err);
						} else {
							this._dao.buyIn(e.id, this.conf["adminID"], this.conf["roomID"], e.fullName,
							beforeBalance, e.balance, beforeChips, e.chips, amount, (err: any, res : any) => {
								if (!!err) {
									logger.error("[ processPendingAddChips ] buyIn query error : %s", err);
								} else {
									this._dao.updateBalance(e.id, e.balance, (err: any, res: any) => {
										if (!!err) {
											logger.error("[ processPendingAddChips ] updateBalance query error : %s", err);
										} else {

										}
									});
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
			this._dao.selectBalanceByUID(e.id, (err: any, res : any) => {
				if (!!err) {
					logger.error("[ processPendingAddChips ] selectBalanceByUID query error : %s", err);
				} else {
					if (res.length <= 0) {
						logger.error("[ processPendingAddChips ] selectBalanceByUID invalid user id");
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

							this._dao.buyIn(e.id, this.conf["adminID"], this.conf["roomID"], e.fullName,
								oldBalance, e.balance, oldChips, e.chips, reBuyAmount, (err: any, res : any) => {
									if (!!err) {
										logger.error("[ processPendingAddChips ] buyIn query error : %s", err);
									}
								});

							this._dao.updateBalance(e.id, e.balance, (err: any, res : any) => {
								if (!!err) {
									logger.error("[ processPendingAddChips ] updateBalance query error : %s", err);
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
			let timePass = ( e.remainTimeMS > 0 );

			if ( true == e.enoughChip && true == timePass && false == e.isSitOut ) {
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
		logger.info( ">>>>>>>>>>>>>>>>>>>>>>>>" );
		if( null !== this.bufferTimerID ) {
			clearTimeout( this.bufferTimerID );
			this.bufferTimerID = null;
		}

		switch( state ) {
			case eGameState.Suspend:
				this.broadcast( "SUSPEND_ROUND", {
					entities: this.state.entities,
					dealerPos: this.state.dealerSeat,
				} );
				break;

			case eGameState.Ready:
				this.broadcast( "READY_ROUND", {
					msg: "READY_ROUND", timeMS: this.conf[ "readyTerm" ], entities: this.state.entities
				} );
				break;

			case eGameState.Prepare: // reset room, set dealer pos, card shuffle, pick community cards
				logger.info( "[ changeState ] PREPARE" );

				//Check Sit out Player
				this.potCalc.Clear();
				this.prepareRound();
				this.cardDispensing();
				this.UpdateSeatInfo();
				break;

			case eGameState.PreFlop: // card draw, blind bet
				logger.info( "[ changeState ] PRE_FLOP" );
				this.centerCardState = eCommunityCardStep.PRE_FLOP;
				this.potCalc.UpdateCenterCard(this.centerCardState);

				// this.cardDispensing();
				this.blindBet();

				this.bufferTimerID = setTimeout( () => {
					this.changeState( eGameState.Bet );
				}, 1000 );
				break;

			case eGameState.Bet:
				logger.info( "[ changeState ] BET." );
				if( null !== this.bufferTimerID ) {
					clearTimeout( this.bufferTimerID );
					this.bufferTimerID = null;
				}

				// pre-flop 상태에서는 maxBet, entity`s currBet 을 초기화 하면 안 된다.
				if( eCommunityCardStep.PRE_FLOP !== this.centerCardState ) {
					this.setTurnBet();
				}

				// 베팅은 SB 부터 시작 된다. 단, pre-flop bet 은 bb + 1 부터 시작 된다.
				// broadTurn 에서 betSeat 를 +1 해서 찾기때문에,,,
				if( eCommunityCardStep.PRE_FLOP === this.centerCardState ) {
					this.betSeat = this.state.bbSeat;
					this.endSeat = this.state.bbSeat;
				}
				else {
					this.betSeat = this.state.dealerSeat;
					this.endSeat = this.state.dealerSeat;
				}

				this.broadTurn();
				this.updateEndSeat( this.betSeat, false );
				// logger.info( "[ changeState ] BET. START SEAT : %s // END SEAT : %s", this.betSeat, this.endSeat );
				break;

			case eGameState.Flop:
				this.potCalc.CalculatePot();
				
				logger.info( "[ changeState ] FLOP. card : %s", this.communityCardIndex.slice( 0, 3 ).toString() );
				this.broadcast( "SHOW_FLOP", { cards: this.communityCardIndex.slice( 0, 3 ), dpPot : this.potCalc.GetPots(false), potTotal : this.state.pot - this.potCalc.rakeTotal});

				this.bufferTimerID = setTimeout( () => {
					this.changeState( eGameState.Bet );
				}, 1000 );
				break;

			case eGameState.Turn:
				logger.info( "[ changeState ] TURN. card : %s", this.communityCardIndex.slice( 3, 4 ).toString() );
				this.broadcast( "SHOW_TURN", { cards: this.communityCardIndex.slice( 3, 4 ), dpPot : this.potCalc.GetPots(false)} );

				this.bufferTimerID = setTimeout( () => {
					this.changeState( eGameState.Bet );
				}, 1000 );
				break;

			case eGameState.River:
				logger.info( "[ changeState ] RIVER. card : %s", this.communityCardIndex.slice( 4 ).toString() );
				this.broadcast( "SHOW_RIVER", { cards: this.communityCardIndex.slice( 4 ), dpPot : this.potCalc.GetPots(false)} );

				this.bufferTimerID = setTimeout( () => {
					this.changeState( eGameState.Bet );
				}, 1000 );
				break;
			case eGameState.ShowDown:
				logger.info( "[ changeState ] SHOWDOWN" );
				// All Fold
				this.showdownTime = this.conf[ "showDownTerm" ];
				let isAllIn = false;

				if( false === this.isAllFold() ) {
					let pots : any[] = this.potCalc.GetPots(true);

					if( eCommunityCardStep.SHOWDOWN !== this.centerCardState ) {
						//Round ended before showdown
						isAllIn = true;
						
						if( eCommunityCardStep.PRE_FLOP === this.centerCardState ) {
							this.showdownTime += 5500;	//1500 + 3 * 50 + 1000 + 2000
						}
						else if(eCommunityCardStep.FLOP === this.centerCardState){
							this.showdownTime += 5000;	//1500 + 1000 + 2000
						}
						else if( eCommunityCardStep.TURN === this.centerCardState ) {
							this.showdownTime += 4000;	//1500 + 2000
						}
						else if( eCommunityCardStep.RIVER === this.centerCardState ) {
							this.showdownTime += 2000;	//1500
						}

						this.showdownTime += pots.length * 2000;
						//this.broadcast( "SHOW_ALL", { cards: this.communityCardIndex, dpPot : pots} );
					}
					else
					{
						this.showdownTime += pots.length * 2000;
					}
					this.broadPlayerCards(isAllIn);
				}

				this.finishProc_pot( this.isAllFold(), isAllIn);
				this.elapsedTick = 0;
				break;

			case eGameState.ClearRound:
				this.state.entities.forEach( e => {
					if ( e.isSitOut === true && false === e.wait ) {
						logger.error("ENTER_SIT_OUT");
						e.isSitBack = false;
						e.isSitOut = true;
						e.wait = true;
						this.broadcast("SIT_OUT", { seat: e.seat });
						return;
					}
				} );

				this.processPendingAddChips();
				this.processReBuyInRequest();

				this.broadcast( "CLEAR_ROUND", {
					msg: "CLEAR_ROUND", timeMS: this.conf[ "clearTerm" ] * 1000, entities: this.state.entities
				} );

				this.updateEntityPass();
				this.UpdateSeatInfo();
				break;
		}

		this.state.gameState = state;
	}

	changeCenterCardState() {
		switch( this.centerCardState ) {
			case eCommunityCardStep.PRE_FLOP: // 0
				logger.info( "[ changeCenterCardState ] Card state from [ PRE_FLOP ] to [ FLOP ]" );
				this.centerCardState = eCommunityCardStep.FLOP;
				this.potCalc.UpdateCenterCard(this.centerCardState);
				this.potCalc.CalculatePot();
				this.changeState( eGameState.Flop );
				break;
			case eCommunityCardStep.FLOP:	// 3
				logger.info( "[ changeCenterCardState ] Card state from [ FLOP ] to [ TURN ]" );
				this.centerCardState = eCommunityCardStep.TURN;
				this.potCalc.UpdateCenterCard(this.centerCardState);
				this.potCalc.CalculatePot();
				this.changeState( eGameState.Turn );
				break;
			case eCommunityCardStep.TURN:	// 4
				logger.info( "[ changeCenterCardState ] Card state from [ TURN ] to [ RIVER ]" );
				this.centerCardState = eCommunityCardStep.RIVER;
				this.potCalc.UpdateCenterCard(this.centerCardState);
				this.potCalc.CalculatePot();
				this.changeState( eGameState.River );
				break;
			case eCommunityCardStep.RIVER:	// 5
				logger.info( "[ changeCenterCardState ] Card state from [ RIVER ] to [ SHOWDOWN ]" );
				this.centerCardState = eCommunityCardStep.SHOWDOWN;
				this.potCalc.UpdateCenterCard(this.centerCardState);
				this.potCalc.CalculatePot();
				this.changeState( eGameState.ShowDown );
				break;
			default:
				logger.error( "[ changeCenterCardState ] invalid state : %s", this.centerCardState );
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
			if(element.wait === false){
				entryPlayerCount++;
			}
		});

		logger.info( "[ entryPlayerCount %s",  entryPlayerCount);

		this.potCalc.SetRoundPlayerCount(entryPlayerCount);

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

		logger.info( "[ card shuffle");

		// card shuffle
		for( let i = 0; i < 2; i++ ) {
			for( let index = this.totalCards2.length - 1; index > 0; index-- ) {
				const randomPosition = Math.floor( Math.random() * ( index + 1 ) );
				const temporary = this.totalCards2[ index ];
				this.totalCards2[ index ] = this.totalCards2[ randomPosition ];
				this.totalCards2[ randomPosition ] = temporary;
			}
		}

		let shuStr = "";
		for( let i = 0; i < this.totalCards2.length; i++ ) {
			let temp = this.totalCards2[ i ];
			shuStr = shuStr + temp + " ";
		}

		logger.debug( "[ prepareRound ] shuffle : %s ", shuStr );

		// community card pick.
		for( this.cardPickPos = 0; this.cardPickPos < this.conf[ "communityCard" ]; this.cardPickPos++ ) {
			let card = this.totalCards[ parseInt( this.totalCards2[ this.cardPickPos ] ) ];
			this.communityCardString.push( card );
			this.communityCardIndex.push( parseInt( this.totalCards2[ this.cardPickPos ] ) );
		}

		logger.info( "[ prepareRound ] community cards : %s ", this.communityCardString );

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
		}, 500 );
	}

	resetEntities() {
		this.state.entities.forEach( e => {
			e.currBet = 0;
			e.roundBet = 0;
			e.totalBet = 0;
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

	//------------------------------------
	// PRE_FLOP
	//------------------------------------
	cardDispensing() {
		for( let i = 0; i < this.state.entities.length; i++ ) {
			let entity = this.state.entities[ i ];

			// 	entity.seat, entity.wait, entity.fold, entity.leave, entity.allIn, entity.waitReconnection  );

			if (-1 === entity.seat) {
				continue;
			}

			if( true === entity.wait || true === entity.fold) {
				entity.client.send( "CARD_DISPENSING", {
					primaryCard: -1,//entity.primaryCard,
					secondaryCard: -1//entity.secondaryCard
				} );
				continue;
			}

			let primaryIndex = parseInt( this.totalCards2[ this.cardPickPos++ ] );
			entity.primaryCard = this.totalCards[ primaryIndex ];
			entity.cardIndex.push( primaryIndex );

			let secondaryIndex = parseInt( this.totalCards2[ this.cardPickPos++ ] );
			entity.secondaryCard = this.totalCards[ secondaryIndex ];
			entity.cardIndex.push( secondaryIndex );

			entity.client.send( "CARD_DISPENSING", {
				primaryCard: primaryIndex,//entity.primaryCard,
				secondaryCard: secondaryIndex//entity.secondaryCard
			} );

			entity.eval = PokerEvaluator.evalHand(
				[ entity.primaryCard, entity.secondaryCard,
					this.communityCardString[ 0 ], this.communityCardString[ 1 ], this.communityCardString[ 2 ],
					this.communityCardString[ 3 ], this.communityCardString[ 4 ] ] );

			logger.debug( "[ cardDispensing ] sid : %s // seat : %s", entity.sid, entity.seat );
			logger.debug( "[ cardDispensing ] primary : %s // secondary : %s", entity.primaryCard, entity.secondaryCard );
			logger.debug( "[ cardDispensing ] eval : %s ", entity.eval );

		}
	}

	blindBet() {
		let smallBlind = this.getEntity( this.state.sbSeat );
		let bigBlind = this.getEntity( this.state.bbSeat );
		let missSb: any[] = [];
		let missBb: any[] = [];

		let sbBet = this.conf["smallBlind"];

		if ( null != smallBlind  ) {
			logger.debug( "[ blindBet ] small. seat : %s // wait : %s ", this.state.sbSeat, smallBlind.wait );
			if( smallBlind.chips > sbBet &&
				smallBlind.wait === false ) {
				smallBlind.currBet = sbBet;
				smallBlind.roundBet = sbBet;
				smallBlind.totalBet = sbBet;
				smallBlind.chips -= smallBlind.currBet;
				this.state.pot += smallBlind.currBet;

				this.potCalc.SetBet(this.state.sbSeat,smallBlind.totalBet,smallBlind.eval.value,false);
			}
			logger.debug( "[ blindBet ] smallBlind. curr bet : %s // chip : %s", smallBlind.currBet, smallBlind.chips );
		}

		if ( null != bigBlind ) {
			logger.debug( "[ blindBet ] big. seat : %s // wait : %s ", this.state.bbSeat, bigBlind.wait );
			if( bigBlind.chips > this.state.startBet &&
				bigBlind.wait === false ) {
				bigBlind.currBet = this.state.startBet;
				bigBlind.roundBet = this.state.startBet;
				bigBlind.totalBet = this.state.startBet;
				bigBlind.chips -= bigBlind.currBet;
				this.state.pot += bigBlind.currBet;

				this.potCalc.SetBet(this.state.bbSeat,bigBlind.totalBet,bigBlind.eval.value,false);
			}
			logger.debug( "[ blindBet ] bigBlind. curr bet : %s // chip : %s", bigBlind.currBet, bigBlind.chips );
		}

		//check miss button
		for( let i = 0; i < this.state.entities.length; i++ ) {
			let e = this.state.entities[ i ];
			if ( null === e || undefined === e ) {
				continue;
			}

			if ( true === e.wait) {
				continue;
			}

			if ( true === e.missSb ) {
				let val = sbBet;
				if( e.chips > val ) {
					if ( true === e.missBb ) {
						e.chips -= val;
						e.missSb = false;
						this.state.pot += val;
						missSb.push(e);

						this.potCalc.AddDeadBlind(val);
					} else {
						e.currBet = sbBet;
						e.roundBet = sbBet;
						e.totalBet = sbBet;
						e.chips -= e.currBet;
						this.state.pot += e.currBet;
						missSb.push(e);
						this.potCalc.SetBet(this.state.sbSeat,e.totalBet,e.eval.value,false);
					}
				}
			}

			if ( true === e.missBb) {
				let val = this.state.startBet;
				if( e.chips > val ) {
					e.currBet = this.state.startBet;
					e.roundBet = this.state.startBet;
					e.totalBet = this.state.startBet;
					e.chips -= e.currBet;
					e.missBb = false;
					this.state.pot += e.currBet;
					missBb.push(e);
					this.potCalc.SetBet(e.seat,e.totalBet,e.eval.value,false);
				}
			}
		}

		let player: number[] = [];
		for( let i = 0; i < this.state.entities.length; i++ ) {
			let e = this.state.entities[ i ];
			if ( null === e || undefined === e ) {
				continue;
			}

			if ( true === e.wait || true === e.isSitOut) {
				continue;
			}

			player.push(e.seat);
		}

		this.state.maxBet = this.state.startBet;
		this.state.minRaise = this.state.maxBet;

		this.broadcast( "BLIND_BET", {
			smallBlind: smallBlind, // this.state.startBet / 2,
			bigBlind: bigBlind,// this.state.startBet,
			maxBet: this.state.maxBet,
			pot: this.state.pot - this.potCalc.rakeTotal,
			missSb: missSb,
			missBb: missBb,
			player: player,
		} );
	}

	//------------------------------------
	// BET
	//------------------------------------
	setTurnBet() {
		this.state.maxBet = 0;
		for( let i = 0; i < this.state.entities.length; i++ ) {
			this.state.entities[ i ].currBet = 0;
			this.state.entities[ i ].hasAction = true;
		}
	}

	broadTurn() {
		logger.info( "============================================================" );

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
					logger.info( "[ broadTurn ] seat %s is leave. fold", entity.seat );
					let next = this.funcFold( entity.seat );
					if( false === next ) {
						return;
					}
				}

				if(true === entity.wait)
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
			logger.error( "[ broadTurn ] %s seat player is null", this.betSeat );
			return;
		}

		logger.info( "[ broadTurn ] seat : %s // player index : %s // currBet : %s // chips : %s // maxBet : %s // minRaise : %s // allin : %s",
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

			let sumChip = locE.chips + locE.currBet;

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

		logger.info( "[ broadTurn ] seat : %s // maxChip : %s", currPlayer.seat, maxChip );

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
			isLast : finishedCount == (this.state.entities.length - 1),
		} );
	}

	onCheck( client: Client, msg: any ) {
		if( eGameState.Bet !== this.state.gameState ) {
			logger.error( "[ onCheck ] INVALID CALL. seat : %s // now state : %s", msg[ "seat" ], this.state.gameState );
			return;
		}

		logger.info( "[ onCheck ] player index : %s // send msg : %s", msg[ "seat" ], msg );

		let e = this.getEntity( msg[ "seat" ] );

		if(e.fold === true){
			logger.error("onCheck - player " + msg["seat"] + " is fold but try Check");
			return;
		}

		e.hasAction = false;
		e.timeLimitCount = 0;

		this.potCalc.CalculatePot();

		this.broadcast( "CHECK", {
			seat: this.betSeat,
			pot : this.state.pot - this.potCalc.rakeTotal
		} );

		this.elapsedTick = 0;

		if( true === this.isLastTurn( this.betSeat ) ) {
			logger.info( "[ onCheck ] this is last turn" );
			this.changeCenterCardState();
			return;
		}

		this.broadTurn();
	}

	onCall( client: Client, msg: any ) {
		if( eGameState.Bet !== this.state.gameState ) {
			logger.error( "[ onCall ] INVALID CALL. seat : %s // now state : %s", msg[ "seat" ], this.state.gameState );
			return;
		}

		logger.info( "[ onCall ] player index : %s // send msg : %s", msg[ "seat" ], msg );

		// if( msg[ "betAmount" ] !== this.state.maxBet ) {
		// 	logger.error( "[ onCall ] HOW??" );
		// }

		let amount = msg["betAmount"];
		let e = this.getEntity( msg[ "seat" ] );

		if(e.fold === true){
			logger.error("onCall - player " + msg["seat"] + " is fold but try Call");
			return;
		}

		let bet = amount - e.currBet;
		let isAllIn = bet >= e.chips;
		if( true == isAllIn ) {
			e.allIn = 1;
			bet = e.chips;
			logger.info( "[ onCall ] all-in" );
		}

		e.currBet += bet;
		e.roundBet += bet;
		e.totalBet += bet;
		e.chips -= bet;
		e.hasAction = false;

		e.timeLimitCount = 0;

		this.state.pot += bet;

		this.potCalc.SetBet(e.seat, e.totalBet, e.eval.value, false);

		this.broadcast( "CALL", {
			seat: this.betSeat,
			chips: e.chips,
			bet: msg[ "betAmount" ],
			pot: this.state.pot - this.potCalc.rakeTotal,
			allin: e.allIn,
		} );

		this.elapsedTick = 0;

		if( true === this.isLastTurn( this.betSeat ) ) {
			logger.info( "[ onCall ] this is last turn" );

			if( this.checkCount() <= 1 ) {
				logger.info( "[ onCall ] round finished." );
				this.bufferTimerID = setTimeout( () => {
					this.changeState( eGameState.ShowDown );
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

	onBet( client: Client, msg: any ) {
		if( eGameState.Bet !== this.state.gameState ) {
			logger.error( "[ onBet ] INVALID CALL. seat : %s // now state : %s", msg[ "seat" ], this.state.gameState );
			return;
		}

		logger.info( "[ onBet ] player index : %s // send msg : %s", msg[ "seat" ], msg );

		if( msg[ "betAmount" ] < this.state.startBet ) {
			logger.error( "[ onBet ] bet amount is larger than startBet??" );
		}

		let e = this.getEntity( msg[ "seat" ] );
		
		if(e.fold === true){
			logger.error("onBet - player " + msg["seat"] + " is fold but try bet");
			return;
		}

		if( msg[ "betAmount" ] > e.chips ) {
			logger.error( "[ onBet ] bet > stack!!!" );
			msg[ "betAmount" ] = e.chips;
		}

		e.chips -= msg[ "betAmount" ];

		if( e.chips <= 0 ) {
			logger.info( "[ onBet ] allin" );
			e.chips = 0;
			e.allIn = 1;
		}
		e.currBet += msg[ "betAmount" ];
		e.roundBet += msg[ "betAmount" ];
		e.totalBet += msg[ "betAmount" ];

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

		this.potCalc.SetBet(e.seat, e.totalBet, e.eval.value, false);

		this.broadcast( "BET", {
			seat: this.betSeat,
			chips: e.chips,
			bet: msg[ "betAmount" ],
			pot: this.state.pot - this.potCalc.rakeTotal,
			allin: e.allIn,
		} );

		this.updateEndSeat( e.seat, true );
		this.broadTurn();

		this.elapsedTick = 0;
	}

	onRaise( client: Client, msg: any ) {
		if( eGameState.Bet !== this.state.gameState ) {
			logger.error( "[ onRaise ] INVALID RAISE. seat : %s // now state : %s", msg[ "seat" ], this.state.gameState );
			return;
		}

		let e = this.getEntity( msg[ "seat" ] );

		if(e.fold === true){
			logger.error("onRaise - player " + msg["seat"] + " is fold but try Raise");
			return;
		}

		let locBet = msg[ "betAmount" ];
		let locChangeEndSeat = false;
		logger.info( "[ onRaise ] player index : %s // send msg : %s", msg[ "seat" ], msg );

		this.state.maxBet = locBet;
		this.state.minRaise = this.state.maxBet;
		locChangeEndSeat = true;

		let bet = this.state.maxBet - e.currBet;

		if( bet >= e.chips ) {
			logger.info( "[ onRaise ] allin?? But??" );
			e.allIn = 1;
			bet = e.chips;
		}

		e.chips -= bet;
		e.currBet += bet;
		e.roundBet += bet;
		e.totalBet += bet;
		e.timeLimitCount = 0;

		this.ReOpenAction();
		e.hasAction = false;

		this.state.pot = this.state.pot + bet;

		if( e.chips <= 0 ) {
			e.chips = 0;
		}

		this.potCalc.SetBet(e.seat, e.totalBet, e.eval.value, false);

		this.broadcast( "RAISE", {
			seat: this.betSeat,
			chips: e.chips,
			bet: msg[ "betAmount" ],
			pot: this.state.pot - this.potCalc.rakeTotal,
			allin: e.allIn,
		} );

		if( this.checkCount() < 1 ) {
			logger.info( "[ onRaise ] round finished." );
			this.bufferTimerID = setTimeout( () => {
				this.changeState( eGameState.ShowDown );
			}, 500 );
			this.elapsedTick = 0;
			return;
		}

		if( locChangeEndSeat ) {
			logger.info( "[ onRaise ] max bet updated. change end seat??" );
			this.updateEndSeat( e.seat , true);
		}

		if( true === this.isLastTurn( this.betSeat ) ) {
			logger.info( "[ onRaise ] this is last turn" );

			if( this.checkCount() <= 1 ) {
				logger.info( "[ onRaise ] round finished." );
				this.bufferTimerID = setTimeout( () => {
					this.changeState( eGameState.ShowDown );
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

	onAllIn( client: Client, msg: any ) {
		if( eGameState.Bet !== this.state.gameState ) {
			logger.error( "[ onRaiseShort ] INVALID RAISE_SHORT. seat : %s // now state : %s",
				msg[ "seat" ], this.state.gameState );
			return;
		}

		let e = this.getEntity( msg[ "seat" ] );
		if(e.fold === true){
			logger.error("onAllIn - player " + msg["seat"] + " is fold but try AllIn");
			return;
		}

		let locBet = msg[ "betAmount" ];
		let locChangeEndSeat = true;
		this.state.maxBet = locBet;

		let bet = locBet - e.currBet;
		if( bet >= e.chips ) {
			e.allIn = 1;
			bet = e.chips;
		}

		e.chips -= bet;
		e.currBet += bet;
		e.roundBet += bet;
		e.totalBet += bet;
		e.hasAction = false;

		e.timeLimitCount = 0;
		
		this.state.pot = this.state.pot + bet;

		if( e.chips <= 0 ) {
			e.chips = 0;
		}

		this.potCalc.SetBet(e.seat, e.totalBet, e.eval.value, false);

		this.broadcast( "RAISE", {
			seat: this.betSeat,
			chips: e.chips,
			bet: msg[ "betAmount" ],
			pot: this.state.pot - this.potCalc.rakeTotal,
			allin: e.allIn,
		} );

		if( this.checkCount() < 1 ) {
			this.bufferTimerID = setTimeout( () => {
				this.changeState( eGameState.ShowDown );
			}, 1000 );
			this.elapsedTick = 0;
			return;
		}

		if( locChangeEndSeat ) {
			logger.info( "[ onRaise ] max bet updated. change end seat" );
			this.updateEndSeat( e.seat , false);
		}

		if( true === this.isLastTurn( this.betSeat ) ) {
			logger.info( "[ onRaise ] this is last turn" );

			if( this.checkCount() <= 1 ) {
				logger.info( "[ onRaise ] round finished." );
				this.bufferTimerID = setTimeout( () => {
					this.changeState( eGameState.ShowDown );
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

	private ReOpenAction() {
		for( let i = 0; i < this.state.entities.length; i++ ) {
			if( false === this.state.entities[ i ].fold &&
				false === this.state.entities[ i ].wait &&
				0 === this.state.entities[ i ].allIn ) {
				this.state.entities[ i ].hasAction = true;
			}
		}
	}

	private OnSitOut(client : Client, msg : any){

		let seatNumber : number = msg["seat"];

		if(null === seatNumber || undefined === seatNumber){
			logger.error(" [ OnSitOut ] Sit out Fail Seat Number is null or Undefined " + msg);
			return;
		}

		let sitOutPlayer = this.getEntity(seatNumber);

		if(null === sitOutPlayer || undefined === sitOutPlayer){
			logger.error(" [ OnSitOut ] can't find player seat number : " + seatNumber);
			return;
		}

		if(true === sitOutPlayer.isSitOut){
			logger.error(" [ OnSitOut ] the seat number " + seatNumber + " is Already sit out but try sit out Again");
			return;
		}

		sitOutPlayer.isSitOut = true;
		
		if(sitOutPlayer.wait == true){
			this.broadcast("SIT_OUT", {seat : sitOutPlayer.seat});
			this.UpdateSeatInfo();
			return;
		}

		if( this.state.gameState === eGameState.Suspend ||
			this.state.gameState === eGameState.Ready ||
			this.state.gameState === eGameState.ClearRound ){
			sitOutPlayer.wait = true;
			this.broadcast("SIT_OUT", {seat : sitOutPlayer.seat});
			this.UpdateSeatInfo();
		}
	}

	private OnSitBack(client : Client, msg : any){
		let seatNumber : number = msg["seat"];

		if(null === seatNumber || undefined === seatNumber){
			logger.error(" [ OnSitBack ] Sit out Fail SeatNumber is null or Undefined " + msg);
			return;
		}

		let sitOutPlayer = this.getEntity(seatNumber);

		if(null === sitOutPlayer || undefined === sitOutPlayer){
			logger.error(" [ OnSitBack ] can't find player seatNumber : " + seatNumber);
			return;
		}

		if(false === sitOutPlayer.isSitOut){
			logger.error(" [ OnSitBack ] the seat number " + seatNumber + " is not sit-out but try sit-back");
			return;
		}

		sitOutPlayer.isSitOut = false;
		sitOutPlayer.isSitBack = true;

		if( eGameState.Suspend === this.state.gameState ) {
			sitOutPlayer.isSitBack = false;
			sitOutPlayer.isSitOut = false;

			this.UpdateSeatInfo();
			this.broadcast("SIT_BACK", {seat : seatNumber});

			let isStart = this.checkStartCondition();
			if ( true === isStart ) {
				logger.info( "[ onSitBack ] GAME STATE TO READY" );
				this.changeState( eGameState.Ready );
			}

		} else if ( eGameState.Ready === this.state.gameState ||
			eGameState.ClearRound === this.state.gameState) {
			sitOutPlayer.isSitBack = false;
			sitOutPlayer.isSitOut = false;

			this.UpdateSeatInfo();
			this.broadcast("SIT_BACK", {seat : seatNumber});
		}
	}

	onFold( client: Client, msg: any ) {
		if( eGameState.Bet !== this.state.gameState ) {
			logger.error( "[ onFold ] INVALID CALL. seat : %s // now state : %s", msg[ "seat" ], this.state.gameState );
			return;
		}

		let e = this.getEntity(  msg[ "seat" ] );

		if(e.fold === true){
			logger.error(" onFold - player " + e.seat + " is fold but try fold");
			return;
		}

		logger.info( "[ onFold ] player index : %s // send msg : %s", msg[ "seat" ], msg );
		
		let next = this.funcFold( msg[ "seat" ] );
		if( next ) {
			this.broadTurn();
		}
		this.elapsedTick = 0;
	}

	funcFold( seat: number ) {
		let e = this.getEntity( seat );
		e.fold = true;

		this.processPendingAddChipsBySeat(e);
		e.initRoundChips = e.chips;
		this.potCalc.SetBet(e.seat, e.totalBet, e.eval.value, true);

		this.broadcast( "FOLD", {
			seat: seat
		} );

		if ( true === e.isSitOut && false === e.wait ) {
			e.wait = true;
			this.broadcast("SIT_OUT", {seat : e.seat});
			this.UpdateSeatInfo();
		}

		if( this.isAllFold() ) {
			logger.info( "[ funcFold ] all fold" );
			this.bufferTimerID = setTimeout( () => {
				this.changeState( eGameState.ShowDown );
			}, 500 );
			return false;
		}

		if( this.checkCount() < 1 ) {
			logger.info( "[ funcFold ] not player." );
			this.bufferTimerID = setTimeout( () => {
				this.changeState( eGameState.ShowDown );
			}, 500 );
			return false;
		}

		if( true === this.isLastTurn( seat ) ) {
			// logger.info( "[ funcFold ] this is last turn" );
			// this.changeCenterCardState();
			// return false;

			if( this.checkCount() <= 1 ) {
				logger.info( "[ funcFold ] this is last turn" );
				this.bufferTimerID = setTimeout( () => {
					this.changeState( eGameState.ShowDown );
				}, 1000 );
			}
			else {
				this.changeCenterCardState();
			}

			return false;
		}
		else
		{
			if(this.checkCount() <= 1 && e.currBet <= 0){
				this.bufferTimerID = setTimeout(() => {
					this.changeState(eGameState.ShowDown);
				}, 1000);

				return false;
			} 
		}

		return true;
	}

	onShowCard(client: Client, msg: any){
		let seat = msg["seat"];
		logger.info("OnShowCard - Seat : " + seat);
		if(eGameState.ShowDown != this.state.gameState){
			logger.error("OnShowCard GameState is Not ShowDown");
			return;
		}
		
		let entity = this.getEntity(seat);

		if(null == entity){
			logger.error("OnShowCard entity is null SeatNumber : " + seat);
			return;
		}
		this.broadcast( "SHOW_CARD", { seat: entity.seat, cards: entity.cardIndex } );
	}

	broadPlayerCards(isAllIn : boolean) {
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
				let winner = this.potCalc.IsWinner(this.state.entities[i].seat);
				isWinners[ this.state.entities[ i ].seat ] = winner;
				if (false === winner) {
				}
			}
		}

		this.broadcast( "PLAYER_CARDS", { allin: isAllIn, cards: cards, winners: isWinners,
		communities: this.communityCardIndex} );
	}

	private finishProc_pot(skip : boolean, isAllIn : boolean){
		
		let rakeInfo = this.potCalc.userRakeInfo;
		let pots = this.potCalc.GetPots(true);
		let winners = [];
		let folders: number[] = [];

		if (null != rakeInfo) {
			for (let i = 0; i < rakeInfo.length; i++) {
				//Rake Collect
				let element = rakeInfo[i];
				logger.info(element.seat + "  :  " + element.rake);
				
				let ent = this.state.entities.find((e) => { return e.seat == element.seat; });

				if(null == ent){
					continue;
				}

				ent.rake += element.rake;
			}
		}
		// if(pot.rakeInfo != undefined){
		// 	//Rake Exist
		// 	//logger.error("pot.RakeInfo Found : " + pot.rakeInfo.length);

		// 	for(let j = 0; j < pot.rakeInfo.length; j++){
		// 		let rakeInfo = pot.rakeInfo[j];

		// 		if(null == rakeInfo){
		// 			continue;
		// 		}

		// 		logger.error(rakeInfo.seat + "  :  " + rakeInfo.rake);
		// 	}
		// }

		for(let i = 0; i < pots.length; i++){
			let pot : any = pots[i];
			let potWinners : any[] = pot.winner;
			let potAmount = pot.rake == undefined ? pot.total : pot.total - pot.rake;
			let winAmount = potAmount / potWinners.length;

			for(let j = 0; j < potWinners.length; j++){
				let entity = this.getEntity(potWinners[j]);

				if(null === entity || undefined === entity){
					logger.error("[ finishProc_pot ] no entity Found SeatNumber : " + potWinners[j]);
					continue;
				}

				entity.chips += winAmount;
				entity.winAmount += winAmount;
				entity.winHandRank = entity.eval.handName;

				winners.push( {
					seat: entity.seat,
					cards: entity.cardIndex,
					name: entity.name,
					chips: entity.chips,
					winAmount: entity.winAmount,
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

		logger.debug("WINNERS");
		this.broadcast( "WINNERS", {
			skip: skip,
			winners: winners,
			dpPot : pots,
			cards: this.communityCardIndex,
			folders: folders,
			isAllInMatch : isAllIn
		} );

	}

	updateBetSeat( seat: number ) {
		let locSeat = seat;
		let findSeat = false;

		while( !findSeat ) {
			locSeat += 1;
			if( locSeat >= this.maxClients ) {
				locSeat = 0;
			}

			const pos = this.state.entities.findIndex( function( et ) {
				return et.seat === locSeat;
			} );

			if( pos > -1 ) {
				let entity = this.state.entities[ pos ];
				if( false === entity.fold &&
					0 === entity.allIn &&
					false === entity.wait ) {
					findSeat = true;
				}
			}
			else {
				// logger.error( "[ updateEndSeat ] why??. seat : %s", locBetSeat );
			}
		}

		return locSeat;
	}

	updateEndSeat( currBetSeat: number, reOpen: boolean ) {
		// logger.info( "[ updateEndSeat ] [ BET ] previous seat : %s // curr seat : %s", this.betSeat, currBetSeat );
		this.betSeat = currBetSeat;
		let locBetSeat: number = this.betSeat;
		let find = false;

		while( !find ) {
			locBetSeat -= 1;
			if( locBetSeat < 0 ) {
				locBetSeat = this.maxClients;// - 1;
			}

			// logger.info( "[ updateEndSeat ] loc. seat : %s ", locBetSeat );
			if( locBetSeat === this.betSeat ) {
				logger.error( "[ updateEndSeat ] what happening?!" );
				this.changeState(eGameState.ShowDown);
				break;
			}

			const idx = this.state.entities.findIndex( function( e ) {
				return e.seat === locBetSeat;
			} );

			if( idx > -1 ) {
				let entity = this.state.entities[ idx ];
				// logger.info( "[ updateEndSeat ] loc. seat : %s // entity seat : %s", locBetSeat, entity.seat );
				// logger.info( "[ updateEndSeat ] fold : %s // all-in : %s // wait : %s", entity.fold, entity.allIn, entity.wait );
				if( false === entity.fold &&
					0 === entity.allIn &&
					false === entity.wait ) {
					find = true;
				}
			}
			else {
				// logger.error( "[ updateEndSeat ] why??. seat : %s", locBetSeat );
			}
		}

		logger.info( "[ updateEndSeat ] bet seat : %s // end seat [ %s ] to [ %s ]", this.betSeat, this.endSeat, locBetSeat );
		this.endSeat = locBetSeat;
	}

	isLastTurn( seat: number ) {
		// logger.info( "[ isLastTurn ] is %s. curr turn : %s // end turn : %s.", seat === this.endSeat,
		// 	seat, this.endSeat );
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
		// logger.info( "[ isAllFold ] remain player : %s", r );
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
		logger.info( "[ checkCount ] remain player : %s", r );
		return r;
	}

	getEntity( seat: number ) {
		for( let i = 0; i < this.state.entities.length; i++ ) {
			if( seat === this.state.entities[ i ].seat ) {
				return this.state.entities[ i ];
			}
		}

		logger.error( "[ getEntity ] no entity" );
		return null;
	}

	ping() {
		this.broadcast( "ping", {} );
	}


	kickPlayer(sessionId : string, returnCode : number){
		
		if(returnCode < 4000){
			console.error("returnCode Is Already took by system please use < 4000");
			return;
		}

		logger.info("Kick Player SessionID : " + sessionId + "  returnCode : " + returnCode);

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
			logger.error( "[ kickPlayer ] entity is null" );
			return;
		}

		if (true == this.conf["private"]) {
			this._dao.updateAccountBalanceByID({
				id: runaway.id,
				//balance: runaway.balance,
				chip: runaway.chips
			}, function (err: any, res: any) {
				if (!!err) {
					logger.error("[ processLeave ] update query error : %s", err);
				}
			});
		}

		runaway.client?.leave(returnCode);
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
				name : element.fullName,
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
				publicRoomID: -1,
				id : entity.id
			}
			this._dao.updatePublicRoomID(data, (err: any, res: boolean) => {
				if (null != err) {
					logger.error(err);
				}
			});

			this._dao.publicChipOut(entity.chips, entity.id);
			entity.chips = 0;
		}

		const idx = this.state.entities.findIndex( function( e ) {
			return e.seat === entity.seat;
		});

		if( idx > -1 ) {
			this.state.entities.splice( idx, 1 );
		}
		else {
			logger.error( "[ handleEscapee ] why??. seat : %s", entity.seat);
		}

		this.UpdateSeatInfo();
	}
}