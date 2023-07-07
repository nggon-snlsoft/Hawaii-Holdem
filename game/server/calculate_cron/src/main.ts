import { sqlProxy } from './modules/sqlProxy';
import dao from './modules/dao';
import exitHook from './modules/hookExit';
import ScheduleController from './controllers/ScheduleController';

const devDBInfo: any = {
    "host": "127.0.0.1",
    "port": "3306",
    "database": "holdem",
    "user": "root",
    "pw": "root"
};

// const devDBInfo: any = {
//     "host": "database-1.cleanm1dnitm.ap-northeast-1.rds.amazonaws.com",
//     "port": "3306",
//     "database": "holdem",
//     "user": "admin",
//     "pw": "admin0912"
// };

export class HoldemCalculateCronServer {

    // private _SystemController: SystemController = null;
    private _ScheduleController: ScheduleController = null;    

    private conf: any = null;
    readonly sqlClient: sqlProxy = null;

    constructor() {
        this.sqlClient = new sqlProxy(devDBInfo);
        dao.init( this.sqlClient );

        // this._SystemController = new SystemController(this.sqlClient);
        this._ScheduleController = new ScheduleController( dao );

        this.Init();
    }

    async Init(): Promise<any>{
        if ( this._ScheduleController != null ) {
            this._ScheduleController.InitSCHEDULE();            
        }
    }
}

exitHook(() => {
    console.log("server is Closing");
    console.error("OnExit");
  });

