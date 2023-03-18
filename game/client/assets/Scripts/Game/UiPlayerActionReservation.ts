import { _decorator, Component, Node, Toggle, Label } from 'cc';
import { Board } from '../Board';
const { ccclass, property } = _decorator;

@ccclass('UiPlayerActionReservation')
export class UiPlayerActionReservation extends Component {
    @property(Toggle) toggleReservation: Toggle = null;
    @property(Label) labelReservation: Label = null;

    private isOpen: boolean = false;
    private reservationType: number = -1;

    init() {
        this.labelReservation.string = '';
        this.reservationType = -1;
        this.isOpen = false;
        this.toggleReservation.isChecked = false;
        this.node.active = false;
    }

    show( myBet: number, turnBet: number ) {
        if ( this.isOpen == false ) {
            this.toggleReservation.isChecked = false;
        }

        if ( turnBet == myBet ) {
            this.labelReservation.string = '폴드/체크';
            this.reservationType = 1;            
        } else {
            this.reservationType = 0;                        
            this.labelReservation.string = '폴드';
        }

        this.isOpen = true;
        this.node.active = true;
    }

    reset() {
        this.reservationType = -1;
        this.isOpen = false;
        this.node.active = false;
        this.labelReservation.string = '';
        this.toggleReservation.isChecked = false;
    }

    hide() {
        this.isOpen = false;
        this.node.active = false;
    }

    public isOpenReservation(): boolean {
        return this.isOpen;
    }

    public checkReservation(): boolean {
        return this.toggleReservation.isChecked;
    }

    public getReservationType(): number {
        return this.reservationType;
    }

    public excute( myBet: number, turnBet: number, seat: number ) {
        let obj: any = {
            seat: seat
        };

        if ( this.reservationType == 0 ) {
			Board.table.sendMsg( "FOLD", obj );            
        } else if ( this.reservationType == 1) {
            if ( myBet == turnBet) {
			    Board.table.sendMsg( "CHECK", obj );            
            } else {
			    Board.table.sendMsg( "FOLD", obj );            
            }

        }
    }
}


