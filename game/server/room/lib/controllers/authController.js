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
exports.cancelRejoin = exports.getPrivateRoomInfo = exports.joinPrivateRoom = exports.isReconnecting = exports.updateUserSetting = exports.updateUserAvatar = exports.getPlayerProfile = exports.getUserInfoByDB = exports.setting = exports.auth = exports.test = void 0;
const colyseus_1 = require("colyseus");
const logger_1 = __importDefault(require("../util/logger"));
const ClientUserData_1 = require("./ClientUserData");
const conf = require("../config/roomConf");
const gameConf = require('../config/gameConf.json');
const tokenService = require("../modules/token");
const TITLE = "VanillaHoldem";
const VERSION = "0.200";
function test(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('test');
        console.log(req.body);
        res.status(200).json('ok');
    });
}
exports.test = test;
function auth(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!req.body.pinCode) {
            return sendError(res, "Incorrect Pin Code.");
        }
        const locPin = req.body.pinCode;
        const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        const userData = yield getAccount(req.app.get("DAO"), locPin);
        if (userData == undefined) {
            return sendError(res, "Incorrect Pin Code.");
        }
        let clientUserData = ClientUserData_1.ClientUserData.getClientUserData(userData);
        let result = {
            user: clientUserData,
            game: gameConf['game'],
        };
        let useLog = conf["full"].useLog;
        result.useLog = useLog;
        yield isReconnecting(userData.id, userData.publicRoomID, userData.roomID).then((reconnectInfo) => {
            if (reconnectInfo.isPublicReconnecting == true) {
                result.roomID = userData.publicRoomID;
                result.isPublic = true;
                return;
            }
            if (reconnectInfo.isPrivateReconnecing == true) {
                result.roomID = userData.roomID;
                result.isPublic = false;
                return;
            }
        });
        res.status(200).json(result);
    });
}
exports.auth = auth;
function setting(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!req.body.uuid) {
            return sendError(res, "INCORRECT_UUID");
        }
        const uuid = req.body.uuid;
        const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        let userSetting = yield getSetting(req.app.get('DAO'), uuid);
        if (userSetting == undefined) {
            const r = yield insertUserSetting(req.app.get('DAO'), uuid);
            userSetting = yield getSetting(req.app.get('DAO'), uuid);
            if (userSetting == undefined) {
                console.log('NO_DATA??');
                return sendError(res, "INCORRECT_USER_SETTING");
            }
        }
        let clientSettingData = ClientUserData_1.ClientUserData.getClientSettingData(userSetting);
        let result = {
            setting: clientSettingData,
        };
        res.status(200).json(result);
    });
}
exports.setting = setting;
function getUserInfoByDB(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.body.uuid == null || req.body.pin == null) {
            return sendError(res, 'INCORRECT_USER_INFO');
        }
        let uuid = req.body.uuid;
        let pin = req.body.pin;
        const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        console.log(ip);
        const userInfo = yield getAccount(req.app.get("DAO"), pin);
        if (userInfo == undefined) {
            return sendError(res, "INCORRECT_PIN_CODE");
        }
        let _userInfo = ClientUserData_1.ClientUserData.getClientUserData(userInfo);
        const userSetting = yield getSetting(req.app.get('DAO'), uuid);
        if (userSetting == undefined) {
            return sendError(res, "INCORRECT_USER_SETTING");
        }
        let _userSetting = ClientUserData_1.ClientUserData.getClientSettingData(userSetting);
        let result = {
            info: _userInfo,
            setting: _userSetting
        };
        res.status(200).json(result);
    });
}
exports.getUserInfoByDB = getUserInfoByDB;
function getPlayerProfile(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.body.uuid == null) {
            return sendError(res, 'INCORRECT_USER_INFO');
        }
        let uuid = req.body.uuid;
        const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        const profile = yield getAccountByIndex(req.app.get("DAO"), uuid);
        if (profile == undefined) {
            return sendError(res, "INCORRECT_PIN_CODE");
        }
        let _profile = ClientUserData_1.ClientUserData.getClientUserData(profile);
        let result = {
            profile: _profile,
        };
        res.status(200).json(result);
    });
}
exports.getPlayerProfile = getPlayerProfile;
function updateUserAvatar(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!req.body.uuid) {
            return sendError(res, "INCORRECT_UUID");
        }
        if (!req.body.avatar) {
            return sendError(res, "INCORRECT_AVATAR");
        }
        const uuid = req.body.uuid.toString();
        const avatar = req.body.avatar.toString();
        const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        yield setUserAvatar(req.app.get("DAO"), uuid, avatar);
        const userInfo = yield getAccountByIndex(req.app.get('DAO'), uuid);
        if (userInfo == undefined) {
            return sendError(res, "INCORRECT_USER_Info");
        }
        let clientUserData = ClientUserData_1.ClientUserData.getClientUserData(userInfo);
        let result = {
            user: clientUserData,
        };
        res.status(200).json(result);
    });
}
exports.updateUserAvatar = updateUserAvatar;
function updateUserSetting(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!req.body.uuid) {
            return sendError(res, "INCORRECT_UUID");
        }
        if (!req.body.setting) {
            return sendError(res, "INCORRECT_SETTING");
        }
        const uuid = req.body.uuid.toString();
        const setting = req.body.setting;
        const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        yield setUserSetting(req.app.get("DAO"), uuid, setting);
        const userSetting = yield getSetting(req.app.get('DAO'), uuid);
        if (userSetting == undefined) {
            return sendError(res, "INCORRECT_USER_SETTING");
        }
        let clientSettingData = ClientUserData_1.ClientUserData.getClientSettingData(userSetting);
        let result = {
            setting: clientSettingData,
        };
        res.status(200).json(result);
    });
}
exports.updateUserSetting = updateUserSetting;
function isReconnecting(userID, publicRoomID, privateRoomID) {
    return __awaiter(this, void 0, void 0, function* () {
        let resultObj = {
            isPublicReconnecting: false,
            isPrivateReconnecing: false
        };
        return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
            if (-1 != publicRoomID) {
                let room = yield colyseus_1.matchMaker.query({ private: false, serial: publicRoomID });
                if (room != null && room.length > 0) {
                    let serverRoom = yield colyseus_1.matchMaker.getRoomById(room[0].roomId);
                    if (null != serverRoom) {
                        //gamming
                        let serverRoomCast = serverRoom;
                        let publicReconnecting = serverRoomCast.isUserReconnecting(userID);
                        if (publicReconnecting == true) {
                            resultObj.isPublicReconnecting = true;
                            res(resultObj);
                            return;
                        }
                    }
                }
            }
            if (-1 != privateRoomID) {
                let room = yield colyseus_1.matchMaker.query({ private: true, serial: privateRoomID });
                if (room != null && room.length > 0) {
                    let serverRoom = yield colyseus_1.matchMaker.getRoomById(room[0].roomId);
                    if (null != serverRoom) {
                        let serverRoomCast = serverRoom;
                        let privaterReconnecting = serverRoomCast.isUserReconnecting(userID);
                        if (privaterReconnecting == true) {
                            resultObj.isPrivateReconnecing = true;
                            res(resultObj);
                            return;
                        }
                    }
                }
            }
            res(resultObj);
        }));
    });
}
exports.isReconnecting = isReconnecting;
function joinPrivateRoom(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (null == req.body.pinCode) {
            return sendError(res, "Incorrect Pin Code.");
        }
        let pinCode = req.body.pinCode;
        let userData = yield getAccount(req.app.get("DAO"), pinCode);
        if (userData == undefined) {
            return sendError(res, "Incorrect Pin Code.");
        }
        const roomData = yield getRoom(req.app.get("DAO"), userData["roomID"]);
        if (roomData == undefined) {
            return sendError(res, "Incorrect Room Info.");
        }
        let seatReservation = null;
        let roomID = roomData["maxPlayers"] == 9 ? "holdem_full" : "holdem_short";
        let room = yield colyseus_1.matchMaker.query({ private: true, name: roomID, serial: userData["roomID"] });
        if (null != room && room.length > 0) {
            // logger.error("Room Found" + room + "   " + room[0].maxClients + " clinet " + room[0].clients);
            if (room[0].maxClients == room[0].clients) {
                return sendError(res, "Room is Full");
            }
        }
        seatReservation = yield matchMakeToRoom(roomID, userData["roomID"]);
        userData.pendingSessionId = seatReservation.sessionId;
        userData.pendingSessionTimestamp = Date.now();
        yield updateAccountPendingState(req.app.get("DAO"), userData);
        const userCopy = Object.assign({}, userData);
        delete userCopy.pin_code;
        res.status(200).json({
            seatReservation: seatReservation,
            user: userCopy,
            seatCount: roomData["maxPlayers"]
        });
    });
}
exports.joinPrivateRoom = joinPrivateRoom;
function getPrivateRoomInfo(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (null == req.body.pinCode) {
            return sendError(res, "Incorrect Pin Code.");
        }
        let pinCode = req.body.pinCode;
        let userData = yield getAccount(req.app.get("DAO"), pinCode);
        if (userData == undefined) {
            return sendError(res, "Incorrect Pin Code.");
        }
        const roomData = yield getRoom(req.app.get("DAO"), userData["roomID"]);
        if (roomData == undefined) {
            return sendError(res, "Incorrect Room Info.");
        }
        let users = [];
        let room = yield colyseus_1.matchMaker.query({ private: true, serial: userData["roomID"] });
        if (room != null && room.length > 0) {
            let serverRoom = yield colyseus_1.matchMaker.getRoomById(room[0].roomId);
            if (null != serverRoom) {
                let serverRoomCast = serverRoom;
                users.push(...serverRoomCast.getEntitiesInfo());
            }
        }
        res.status(200).json({
            result: roomData,
            users: users
        });
    });
}
exports.getPrivateRoomInfo = getPrivateRoomInfo;
function cancelRejoin(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let roomID = req.body.roomID;
        let pin = req.body.pin;
        const userData = yield getAccount(req.app.get("DAO"), pin);
        if (userData == undefined) {
            res.status(200).json({});
            return;
        }
        //{ private: false, serial: publicRoomID private : true,
        let rooms = yield colyseus_1.matchMaker.query({ serial: roomID });
        let room = null;
        if (rooms == null || rooms.length < 1) {
            // rooms = await matchMaker.query({ private : true, serial: roomID });
            // if(rooms == null || rooms.length < 1)
            console.error("no Room number : " + roomID);
            res.status(200).json({});
            return;
        }
        room = rooms[0];
        let serverRoom = yield colyseus_1.matchMaker.getRoomById(room.roomId);
        if (null == serverRoom) {
            console.error("no server room : " + room.roomId);
            res.status(200).json({});
            return;
        }
        let serverRoomCast = serverRoom;
        serverRoomCast.cancelRejoin(userData.id);
        res.status(200).json({});
    });
}
exports.cancelRejoin = cancelRejoin;
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
function setUserAvatar(dao, uuid, avatar) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((res, rej) => {
            dao.updateAvatarType(uuid, avatar, function (err, result) {
                if (!!err) {
                    rej(new colyseus_1.ServerError(400, "BAD_ACCESS_TOKEN"));
                }
                else {
                    res(result);
                }
            });
        });
    });
}
function setUserSetting(dao, uuid, setting) {
    return __awaiter(this, void 0, void 0, function* () {
        let value = setting;
        return new Promise((res, rej) => {
            dao.updateSetting(uuid, value, function (err, result) {
                if (!!err) {
                    rej(new colyseus_1.ServerError(400, "BAD_ACCESS_TOKEN"));
                }
                else {
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
                    resolve(res[0]);
                }
            });
        });
    });
}
function getAccountByIndex(dao, uid) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            dao.selectAccountByIndex(uid, function (err, res) {
                if (!!err) {
                    logger_1.default.error("[ authController::getAccount ] query error : %s", err);
                    reject(new colyseus_1.ServerError(400, "bad access token"));
                }
                else {
                    resolve(res[0]);
                }
            });
        });
    });
}
function getSetting(dao, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            dao.selectSettingByUUID(uuid, function (err, res) {
                if (!!err) {
                    logger_1.default.error("[ authController::getSetting ] query error : %s", err);
                    reject(new colyseus_1.ServerError(400, "bad access token"));
                }
                else {
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
function insertUserSetting(dao, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            dao.insertUserSetting(uuid, function (err, res) {
                if (!!err) {
                    reject(new colyseus_1.ServerError(400, "BAD_ACCESS_TOKEN"));
                }
                else {
                    resolve(res);
                }
            });
        });
    });
}
function matchMakeToRoom(room = "holdem", serial = 0) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield colyseus_1.matchMaker.joinOrCreate(room, { private: true, serial: serial });
    });
}
