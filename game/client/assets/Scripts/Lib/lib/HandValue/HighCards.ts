import HoldemCard from "../HoldemCard";
import HoldemGame from "../HoldemGame";
import { Nullable } from "../Interfaces";
export default function getHighCards(game: HoldemGame, cards: Array<HoldemCard>, suits: {
    [key: string]: Array<HoldemCard>;
}, num_groups: Array<Array<HoldemCard>>, player_cards: Array<HoldemCard>, board: Array<HoldemCard>): Nullable<Array<HoldemCard>> {

    // if (game.isOmaha()) {
    //     player_cards.sortCards();
    //     board.sortCards();
    //     return [
    //         ...player_cards.slice(0, 2),
    //         ...board.slice(0, 3)
    //     ].sortCards();
    // }
    return cards.slice(0, 5);
}

