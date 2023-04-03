import HoldemPlayer from "./HoldemPlayer";
import HoldemDeck from "./HoldemDeck";
import HoldemGame from "./HoldemGame";
import HoldemBoard from "./HoldemBoard";
import { Games as iGames, IHand } from "./Interfaces";

export default class HoldemTable {
    protected seats: number;
    protected players: Array<HoldemPlayer>;
    protected deck: HoldemDeck;
    protected game: HoldemGame;
    protected board: HoldemBoard;
    private _exhaustive;
    private _limit;
    constructor(game: iGames = 'texas_holdem' , seats: number = 9 ) {
        this.seats = seats;
        this.players = [];
        this._exhaustive = false;
        this._limit = 100000;
        this.players = new Array(seats).fill(null).map((p, i) => new HoldemPlayer(i + 1, this));
        this.game = new HoldemGame(game, this);
        this.deck = new HoldemDeck(this.game);
        this.board = new HoldemBoard(this);
    }

    exhaustive(): this {
        this._exhaustive = true;
        return this;
    }

    runExhaustive(): boolean {
        return this._exhaustive;
    }

    limit(limit: number): this {
        this._limit = limit;
        return this;
    }

    getLimit(): number {
        return this._limit;
    }

    tripsBeatsStraight(): this {
        this.game.tripsBeatsStraight();
        return this;
    }

    getPlayersInHand(): HoldemPlayer[] {
        return this.players.filter(player => player.inHand());
    }

    getDeck(): HoldemDeck {
        return this.deck;
    }

    getGame(): HoldemGame {
        return this.game;
    }

    getBoard(): HoldemBoard {
        return this.board;
    }

    boardAction(fn: Function): this {
        fn(this.board);
        return this;
    }

    setPlayerHand(hand: IHand, seat: number): this {
        if (this.players.length < seat)
            throw new Error("Seat not available!");
        if (seat < 1 || seat > this.seats)
            throw new Error(`Seat ${seat} not available!`);
        if (!this.players[seat - 1].isEmpty())
            throw new Error(`Seat ${seat} taken!`);
        this.players[seat - 1].setHand(hand);
        return this;
    }

    addPlayer(hand: IHand): this {
        let seat = this.players.findIndex(s => s.isEmpty()) + 1;
        return this.setPlayerHand(hand, seat);
    }

    calculate(): import("./HoldemResult").default {
        if (this.players.filter(player => player.inHand()).length < 2)
            throw new Error("Minimum 2 players required");
        return this.board.getResult();
    }

    setBoard(cards: Array<string>): this {
        this.board.setFlop(cards.slice(0, 3));
        if (cards.length > 3)
            this.board.setTurn(cards[3]);
        if (cards.length === 5)
            this.board.setRiver(cards[4]);
        return this;
    }

    setDeadCards(cards: Array<string>): this {
        this.board.dead(cards);
        return this;
    }
}


