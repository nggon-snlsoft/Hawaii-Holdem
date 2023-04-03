
import HoldemTable from "./HoldemTable";
import HoldemCard from "./HoldemCard";
import HoldemResult from "./HoldemResult";

export default class HoldemBoard {
    private table;
    private cards;
    private dead_cards;

    constructor(table: HoldemTable) {
        this.table = table;
        this.cards = [];
        this.dead_cards = [];
    }

    private checkGameRules ( action ) {
        if (this.getGame().isTexasHoldem() || this.getGame().isSixPlusTexasHoldem() || this.getGame().isOmaha()) {
            if ((action === "flop" && this.cards.length !== 0)
                || (action === "turn" && this.cards.length !== 3)
                || (action === "river" && this.cards.length !== 4))
                throw new Error(`Cannot set ${action}`);
        }
        else if (~["flop", "turn", "river"].indexOf(action))
            throw new Error(`Game ${this.getGame().getGame()} cannot have a ${action}!`);
    }

    setFlop(cards: Array<string>): this {
        this.checkGameRules("flop");
        if (cards.length !== 3)
            throw new Error(`A flop takes exactly 3 cards, ${cards.length} given!`);
        cards.forEach(card => this.setCard(card));
        return this;
    }

    dead(cards: string | Array<string>): this {
        if (!Array.isArray(cards))
            cards = [cards];
        cards.forEach(card => {
            this.dead_cards.push(this.table.getDeck().getCards().find(c => card === c.toString()).setOwner(this));
        });
        return this;
    }

    getDeadCards(): HoldemCard[] {
        return this.dead_cards;
    }

    setTurn(card: string): this {
        this.checkGameRules("turn");
        this.setCard(card);
        return this;
    }

    setRiver(card: string): this {
        this.checkGameRules("river");
        this.setCard(card);
        return this;
    }

    private setCard ( card ) {
        const c = this.table.getDeck().getCards().find(c => card === c.toString());
        if (!c)
            throw new Error(`Card ${card} not found!`);
        this.cards.push(c.setOwner(this));
        return this;        
    }

    getGame(): import("./HoldemGame").default {
        return this.table.getGame();
    }

    getCards(): HoldemCard[] {
        return this.cards;
    }

    getResult(): HoldemResult {
        return null;

        // let ts = Date.now();
        // let ranks = {};
        // for (let type in index_1.type)
        //     ranks[type] = 0;
        // const players = this.table.getPlayersInHand();
        // const _players = players.map((p, i) => {
        //     return {
        //         wins: 0,
        //         ties: 0,
        //         ranks: lodash_1.clone(ranks),
        //         player: players[i]
        //     };
        // });
        // let iterations = 0;
        // const approximate = !this.table.runExhaustive() && this.cards.length <= 2;
        // const cards = this.table.getDeck().getAvailableCards();
        // let getResult = (players, board) => {
        //     let result = this.table.getGame().getResult(players, board);
        //     const top_score = result.slice(0).sort((a, b) => b.points - a.points)[0].points;
        //     const tie = result.filter((rank) => rank.points === top_score).length > 1;
        //     for (let i = 0, j = _players.length; i < j; i++) {
        //         _players[i].ranks[result[i].rank.str]++;
        //         if (result[i].points === top_score) {
        //             if (tie)
        //                 _players[i].ties++;
        //             else
        //                 _players[i].wins++;
        //         }
        //     }
        //     iterations++;
        // };
        // let completeBoard = (board, pi, l) => {
        //     if (approximate) {
        //         for (let i = 0; i < this.table.getLimit(); i++) {
        //             getResult(players, lodash_1.sampleSize(cards, 5));
        //         }
        //     }
        //     else {
        //         if (!l)
        //             getResult(players, board);
        //         else {
        //             cards.forEach((card, i) => {
        //                 if (i < pi)
        //                     return;
        //                 const cardStr = card.toString();
        //                 if (board.find(c => c.toString() === cardStr))
        //                     return;
        //                 completeBoard([...board, card], i, l - 1);
        //             });
        //         }
        //     }
        // };
        // completeBoard(this.cards, 0, 5 - this.cards.length);
        // return new Result_1.default({ players: _players, iterations, approximate, time: Date.now() - ts, board: this });
    }
}