import { _decorator, Component, Node, Label, Button } from 'cc';
import { CommonUtil } from '../CommonUtil';
import { NetworkManager } from '../NetworkManager';
const { ccclass, property } = _decorator;

@ccclass('UiLOBBY_POPUP_TICKETS')
export class UiLOBBY_POPUP_TICKETS extends Component {
    @property(Label) labelTitle: Label = null;
    @property(Label) labelDescription: Label = null;
    @property(Button) buttonConfirm: Button = null;

    private tickets: any[] = null;
    private current: number = 0;
    private maxTickets: number = 0;
    private cbDONE: ()=>void = null;

    public Init() {
        this.tickets = [];
        this.labelTitle.string = '';
        this.labelDescription.string = '';

        this.buttonConfirm.node.off( 'click' );
        this.buttonConfirm.node.on( 'click', this.onCONFIRM.bind(this), this );

        this.node.active = false;
    }

    public Show( tickets: any[], done:()=>void ) {
        if ( done != null ) {
            this.cbDONE = done;
        }

        this.tickets = tickets;

        if ( this.tickets.length > 0 ) {
            this.current = 0;
            this.maxTickets = this.tickets.length;
            let ticket = this.tickets[ this.current ];
            this.SetTicket( ticket );
            this.node.active = true;

        } else {
            this.onDONE();
        }
    }

    public Hide() {
        this.node.active = false;
    }

    private onDONE() {
        console.log( 'onDONE');
        if ( this.cbDONE != null ) {
            this.cbDONE();
        }
    }

    private onCONFIRM( button: Button ) {
        let id: number = 0;
        if ( this.tickets[ this.current ] != null ) {
            id = this.tickets[ this.current ].id;
        }

        this.buttonConfirm.interactable = false;
        NetworkManager.Instance().reqCHECK_TICKETS( id, ( res )=>{
            this.buttonConfirm.interactable = true;
            let next = this.current + 1;
            if ( next < this.maxTickets ) {
                this.current = next;
                this.SetTicket( this.tickets[next] );
            } else {
                this.onDONE();
            }
        }, ( err )=>{
            this.buttonConfirm.interactable = true;            
            let next = this.current + 1;
            if ( next < this.maxTickets ) {
                this.current = next;
                this.SetTicket( this.tickets[next] );
            } else {
                this.onDONE();
            }
        });
    }



    private async SetTicket( ticket: any ) {
        let title: string = null;
        let description: string = null;

        if ( Number(ticket.charge) > 0 ) {
            title = '입금신청';
            description = '입금신청 [' + CommonUtil.getKoreanNumber( ticket.charge ) + '] 이 처리되었습니다.';
            description += '\n' + ticket.updateDate;

        } else if ( Number(ticket.transfer) > 0 ) {
            title = '출금신청';
            description = '출금신청 [' + CommonUtil.getKoreanNumber( ticket.transfer ) + '] 이 처리되었습니다.';
            description += '\n' + ticket.updateDate;
            
        } else if ( Number(ticket.return) > 0 ) {
            title = '출금신청';
            description = '출금신청 ' + CommonUtil.getKoreanNumber( ticket.return ) + ' 이 취소되었습니다.';
            description += '\n' + ticket.updateDate;
        }

        this.labelTitle.string = title;
        this.labelDescription.string = description;
    }
}

