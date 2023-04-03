
import HoldemCard from "./HoldemCard";
import HoldemGame from "./HoldemGame";
import { ICardNumber, ISuit, Suits, SuitsList, SixPlusDeck, FullDeck} from "./Interfaces";

export default class HoldemDeck {
    private game;
    private cards;

    constructor(game: HoldemGame) {
        this.game = game;
        this.cards = [];
        SuitsList.forEach((suit) => {
            let numbers = game.isSixPlusTexasHoldem() ? SixPlusDeck : FullDeck;
            numbers.forEach(num => {
                this.cards.push(new HoldemCard(suit, num, this.game));
            });
        });

    }

    getCards(): Array<HoldemCard> {
        return this.cards;
    }

    getAvailableCards(): HoldemCard[] {
        return this.cards.filter(card => !card.inPlay());
    }
}
