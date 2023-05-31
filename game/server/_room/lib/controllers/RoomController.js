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
exports.RoomController = void 0;
const colyseus_1 = require("colyseus");
const logger_1 = __importDefault(require("../util/logger"));
const UserController_1 = require("./UserController");
class RoomController {
    constructor() {
        this.rooms = [];
    }
    static Instance() {
        if (this.instance == null) {
            this.instance = new RoomController();
        }
        return this.instance;
    }
    InitializeRoomController(dao) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.getRoomListFromDB(dao).then((res) => {
                res.forEach((e) => {
                    let roomInfo = {
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
                    };
                    this.rooms.push(roomInfo);
                });
            }).catch((reason) => {
            });
        });
    }
    RequestMakeInstanceRoom(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let index = this.GetInstanceRoomID();
            let room = {
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
            };
            this.rooms.push(room);
            res.status(200).json({
                id: room.id,
                info: room.info,
            });
        });
    }
    RequestJoinRoom(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (null == req.body.id || null == req.body.pins) {
                res.status(400);
                res.send({ msg: "Bad Request" });
                return;
            }
            let id = req.body.id;
            let pins = req.body.pins;
            let user = yield UserController_1.UserController.Instance().GetUserInfoFromDB(req.app.get("DAO"), pins);
            if (user == undefined) {
                res.send({
                    msg: "INCORRECT_PIN_CODE"
                });
                return;
            }
            let info = this.rooms.find((e) => {
                return id == e.id;
            });
            if (info == null) {
                res.send({
                    msg: "INCORRECT_ROOM_INFO"
                });
                return;
            }
            let reservation = null;
            let size = "holdem_full";
            let room = (yield colyseus_1.matchMaker.query({ private: false, name: size, serial: info.id }));
            if (null != room && room.length > 0) {
                if (room[0].maxClients == room[0].clients) {
                    res.send({ msg: "ROOM_IS_FULL" });
                    return;
                }
            }
            reservation = yield colyseus_1.matchMaker.joinOrCreate(size, { private: false, serial: info.id });
            user.pendingSessionId = reservation.sessionId;
            user.pendingSessionTimestamp = Date.now();
            user.publicRoomID = info.id;
            yield UserController_1.UserController.Instance().UpdateUserPendingState(req.app.get("DAO"), user);
            yield UserController_1.UserController.Instance().UpdateUserRoomID(req.app.get("DAO"), user);
            const userCopy = Object.assign({}, user);
            delete userCopy.pin_code;
            res.status(200).json({
                reservation: reservation,
                user: userCopy,
                count: info.info.maxPlayers,
                info: info,
            });
        });
    }
    RequestTableList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("RequestTableList");
            let size = "holdem_full";
            let rooms = yield colyseus_1.matchMaker.query({ private: false, name: size });
            this.rooms.forEach((e) => {
            });
            res.status(200).json({
                tables: this.rooms,
            });
        });
    }
    GetInstanceRoomID() {
        let id = 7000 + this.rooms.length;
        return id;
    }
    getRoomListFromDB(dao) {
        return __awaiter(this, void 0, void 0, function* () {
            let getRoomListFromDB = new Promise((resolve, reject) => {
                dao.selectPublicRoomList((err, res) => {
                    if (err != null) {
                        logger_1.default.error("Get RoomList Error " + err);
                        reject(new colyseus_1.ServerError(400, "Bad Request"));
                        return;
                    }
                    resolve(res);
                });
            });
            return getRoomListFromDB;
        });
    }
}
exports.RoomController = RoomController;
RoomController.instance = null;
