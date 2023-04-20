import { _decorator, AudioClip, Color, Component, Node, resources, Sprite, SpriteFrame, url } from 'cc';
import { NetworkManager } from './NetworkManager';
import { ENUM_DEVICE_TYPE, GameManager } from './GameManager';
const { ccclass, property } = _decorator;

const CARDS_NAME: string[] = [
	"Ac", "Kc", "Qc", "Jc", "Tc", "9c", "8c", "7c", "6c", "5c", 
	"4c", "3c", "2c", "Ad", "Kd", "Qd", "Jd", "Td", "9d", "8d", 
	"7d", "6d", "5d", "4d", "3d", "2d",	"Ah", "Kh", "Qh", "Jh", 
	"Th", "9h", "8h", "7h", "6h", "5h", "4h", "3h", "2h", "As", 
	"Ks", "Qs", "Js", "Ts", "9s", "8s", "7s", "6s", "5s", "4s",
	"3s", "2s" ];

const SOUNDS_NAME: any = [
	{ name: 'BUTTON_CLICK',				url: 'fx_click' },
	{ name: 'TURN_LIMIT',				url: 'fx_timer' },
	{ name: 'BET_CHIPS',				url: 'fx_bet' },
	{ name: 'MY_TURN',					url: 'fx_my_turn' },
	{ name: 'CARD_SHUFFLE',				url: 'fx_shuffle_card' },
	{ name: 'CARD_DEALING',				url: 'fx_dealing' },
	{ name: 'CHIP_START',				url: 'fx_chip_start' },
	{ name: 'CHIP_END',					url: 'fx_chip_end' },
	{ name: 'CARD_PUT',					url: 'fx_card_put' },
	{ name: 'CARD_FLIP',				url: 'fx_card_flip' },
	{ name: 'CARD_SHOW',				url: 'fx_card_show' },
	{ name: 'WIN',						url: 'fx_win' },
	{ name: 'SHOWDOWN',					url: 'fx_showdown' },	

	{ name: 'VOICE_GOOD_LUCK',			url: 'voice_goodluck' },
	{ name: 'VOICE_WELCOME',			url: 'voice_welcome' },	
	{ name: 'VOICE_START', 				url: 'voice_start' },

	{ name: 'VOICE_ACTION_ALLIN', 		url: 'voice_action_allin' },	
	{ name: 'VOICE_ACTION_CALL',		url: 'voice_action_call' },	
	{ name: 'VOICE_ACTION_CHECK',		url: 'voice_action_check' },	
	{ name: 'VOICE_ACTION_DIE',			url: 'voice_action_die'	},

	{ name: 'VOICE_BETTING_FULL',		url: 'voice_betting_full' },	
	{ name: 'VOICE_BETTING_HALF',		url: 'voice_betting_half' },	
	{ name: 'VOICE_BETTING_QUATER',		url: 'voice_betting_quater' },

	{ name: 'VOICE_RANK_TOP',			url: 'voice_rank_top' },	
	{ name: 'VOICE_RANK_ONEPAIR',		url: 'voice_rank_onepair' },	
	{ name: 'VOICE_RANK_TWOPAIR',		url: 'voice_rank_twopair' },
	{ name: 'VOICE_RANK_TRIPLE',		url: 'voice_rank_triple' },	
	{ name: 'VOICE_RANK_STRAIGHT',		url: 'voice_rank_straight' },	
	{ name: 'VOICE_RANK_FLUSH',			url: 'voice_rank_flush' },
	{ name: 'VOICE_RANK_FULL_HOUSE',	url: 'voice_rank_fullhouse' },	
	{ name: 'VOICE_RANK_STRAIGHT_FLUSH',url: 'voice_rank_straightflush' },	
	{ name: 'VOICE_RANK_FOURCARD',		url: 'voice_rank_fourcard' },
	{ name: 'VOICE_RANK_RSFLUSH',		url: 'voice_rank_rsflush' },
];

@ccclass('ResourceManager')
export class ResourceManager extends Component {
    private static _instance: ResourceManager = null;

    private preloadCardsResource: {} = {};
    private preloadChipsResource: {} = {};
    private preloadSoundsResource: {} = {};	
    private preloadAvatarResource: {} = {};

	private preloadTableResource: any = null;
	private preloadBackgroundResource: any = null;	

    public static Instance(): ResourceManager {
        if ( this._instance == null ) {
            this._instance = new ResourceManager();
        }
        return this._instance;
    }

    public loadAvatars( count: number, cbProgress:( progress: number )=>void, cbDone: ()=>void ) {
		let cnt: number = 0;
		let l: number = count;
		this.preloadAvatarResource = {};
		for( let i = 0; i < l; i++ ) {
			const url = `Avatars/${ i }/spriteFrame`;

			resources.load<SpriteFrame>( url, ( finished, total, item )=>{
				if ( item.ext == '.png' ) {
					cnt++;
					let p: number = cnt / l;
					cbProgress(p);
				}
			}, ( err, res ) => {

				if( null != err ) {
                    console.log('err');
				}

                this.preloadAvatarResource[ res.name ] = res;
				if( count == Object.keys( this.preloadAvatarResource ).length ) {
					cbDone();
				}
			} );
		}
    }	

    public loadChips( cbProgress:( progress: number )=>void, cbDone: ()=>void ) {
		let cnt: number = 0;
		let l: number = 12;
		this.preloadChipsResource = {};
		for( let i = 0; i < l; i++ ) {
			const url = `BettingChips/${ i }/spriteFrame`;

			resources.load<SpriteFrame>( url, ( finished, total, item )=>{
				if ( item.ext == '.png' ) {
					cnt++;
					let p: number = cnt / CARDS_NAME.length;
					cbProgress(p);
				}
			}, ( err, res ) => {

				if( null != err ) {
                    console.log('err');
				}

                this.preloadChipsResource[ res.name ] = res;
				if( l == Object.keys( this.preloadChipsResource ).length ) {
					cbDone();
				}
			} );
		}
    }

    public loadCards( cbProgress:( progress: number )=>void, cbDone: ()=>void ) {
		let cnt = 0;
		this.preloadCardsResource = {};

		let type = NetworkManager.Instance().getUserSetting().card;
		console.log('type:' + type);
		for( let i = 0; i < CARDS_NAME.length + 1 ; i++ ) {
			const url = 'Cards/'+'type' + type.toString() + '/' + i.toString() + '/spriteFrame';

			resources.load<SpriteFrame>( url, (finished, total, item )=>{
				if ( item.ext == '.png' ) {
					cnt++;
					let p: number = cnt / CARDS_NAME.length;
					cbProgress(p);
				}
			}, ( err, res ) => {

				if( null != err ) {
				}

                this.preloadCardsResource[ res.name ] = res;

				if( 52 <= Object.keys( this.preloadCardsResource ).length ) {
                    cbDone();
				}
			} );
		}
    }

    public loadSounds( cbProgress:( progress: number )=>void, cbDone: ()=>void ) {
		let cnt = 0;
		this.preloadSoundsResource = {};

		let keys = Object.keys( SOUNDS_NAME );
		let values = Object.values ( SOUNDS_NAME );

		for ( let i: number = 0 ; i < SOUNDS_NAME.length; i++ ) {
			let item = values[i];
			const url = `Sounds/${ item['url'] }`;
			resources.load<AudioClip> ( url, ( err, res )=>{
				if ( null != err ) {

				}

				cnt++;
				let p: number = cnt / SOUNDS_NAME.length;
				cbProgress(p);
				this.preloadSoundsResource[ item['name'] ] = res;

				if ( Object.keys( this.preloadSoundsResource ).length >= SOUNDS_NAME.length ) {
					cbDone();
				}
			})
		}
    }

	public loadTables ( cbDone: ()=>void ) {
		let cnt = 0;
		this.preloadTableResource = null;

		let url: string = '';
		let info = GameManager.Instance().GetInfo();
		let type = NetworkManager.Instance().getUserSetting().board;

		if ( info.device == ENUM_DEVICE_TYPE.MOBILE_PORTRAIT ) {
			url = 'Tables/'+'portrait/'+ type.toString() + '/spriteFrame';

		} else {
			url = 'Tables/'+'landscape/'+ type.toString() + '/spriteFrame';
		}

		resources.load<SpriteFrame> (url, (err, res )=>{
			if ( null != err ) {

			}
			this.preloadTableResource = res;
			cbDone();
		});
    }

	public loadBackground ( cbDone: ()=>void ) {
		let cnt = 0;
		this.preloadBackgroundResource = null;

		let type = NetworkManager.Instance().getUserSetting().background;
		let url: string = 'Backgrounds/'+type.toString() + '/spriteFrame';

		resources.load<SpriteFrame> (url, (err, res )=>{
			if ( null != err ) {

			}
			this.preloadBackgroundResource = res;
			cbDone();
		});
    }

    public getCardImage( num: number ): SpriteFrame {
		return this.preloadCardsResource[ num ];
	}    

    public getChipImage( num: number ): SpriteFrame {
		return this.preloadChipsResource[ num ];
	}

	public getAvatarImage( num: number ): SpriteFrame {
		return this.preloadAvatarResource[ num ];
	}

	public getTableImage() {
		return this.preloadTableResource;
	}

	public getBackgroundImage() {
		return this.preloadBackgroundResource;
	}

	public setBackgroundImage( s:Sprite ) {
		s.spriteFrame = this.preloadBackgroundResource;
		let type = NetworkManager.Instance().getUserSetting().background;
		switch ( type ) {
			case 0:
				s.color = new Color(30, 30, 30, 255);
				break;
			case 1:
				s.color = new Color(100, 100, 100, 255);				
				break;
			case 2:
				s.color = new Color(150, 150, 150, 255);				
				break;
			case 3:
				s.color = new Color(70, 70, 70, 255);				
				break;
			case 4:
				s.color = new Color(100, 100, 100, 255);				
				break;
		}
	}

	public setTableImage( s:Sprite ) {
		s.spriteFrame = this.preloadTableResource;
	}

	public getCardPreloadState(): boolean {		
		if ( Object.keys( this.preloadCardsResource ).length >= 53 ) {
			return true;
		}
		return false;
	}

	public getChipPreloadState(): boolean {
		if ( Object.keys( this.preloadChipsResource ).length >= 11 ) {
			return true;
		}
		return false;
	}

	public getSoundsPreloadState(): boolean {
		if ( Object.keys( this.preloadSoundsResource ).length >= SOUNDS_NAME.length ) {
			return true;
		}
		return false;
	}

	public getTablePreloadState(): boolean {
		return false;

		// if ( this.preloadTableResource != null ) {
		// 	return true;
		// }
		// return false;
	}

	public getBackgroundPreloadState(): boolean {
		return false;

		// if ( this.preloadBackgroundResource != null ) {
		// 	return true;
		// }
		// return false;
	}

	public getSoundSource( name: string ): AudioClip {
		let values = Object.values ( SOUNDS_NAME );
		let clipName = values.find((e)=>{
			return e['name'] == name;
		})['name'];

		return this.preloadSoundsResource[ clipName ];
	}

	public resetCardsPreload() {
		this.preloadCardsResource = {};
	}

	public resetChipsPreload() {
		this.preloadChipsResource = {};
	}
}

