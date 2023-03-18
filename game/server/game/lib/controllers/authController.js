"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const colyseus_1 = require("colyseus");
const logger_1 = __importDefault(require("../util/logger"));
const tokenService = require("../modules/token");
const TITLE = "VanillaHoldem";
const VERSION = "0.200";
function auth(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // logger.info( "[ authController::auth ] body : %s", JSON.stringify( req.body ) );
        // if( !req.body.token  ) {
        // 	return sendError( res, "Missing token or password" );
        // }
        if (!req.body.pinCode) {
            return sendError(res, "Incorrect Pin Code.");
        }
        // const locToken = req.body.token;
        // const token = tokenService.parse( locToken );
        //const locSerial = token[ "serial" ];
        const locPin = req.body.pinCode;
        const tableSize = req.body.tableSize;
        const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        //logger.info( "[ authController::auth ] token(%s), ip(%s), tableSize(%s), serial(%s)", token, ip, tableSize, locSerial );
        //return { title: ts[0], version: ts[1], adminID: Number(ts[2]), serial: Number(ts[3]) };
        // if( TITLE != token["title"]) {
        // 	logger.warn( "[ authController::auth ] Incorrect token : title(%s, %s), pinCode(%s)", TITLE, token["title"], locPin );
        // 	return sendError( res, "Incorrect token." );
        // }
        // if( VERSION != token["version"]) {
        // 	logger.warn( "[ authController::auth ] version is not matched : version(%s, %s), pinCode(%s)", VERSION, token["version"], locPin );
        // 	return sendError( res, "Incorrect Version." );
        // }
        const userData = yield getAccount(req.app.get("DAO"), locPin);
        if (userData == undefined) {
            //logger.info( "[ authController::auth ] token(%s), pinCode(%s)", token, locPin );
            return sendError(res, "Incorrect Pin Code.");
        }
        // const roomData: any = await getRoom( req.app.get( "DAO" ), locSerial );
        const roomData = yield getRoom(req.app.get("DAO"), userData["roomID"]);
        if (roomData == undefined) {
            //logger.info( "[ authController::auth ] token(%s), pinCode(%s)", token, locPin );
            return sendError(res, "Incorrect Room Info.");
        }
        // if( userData.pendingSessionId &&
        // 	userData.pendingSessionTimestamp &&
        // 	( Date.now() - userData.pendingSessionTimestamp ) <= 30000 ) {// Wait a minimum of 30 seconds when a pending session Id currently exists
        // 	let timeLeft = ( Date.now() - userData.pendingSessionTimestamp ) / 1000;
        //
        // 	logger.error( `[ authController::auth ] Can't log in right now, try again in ${ timeLeft } seconds!` );
        // 	return sendError( res, `Can't log in right now, try again in ${ timeLeft } seconds!` );
        // }
        let seatReservation = null;
        let roomID = "short" === tableSize ? "holdem_short" : "holdem_full";
        // let room = await matchMaker.query({name : roomID, serial : locSerial});
        let room = yield colyseus_1.matchMaker.query({ name: roomID, serial: userData["roomID"] });
        if (null != room && room.length > 0) {
            logger_1.default.error("Room Found" + room + "   " + room[0].maxClients + " clinet " + room[0].clients);
            if (room[0].maxClients == room[0].clients) {
                return sendError(res, "Room is Full");
            }
        }
        // seatReservation = await matchMakeToRoom( roomID, locSerial );
        seatReservation = yield matchMakeToRoom(roomID, userData["roomID"]);
        // logger.info( "[ authController::auth ] seatReservation : %s ", JSON.stringify( seatReservation ) );
        userData.pendingSessionId = seatReservation.sessionId;
        userData.pendingSessionTimestamp = Date.now();
        yield updateAccountPendingState(req.app.get("DAO"), userData);
        // logger.info( `[ authController::auth ] update query result [ ${ updateRes } ]!` );
        const userCopy = Object.assign({}, userData);
        delete userCopy.pin_code;
        res.status(200).json({
            seatReservation: seatReservation,
            user: userCopy
        });
    });
}
exports.auth = auth;
function sendError(res, msg) {
    logger_1.default.info(`[ authController::auth ] sendError : ${msg}`);
    res.status(400).json({
        msg: msg
    });
}
function updateAccountPendingState(dao, updateData) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((res, rej) => {
            dao.updateAccountPending(updateData, function (err, result) {
                if (!!err) {
                    logger_1.default.error("[ authController::updateAccountPendingState ] query error : %s", err);
                    rej(new colyseus_1.ServerError(400, "bad access token"));
                }
                else {
                    // logger.info( "[ authController::updateAccount ] query res : %s", JSON.stringify( result ) );
                    res(result);
                }
            });
        });
    });
}
function getAccount(dao, uid) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            dao.selectAccountByUID(uid, function (err, res) {
                if (!!err) {
                    logger_1.default.error("[ authController::getAccount ] query error : %s", err);
                    reject(new colyseus_1.ServerError(400, "bad access token"));
                }
                else {
                    // logger.info( "[ authController::getAccount ] query res : %s", JSON.stringify( res[ 0 ] ) );
                    resolve(res[0]);
                }
            });
        });
    });
}
function getRoom(dao, rid) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            dao.selectRoomByUID(rid, function (err, res) {
                if (!!err) {
                    logger_1.default.error("[ authController::getRoom ] query error : %s", err);
                    reject(new colyseus_1.ServerError(400, "bad access token"));
                }
                else {
                    // logger.info( "[ authController::getAccount ] query res : %s", JSON.stringify( res[ 0 ] ) );
                    resolve(res[0]);
                }
            });
        });
    });
}
function matchMakeToRoom(room = "holdem", serial = 0) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield colyseus_1.matchMaker.joinOrCreate(room, { serial: serial });
    });
}
