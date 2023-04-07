import { matchMaker, Room, RoomListingData, ServerError } from "colyseus";
import logger, { emit } from "../util/logger";
import { Express, Request, response, Response } from "express";
import { HoldemRoom } from "../rooms/HoldemRoom";
import { EntityState, RoomState } from "../rooms/schema/HoldemState";
import { ClientUserData } from "./ClientUserData";

export class InstanceRoomManager {

    private static instance : InstanceRoomManager= null;
    private instanceRoomId: number = -1;

    public static Instance() : InstanceRoomManager{
        if(null == this.instance){
            this.instance = new InstanceRoomManager(60000);
        }
        return this.instance;
    }

    private rooms: any[] = [];
    private makeRequestQueue: any[] = [];
    private lastQueryTime: number = -1;

    readonly updateTerm : number = 0;

    constructor(updateTerm : number){
        this.updateTerm = updateTerm;
    }

    public async RequestMakeInstanceRoom(req : Request, res : Response){

        let roomId = 7000 + this.rooms.length + 1;
        let roomInfo: any = {
            roomId: roomId,
            info: req.body,
        };

        this.rooms.push(roomInfo);

        console.log(this.rooms);

        res.status(200).json( {
           roomId : roomId,
           info: roomInfo,
        });
    }

    public async RequestJoinInstanceRoom(req : Request, res : Response){

        if( null == req.body.roomId || null == req.body.pinCode) {
            res.status(400);
            res.send({ msg : "Bad Request"});
            return;
        }

        let roomId : number = req.body.roomId;
        let pinCode : string = req.body.pinCode;

        let userData: any = await this.getAccount( req.app.get( "DAO" ), pinCode);
        if( userData == undefined) {
            res.send({ msg : "Incorrect Pin Code."});
            return;
        }

        let roomData: any = this.rooms.find( (e)=>{
            return roomId == e.roomId;
        });

        if ( roomData == null ) {
            res.send( { msg: 'Incorrect Room Id'});
            return;
        }

        let seatReservation: matchMaker.SeatReservation = null;
        let type = 'holdem_full';
        let room = await matchMaker.query( {private: false, name: type, serial: roomId });

        seatReservation = await matchMaker.joinOrCreate( type, { private: false, serial: roomId });
        userData.pendingSessionId = seatReservation.sessionId;
        userData.pendingSessionTimestamp = Date.now();
        userData.publicRoomID = roomId;

        await this.updateAccountPendingState( req.app.get ("DAO"), userData );
        await this.updatePublicRoomID( req.app.get ("DAO"), userData );

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

