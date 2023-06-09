const logger = require( "../util/logger" );

export class HandHistoryController {
    private initHandsCount: number = 0;
    private table_id: number = 0;
    private maxClient: number = 0;
    private id: number = 0;
    private boards: string[] = [];
    private players: any[] = [];

    constructor( table_id: number, maxClient: number, initHandsCount: number  ) {
        this.table_id = table_id;
        this.initHandsCount = initHandsCount;
        this.maxClient = maxClient;
    }

    public Init() {
        console.log( 'this.table_id: ' + this.table_id  );
        console.log( 'this.initHandsCount: ' + this.initHandsCount  );
        this.id = this.initHandsCount;
    }

    private InitializePlayers() {
        this.players = [];
        for( let i = 0 ; i < this.maxClient ; i ++ ) {
            this.players.push({
                id: -1,
                nickname: '',
                seat: -1,
                hands: { primary: -1, secondary: -1 },
            });
        }
    }

    public Set( participants: any[] ) {
        this.id++;
        this.boards = [];

        //this.InitializePlayers();

        this.players = [];

        //이거 몽고DB에 저장해야겠다!!
        //시트 순서로 정렬한다
        //플레이어에 관련 정보를 넣는다.
        //핸드
        //아이디
        //닉네임
        //
    }
}