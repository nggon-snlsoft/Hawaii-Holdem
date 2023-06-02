import logger from "../util/logger";
import { eCommunityCardStep } from "../rooms/HoldemRoom";

export class PotCalculation {

  private player: any[];
  private pots: any[];
  private playerCount: number = 0;
  private rakePercentage: number = 0;
  // private rakeCap: number[] = [];
  private useRake: boolean = false;
  // private flopRake : boolean = false;
  public userRakeInfo: any[] = [];
  public deadBlind : number = 0;
  public antes: number = 0;

  private centerCardState : eCommunityCardStep = eCommunityCardStep.PREPARE;
  public rakeTotal : number = 0;

  constructor( useRake: boolean, rakePercentage: number /*, rakeCap: number[], flopRake : boolean*/ ) {
    this.rakePercentage = rakePercentage;
    // this.rakeCap = rakeCap;
    this.useRake = useRake;
    // this.flopRake = flopRake;
    
    this.Clear();
  }

  public SetRoundPlayerCount(count: number) {
    this.playerCount = count;
  }

  public DeadBlind(value : number){
    this.deadBlind += value;
  }

  public UpdateCenterCard(state : eCommunityCardStep){
    this.centerCardState = state;
    logger.error("CenterState Changed : " + state);
  }

  public SetBet( seat: number, value: number, handValue: number, isFold: boolean ) {
    if ( seat == null || value == null || handValue == null || isFold == null ) {
      return;
    }

    try {
      let target: any = this.player.find(element => {
        return seat === element.seat;
      });
  
      if (null === target || undefined === target) {
        this.player.push({
          seat: seat,
          amount: value,
          hand: handValue,
          fold: isFold
        });
  
      } else {
        target.amount = value;
        target.hand = handValue;
        target.fold = isFold;
      }
  
      this.CalculatePot();      
    } catch (error) {
      logger.error( error );      
    }
  }

  public CalculatePot() {
    this.pots = this.Calculate();

    if (this.useRake === false) {
      return;
    }

    this.CalculateRake();
  }

  public SetAnte( seat: number, value: number, handValue: number, isFold: boolean ) {

    try {
      let target: any = this.player.find(element => {
        return seat === element.seat;
      })
  
      if (null === target || undefined === target) {
        this.player.push({
          seat: seat,
          amount: value,
          hand: handValue,
          fold: isFold
        });
  
      } else {
        target.amount = value;
        target.hand = handValue;
        target.fold = isFold;
      }
  
      this.CalculatePot();      
    } catch (error) {
      logger.error( error );      
    }
  }  

  private CalculateMinBet(players: any[]): number {
    var min: number = Infinity;
    for (let i = 0; i < players.length; i++) {
      if (players[i]["amount"] < min) {
        min = players[i]["amount"];
      }
    }
    return min;
  }

  public Calculate(): any[] {
    let result: any[] = [];
    let remainPlayer: any[] = this.player;
    let currentPot: any;
    let minBet: number = 0;

    let calcPlayers: any[] = [];

    while ( remainPlayer.length > 0 ) {
      calcPlayers = remainPlayer;
      minBet = this.CalculateMinBet(calcPlayers);

      currentPot = {
        total: 0,
        players: [],
        winners: []
      };

      remainPlayer = [];
      remainPlayer.sort()

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
      currentPot.players.sort((a: any, b: any) => {
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
        let winner: any = currentPot.players.find((elem: { fold: boolean; }) => { return elem.fold === false; });

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

    let final: any[] = [];

    let isSamePot: (a: any[], b: any[]) => Boolean = (a, b) => {

      let sameCount: number = 0;

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

      let returnPot: boolean = element.winners.length === 1 && element.players.length === 1;

      let pls: any[] = [];
      for (let i = 0; i < element.players.length; i++) {
        if (element.players[i].fold === true && element.players.length > 1) {
          //Check is only fold or returnPot
          continue;
        }

        pls.push(element.players[i]);
      }

      let samePot = final.find((pot) => { return isSamePot(pls, pot.players) });
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
      final.sort((a: any, b: any) => {
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

  private CalculateRake() {

    if (null == this.pots || null == this.player) {
      logger.error(" pot : " + this.pots + "   Player : " + this.player + " someting is null ");
      return;
    }

    let totalAmount: number = 0;

    this.pots.forEach(element => {

      if (element.isReturnPot == true) {
        return;
      }

      totalAmount += element.total;
    });

    if (totalAmount < 1) {
      logger.info("totalAmount < 1");
      return;
    }

    let rakePerc = this.rakePercentage;

    let rake: number = Math.trunc(totalAmount * rakePerc);

    let tempCopare: number = 0;

    this.pots.forEach(element => {

      if (element.isReturnPot == true) {
        return;
      }

      if( rake == 0 ){
        element.rake = undefined;
        return;
      }

      let contribution: number = 0;
      contribution = element.total / totalAmount;
      contribution = Math.round((contribution + Number.EPSILON) * 100) / 100;

      element.rake = Math.round(rake * contribution);
      tempCopare += element.rake;

      logger.info("t: " + element.total + " / r: " + element.rake + " / c: " + contribution);
    });

    this.rakeTotal = tempCopare;

    tempCopare = 0;

    let userRake: any[] = [];

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

      userRake.push({ seat: element.seat, rake: Math.round( rake * contribution) });
      tempCopare += Math.round(rake * contribution);
    });

    this.userRakeInfo = userRake;
  }

  public GetPots(withWinner: boolean) {
    let results: any[] = [];

    if (null === this.pots || undefined === this.pots) {
      return;
    }

    this.pots.forEach(element => {

      let pls: number[] = [];
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

  public IsWinner(seat: number): boolean {
    if (null === this.pots || undefined === this.pots) {
      return;
    }

    for (let i = 0; i < this.pots.length; i++) {
      let element = this.pots[i];

      if (null != element.winners.find((winner: number) => { return winner === seat; })) {
        return true;
      }
    }

    return false;
  }

  public Clear() {
    this.player = [];
    this.deadBlind = 0;
    this.antes = 0;
    this.rakeTotal = 0;
    this.centerCardState = eCommunityCardStep.PREPARE;
  }
}