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
exports.SalesReport = void 0;
const logger_1 = __importDefault(require("../util/logger"));
const moment = require('moment');
const timeZone = 'Asia/Tokyo';
class SalesReport {
    constructor(dao, tableid) {
        this.dao = null;
        this.tableid = '';
        this.dao = dao;
        this.tableid = tableid;
    }
    UpdateUser(dao, participants, rakePercentage) {
        return __awaiter(this, void 0, void 0, function* () {
            if (participants == null) {
                return;
            }
            let totalPotRake = 0;
            let totalRollingRake = 0;
            for (let i = 0; i < participants.length; i++) {
                let id = participants[i].id;
                let win = participants[i].win;
                let betting = participants[i].totalBet;
                let rolling = participants[i].roundBet;
                let rake = participants[i].rake;
                let rake_back_rate = participants[i].rake_back_rate;
                let rake_back = Math.trunc(rolling * rake_back_rate);
                let rolling_rake = Math.trunc(rolling * rakePercentage) - rake_back;
                participants[i].rolling += rolling;
                participants[i].rolling_rake += rolling_rake;
                participants[i].rake_back += rake_back;
                participants[i].roundBet = 0;
                totalPotRake += participants[i].rake;
                totalRollingRake += participants[i].rolling_rake;
                let res = 'id: ' + id.toString() + ' ,rake_back_rate: ' + participants[i].rake_back_rate.toString() + ' ,rake_back: ' + participants[i].rake_back.toString();
                logger_1.default.info(this.tableid + '[RAKE] rake info %s', res);
                let affected = null;
                try {
                    affected = this.UPDATE_USERS_BETTINGS(dao, {
                        id: id,
                        win: win,
                        betting: betting,
                        rolling: rolling,
                        rake: rake,
                        rake_back: rake_back,
                        rolling_rake: rolling_rake
                    });
                }
                catch (error) {
                    console.log(this.tableid + error);
                }
            }
            if (Math.abs(totalPotRake - totalRollingRake) > 10) {
                let err = 'pot rake: ' + totalPotRake.toString() + ' / rolling rake: ' + totalRollingRake.toString();
                logger_1.default.error(this.tableid + '[RAKE] diff rake %s', err);
            }
            else {
                let err = 'pot rake: ' + totalPotRake.toString() + ' / rolling rake: ' + totalRollingRake.toString();
                logger_1.default.error(this.tableid + '[RAKE] rake %s', err);
            }
        });
    }
    UpdateReportByUser(dao, participants) {
        return __awaiter(this, void 0, void 0, function* () {
            if (participants == null || participants.length == 0) {
                return;
            }
            let date = this.GetReportDate();
            for (let i = 0; i < participants.length; i++) {
                let id = participants[i].id;
                let row = null;
                try {
                    row = yield this.GetSalesUserFromDB(dao, {
                        id: id,
                        date: date,
                    });
                }
                catch (error) {
                    console.log(this.tableid + error);
                }
                let user_id = participants[i].id;
                let store_id = participants[i].store_id;
                let distributor_id = participants[i].distributor_id;
                let partner_id = participants[i].partner_id;
                let wins = participants[i].win;
                let bettings = participants[i].totalBet;
                let rollings = participants[i].rolling;
                let rake_back = participants[i].rake_back;
                let rolling_rake = participants[i].rolling_rake;
                let point = rake_back;
                let rakes = 0;
                if (participants[i].rake != null) {
                    rakes = participants[i].rake;
                }
                if (row != null) {
                    let index = row.id;
                    let affected = null;
                    try {
                        affected = this.UpdateSalesUserInfo(dao, {
                            index: index,
                            bettings: bettings,
                            wins: wins,
                            rollings: rollings,
                            rake_back: rake_back,
                            rakes: rakes,
                            point: point,
                            rolling_rake: rolling_rake
                        });
                    }
                    catch (error) {
                        console.log(this.tableid + error);
                    }
                }
                else {
                    let affected = null;
                    try {
                        affected = this.CreateSalesUserInfo(dao, {
                            user_id: user_id,
                            store_id: store_id,
                            distributor_id: distributor_id,
                            partner_id: partner_id,
                            bettings: bettings,
                            wins: wins,
                            rakes: rakes,
                            rollings: rollings,
                            rake_back: rake_back,
                            point: point,
                            rolling_rake: rolling_rake,
                            date: date,
                        });
                    }
                    catch (error) {
                        console.log(this.tableid + error);
                    }
                }
            }
        });
    }
    UpdateReportByTable(dao, participants, table_id) {
        return __awaiter(this, void 0, void 0, function* () {
            let date = this.GetReportDate();
            let rakes = 0;
            let bettings = 0;
            if (participants == null) {
                return;
            }
            participants.forEach((player) => {
                bettings += player.totalBet;
                rakes += player.rake;
            });
            let row = null;
            try {
                row = yield this.GetSalesTableFromDB(dao, {
                    table_id: table_id,
                    date: date,
                });
            }
            catch (error) {
                console.log(this.tableid + error);
            }
            if (row != null) {
                let index = row.id;
                let affected = null;
                try {
                    affected = this.UpdateSalesTableInfo(dao, {
                        id: index,
                        bettings: bettings,
                        rakes: rakes,
                    });
                }
                catch (error) {
                    console.log(this.tableid + error);
                }
            }
            else {
                let affected = null;
                try {
                    affected = this.CreateSalesTableInfo(dao, {
                        table_id: table_id,
                        store_id: 0,
                        rakes: rakes,
                        bettings: bettings,
                        date: date,
                    });
                }
                catch (error) {
                    console.log(this.tableid + error);
                }
            }
        });
    }
    GetSalesUserFromDB(dao, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.SELECT_SALES_USER(data, (err, res) => {
                    if (err != null) {
                        reject(err);
                        return;
                    }
                    resolve(res);
                });
            });
        });
    }
    CreateSalesUserInfo(dao, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.INSERT_SALES_USER(data, (err, res) => {
                    if (err != null) {
                        reject(err);
                        return;
                    }
                    resolve(res);
                });
            });
        });
    }
    UPDATE_USERS_BETTINGS(dao, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.UPDATE_USERS_BETTINGS(data, (err, res) => {
                    if (err != null) {
                        reject(err);
                        return;
                    }
                    resolve(res);
                });
            });
        });
    }
    UpdateSalesUserInfo(dao, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.UPDATE_SALES_USER(data, (err, res) => {
                    if (err != null) {
                        reject(err);
                        return;
                    }
                    resolve(res);
                });
            });
        });
    }
    GetSalesTableFromDB(dao, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.SELECT_SALES_TABLE(data, (err, res) => {
                    if (err != null) {
                        reject(err);
                        return;
                    }
                    resolve(res);
                });
            });
        });
    }
    CreateSalesTableInfo(dao, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.INSERT_SALES_TABLE(data, (err, res) => {
                    if (err != null) {
                        reject(err);
                        return;
                    }
                    resolve(res);
                });
            });
        });
    }
    UpdateSalesTableInfo(dao, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.UPDATE_SALES_TABLE(data, (err, res) => {
                    if (err != null) {
                        reject(err);
                        return;
                    }
                    resolve(res);
                });
            });
        });
    }
    GetReportDate() {
        moment().tz(timeZone);
        let timestamp = moment().format('x');
        let year = moment().format('YYYY');
        let month = moment().format('M');
        let day = moment().format('D');
        return {
            timestamp: timestamp,
            year: year,
            month: month,
            day: day
        };
    }
}
exports.SalesReport = SalesReport;
