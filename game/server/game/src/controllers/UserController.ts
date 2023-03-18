import {matchMaker, RoomListingData, ServerError} from "colyseus";
import {ClientUserData} from "./ClientUserData";
import logger from "../util/logger";
import {Request, Response} from "express";

export class UserController {
    private static  instance: UserController = null;
    public static Instance(): UserController {
        if ( this.instance == null ) {
            this.instance = new UserController();
        }
        return  this.instance;
    }

    public async GetUserInfoFromDB( dao: any, uid: string ) {
        return new Promise( ( resolve, reject ) => {
            dao.selectAccountByUID( uid, function( err: any, res: any ) {
                if( !!err ) {
                    reject( new ServerError( 400, "bad access token" ) );
                }
                else {
                    resolve( res[ 0 ] );
                }
            } );
        } );
    }

    public async UpdateUserPendingState( dao: any, updateData: any ) {
        return new Promise( ( res, rej ) => {
            dao.updateAccountPending( updateData, function( err: any, result: any ) {
                if( !!err ) {
                    rej( new ServerError( 400, "bad access token" ) );
                }
                else {
                    res( result );
                }
            } );
        } );
    }

    public async UpdateUserRoomID( dao : any, data : any){
        return new Promise( ( res, rej ) => {
            dao.updatePublicRoomID( data, function( err: any, result: any ) {
                if( !!err ) {
                    rej( new ServerError( 400, "bad access token" ) );
                }
                else {
                    res( result );
                }
            } );
        } );
    }
}