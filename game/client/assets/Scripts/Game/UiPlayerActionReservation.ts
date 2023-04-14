import { _decorator, Component, Node, Toggle, Label } from 'cc';
import { Board } from '../Board';

const { ccclass, property } = _decorator;

export enum ENUM_RESERVATION_TYPE {
    RESERVATION_NONE = 0,
    RESERVATION_FOLD = 1,
    RESERVATION_CHECK = 2,
}

@ccclass('UiPlayerActionReservation')
export class UiPlayerActionReservation extends Component {
    @property(Toggle) toggleFoldReservation: Toggle = null;
    @property(Toggle) toggleCheckReservation: Toggle = null;

    private isOpen: boolean = false;
    private reservationType: ENUM_RESERVATION_TYPE = ENUM_RESERVATION_TYPE.RESERVATION_NONE;

    init() {
        this.reservationType = ENUM_RESERVATION_TYPE.RESERVATION_NONE;
        this.isOpen = false;

        this.toggleFoldReservation.isChecked = false;
        this.toggleCheckReservation.isChecked = false;

        this.toggleFoldReservation.node.active = false;
        this.toggleCheckReservation.node.active = false;

        this.node.active = false;
    }

    show( myBet: number, turnBet: number ) {
        this.toggleFoldReservation.node.active = true;

        this.isOpen = true;
        this.node.active = true;
    }

    reset( resetCheck: boolean = false) {
        this.reservationType = ENUM_RESERVATION_TYPE.RESERVATION_NONE;
        this.isOpen = false;

        this.toggleFoldReservation.isChecked = false;
        this.toggleCheckReservation.isChecked = false;

        this.node.active = false;
    }

    hide() {
        this.isOpen = false;
        this.node.active = false;
    }

    public isOpenReservation(): boolean {
        return this.isOpen;
    }

    public resetCheck() {
        this.toggleFoldReservation.node.active = true;
        this.toggleCheckReservation.node.active = true;
    }

    public showCheck( show: boolean ) {
        this.toggleCheckReservation.node.active = show;
    }

    public checkReservation( myBet: number, turnBet: number ): ENUM_RESERVATION_TYPE {
        if ( this.toggleCheckReservation.isChecked == false && this.toggleFoldReservation.isChecked == false ) {
            return ENUM_RESERVATION_TYPE.RESERVATION_NONE;
        } else {
            if ( this.toggleFoldReservation.isChecked == true ) {
                return ENUM_RESERVATION_TYPE.RESERVATION_FOLD;
            } else {
                if ( myBet == turnBet ) {
                    return ENUM_RESERVATION_TYPE.RESERVATION_CHECK;
                }
                else {
                    return ENUM_RESERVATION_TYPE.RESERVATION_NONE;                    
                }
            }
        }
        return ENUM_RESERVATION_TYPE.RESERVATION_NONE;
    }

    public getReservationType(): number {
        return this.reservationType;
    }
}


