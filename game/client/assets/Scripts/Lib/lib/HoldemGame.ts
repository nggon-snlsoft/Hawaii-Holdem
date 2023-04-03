import HoldemTable from "./HoldemTable";
import HoldemCard from "./HoldemCard";
import HoldemPlayer from "./HoldemPlayer";
import { Games as iGames, Nullable } from './Interfaces';

import { AvailableGames, CardNumbers } from "./Interfaces";
import * as HandValue from './HandValue/Index'


export default class HoldemGame {
    private game;
    private table;
    private trips_beats_straight;
    constructor(game: iGames, table: HoldemTable) {
        this.game = game;
        this.table = table;
        this.trips_beats_straight = false;
        if (!~AvailableGames.indexOf(game))
            throw new Error(`${game} not available! Choose any of ${AvailableGames.join(", ")}`);
    }

    isTexasHoldem(): boolean {
        return this.game == "texas_holdem";
    }

    isSixPlusTexasHoldem(): boolean {
        return this.game == "sixplus_holdem";
    }

    isOmaha(): boolean {
        return this.game == "omaha";
    }

    getGame(): iGames {
        return this.game;
    }

    tripsBeatsStraight(): this {
        if (!this.isSixPlusTexasHoldem())
            throw new Error("Option \"Trip beats straight\" is available for 6+ hold'em only!");
        this.trips_beats_straight = true;
        return this;
    }

    doesTripsBeatStraight(): boolean {
        return this.trips_beats_straight;
    }

    getResult(players: Array<HoldemPlayer>, board: Array<HoldemCard>): {
        points: number;
        rank: {
            rank: string;
            str: string;
        };
        hand: Nullable<HoldemCard[]>;
        cards: HoldemCard[];
    }[] {
        return players.filter(player => player.inHand()).map(player => this.getHandStrentgh(board, player.getCards()));
    }

    private getHandStrentgh ( board, player_cards ) {
        const cards = [...board, ...player_cards];//.sortCards();

        let _cards = cards.slice(0);
        let suits = {
            h: [],
            d: [],
            c: [],
            s: []
        };
        let num_groups = [];
        _cards.forEach((card) => {
            if (card.isAce() && !card.isLowAce()) {
                const AceOne = new HoldemCard(card.getSuit(), CardNumbers.ACE, this).setAsLowAce();
                cards.push(AceOne);
                suits[AceOne.getSuit()].push(AceOne);
            }
            suits[card.getSuit()].push(card);
            let index;
            if ((index = num_groups.findIndex(g => g[0].getNum() === card.getNum())) > -1)
                num_groups[index].push(card);
            else
                num_groups.push([card]);
        });
        let rank = "";
        let rank_str = "HIGH_CARD";
        let hand;
        if ((hand = HandValue.StraightFlush(this, cards, suits, num_groups, player_cards)) !== null) {
            if (hand[0].getNum() === "T") {
                rank = "10";
                rank_str = "ROYAL_FLUSH";
            }
            else {
                rank = "9";
                rank_str = "STRAIGHT_FLUSH";
            }
        }
        else if ((hand = HandValue.Quads(this, cards, suits, num_groups, player_cards, board)) !== null) {
            rank = "8";
            rank_str = "QUADS";
        }
        else if (!this.isSixPlusTexasHoldem() && (hand = HandValue.FullHouse(this, cards, suits, num_groups, player_cards, board)) !== null) {
            rank = "7";
            rank_str = "FULL_HOUSE";
        }
        else if (!this.isSixPlusTexasHoldem() && (hand = HandValue.Flush(this, cards, suits, num_groups, player_cards, board)) !== null) {
            rank = "6";
            rank_str = "FLUSH";
        }
        else if (!this.isSixPlusTexasHoldem() && (hand = HandValue.Straight(this, cards, suits, num_groups, player_cards)) !== null) {
            rank = "5";
            rank_str = "STRAIGHT";
        }
        else if (!this.isSixPlusTexasHoldem() && (hand = HandValue.TreeOfAKind(this, cards, suits, num_groups, player_cards, board)) !== null) {
            rank = "4";
            rank_str = "TREE_OF_A_KIND";
        }
        else if (this.isSixPlusTexasHoldem() && (hand = HandValue.Flush(this, cards, suits, num_groups, player_cards, board)) !== null) {
            rank = "7";
            rank_str = "FLUSH";
        }
        else if (this.isSixPlusTexasHoldem() && (hand = HandValue.FullHouse(this, cards, suits, num_groups, player_cards, board)) !== null) {
            rank = "6";
            rank_str = "FULL_HOUSE";
        }
        else if (this.isSixPlusTexasHoldem() && this.doesTripsBeatStraight() && (hand = HandValue.TreeOfAKind(this, cards, suits, num_groups, player_cards, board)) !== null) {
            rank = "5";
            rank_str = "TREE_OF_A_KIND";
        }
        else if (this.isSixPlusTexasHoldem() && this.doesTripsBeatStraight() && (hand = HandValue.Straight(this, cards, suits, num_groups, player_cards)) !== null) {
            rank = "4";
            rank_str = "STRAIGHT";
        }
        else if (this.isSixPlusTexasHoldem() && !this.doesTripsBeatStraight() && (hand = HandValue.Straight(this, cards, suits, num_groups, player_cards)) !== null) {
            rank = "5";
            rank_str = "STRAIGHT";
        }
        else if (this.isSixPlusTexasHoldem() && !this.doesTripsBeatStraight() && (hand = HandValue.TreeOfAKind(this, cards, suits, num_groups, player_cards, board)) !== null) {
            rank = "4";
            rank_str = "TREE_OF_A_KIND";
        }
        else if ((hand = HandValue.TwoPairs(this, cards, suits, num_groups, player_cards, board)) !== null) {
            rank = "3";
            rank_str = "TWO_PAIRS";
        }
        else if ((hand = HandValue.OnePair(this, cards, suits, num_groups, player_cards, board)) !== null) {
            rank = "2";
            rank_str = "ONE_PAIR";
        }
        else {
            rank = "0";
            hand = HandValue.HighCards(this, cards, suits, num_groups, player_cards, board);
            rank_str = "HIGH_CARDS";
        }
        let points = rank;
        hand.forEach(card => {
            points += card.getRank(true);
        });
        return {
            points: parseInt(points),
            rank: {
                rank,
                str: rank_str
            },
            hand,
            cards
        };
    }
}
