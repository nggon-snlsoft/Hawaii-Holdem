import { _decorator, Component, Node, Button, Label, Sprite } from 'cc';
import { Board } from './Board';
import { CommonUtil } from './CommonUtil';
import { UiGameSystemPopup } from './Game/UiGameSystemPopup';
import { UiSeat } from './UiSeat';
import { ResourceManager } from './ResourceManager';
import { AudioController } from './Game/AudioController';
const { ccclass, property } = _decorator;

@ccclass('UiSeats')
export class UiSeats extends Component {
    @property(Label) labelLimitTimer: Label = null;

    private uiSeats: UiSeat[] = [];
    private buttonTakeSeats: Button[] = [];
    private count: number = 0;
    private isWaitingResult: boolean = false;
    private timerId: number = 0;
    private isOpen: boolean = false;
    private limitTime: number = 0;
    private pauseTimer: boolean = false;
    private joinPlayer: number = -1;
    private playingPlayer: number = -1;
    public unselectSeatDuringTime = false;

    callback: (number) => void = null;

    public init ( maxSeat: number, onClickCallback: (seatNumber: number)=>void) {

        this.isWaitingResult = false;
        let seatCount: number = maxSeat;
        this.callback = onClickCallback;

        let seatsRoot9: Node = this.node.getChildByPath('SEATS9');
        let seatsRoot6: Node = this.node.getChildByPath('SEATS6');        


        let nodeTarget: Node = null;

        let seatRootPath = `SEATS${ seatCount }`;

        if ( seatsRoot9.name == seatRootPath )
        {
            seatsRoot9.active = true;
            seatsRoot6.active = false;
            nodeTarget = seatsRoot9;
        } else {
            seatsRoot9.active = false;
            seatsRoot6.active = true;
            nodeTarget = seatsRoot6;
        }

        this.uiSeats = [];
        for (let i = 0 ; i < nodeTarget.children.length; i++)
        {
            let cn = nodeTarget.children[i];
            if (null == cn) {
                continue;
            }

            let uiSeat: UiSeat = cn.getComponent(UiSeat);
            if (null == uiSeat) {
                continue;
            }

            uiSeat.childRegistered();
            uiSeat.setShowEntity(false);
            uiSeat.setShowReserve(false);

            this.uiSeats.push(uiSeat);
        }

        for (let i = 0 ; i < this.uiSeats.length; i++) {
            this.buttonTakeSeats[i] = this.uiSeats[i].getTakeButton();
        }

        let bg: Sprite = this.node.getChildByPath('SPRITE_BACKGROUND').getComponent(Sprite);
        if ( bg != null ) {
            ResourceManager.Instance().setBackgroundImage(bg);
            bg.node.active = true;
        }

        let tb: Sprite = this.node.getChildByPath('SPRITE_TABLE').getComponent( Sprite );
        if ( tb != null ) {
            ResourceManager.Instance().setTableImage(tb);
            tb.node.active = true;            
        }

        this.unselectSeatDuringTime = false;
        this.labelLimitTimer.string = '플레이할 자리를 선택해 주세요 (60)';
        this.pauseTimer = true;
        this.node.active = false;
    }

    updateSeatInfo ( seats: any[], info: number[], bb: number, sb: number, dealer: number ) {

        for ( let i = 0 ; i < this.buttonTakeSeats.length; i++) {
            let button: Button = this.buttonTakeSeats[i];
            if ( button == null ) {

            }
            else {
                if ( i >= this.uiSeats.length ) {
                    button.node.active = false;
                    continue;
                }

                button.node.active = true;
                button.node.off("click");
                button.node.on("click", this.onClickSeatButton.bind(this, i), this);
            }
        }

        for (let i = 0; i < info.length; i++) {
            let status: number = info[i];
            if ( status == 2)
            {
                this.uiSeats[i].setShowEntity(true);
                this.uiSeats[i].setShowReserve(false);
    
                let target = seats.find((e)=>{
                    return e.seat === i;
                });
    
                if (null != target) {
                    this.uiSeats[i].setUi(target);
    
                    if (bb > -1 && target === bb) {
                        this.uiSeats[i].setUiPosSymbol("bb");
                    }
    
                    if (sb > -1 && target === sb) {
                        this.uiSeats[i].setUiPosSymbol("sb");
                    }
    
                    if (dealer > -1 && target === dealer) {
                        this.uiSeats[i].setUiPosSymbol("dealer");
                    }
                }
    
                this.buttonTakeSeats[i].node.active = false;
                continue;
            }

            if ( status == 1 ) {
                this.uiSeats[i].setEscapee();
                this.buttonTakeSeats[i].node.active = false;
                this.uiSeats[i].setShowEntity(false);
                this.uiSeats[i].setShowReserve(true);
                continue;
            }

            this.uiSeats[i].setShowEntity(false);
            this.uiSeats[i].setShowReserve(false);
            
            this.uiSeats[i].setEscapee();
            this.uiSeats[i].setNickname("EMPTY");
        }

        if (Board.reserveSeat > -1) {
            let status = info[Board.reserveSeat];
            if ( status == 0 ) {
                this.onClickSeatButton (Board.reserveSeat);
                Board.reserveSeat = -1;
            } else {

            }
        }

        let playing = info.filter ((status)=>{
            return (status === 2);
        });

        this.joinPlayer = seats.length;
        this.playingPlayer = playing.length;
    }

    public startSeatsSelect(second: number) {
        if (this.node.active == true) {
            return;
        }

        this.labelLimitTimer.string = '플레이할 자리를 선택해 주세요' + '(' + ( second ).toString() + ')';

        this.count = 0;
        this.isOpen = true;
        this.pauseTimer = false;

        if ( second > 0 ) {
            this.limitTime = second;
            this.timerId = setInterval( ()=>this.checkTimer(), 1000 );
        }

        this.unselectSeatDuringTime = false;
        this.node.active = true;
    }

    end() {
        if (this.node.active == false) {
            return;
        }

        this.clearTimer();
        this.isOpen = false;
        this.pauseTimer = false;

        this.node.active = false;
    }

    onClickSeatButton(seatPos: number) {

        if (null == this.callback) {
            return;
        }

        if (true === this.isWaitingResult) {
            return;
        }

        AudioController.instance.PlaySound('BUTTON_CLICK');

        this.isWaitingResult = true;
        this.callback( seatPos );
    }

    pause() {
        if ( this.isOpen == true ) {
            this.pauseTimer = true;
        }
    }

    unpause() {
        if ( this.isOpen == true ) {
            this.pauseTimer = false;
            clearInterval( this.timerId );
            this.timerId = setInterval( ()=> this.checkTimer(), 60000 );
        }
    }

    onResultFail() {
        this.isWaitingResult = false;
    }

    checkTimer() {
        if ( this.isOpen == false ) {
            clearInterval( this.timerId );
            return;
        }

        if ( this.pauseTimer == true ) {
            return;
        }

        this.count++;

        if (this.count >= this.limitTime ) {
            this.clearTimer();
            // this.isOpen = false;
            this.timerId = -1;
            this.unselectSeatDuringTime = true;

            Board.table.leave();
            this.unscheduleAllCallbacks();

            UiGameSystemPopup.instance.showOkPopup('자리 선택', '자리를 선택하지 않아 로비로 이동합니다', ()=>{
                UiGameSystemPopup.instance.closePopup();
                Board.table.LoadLobby();

                this.unselectSeatDuringTime = false;
            });

        }
        else {
            if ( this.labelLimitTimer != null ) {
                this.labelLimitTimer.string = '플레이할 자리를 선택해 주세요' + '(' + ( this.limitTime - this.count).toString() + ')';
            }
        }
    }

    checkTimerId() {
        if ( this.timerId != -1 ) {
            clearInterval( this.timerId );
            this.timerId = -1;
        }

    }

    clearTimer() {
        clearInterval( this.timerId );
        this.count = 0;
        this.timerId = -1;
    }

    isSeatsSelectOpen(): boolean {
        return false;
    }

    leaveRoom() {
        this.clearTimer();
        this.isOpen = false;
        this.timerId = -1;

        this.node.active = false;
        Board.table.leave();
    }

    leave() {
        clearInterval( this.timerId );        
        this.isOpen = false;
        this.timerId = -1;
        this.node.active = false;
    }

    onJoinTable() {
        Board.room.send("BUY_IN", {id: Board.id, buyInAmount: Board.buyin});
        this.node.active = false;
    }
}


