"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PotCalculation = void 0;
const logger_1 = __importDefault(require("../util/logger"));
const HoldemRoom_1 = require("../rooms/HoldemRoom");
class PotCalculation {
    constructor(useRake, rakePercentage /*, rakeCap: number[], flopRake : boolean*/) {
        this.playerCount = 0;
        this.rakePercentage = 0;
        // private rakeCap: number[] = [];
        this.useRake = false;
        // private flopRake : boolean = false;
        this.userRakeInfo = [];
        this.deadBlind = 0;
        this.antes = 0;
        this.centerCardState = HoldemRoom_1.eCommunityCardStep.PREPARE;
        this.rakeTotal = 0;
        this.rakePercentage = rakePercentage;
        // this.rakeCap = rakeCap;
        this.useRake = useRake;
        // this.flopRake = flopRake;
        this.Clear();
    }
    SetRoundPlayerCount(count) {
        this.playerCount = count;
    }
    DeadBlind(value) {
        this.deadBlind += value;
    }
    UpdateCenterCard(state) {
        this.centerCardState = state;
        logger_1.default.error("CenterState Changed : " + state);
    }
    SetBet(seat, value, handValue, isFold) {
        if (seat == null || value == null || handValue == null || isFold == null) {
            return;
        }
        try {
            let target = this.player.find(element => {
                return seat === element.seat;
            });
            if (null === target || undefined === target) {
                this.player.push({
                    seat: seat,
                    amount: value,
                    hand: handValue,
                    fold: isFold
                });
            }
            else {
                target.amount = value;
                target.hand = handValue;
                target.fold = isFold;
            }
            this.CalculatePot();
        }
        catch (error) {
            logger_1.default.error(error);
        }
    }
    CalculatePot() {
        this.pots = this.Calculate();
        if (this.useRake === false) {
            return;
        }
        this.CalculateRake();
    }
    SetAnte(seat, value, handValue, isFold) {
        try {
            let target = this.player.find(element => {
                return seat === element.seat;
            });
            if (null === target || undefined === target) {
                this.player.push({
                    seat: seat,
                    amount: value,
                    hand: handValue,
                    fold: isFold
                });
            }
            else {
                target.amount = value;
                target.hand = handValue;
                target.fold = isFold;
            }
            this.CalculatePot();
        }
        catch (error) {
            logger_1.default.error(error);
        }
    }
    CalculateMinBet(players) {
        var min = Infinity;
        for (let i = 0; i < players.length; i++) {
            if (players[i]["amount"] < min) {
                min = players[i]["amount"];
            }
        }
        return min;
    }
    Calculate() {
        let result = [];
        let remainPlayer = this.player;
        let currentPot;
        let minBet = 0;
        let calcPlayers = [];
        while (remainPlayer.length > 0) {
            calcPlayers = remainPlayer;
            minBet = this.CalculateMinBet(calcPlayers);
            currentPot = {
                total: 0,
                players: [],
                winners: []
            };
            remainPlayer = [];
            remainPlayer.sort();
            for (let i = 0; i < calcPlayers.length; i++) {
                const seatNumber = calcPlayers[i].seat;
                const standing_bet = calcPlayers[i].amount - minBet;
                currentPot.total += minBet;
                currentPot.players.push({ seat: seatNumber, hand: calcPlayers[i].hand, fold: calcPlayers[i].fold });
                if (standing_bet > 0) {
                    remainPlayer.push({
                        seat: seatNumber,
                        amount: standing_bet,
                        hand: calcPlayers[i].hand,
                        fold: calcPlayers[i].fold
                    });
                }
            }
            //Find Winner
            currentPot.players.sort((a, b) => {
                if (a.hand > b.hand) {
                    return -1;
                }
                return 1;
            });
            let highstVelueHand = currentPot.players[0].hand;
            for (let i = 0; i < currentPot.players.length; i++) {
                let player = currentPot.players[i];
                if (highstVelueHand != player.hand || player.fold === true) {
                    //Check is fold Return Pot
                    if (currentPot.players.length > 1) {
                        continue;
                    }
                }
                currentPot.winners.push(player.seat);
            }
            if (currentPot.winners.length < 1) {
                let winner = currentPot.players.find((elem) => { return elem.fold === false; });
                if (null == winner) {
                    continue;
                }
                currentPot.winners.push(winner.seat);
            }
            if (currentPot.total === 0) {
                continue;
            }
            result.push(currentPot);
        }
        let final = [];
        let isSamePot = (a, b) => {
            let sameCount = 0;
            for (let i = 0; i < a.length; i++) {
                let pl = a[i];
                for (let j = 0; j < b.length; j++) {
                    let plB = b[j];
                    if (pl.seat === plB.seat) {
                        sameCount++;
                        break;
                    }
                }
            }
            return sameCount === a.length && sameCount === b.length;
        };
        result.forEach(element => {
            let returnPot = element.winners.length === 1 && element.players.length === 1;
            let pls = [];
            for (let i = 0; i < element.players.length; i++) {
                if (element.players[i].fold === true && element.players.length > 1) {
                    //Check is only fold or returnPot
                    continue;
                }
                pls.push(element.players[i]);
            }
            let samePot = final.find((pot) => { return isSamePot(pls, pot.players); });
            if (null == samePot) {
                final.push({
                    total: element.total,
                    players: pls,
                    winners: element.winners,
                    isReturnPot: returnPot
                });
                return;
            }
            samePot.total += element.total;
        });
        if (final.length > 0) {
            final.sort((a, b) => {
                if (a.players.length > b.players.length) {
                    return -1;
                }
                else {
                    return 1;
                }
            });
            final[0].total += this.deadBlind;
        }
        return final;
    }
    CalculateRake() {
        if (null == this.pots || null == this.player) {
            logger_1.default.error(" pot : " + this.pots + "   Player : " + this.player + " someting is null ");
            return;
        }
        let totalAmount = 0;
        this.pots.forEach(element => {
            if (element.isReturnPot == true) {
                return;
            }
            totalAmount += element.total;
        });
        if (totalAmount < 1) {
            logger_1.default.info("totalAmount < 1");
            return;
        }
        let rakePerc = this.rakePercentage;
        let rake = Math.trunc(totalAmount * rakePerc);
        let tempCopare = 0;
        this.pots.forEach(element => {
            if (element.isReturnPot == true) {
                return;
            }
            if (rake == 0) {
                element.rake = undefined;
                return;
            }
            let contribution = 0;
            contribution = element.total / totalAmount;
            contribution = Math.round((contribution + Number.EPSILON) * 100) / 100;
            element.rake = Math.round(rake * contribution);
            tempCopare += element.rake;
            logger_1.default.info("t: " + element.total + " / r: " + element.rake + " / c: " + contribution);
        });
        this.rakeTotal = tempCopare;
        tempCopare = 0;
        let userRake = [];
        this.player.forEach(element => {
            let myAmount = element.amount;
            let myReturnInfo = this.pots.find((e) => {
                if (e.players.length != 1) {
                    return false;
                }
                return element.seat === e.players[0].seat && e.isReturnPot === true;
            });
            if (null != myReturnInfo) {
                myAmount -= myReturnInfo.total;
            }
            let contribution = myAmount / totalAmount;
            contribution = Math.round((contribution + Number.EPSILON) * 1000) / 1000;
            userRake.push({ seat: element.seat, rake: Math.round(rake * contribution) });
            tempCopare += Math.round(rake * contribution);
        });
        this.userRakeInfo = userRake;
    }
    GetPots(withWinner) {
        let results = [];
        if (null === this.pots || undefined === this.pots) {
            return;
        }
        this.pots.forEach(element => {
            let pls = [];
            for (let i = 0; i < element.players.length; i++) {
                pls.push(element.players[i].seat);
            }
            if (true === withWinner) {
                results.push({ total: element.total, players: pls, winner: element.winners, rake: element.rake });
                return;
            }
            results.push({ total: element.total, players: pls, rake: element.rake });
        });
        return results;
    }
    IsWinner(seat) {
        if (null === this.pots || undefined === this.pots) {
            return;
        }
        for (let i = 0; i < this.pots.length; i++) {
            let element = this.pots[i];
            if (null != element.winners.find((winner) => { return winner === seat; })) {
                return true;
            }
        }
        return false;
    }
    Clear() {
        this.player = [];
        this.deadBlind = 0;
        this.antes = 0;
        this.rakeTotal = 0;
        this.centerCardState = HoldemRoom_1.eCommunityCardStep.PREPARE;
    }
}
exports.PotCalculation = PotCalculation;
