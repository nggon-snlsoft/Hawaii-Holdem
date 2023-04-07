import { matchMaker, Room, RoomListingData, ServerError } from "colyseus";
import logger, { emit } from "../util/logger";
import { Express, Request, response, Response } from "express";
import { HoldemRoom } from "../rooms/HoldemRoom";
import { EntityState, RoomState } from "../rooms/schema/HoldemState";
import { ClientUserData } from "./ClientUserData";

export class publicRoomManager{

    private static instance : publicRoomManager= null;

    public static Instance() : publicRoomManager{
        if(null == this.instance){
            console.log("construct publicRoomManager");
            this.instance = new publicRoomManager(60000);
        }

        return this.instance;
    }

    private roomInfo : any[] = [];
    private lastDBQueryTime : number = 0;
    readonly updateTerm : number = 0;

    constructor(updateTerm : number){
        this.updateTerm = updateTerm;
    }

    public async RequestRoomList(req : Request, res : Response){
        
        let timeDiff = Date.now() - this.lastDBQueryTime;
        if(timeDiff > this.updateTerm){
            let error : ServerError = null;

            await this.getRoomListFromDB(req.app.get("DAO")).then((res : any[]) => {
                this.roomInfo = res == null ? [] : res;
                publicRoomManager.Instance().lastDBQueryTime = Date.now();
            }).catch((reason) => {
                error = reason;
            });

            if (null != error) {
                res.status(error.code).json({
                    msg: error.message
                });
                return;
            }
        }

        if(this.roomInfo == null){
            res.send({msg : "fail to load RoomList"});
            return;
        }

        let rooms : RoomListingData<any>[] = await matchMaker.query({ private : false });

        //logger.info(rooms);

        //result contain 
        let result : any[] = [];

        this.roomInfo.forEach(element => {
            let roomID : number = element.id;

            let room = rooms.find((roomElement) => {return roomElement.serial == roomID});

            result.push({
                id : roomID,
                name : element.name,
                sb : element.smallBlind,
                bb : element.bigBlind,
                players : room == null ? 0 : room.clients,
                maxPlayers : element.maxPlayers,
                rule : element.type,
                useRake : element.useRake,
                rake: element.rake,
                useTimePass: element.useTimePass,
                useFlopRake: element.useFlopRake
            });
        });

        let pinCode : string = req.body.pinCode;

        let userData: any = await this.getAccount( req.app.get( "DAO" ), pinCode);
        if( userData == undefined) {
            res.send({ msg : "Incorrect Pin Code."});
            return;
        }

        let clientUserData = ClientUserData.getClientUserData(userData);

        res.status(200);
        res.send({ userData : clientUserData, result : result });
    }    

    public async RequestRoomInfo(req : Request, res : Response){
     
        if(req.body == null){
            res.status(400);
            res.send({msg : "bad Request"});
            return;
        }

        if(req.body.roomID == null){
            res.status(400);
            res.send({msg : "bad Request"});
            return;
        }

        let roomID = req.body.roomID;
        logger.info("search Room ID : " + roomID);

        let roomInfoFromDB : any = null;

        await this.getRoomInfoFromDB(req.app.get("DAO"), roomID).then((result) => {
            if(result == null || result.length < 1){
                res.status(400);
                res.send({msg : "bad Request"});
                return;
            }

            roomInfoFromDB = result[0];
        }).catch((err) => { logger.error(err);});

        if(null == roomInfoFromDB){
            return;
        }
        

        let result : any = {
            minStakePrice : roomInfoFromDB.minStakePrice,
            maxStakePrice : roomInfoFromDB.maxStakePrice,
            betTimeLimit : roomInfoFromDB.betTimeLimit,
            timePassPrice : roomInfoFromDB.timePassPrice,
            timePassTerm : roomInfoFromDB.timePassTerm,
            users : []
        };

        let room : RoomListingData<any>[] = await matchMaker.query({ private : false, serial : roomID });
        if(room != null && room.length > 0){
            let serverRoom : Room<RoomState> = await matchMaker.getRoomById(room[0].roomId);

            if(null != serverRoom){
                //gamming
                let serverRoomCast = serverRoom as HoldemRoom;
                result.users.push(...serverRoomCast.getEntitiesInfo());
            }
        }
         
        res.status(200);
        res.send({ result : result});
    }

    private async getRoomListFromDB(dao : any) : Promise<any>{
        let getRoomListFromDB = new Promise<any>((resolve, reject) => {
            dao.selectPublicRoomList((err : any, res : any[]) => {
                if(err != null){
                    logger.error("Get RoomList Error " + err);
                    reject(new ServerError(400, "Bad Request"));
                    return;
                }
    
                resolve(res);
            });
        });
    
        return getRoomListFromDB;
    }

    private async getRoomInfoFromDB(dao : any, id : number) : Promise<any>{
        let getRoomInfo = new Promise<any>((resolve, reject) => {
            dao.selectRoom(id, (err : any, res : any[]) => {
                if(err != null){
                    logger.error("Get Room Error " + err);
                    reject(new ServerError(400, "Bad Request"));
                    return;
                }

                resolve(res);
            });
        });

        return getRoomInfo;
    }

    public async RequestJoinPublicRoom(req : Request, res : Response){

        if( null == req.body.roomID || null == req.body.pinCode) {
            res.status(400);
            res.send({ msg : "Bad Request"});
            return;
        }
    
        let roomID : number = req.body.roomID;
        let pinCode : string = req.body.pinCode;

        let userData: any = await this.getAccount( req.app.get( "DAO" ), pinCode);
        if( userData == undefined) {
            res.send({ msg : "Incorrect Pin Code."});
            return;
        }
    
        let roomData: any = await this.getRoomInfoFromDB( req.app.get( "DAO" ), roomID );

        if( roomData == undefined) {
            res.send({ msg : "Incorrect Room Info."});
            return;
        }

        roomData = roomData[0];
        let seatReservation: matchMaker.SeatReservation = null;
        let gameSize = roomData["maxPlayers"] == 9 ? "holdem_full" : "holdem_short";
        let room = await matchMaker.query({private : false, name : gameSize, serial : roomID});
    
        if(null != room && room.length > 0)
        {
            logger.error("Room Found" + room + "   " + room[0].maxClients + " clinet " + room[0].clients);
            if( room[0].maxClients ==  room[0].clients){
                res.send({ msg : "Room is Full"});
                return;
            }
        }
    
        seatReservation = await matchMaker.joinOrCreate( gameSize, { private : false, serial : roomID } );
    
        userData.pendingSessionId = seatReservation.sessionId;
        userData.pendingSessionTimestamp = Date.now();
        userData.publicRoomID = roomID;
    
        await this.updateAccountPendingState( req.app.get( "DAO" ), userData );
        await this.updatePublicRoomID( req.app.get("DAO"), userData);

        const userCopy = { ...userData };
        delete userCopy.pin_code;
    
        res.status( 200 ).json( {
            seatReservation: seatReservation,
            user: userCopy,
            seatCount : roomData["maxPlayers"]
        });
    }

    private async updateAccountPendingState( dao: any, updateData: any ) {
        return new Promise( ( res, rej ) => {
            dao.updateAccountPending( updateData, function( err: any, result: any ) {
                if( !!err ) {
                    logger.error( "[ publicRoomManager::updateAccountPendingState ] query error : %s", err );
                    rej( new ServerError( 400, "bad access token" ) );
                }
                else {
                    // logger.info( "[ authController::updateAccount ] query res : %s", JSON.stringify( result ) );
                    res( result );
                }
            } );
        } );
    }

    private async updatePublicRoomID( dao : any, data : any){
        return new Promise( ( res, rej ) => {
            dao.updatePublicRoomID( data, function( err: any, result: any ) {
                if( !!err ) {
                    logger.error( "[ publicRoomManager::updatePublicRoomID ] query error : %s", err );
                    rej( new ServerError( 400, "bad access token" ) );
                }
                else {
                    // logger.info( "[ authController::updateAccount ] query res : %s", JSON.stringify( result ) );
                    res( result );
                }
            } );
        } );
    }

    private async getAccount( dao: any, uid: string ) {
        return new Promise( ( resolve, reject ) => {
            dao.selectAccountByUID( uid, function( err: any, res: any ) {
                if( !!err ) {
                    logger.error( "[ authController::getAccount ] query error : %s", err );
                    reject( new ServerError( 400, "bad access token" ) );
                }
                else {
                    // logger.info( "[ authController::getAccount ] query res : %s", JSON.stringify( res[ 0 ] ) );
                    resolve( res[ 0 ] );
                }
            } );
        } );
    }
}

