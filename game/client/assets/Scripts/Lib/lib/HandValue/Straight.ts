import HoldemCard from "../HoldemCard";
import HoldemGame from "../HoldemGame";
import { Nullable } from "../Interfaces";
export default function Straight(game: HoldemGame, cards: Array<HoldemCard>, suits: {
    [key: string]: Array<HoldemCard>;
}, num_groups: Array<Array<HoldemCard>>, player_cards: Array<HoldemCard>): Nullable<Array<HoldemCard>> {
    let match = [];
    let match_omaha = [];
    for (let i = 0, j = cards.length; i < j; i++) {
        if (i === 0) {
            match = [cards[i]];
            match_omaha = [[cards[i]]];
        }
        else {
            const this_card = cards[i];
            const prev_card = match[match.length - 1];
            let ln = match.length;
            if (this_card.getRank() === prev_card.getRank()) {
                match_omaha[match_omaha.length - 1].push(this_card);
            }
            else if ((this_card.getRank() + 1) === prev_card.getRank()) {
                match.push(this_card);
                match_omaha.push([this_card]);
                ln++;
            }
            else if (ln < 5) {
                match = [this_card];
                match_omaha = [[this_card]];
            }
            if (ln >= 5) {
                return match;

                // if (game.isOmaha()) {
                //     const omaha_matches = Utils_1.flatUnique(match_omaha.slice(ln - 5, ln));
                //     for (let omaha_match of omaha_matches) {
                //         if (player_cards.filter(pc => !!omaha_match.find(m => m.toString() === pc.toString())).length === 2)
                //             return omaha_match;
                //     }
                // }
                // else
                //     return match;
            }
        }
    }
    return null;    
}

