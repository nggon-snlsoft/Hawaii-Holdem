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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesReport = void 0;
class SalesReport {
    constructor(dao) {
        this.dao = null;
        this.dao = dao;
    }
    UpdateUser(dao, participants, rakeBackPercentage) {
        return __awaiter(this, void 0, void 0, function* () {
            if (participants == null) {
                return;
            }
            for (let i = 0; i < participants.length; i++) {
                let id = participants[i].id;
                let win = participants[i].win;
                let betting = participants[i].totalBet;
                let rolling = participants[i].roundBet;
                let rake = participants[i].rake;
                let rake_back = Math.trunc(rolling * rakeBackPercentage);
                participants[i].rolling += rolling;
                participants[i].rake_back += rake_back;
                participants[i].roundBet = 0;
                let affected = null;
                try {
                    affected = yield this.UPDATE_USERS_BETTINGS(dao, {
                        id: id,
                        win: win,
                        betting: betting,
                        rolling,
                        rake: rake,
                        rake_back: rake_back
                    });
                }
                catch (error) {
                    console.log(error);
                }
            }
        });
    }
    UpdateReportByUser(dao, participants) {
        return __awaiter(this, void 0, void 0, function* () {
            if (participants == null || participants.length == 0) {
                return;
            }
            let now = new Date();
            let date = this.GetReportDate(now);
            if (participants == null) {
                return;
            }
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
                    console.log(error);
                }
                let user_id = participants[i].id;
                let store_id = participants[i].store_id;
                let distributor_id = participants[i].distributor_id;
                let partner_id = participants[i].partner_id;
                let wins = participants[i].win;
                let bettings = participants[i].totalBet;
                let rollings = participants[i].rolling;
                let rake_back = participants[i].rake_back;
                let point = rake_back;
                let rakes = 0;
                if (participants[i].rake != null) {
                    rakes = participants[i].rake;
                }
                if (row != null) {
                    let index = row.id;
                    let affected = null;
                    try {
                        affected = yield this.UpdateSalesUserInfo(dao, {
                            index: index,
                            bettings: bettings,
                            wins: wins,
                            rollings: rollings,
                            rake_back: rake_back,
                            rakes: rakes,
                            point: point,
                        });
                    }
                    catch (error) {
                        console.log(error);
                    }
                }
                else {
                    let affected = null;
                    try {
                        affected = yield this.CreateSalesUserInfo(dao, {
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
                            date: date,
                        });
                    }
                    catch (error) {
                        console.log(error);
                    }
                }
            }
        });
    }
    UpdateReportByTable(dao, participants, table_id) {
        return __awaiter(this, void 0, void 0, function* () {
            let now = new Date();
            let date = this.GetReportDate(now);
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
                console.log(error);
            }
            if (row != null) {
                let index = row.id;
                let affected = null;
                try {
                    affected = yield this.UpdateSalesTableInfo(dao, {
                        id: index,
                        bettings: bettings,
                        rakes: rakes,
                    });
                }
                catch (error) {
                    console.log(error);
                }
            }
            else {
                let affected = null;
                try {
                    affected = yield this.CreateSalesTableInfo(dao, {
                        table_id: table_id,
                        store_id: 0,
                        rakes: rakes,
                        bettings: bettings,
                        date: date,
                    });
                }
                catch (error) {
                    console.log(error);
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
    GetReportDate(date) {
        let timestamp = Number(date);
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        return {
            timestamp: timestamp,
            year: year,
            month: month,
            day: day
        };
    }
}
exports.SalesReport = SalesReport;
