const logger = require( "../util/logger" );

export class HandHistoryController {
    private initHandsCount: number = 0;
    private table_id: number = 0;
    private maxClient: number = 0;
    private id: number = 0;
    private hands: number = 0;
    private boards: string[] = [];
    private players: any[] = [];

    constructor( table_id: number, maxClient: number, initHandsCount: number  ) {
        this.table_id = table_id;
        this.initHandsCount = initHandsCount;
        this.maxClient = maxClient;
    }

    public Init() {
        logger.info( this.table_id.toString() + "[ HANDSHISTORY ] INIT");
        logger.info( this.table_id.toString() + "[ HANDSHISTORY ] INIT HANDS COUNT: %s", this.initHandsCount.toString() );        
        this.id = this.initHandsCount;
        this.hands = this.id;
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
        this.hands = this.id;
        logger.info( '[TABLE:' + this.table_id.toString() + "][ HANDSHISTORY ] HANDS INDEX: %s", this.hands.toString() );
        // this.boards = [];
        //this.InitializePlayers();
        // this.players = [];

        //이거 몽고DB에 저장해야겠다!!
        //시트 순서로 정렬한다
        //플레이어에 관련 정보를 넣는다.
        //핸드
        //아이디
        //닉네임
        //
    }

    public GetHands(): number {
        return this.hands;
    }
}