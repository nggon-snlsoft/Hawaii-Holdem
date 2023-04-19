"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PotCalculation = void 0;
const logger_1 = __importDefault(require("../util/logger"));
class PotCalculation {
    constructor(useRake, rakePercentage, rakeCap) {
        this.playerCount = 0;
        this.rakePercentage = 0;
        this.rakeCap = [];
        this.useRake = false;
        this.userRakeInfo = [];
        this.deadBlind = 0;
        this.rakePercentage = rakePercentage;
        this.rakeCap = rakeCap;
        this.useRake = useRake;
        this.Clear();
    }
    SetRoundPlayerCount(count) {
        this.playerCount = count;
    }
    AddDeadBlind(value) {
        this.deadBlind += value;
    }
    SetBet(seat, value, handValue, isFold) {
        let targetPlayer = this.player.find(element => {
            return seat === element.seat;
        });
        if (null === targetPlayer || undefined === targetPlayer) {
            this.player.push({
                seat: seat,
                amount: value,
                hand: handValue,
                fold: isFold
            });
        }
        else {
            targetPlayer.amount = value;
            targetPlayer.hand = handValue;
            targetPlayer.fold = isFold;
        }
        this.pots = this.Calculate();
        if (this.useRake === false) {
            return;
        }
        this.CalculateRake();
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
                //AllFold without winner
                //logger.error("All Fold Without winner");
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
        let rakeCap = this.playerCount > this.rakeCap.length ? this.rakeCap[this.rakeCap.length - 1] : this.rakeCap[this.playerCount - 1];
        let rake = Math.trunc(totalAmount * rakePerc);
        rake = Math.min(rakeCap, rake);
        logger_1.default.info("Start Rake Calculate RakePercent : " + rakePerc + " / Rake Cap : " + rakeCap + " / Rake : " + rake + " / Pot Total : " + totalAmount);
        let tempCopare = 0;
        //리턴팟 관련 처리 해야함
        this.pots.forEach(element => {
            if (element.isReturnPot == true) {
                //Return Pot
                return;
            }
            let contribution = 0;
            contribution = element.total / totalAmount;
            contribution = Math.round((contribution + Number.EPSILON) * 100) / 100;
            element.rake = Math.round(rake * contribution);
            tempCopare += element.rake;
            logger_1.default.info("total : " + element.total + " / Rake : " + element.rake + " / contribution : " + contribution);
        });
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
            logger_1.default.info("User " + element.seat + " has ReturnPot : " + (myReturnInfo != null) + " / Amount : " + myAmount + " / RakeCollect : " + (rake * contribution) + " / contribution : " + contribution);
        });
        this.userRakeInfo = userRake;
    }
    GetPots(withWinner) {
        let results = [];
        if (null === this.pots || undefined === this.pots) {
            console.error(" Pots is Null");
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
    }
}
exports.PotCalculation = PotCalculation;
