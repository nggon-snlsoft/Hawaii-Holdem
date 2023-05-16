"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.TableController = void 0;
const express_1 = __importDefault(require("express"));
const main_1 = require("../main");
const request = __importStar(require("superagent"));
class TableController {
    constructor(sql, info) {
        this.router = null;
        this.devServerInfo = null;
        this.serverPrefix = '';
        this.router = express_1.default.Router();
        this.devServerInfo = info;
        this.sql = sql;
        this.initRouter();
        this.serverPrefix = 'http://' + this.devServerInfo.host + ':' + this.devServerInfo.port + '/';
        console.log('TABLE_CONTROLLER_INITIALIZED');
    }
    initRouter() {
        this.router.post('/getTables', this.getTableList.bind(this));
    }
    getTableList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('testFunction');
            yield this.HttpPostToServer('users/test', {
                id: 1,
                password: 2,
            }, (res) => {
                console.log(res);
            }, (err) => {
                console.log(err);
            });
        });
    }
    HttpPostToServer(url, body, onSuccess, onFail) {
        return __awaiter(this, void 0, void 0, function* () {
            let fullUrl = this.serverPrefix + url;
            yield request.post(fullUrl).send(body)
                .then((result) => {
                if (onSuccess != null) {
                    onSuccess(result.body);
                }
            }).catch((err) => {
                if (onFail != null) {
                    onFail(err);
                }
            });
        });
    }
    // public async getTableList( req: any, res: any ) {
    //     let tables: any = await this.getAllTables( req.app.get('DAO'));
    //     if ( tables == undefined) {
    //         res.status( 200 ).json({
    //             code: ENUM_RESULT_CODE.UNKNOWN_FAIL,
    //             msg: 'NO_TABLES',
    //         });
    //         return;
    //     }
    //     let _tables: any[] = [];
    //     for ( let i = 0 ; i < tables.length; i++ ) {
    //         if ( tables[i].alive == 1 && tables[i].disable == 0 ) {
    //             let t = ClientUserData.getClientRoomData(tables[i]);
    //             _tables.push(t);
    //         }
    //     }
    //     res.status( 200 ).json({
    //         code: ENUM_RESULT_CODE.SUCCESS,
    //         tables: _tables,
    //         msg: 'SUCCESS',
    //     });
    // }
    getAllTables(dao) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                dao.selectTables(function (err, res) {
                    if (!!err) {
                        console.log('getAllTables');
                        reject({
                            code: main_1.ENUM_RESULT_CODE.UNKNOWN_FAIL,
                            msg: 'BAD_ACCESS_TOKEN'
                        });
                    }
                    else {
                        resolve(res);
                    }
                });
            });
        });
    }
}
exports.TableController = TableController;
exports.default = TableController;
