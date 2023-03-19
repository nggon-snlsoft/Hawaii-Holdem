import {HoldemAdminServer} from "./main";

const server: HoldemAdminServer = new HoldemAdminServer();
server.listen(2600);


// import express, { Request, Response } from "express";
// import cors from "cors";
// import { sqlProxy } from "./module/sqlProxy";
// import process from "process"
// import exitHook from "./module/hookExit";
// import session from "express-session";
// import bodyParser from "body-parser";
// import path from "path";
// import f from "session-file-store";
//
// const port: number = 2568;
//
// const devDBInfo: any = {
//   "host": "127.0.0.1",
//   "port": "3306",
//   "database": "holdem",
//   "user": "root",
//   "pw": "root"
// };
//
// export enum ENUM_RESULT_CODE {
//   UNKNOWN_FAIL = -1,
//   SUCCESS = 0,
//   EXPIRED_SESSION = 1,
// }
//
// class App {
//   public application: express.Application;
//   public sql: sqlProxy = null;
//
//   constructor() {
//     this.application = express();
//     this.sql = new sqlProxy(devDBInfo);
//   }
//
//   public onClose() {
//     this.sql.shutDown();
//   }
// }
//
// const appObject = new App();
// const app = appObject.application;
//
// exitHook(() => {
//   appObject.onClose();
// });
//
// app.use(cors());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({
//   extended : true
// }));
//
// app.use( "/", express.static( path.join( __dirname, "static" ) ) );
// app.get("/", (req: express.Request, res: express.Response) => {
//   res.send("Hello");
// });
//
// app.post("/reqLogin", (req, res) => {
//   if(req.body == undefined){
//     res.status(400);
//     res.end();
//     return;
//   }
//
//   let code: string = req.body.code;
//   if ( code == null || code.length <= 0 ) {
//     res.status( 400 );
//     res.end();
//     return;;
//   }
//
//   res.status(200);
//
//   appObject.sql.query('SELECT * FROM ADMIN_TABLE WHERE CODE =' + code, null, (err, result) =>{
//     if(err != null){
//       res.send({ code: ENUM_RESULT_CODE.UNKNOWN_FAIL, message : "ERROR: " + err });
//       return;
//     }
//
//     if(result.length < 1){
//       //no result
//       res.send({ code:  ENUM_RESULT_CODE.UNKNOWN_FAIL, message : "ADMIN_ACCOUNT_IS_NOT_EXIST" });
//       return;
//     }
//
//     let admin : any = result[0];
//
//     appObject.sql.query("update admin_table set loginCount =" + (admin.loginCount + 1) + ", status = 1, updateDate = now() where id=" + admin.id, null ,(err, result) => {
//       if(err != null){
//         res.send({code : ENUM_RESULT_CODE.UNKNOWN_FAIL, message : "fail to update admin_table", sessionID : -1});
//         return;
//       }
//
//       res.send({code : ENUM_RESULT_CODE.SUCCESS, message : "Login Success", admin : admin });
//     });
//   });
// });
//
// const server = app.listen(port, () => { console.log("tool server initialized"); });
