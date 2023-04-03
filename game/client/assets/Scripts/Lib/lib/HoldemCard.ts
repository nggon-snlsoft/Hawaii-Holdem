import HoldemPlayer from "./HoldemPlayer";
import HoldemBoard from "./HoldemBoard";
import HoldemGame from "./HoldemGame";

import { ICardNumber, ISuit, Suits } from "./Interfaces";

export default class HoldemCard {
    private suit;
    private num;
    private game;
    private owner;
    private rank;
    readonly str: string;

    constructor(suit: ISuit, num: ICardNumber, game: HoldemGame) {
        this.suit = suit;
        this.num = num;
        this.game = game;
        this.owner = null;
        this.rank = [2, 3, 4, 5, 6, 7, 8, 9, "T", "J", "Q", "K", "A"].indexOf(this.num) + 2;
        this.str = num + suit;
    }

    toString(): string {
        return this.str;
    }

    color(): "white" | "red" {
        switch (this.suit) {
            case Suits.SPADES:
            case Suits.CLUBS:
                return "white";
            case Suits.HEARTS:
            case Suits.DIAMONDS:
                return "red";
        }
    }

    inPlay(): boolean {
        return this.owner !== null;
    }

    setOwner(owner: HoldemPlayer | HoldemBoard): this {
        if (this.inPlay())
            throw new Error(`Card ${this.toString()} already in play!`);
        this.owner = owner;
        return this;
    }

    isAce(): boolean {
        return this.num === "A";
    }

    isLowAce(): boolean {
        return this.num === "A" && this.rank !== 14;
    }

    setAsLowAce(): this {
        if (!this.isAce())
            throw new Error("Only Ace can have a rank of 1");
        this.rank = this.game.isSixPlusTexasHoldem() ? 5 : 1;
        return this;
    }

    getRank(leading_zero?: boolean): any {
        if (leading_zero)
            return `${this.rank < 10 ? "0" : ""}${this.rank}`;
        return this.rank;
    }

    getSuit(): Suits {
        return this.suit;
    }

    getNum(): import("./Interfaces").CardNumbers {
        return this.num;
    }
}

