import { _decorator, Component, Node, Label, Button } from 'cc';
import { CommonUtil } from '../CommonUtil';
const { ccclass, property } = _decorator;

@ccclass('UiLOBBY_POPUP_POINT_RECEIVE')
export class UiLOBBY_POPUP_POINT_RECEIVE extends Component {
    @property(Label) labelTitle: Label = null;
    @property(Label) labelDescription: Label = null;
    @property(Button) buttonConfirm: Button = null;

    private logs: any[] = null;
    private current: number = 0;
    private maxLogs: number = 0;
    private cbDONE: ()=>void = null;

    public Init() {
        this.logs = [];
        this.labelTitle.string = '';
        this.labelDescription.string = '';

        this.buttonConfirm.node.off( 'click' );
        this.buttonConfirm.node.on( 'click', this.onCONFIRM.bind(this), this );

        this.node.active = false;
    }

    public Show( logs: any[], done:()=>void ) {
        if ( done != null ) {
            this.cbDONE = done;
        }

        this.logs = logs;
        if ( this.logs.length > 0 ) {
            this.current = 0;
            this.maxLogs = this.logs.length;
            let log = this.logs[ this.current ];
            this.SetLog( log );
            this.node.active = true;

        } else {
            this.onDONE();
        }
    }

    public Hide() {
        this.node.active = false;
    }

    private onDONE() {
        if ( this.cbDONE != null ) {
            this.cbDONE();
        }
    }

    private onCONFIRM( button: Button ) {
        let id: number = 0;
        if ( this.logs[ this.current ] != null ) {
            id = this.logs[ this.current ].id;
        }

        let next = this.current + 1;
        if ( next < this.maxLogs ) {
            this.current = next;
            this.SetLog( this.logs[next] );
        } else {
            this.onDONE();
        }
    }

    private async SetLog( log: any ) {
        let title: string = '포인트 받음';
        let description: string = '포인트를 받았습니다.\n\n받은 포인트: ' + CommonUtil.getKoreanNumber( log.point ) + '\n' + log.desc;
        description += '\n'+log.createDate;

        this.labelTitle.string = title;
        this.labelDescription.string = description;
    }
}


