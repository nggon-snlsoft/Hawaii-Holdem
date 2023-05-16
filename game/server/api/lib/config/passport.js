"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = __importDefault(require("passport-local"));
const mysql = require('../modules/sqlProxy');
const LocalStrategy = passport_local_1.default.Strategy;
class Passport {
    constructor(sql) {
        this.dao = null;
        this.sql = null;
        this.config = () => {
            passport_1.default.serializeUser((user, done) => {
                done(null, user.id);
            });
            passport_1.default.deserializeUser((id, done) => {
                let user;
                done(null, user);
            });
            passport_1.default.use(new LocalStrategy({
                usernameField: 'uid',
                passwordField: 'password'
            }, (uid, password, done) => {
                let query = 'SELECT * FROM USERS WHERE userId=? AND password=?';
                let args = [uid, password];
                this.sql.query(query, args, (err, res) => {
                    if (res == null) {
                        console.log('INCORRECT_UID');
                        return done(null, false, { message: 'INCORRECT_UID' });
                    }
                    let result = JSON.stringify(res);
                    let user = JSON.parse(result);
                    return done(null, user);
                });
            }));
        };
        this.isAuthenticated = (req, res, next) => {
            if (req.isAuthenticated()) {
                return next();
            }
            res.redirect('/');
        };
        this.sql = sql;
    }
    auth(req, res) {
        passport_1.default.authenticate('local', (err, user, info) => {
            console.log('err: ' + err);
            console.log(user);
            console.log('info: ' + info);
            if (err) {
            }
            if (!user) {
            }
            return res.json(user);
        });
    }
}
exports.default = Passport;
