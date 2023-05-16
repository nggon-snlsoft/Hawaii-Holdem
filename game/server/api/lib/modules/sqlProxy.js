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
exports.sqlProxy = void 0;
const mysql_1 = __importDefault(require("mysql"));
class sqlProxy {
    constructor(sqlConfig) {
        // sqlConfig Contain : 
        // host : string
        // port : number
        // database : string
        // user : string
        // pw : string
        this.host = "";
        this.port = -1;
        this.databaseName = "";
        this.user = "";
        this.pw = "";
        this.databasePool = null;
        this.host = sqlConfig["host"];
        this.port = sqlConfig["port"];
        this.databaseName = sqlConfig["database"];
        this.user = sqlConfig["user"];
        this.pw = sqlConfig["pw"];
        this.createPool();
        if (null == this.databasePool) {
            console.error("sqlProxy Error Create DatabasePool Failed");
            return;
        }
        console.log("SQL Pool Initialized");
    }
    createPool() {
        try {
            this.databasePool = mysql_1.default.createPool({
                host: this.host,
                port: this.port,
                database: this.databaseName,
                user: this.user,
                password: this.pw,
                connectionLimit: 100,
                waitForConnections: true,
                dateStrings: true
            });
        }
        catch (e) {
            console.error("Create DB Pool Error e : " + e);
            console.error("info host : " + this.host + " databaseName : " + this.databaseName + " user : " + this.user + " pw : " + this.pw);
            return;
        }
        this.databasePool.on("enqueue", () => {
            console.warn(" database waiting for available connection slot");
        });
    }
    query(sql, args, callback) {
        this.databasePool.getConnection((error, connection) => {
            if (error != null) {
                callback(error, null);
            }
            connection.query(sql, args, (error, result) => {
                connection.release();
                callback(error, result);
            });
        });
    }
    queryAsync(sql, args, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            let promise = new Promise((resolve, reject) => {
                this.databasePool.getConnection((error, connection) => {
                    if (error != null) {
                        callback(error, null);
                        resolve(false);
                    }
                    connection.query(sql, args, (error, result) => {
                        connection.release();
                        callback(error, result);
                        resolve(true);
                    });
                });
            });
            return promise;
        });
    }
    shutDown() {
        console.log("SQL Proxy shutdown");
        this.databasePool.end((error) => {
            console.error("Database Pool End Error : " + error);
        });
    }
}
exports.sqlProxy = sqlProxy;
