"use strict";
let _client = null;
const dao = module.exports;
const logger = require("../util/logger");
var moment = require('moment-timezone');
//const timeZone = "America/Los_Angeles";
const timeZone = "America/New_York";
dao.init = function (sqlClient) {
    console.log("dao.init");
    _client = sqlClient;
    return dao;
};
dao.timePurchase = function (uid, adminID, roomID, name, oldBalance, balance, oldChip, chip, amount, cb) {
    let sql = "INSERT INTO time_purchase (adminID, userID, roomID, name, oldBalance, balance, oldChip, chip, amount, createDate) values ( ?,?,?,?,?,?,?,?,?,? )";
    let now = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");
    let args = [adminID, uid, roomID, name, oldBalance, balance, oldChip, chip, amount, now];
    _client.query(sql, args, function (err, res) {
        if (!!err) {
            if (!!cb) {
                cb(err, null);
            }
            return;
        }
        cb === null || cb === void 0 ? void 0 : cb(null, res);
    });
};
dao.buyIn = function (uid, adminID, roomID, name, oldBalance, balance, oldChip, chip, amount, cb) {
    let sql = "INSERT INTO buyIn_Table (adminID, userID, roomID, name, oldBalance, balance, oldChip, chip, amount, createDate) values ( ?,?,?,?,?,?,?,?,?,? )";
    let now = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");
    let args = [adminID, uid, roomID, name, oldBalance, balance, oldChip, chip, amount, now];
    _client.query(sql, args, function (err, res) {
        if (!!err) {
            if (!!cb) {
                cb(err, null);
            }
            return;
        }
        cb === null || cb === void 0 ? void 0 : cb(null, res);
    });
};
dao.selectBalanceByUID = function (uid, cb) {
    let sql = "SELECT balance FROM user_table WHERE id = ?";
    let args = [uid];
    _client.query(sql, args, function (err, res) {
        if (!!err) {
            if (!!cb) {
                cb(err, null);
            }
            return;
        }
        cb === null || cb === void 0 ? void 0 : cb(null, res);
    });
};
dao.updateBalance = function (uid, balance, cb) {
    let sql = "UPDATE user_table set balance = ?, updateDate = ? WHERE id = ?";
    let now = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");
    let args = [balance, now, uid];
    _client.query(sql, args, function (err, res) {
        if (err !== null) {
            cb(err, null);
        }
        else {
            if (!!res && res.affectedRows > 0) {
                cb(null, true);
            }
            else {
                cb(null, false);
            }
        }
    });
};
dao.updateChip = function (uid, chip, cb) {
    let sql = "UPDATE user_table set chip = ?, updateDate = ? WHERE id = ?";
    let now = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");
    let args = [chip, now, uid];
    _client.query(sql, args, function (err, res) {
        if (err !== null) {
            cb(err, null);
        }
        else {
            if (!!res && res.affectedRows > 0) {
                cb(null, true);
            }
            else {
                cb(null, false);
            }
        }
    });
};
dao.selectRoomByUID = function (uid, cb) {
    let sql = "SELECT * FROM room_table  WHERE id = ?";
    let args = [uid];
    _client.query(sql, args, function (err, res) {
        if (!!err) {
            if (!!cb) {
                cb(err, null);
            }
            return;
        }
        cb === null || cb === void 0 ? void 0 : cb(null, res);
    });
};
dao.selectAccountByUID = function (uid, cb) {
    let sql = "SELECT * FROM user_table  WHERE code = ?";
    let args = [uid];
    _client.query(sql, args, function (err, res) {
        if (!!err) {
            if (!!cb) {
                cb(err, null);
            }
            return;
        }
        cb === null || cb === void 0 ? void 0 : cb(null, res);
    });
};
dao.selectAccountByPendingID = function (pendingID, cb) {
    let sql = "SELECT * FROM user_table  WHERE pendingSessionId = ?";
    let args = [pendingID];
    _client.query(sql, args, function (err, res) {
        if (!!err) {
            if (!!cb) {
                cb(err, null);
            }
            return;
        }
        cb === null || cb === void 0 ? void 0 : cb(null, res);
    });
};
dao.updateAccountPending = function (data, cb) {
    let sql = "UPDATE user_table set pendingSessionId = ?,  pendingSessionTimestamp = ?, updateDate = ? WHERE id = ?";
    let now = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");
    let args = [data["pendingSessionId"], data["pendingSessionTimestamp"], now, data["id"]];
    _client.query(sql, args, function (err, res) {
        if (err !== null) {
            cb(err, null);
        }
        else {
            if (!!res && res.affectedRows > 0) {
                cb(null, true);
            }
            else {
                cb(null, false);
            }
        }
    });
};
dao.updateAccountBalanceByID = function (data, cb) {
    // let sql = "UPDATE user_table set balance = ?, chip = ?, activeSessionId = ? WHERE id = ?";
    // let args = [parseInt(data["balance"]), parseInt(data["chip"]), "", data["id"]];
    let sql = "UPDATE user_table set chip = ?, activeSessionId = ?, updateDate = ? WHERE id = ?";
    let now = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");
    let args = [parseInt(data["chip"]), "", now, data["id"]];
    _client.query(sql, args, function (err, res) {
        if (err !== null) {
            cb(err, null);
        }
        else {
            if (!!res && res.affectedRows > 0) {
                cb(null, true);
            }
            else {
                cb(null, false);
            }
        }
    });
};
dao.updateActiveSessionID = function (sid, cb) {
    let sql = "UPDATE user_table set activeSessionId = ?, pendingSessionId = ?, updateDate = ? WHERE pendingSessionId = ?";
    let now = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");
    let args = [sid, "", now, sid];
    _client.query(sql, args, function (err, res) {
        if (err !== null) {
            cb(err, null);
        }
        else {
            if (!!res && res.affectedRows > 0) {
                cb(null, true);
            }
            else {
                cb(null, false);
            }
        }
    });
};
