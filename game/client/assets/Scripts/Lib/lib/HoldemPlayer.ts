import HoldemCard from "./HoldemCard";
import HoldemTable from "./HoldemTable";

import { IHand, Nullable } from "./Interfaces";

export default class HoldemPlayer {
    private seat;
    private Table;
    private hand;
    constructor(seat: number, table: HoldemTable, hand?: Nullable<IHand>) {

    }

    setHand(hand: IHand): this {
        return null;

    }

    getHand(): Nullable<string> {
        return null;

    }

    inHand(): boolean {
        return false;
    }

    getCards(): Nullable<HoldemCard[]> {
        return null;
    }

    isEmpty(): boolean {
        return false;
    }

    getSeat(): number {
        return -1;
    }
}