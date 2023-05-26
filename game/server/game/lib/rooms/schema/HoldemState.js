"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomState = exports.EntityState = void 0;
const schema_1 = require("@colyseus/schema");
class EntityState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.sid = "SESSION_ID";
        this.id = 0;
        this.avatar = 0;
        this.uid = "";
        this.nickname = "";
        this.chips = 0;
        this.rake = 0;
        this.wait = false;
        this.currBet = 0;
        this.roundBet = 0;
        this.fold = false;
        this.hasAction = false;
        this.allIn = 0;
        this.seat = -1;
        this.cardIndex = [];
        this.primaryCard = "";
        this.secondaryCard = "";
        this.client = null;
        this.eval = null;
        this.leave = false;
        this.winAmount = 0;
        this.winHandRank = '';
        this.enoughChip = true;
        this.balance = 0;
        this.ante = 0;
        this.totalBet = 0;
        this.waitReconnection = false;
        this.lastPingTime = -1;
        this.isSitOut = false;
        this.pendSitout = false;
        this.isSitBack = false;
        this.sitoutTimestamp = 0;
        this.timeLimitCount = 0;
        this.dealable = false;
        this.isDealer = false;
        this.isSb = false;
        this.isBb = false;
        this.isNew = false;
        this.longSitOut = false;
        this.reBuyCount = 0;
        this.pendReBuy = 0;
        this.initRoundChips = 0;
        this.tableInitChips = 0;
        this.tableBuyInAmount = 0;
        this.tableBuyInCount = 0;
        this.background = false;
        this.backgroundTimestamp = 0;
        this.statics = null;
        this.missSb = false;
        this.missBb = false;
        this.oldChips = 0;
        this.oldRake = 0;
    }
}
__decorate([
    schema_1.type("string")
], EntityState.prototype, "sid", void 0);
__decorate([
    schema_1.type("number")
], EntityState.prototype, "id", void 0);
__decorate([
    schema_1.type("number")
], EntityState.prototype, "avatar", void 0);
__decorate([
    schema_1.type("string")
], EntityState.prototype, "uid", void 0);
__decorate([
    schema_1.type("string")
], EntityState.prototype, "nickname", void 0);
__decorate([
    schema_1.type("number")
], EntityState.prototype, "chips", void 0);
__decorate([
    schema_1.type("number")
], EntityState.prototype, "rake", void 0);
__decorate([
    schema_1.type("boolean")
], EntityState.prototype, "wait", void 0);
__decorate([
    schema_1.type("number")
], EntityState.prototype, "currBet", void 0);
__decorate([
    schema_1.type("number")
], EntityState.prototype, "roundBet", void 0);
__decorate([
    schema_1.type("boolean")
], EntityState.prototype, "fold", void 0);
__decorate([
    schema_1.type("boolean")
], EntityState.prototype, "hasAction", void 0);
__decorate([
    schema_1.type("number")
], EntityState.prototype, "allIn", void 0);
__decorate([
    schema_1.type("number")
], EntityState.prototype, "seat", void 0);
__decorate([
    schema_1.type("boolean")
], EntityState.prototype, "leave", void 0);
__decorate([
    schema_1.type("number")
], EntityState.prototype, "winAmount", void 0);
__decorate([
    schema_1.type("boolean")
], EntityState.prototype, "enoughChip", void 0);
__decorate([
    schema_1.type("number")
], EntityState.prototype, "balance", void 0);
__decorate([
    schema_1.type("number")
], EntityState.prototype, "ante", void 0);
__decorate([
    schema_1.type("number")
], EntityState.prototype, "totalBet", void 0);
__decorate([
    schema_1.type("boolean")
], EntityState.prototype, "isSitOut", void 0);
__decorate([
    schema_1.type("boolean")
], EntityState.prototype, "pendSitout", void 0);
__decorate([
    schema_1.type("boolean")
], EntityState.prototype, "isSitBack", void 0);
__decorate([
    schema_1.type("boolean")
], EntityState.prototype, "dealable", void 0);
__decorate([
    schema_1.type('boolean')
], EntityState.prototype, "isDealer", void 0);
__decorate([
    schema_1.type('boolean')
], EntityState.prototype, "isSb", void 0);
__decorate([
    schema_1.type('boolean')
], EntityState.prototype, "isBb", void 0);
__decorate([
    schema_1.type("boolean")
], EntityState.prototype, "missSb", void 0);
__decorate([
    schema_1.type("boolean")
], EntityState.prototype, "missBb", void 0);
__decorate([
    schema_1.type("number")
], EntityState.prototype, "oldChips", void 0);
__decorate([
    schema_1.type("number")
], EntityState.prototype, "oldRake", void 0);
exports.EntityState = EntityState;
class RoomState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.entities = new schema_1.ArraySchema();
        this.gameState = 0;
        this.dealerSeat = -1;
        this.sbSeat = -1;
        this.bbSeat = -1;
        this.startBet = 0;
        this.maxBet = 0;
        this.minRaise = 0;
        this.shuffle = "";
        this.pot = 0;
    }
}
__decorate([
    schema_1.type([EntityState])
], RoomState.prototype, "entities", void 0);
__decorate([
    schema_1.type("int8")
], RoomState.prototype, "gameState", void 0);
__decorate([
    schema_1.type("number")
], RoomState.prototype, "dealerSeat", void 0);
__decorate([
    schema_1.type("number")
], RoomState.prototype, "sbSeat", void 0);
__decorate([
    schema_1.type("number")
], RoomState.prototype, "bbSeat", void 0);
__decorate([
    schema_1.type("number")
], RoomState.prototype, "startBet", void 0);
__decorate([
    schema_1.type("number")
], RoomState.prototype, "maxBet", void 0);
__decorate([
    schema_1.type("number")
], RoomState.prototype, "minRaise", void 0);
__decorate([
    schema_1.type("string")
], RoomState.prototype, "shuffle", void 0);
__decorate([
    schema_1.type("number")
], RoomState.prototype, "pot", void 0);
exports.RoomState = RoomState;
