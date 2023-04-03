import HoldemCard from "../HoldemCard";
import HoldemGame from "../HoldemGame";
import { Nullable } from "../Interfaces";
export default function OnePair(game: HoldemGame, cards: Array<HoldemCard>, suits: {
    [key: string]: Array<HoldemCard>;
}, num_groups: Array<Array<HoldemCard>>, player_cards: Array<HoldemCard>, board: Array<HoldemCard>): Nullable<Array<HoldemCard>> {
    let pair = num_groups.find(g => g.length === 2);
    if (pair) {
        // if (game.isOmaha()) {
        //     const matches = player_cards.filter(pc => !!pair.find(m => m.toString() === pc.toString()));
        //     const ln = matches.length;
        //     player_cards.sortCards();
        //     board.sortCards();
        //     let op = null;
        //     if (ln === 2) {
        //         op = board.slice(0, 3);
        //     }
        //     else if (ln === 1) {
        //         op = [
        //             ...board.filter(c => !pair.find(ngc => c.toString() === ngc.toString())).slice(0, 2),
        //             player_cards.find(c => !pair.find(ngc => c.toString() === ngc.toString()))
        //         ];
        //     }
        //     else if (ln === 0) {
        //         op = [
        //             board.find(c => !pair.find(ngc => c.toString() === ngc.toString())),
        //             ...player_cards.slice(0, 2)
        //         ];
        //     }
        //     if (op) {
        //         op.sortCards();
        //         return [...pair, ...op];
        //     }
        // }
        // else {
        // }
        return [...pair, ...cards.filter(card => {
            return card.getNum() !== pair[0].getNum();
        }).slice(0, 3)];

    }
    return null;
};

