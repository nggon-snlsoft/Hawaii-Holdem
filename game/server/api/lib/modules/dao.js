"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("../main");
let _client = null;
const dao = module.exports;
dao.init = function (sql) {
    _client = sql;
    return dao;
};
dao.SELECT_USER_BY_USER_ID = function (id, cb) {
    let sql = 'SELECT * FROM USERS WHERE ID = ?';
    let args = [id];
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
dao.SELECT_USERS_BY_LOGIN_ID = function (login_id, cb) {
    let sql = 'SELECT * FROM USERS WHERE LOGIN_ID = ?';
    let args = [login_id];
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
dao.UPDATE_USERS_TOKEN_LOGIN_ID = function (token, login_id, cb) {
    let sql = "UPDATE USERS SET TOKEN = ? WHERE LOGIN_ID = ? ";
    let args = [token, login_id];
    _client.query(sql, args, function (err, res) {
        if (!!err) {
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
dao.SELECT_JOINS_BY_LOGIN_ID = function (login_id, cb) {
    let sql = 'SELECT * FROM JOINS WHERE LOGIN_ID = ?';
    let args = [login_id];
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
dao.SELECT_JOINS_BY_NICKNAME = function (nickname, cb) {
    let sql = 'SELECT * FROM JOINS WHERE NICKNAME = ?';
    let args = [nickname];
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
dao.SELECT_USERS_BY_NICKNAME = function (nickname, cb) {
    let sql = 'SELECT * FROM USERS WHERE NICKNAME = ?';
    let args = [nickname];
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
dao.SELECT_USERS_BY_USER_ID_TOKEN = function (user_id, token, cb) {
    let sql = 'SELECT * FROM USERS WHERE ID = ? AND TOKEN = ? ';
    let args = [user_id, token];
    _client.query(sql, args, function (err, res) {
        if (!!err) {
            if (!!cb) {
                cb(err, null);
            }
            return;
        }
        if (res != null) {
            if (res.length > 0) {
                cb(null, true);
            }
            else {
                cb(null, false);
            }
        }
        else {
            cb(null, false);
        }
    });
};
dao.SELECT_SETTING_BY_USER_ID = function (user_id, cb) {
    let sql = 'SELECT * FROM SETTING WHERE USER_ID = ?';
    let args = [user_id];
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
dao.UPDATE_SETTING = function (user_id, setting, cb) {
    let sound = setting.sound;
    let mode = 0;
    let card = setting.card;
    let board = setting.table;
    let background = setting.background;
    let sql = "UPDATE SETTING SET SOUND = ?, MODE = ?,  CARD_TYPE = ?, BOARD_TYPE = ?, BG_TYPE = ? WHERE USER_ID = ? ";
    let args = [sound, mode, card, board, background, user_id];
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
dao.SELECT_STATICS_BY_USER_ID = function (user_id, cb) {
    let sql = 'SELECT * FROM STATICS WHERE USER_ID = ?';
    let args = [user_id];
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
dao.insertAccountForPending = function (user, cb) {
    let sql = 'INSERT INTO USERS (uid, nickname, password, transferpassword, phone, bank, holder, account, recommender, disable, alive, pending ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    let args = [user.uid, user.nickname, user.password, user.trans, user.phone, user.bank, user.holder, user.account, user.recommender, 0, 1, 1];
    _client.query(sql, args, function (err, res) {
        if (!!err) {
            if (!!cb) {
                cb(err, null);
            }
            return;
        }
        console.log(res);
        cb === null || cb === void 0 ? void 0 : cb(null, {
            code: main_1.ENUM_RESULT_CODE.SUCCESS,
        });
    });
};
dao.insertJOIN_MEMBER = function (user, cb) {
    let sql = 'INSERT INTO JOINS (login_id, store_id, nickname, password, transferpassword, phone, bank, holder, account, recommender, alive ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    let args = [user.login_id, user.store_id, user.nickname, user.password, user.transfer_password, user.phone,
        user.bank, user.holder, user.account, user.recommender, 1];
    _client.query(sql, args, function (err, res) {
        if (!!err) {
            if (!!cb) {
                cb(err, null);
            }
            return;
        }
        cb === null || cb === void 0 ? void 0 : cb(null, {
            code: main_1.ENUM_RESULT_CODE.SUCCESS,
        });
    });
};
dao.INSERT_SETTING = function (user_id, cb) {
    let sql = "INSERT INTO setting ( user_id ) values ( ? )";
    let args = [user_id];
    _client.query(sql, args, function (err, res) {
        if (!!err) {
            if (!!cb) {
                cb(err, null);
            }
            return;
        }
        if (!!res && res.affectedRows > 0) {
            cb(null, res.affectedRows);
        }
        else {
            cb(null, 0);
        }
    });
};
dao.INSERT_STATICS = (user_id, cb) => {
    let sql = "INSERT INTO STATICS(user_id) VALUES (?)";
    let args = [user_id];
    _client.query(sql, args, function (err, res) {
        if (!!err) {
            console.log('err');
            if (!!cb) {
                cb(err, null);
            }
            return;
        }
        if (!!res && res.affectedRows > 0) {
            cb(null, res.affectedRows);
        }
        else {
            cb(null, 0);
        }
    });
};
dao.UPDATE_AVATAR = function (id, avatar, cb) {
    let sql = "UPDATE USERS SET AVATAR = ? WHERE ID = ? ";
    let args = [avatar, id];
    _client.query(sql, args, function (err, res) {
        if (!!err) {
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
dao.UPDATE_POINT_TRANSFER = function (data, cb) {
    let id = data.user_id;
    let balance = data.balance;
    let point = data.point;
    let sql = "UPDATE USERS SET BALANCE = ?, POINT = ? WHERE ID = ? ";
    let args = [balance, point, id];
    _client.query(sql, args, function (err, res) {
        if (!!err) {
            cb(err, 0);
        }
        else {
            if (!!res && res.affectedRows > 0) {
                cb(null, res.affectedRows);
            }
            else {
                cb(null, 0);
            }
        }
    });
};
dao.UPDATE_TICKETS_ALIVE = function (ticket_id, cb) {
    let sql = "UPDATE TICKETS SET ALIVE = 0 WHERE ID = ? ";
    let args = [ticket_id];
    _client.query(sql, args, function (err, res) {
        if (!!err) {
            cb(err, 0);
        }
        else {
            if (!!res && res.affectedRows > 0) {
                cb(null, res.affectedRows);
            }
            else {
                cb(null, 0);
            }
        }
    });
};
dao.selectTables = function (cb) {
    let alive = 1;
    let sql = 'SELECT * FROM TABLES WHERE ALIVE = ?';
    let args = [alive];
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
dao.SELECT_STORE_BySTORE_ID = function (store_id, cb) {
    let sql = 'SELECT * FROM STORES WHERE ID = ?';
    let args = [store_id];
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
dao.SELECT_STORE_CODE_ByCODE = function (code, cb) {
    let sql = 'SELECT * FROM STORE_CODE WHERE CODE = ?';
    let args = [code];
    _client.query(sql, args, function (err, res) {
        if (!!err) {
            if (!!cb) {
                cb(err, null);
            }
            return;
        }
        if (res == null) {
            cb(null, -1);
        }
        else {
            if (res.length > 0) {
                cb(null, res[0]);
            }
            else {
                cb(null, -1);
            }
        }
    });
};
dao.SELECT_CHARGE_REQUESTS_ByUSER_ID = function (user_id, cb) {
    let sql = 'SELECT * FROM CHARGES WHERE USER_ID = ? AND ALIVE = 1';
    let args = [user_id];
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
dao.SELECT_TRANSFER_REQUEST_ByUSER_ID = function (user_id, cb) {
    let sql = 'SELECT * FROM TRANSFERS WHERE USER_ID = ? AND ALIVE = 1';
    let args = [user_id];
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
dao.SELECT_POPUPS_BySTORE_ID = function (store_id, cb) {
    let sql = 'SELECT * FROM POPUPS WHERE (STORE_ID = ? OR STORE_ID = 0) AND DISABLE = 0';
    let args = [store_id];
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
dao.SELECT_TICKETS_ByUSER_ID = function (user_id, cb) {
    let sql = 'SELECT * FROM TICKETS WHERE USER_ID = ? AND ALIVE = 1';
    let args = [user_id];
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
dao.INSERT_CHARGE_REQUEST = function (data, cb) {
    let amount = data.amount;
    let user = data.user;
    let sql = 'INSERT INTO CHARGES ( user_id, login_id, nickname, holder, amount, alive, pending ) values ( ?, ?, ?, ?, ?, ?, ? )';
    let args = [user.id, user.login_id, user.nickname, user.holder, amount, 1, 1];
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
dao.INSERT_QNA = function (user, data, cb) {
    let user_id = user.id;
    let store_id = user.store_id;
    let nickname = user.nickname;
    let title = data.title;
    let question = data.question;
    let sql = 'INSERT INTO QUESTIONS ( user_id, store_id, nickname, type, title, question, alive, pending ) values ( ?, ?, ?, ?, ?, ?, ?, ? )';
    let args = [user_id, store_id, nickname, 0, title, question, 1, 1];
    _client.query(sql, args, function (err, res) {
        if (err !== null) {
            cb(err, null);
        }
        else {
            if (!!res && res.affectedRows > 0) {
                cb(null, res.affectedRows);
            }
            else {
                cb(null, 0);
            }
        }
    });
};
dao.INSERT_TRANSFER_REQUEST = function (data, cb) {
    let value = data.value;
    let user = data.user;
    let oldBalance = user.balance;
    let newBalance = oldBalance - value;
    let sql = 'INSERT INTO TRANSFERS ( user_id, login_id, nickname, amount, oldBalance, newBalance, alive, pending ) values ( ?, ?, ?, ?, ?, ?, ?, ? )';
    let args = [user.id, user.login_id, user.nickname, value, oldBalance, newBalance, 1, 1];
    _client.query(sql, args, function (err, res) {
        if (err !== null) {
            cb(err, null);
        }
        else {
            if (!!res && res.affectedRows > 0) {
                cb(null, {
                    affected: res.affectedRows,
                    balance: newBalance,
                });
            }
            else {
                cb(null, {
                    affected: 0,
                    balance: newBalance,
                });
            }
        }
    });
};
dao.UPDATE_USER_BALANCE = function (data, cb) {
    let id = data.id;
    let value = data.newBalance;
    let sql = "UPDATE USERS SET BALANCE = ? WHERE ID = ? ";
    let args = [value, id];
    _client.query(sql, args, function (err, res) {
        if (!!err) {
            cb(err, null);
        }
        else {
            if (!!res && res.affectedRows > 0) {
                sql = 'SELECT * FROM USERS WHERE ID = ?';
                args = [id];
                _client.query(sql, args, function (err, user) {
                    if (!!err) {
                        cb(err, user);
                    }
                    else {
                        cb(null, user);
                    }
                });
            }
            else {
                cb(null, null);
            }
        }
    });
};
dao.INSERT_POINT_TRANSFER_LOG = (data, cb) => {
    let user_id = data.user_id;
    let oldPoint = data.oldPoint;
    let newPoint = data.newPoint;
    let point = data.point;
    let oldBalance = data.oldBalance;
    let newBalance = data.newBalance;
    let sql = 'INSERT INTO POINT_TRANSFERS ( user_id, oldPoint, newPoint, point, oldBalance, newBalance ) VALUES ( ?, ?, ?, ?, ?, ? )';
    let args = [user_id, oldPoint, newPoint, point, oldBalance, newBalance];
    _client.query(sql, args, function (err, res) {
        if (!!err) {
            cb(err, null);
            return;
        }
        else {
            if (!!res && res.affectedRows > 0) {
                sql = 'SELECT * FROM POINT_TRANSFERS WHERE USER_ID = ? ORDER BY createDate DESC';
                args = [user_id];
                _client.query(sql, args, function (err, logs) {
                    if (!!err) {
                        cb(err, null);
                    }
                    else {
                        cb(null, logs);
                    }
                });
            }
            else {
                cb(null, null);
            }
        }
    });
};
dao.SELECT_POINT_TRANSFER_LOG = (id, cb) => {
    let sql = 'SELECT * FROM POINT_TRANSFERS WHERE USER_ID = ? ORDER BY createDate DESC';
    let args = [id];
    _client.query(sql, args, function (err, res) {
        if (!!err) {
            cb(err, null);
            return;
        }
        else {
            console.log(res);
            if (res != null) {
                cb(null, res);
            }
            else {
                cb(null, null);
            }
        }
    });
};
dao.SELECT_POINT_RECEIVE_LOG = (user_id, cb) => {
    let sql = 'SELECT * FROM POINT_RECEIVES WHERE USER_ID = ? ORDER BY createDate DESC';
    let args = [user_id];
    _client.query(sql, args, function (err, res) {
        if (!!err) {
            cb(err, null);
            return;
        }
        else {
            if (res != null) {
                cb(null, res);
            }
            else {
                cb(null, null);
            }
        }
    });
};
dao.SELECT_QUESTIONS_ByUSER_ID = (user_id, cb) => {
    let sql = 'SELECT * FROM QUESTIONS WHERE USER_ID = ? AND ALIVE = 1 ORDER BY questionDate DESC';
    let args = [user_id];
    _client.query(sql, args, function (err, res) {
        if (!!err) {
            cb(err, null);
            return;
        }
        else {
            if (res != null) {
                cb(null, res);
            }
            else {
                cb(null, null);
            }
        }
    });
};
exports.default = dao;