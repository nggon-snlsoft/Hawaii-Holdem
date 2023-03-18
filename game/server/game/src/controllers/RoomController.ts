import {matchMaker, RoomListingData, ServerError} from "colyseus";
import {ClientUserData} from "./ClientUserData";
import logger from "../util/logger";
import {Request, Response} from "express";
import {UserController} from "./UserController";
import {publicRoomManager} from "./publicRoomManager";
import {HoldemRoom} from "../rooms/HoldemRoom";

export class RoomController {
    private static  instance: RoomController = null;
    public static Instance(): RoomController {
        if ( this.instance == null ) {
            this.instance = new RoomController();
        }
        return  this.instance;
    }

    private rooms: any[] = [];

    public async InitializeRoomController(dao: any) {
        await this.getRoomListFromDB(dao).then((res: any[])=> {
            res.forEach( (e)=>{
                let roomInfo: any = {
                    id: e.id,
                    info: {
                        name: e.name,
                        type: 0,
                        /*
                        0: Pre Make Public Room
                        1: Instance Room (Made by User)
                        */
                        maxPlayers: e.maxPlayers,
                        betTimeLimit: e.betTimeLimit,
                        smallBlind: e.smallBlind,
                        bigBlind: e.bigBlind,
                        minStakePrice: e.minStakePrice,
                        maxStakePrice: e.maxStakePrice,
                        rake: e.rake,
                        useRakeCap: e.useRakeCap,
                        rakeCap1: e.rakeCap1,
                        rakeCap2: e.rakeCap2,
                        rakeCap3: e.rakeCap3,
                        useFlopRake: e.useFlopRake,
                        players: 0,
                    }
                }
                this.rooms.push( roomInfo );
            });
        }).catch((reason)=>{

        });
    }

    public async RequestMakeInstanceRoom( req: Request, res: Response ) {
        let index = this.GetInstanceRoomID();
        let room: any = {
            id: index,
            info: {
                maxPlayers: req.body.maxPlayers,
                betTimeLimit: req.body.betTimeLimit,
                smallBlind: req.body.smallBlind,
                bigBlind: req.body.bigBlind,
                minStakePrice: req.body.minStakePrice,
                maxStakePrice: req.body.maxStakePrice,
                rake: 1,
                useRakeCap: 0,
                rakeCap1: 0,
                rakeCap2: 0,
                rakeCap3: 0,
                useFlopRake: 0,
                players: 0,
            },
        }

        this.rooms.push( room );
        res.status(200).json({
            id: room.id,
            info: room.info,
        });
    }

    public async RequestJoinRoom(req : Request, res : Response){

        if( null == req.body.id || null == req.body.pins) {
            res.status(400);
            res.send({ msg : "Bad Request"});
            return;
        }

        let id : number = req.body.id;
        let pins : string = req.body.pins;
        let user: any = await UserController.Instance().GetUserInfoFromDB( req.app.get("DAO"), pins);
        if ( user == undefined ) {
            res.send({
                msg: "INCORRECT_PIN_CODE"
            });
            return;
        }

        let info: any = this.rooms.find( (e)=>{
            return id == e.id;
        } );

        if ( info == null ) {
            res.send( {
                msg: "INCORRECT_ROOM_INFO"
            });
            return;
        }

        let reservation: matchMaker.SeatReservation = null;
        let size: string = "holdem_full";
        let room = (await matchMaker.query({ private : false, name : size, serial : info.id }));

        if ( null != room && room.length > 0 ) {
            if ( room[0].maxClients == room[0].clients ) {
                res.send( { msg: "ROOM_IS_FULL" });
                return;
            }
        }

        reservation = await matchMaker.joinOrCreate( size, { private: false, serial: info.id});

        user.pendingSessionId = reservation.sessionId;
        user.pendingSessionTimestamp = Date.now();
        user.publicRoomID = info.id;

        await UserController.Instance().UpdateUserPendingState( req.app.get ("DAO"), user );
        await UserController.Instance().UpdateUserRoomID( req.app.get("DAO"), user);

        const userCopy = {...user};

        delete  userCopy.pin_code;

        res.status(200).json({
            reservation: reservation,
            user: userCopy,
            count: info.info.maxPlayers,
            info: info,
        });
    }

    public async RequestTableList(req : Request, res : Response) {
        console.log("RequestTableList");

        let size: string = "holdem_full";
        let rooms = await matchMaker.query( { private: false, name: size } );

        this.rooms.forEach((e)=>{

        });

        res.status(200).json({
            tables: this.rooms,
        });
    }

    private GetInstanceRoomID(): number {
        let id: number = 7000 + this.rooms.length;
        return id;
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
}