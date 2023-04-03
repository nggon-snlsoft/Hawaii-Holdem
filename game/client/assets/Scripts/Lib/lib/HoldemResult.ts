import HoldemPlayer from "./HoldemPlayer";
import HoldemBoard from "./HoldemBoard";

interface iPlayerResult {
    player: HoldemPlayer;
    wins: number;
    ties: number;
    ranks: {
        [key: string]: number;
    };
}
declare class ResultPlayer {
    private readonly data;
    private table;
    constructor(data: iPlayerResult, table: HoldemResult);
    isWinner(): boolean;
    getWins(): number;
    getWinsPercentage(): number;
    getWinsPercentageString(): string;
    getTies(): number;
    getTiesPercentage(): number;
    getTiesPercentageString(): string;
    getPlayer(): HoldemPlayer;
    getRanks(): {
        [key: string]: ResultRank;
    };
    getTable(): HoldemResult;
    getRawRanks(): {
        [key: string]: number;
    };
    getName(): string;
    getHand(): import('./Interfaces').Nullable<string>;
}
declare class ResultRank {
    private readonly rank;
    private player;
    constructor(rank: string, player: ResultPlayer);
    getCount(): number;
    getPercentage(as_string?: boolean, _default?: string): number | string;
    getName(): string;
}
export default class HoldemResult {
    private readonly result;

    constructor(result: {
        players: Array<iPlayerResult>;
        board: HoldemBoard;
        iterations: number;
        approximate: boolean;
        time: number;
    }) {

    };

    getPlayers(): ResultPlayer[] {
        return null;
    }

    isApproximate(): boolean {
        return false;
    }

    getIterations(): number {
        return -1;
    }

    getTime(): number {
        return -1;
    }

    getWinner(): iPlayerResult {
        return null;
    }

    getBoard(): string {
        return null;
    }

    getDeadCards(): string {
        return null;

    }

    toJson(): {
        players: iPlayerResult[];
        board: HoldemBoard;
        iterations: number;
        approximate: boolean;
        time: number;
    } {
        return null;
    };
}
export {};


