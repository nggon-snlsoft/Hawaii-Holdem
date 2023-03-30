import { _decorator, Component, Node, resources, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

const CARDS_NAME: string[] = [
	"Ac", "Kc", "Qc", "Jc", "Tc", "9c", "8c", "7c", "6c", "5c", 
	"4c", "3c", "2c", "Ad", "Kd", "Qd", "Jd", "Td", "9d", "8d", 
	"7d", "6d", "5d", "4d", "3d", "2d",	"Ah", "Kh", "Qh", "Jh", 
	"Th", "9h", "8h", "7h", "6h", "5h", "4h", "3h", "2h", "As", 
	"Ks", "Qs", "Js", "Ts", "9s", "8s", "7s", "6s", "5s", "4s",
	"3s", "2s" ];

@ccclass('ResourceManager')
export class ResourceManager extends Component {
    private static _instance: ResourceManager = null;

    private preloadCardsResource: {} = {};
    private preloadChipsResource: {} = {};
    private preloadAvatarResouce: {} = {};

    public static Instance(): ResourceManager {
        if ( this._instance == null ) {
            this._instance = new ResourceManager();
        }
        return this._instance;
    }

    public loadChips( cbDone: ()=>void ) {
		for( let i = 0; i < 12; i++ ) {
			const url = `BettingChips/${ i }/spriteFrame`;

			resources.load<SpriteFrame>( url, ( err, res ) => {

				if( null != err ) {
                    console.log('err');
				}

                this.preloadChipsResource[ res.name ] = res;
				if( 11 == Object.keys( this.preloadChipsResource ).length ) {
					cbDone();
				}
			} );
		}
    }

    public loadCards( cbDone: ()=>void ) {
		for( let i = 0; i < 53; i++ ) {
			const url = `PlayingCards/${ i }/spriteFrame`;

			resources.load<SpriteFrame>( url, ( err, res ) => {

				if( null != err ) {
				}

                this.preloadCardsResource[ res.name ] = res;

				if( 52 == Object.keys( this.preloadCardsResource ).length ) {
                    cbDone();
				}
			} );
		}
    }    

    public getCardImage( num: number ): SpriteFrame {
		return this.preloadCardsResource[ num ];
	}    

    public getChipImage( num: number ): SpriteFrame {
		return this.preloadChipsResource[ num ];
	}
}

