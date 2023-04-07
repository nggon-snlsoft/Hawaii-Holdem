import { _decorator, AudioClip, Component, Node, resources, SpriteFrame, url } from 'cc';
const { ccclass, property } = _decorator;

const CARDS_NAME: string[] = [
	"Ac", "Kc", "Qc", "Jc", "Tc", "9c", "8c", "7c", "6c", "5c", 
	"4c", "3c", "2c", "Ad", "Kd", "Qd", "Jd", "Td", "9d", "8d", 
	"7d", "6d", "5d", "4d", "3d", "2d",	"Ah", "Kh", "Qh", "Jh", 
	"Th", "9h", "8h", "7h", "6h", "5h", "4h", "3h", "2h", "As", 
	"Ks", "Qs", "Js", "Ts", "9s", "8s", "7s", "6s", "5s", "4s",
	"3s", "2s" ];

const SOUNDS_NAME: any = [
	{ name: 'VOICE_GOOD_LUCK',		url: 'voice_goodluck' },
	{ name: 'VOICE_START', 			url: 'voice_start' },

	{ name: 'VOICE_ACTION_ALLIN', 	url: 'voice_action_allin' },	
	{ name: 'VOICE_ACTION_CALL',	url: 'voice_action_call' },	
	{ name: 'VOICE_ACTION_CHECK',	url: 'voice_action_check' },	
	{ name: 'VOICE_ACTION_DIE',		url: 'voice_action_die'	},

	{ name: 'VOICE_BETTING_FULL',	url: 'voice_betting_full' },	
	{ name: 'VOICE_BETTING_HALF',	url: 'voice_betting_half' },	
	{ name: 'VOICE_BETTING_QUATER',	url: 'voice_betting_quater' },

	{ name: 'VOICE_RANK_TOP',		url: 'voice_rank_top' },	
	{ name: 'VOICE_RANK_ONEPAIR',	url: 'voice_rank_onepair' },	
	{ name: 'VOICE_RANK_TWOPAIR',	url: 'voice_rank_twopair' },
	{ name: 'VOICE_RANK_TRIPLE',	url: 'voice_rank_triple' },	
	{ name: 'VOICE_RANK_STRAIGHT',	url: 'voice_rank_straight' },	
	{ name: 'VOICE_RANK_FLUSH',		url: 'voice_rank_flush' },
	{ name: 'VOICE_RANK_FULL_HOUSE',url: 'voice_rank_fullhouse' },	
	{ name: 'VOICE_RANK_STRAIGHT_FLUSH',	url: 'voice_rank_straightflush' },	
	{ name: 'VOICE_RANK_FOURCARD',	url: 'voice_rank_fourcard' },
	{ name: 'VOICE_RANK_RSFLUSH',	url: 'voice_rank_rsflush' },
];

@ccclass('ResourceManager')
export class ResourceManager extends Component {
    private static _instance: ResourceManager = null;

    private preloadCardsResource: {} = {};
    private preloadChipsResource: {} = {};
    private preloadSoundsResouce: {} = {};	
    private preloadAvatarResouce: {} = {};

    public static Instance(): ResourceManager {
        if ( this._instance == null ) {
            this._instance = new ResourceManager();
        }
        return this._instance;
    }

    public loadAvatars( count: number, cbProgress:( progress: number )=>void, cbDone: ()=>void ) {
		let cnt: number = 0;
		let l: number = count;
		this.preloadAvatarResouce = {};
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

                this.preloadAvatarResouce[ res.name ] = res;
				if( count == Object.keys( this.preloadAvatarResouce ).length ) {
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
		for( let i = 0; i < CARDS_NAME.length + 1 ; i++ ) {
			const url = `PlayingCards/${ i }/spriteFrame`;
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
		this.preloadCardsResource = {};

		let keys = Object.keys( SOUNDS_NAME );
		let values = Object.values ( SOUNDS_NAME );

		for ( let i: number = 0 ; i < SOUNDS_NAME.length; i++ ) {
			let item = values[i];
			console.log(item['url']);
			const url = `Sounds/${ item['url'] }`;
			resources.load<AudioClip> ( url, ( err, res )=>{
				if ( null != err ) {

				}

				cnt++;
				let p: number = cnt / SOUNDS_NAME.length;
				cbProgress(p);

				this.preloadSoundsResouce[ item['name'] ] = res;
				if ( Object.keys( this.preloadSoundsResouce ).length >= SOUNDS_NAME.length ) {
					cbDone();
				}
			})
		}
    }

    public getCardImage( num: number ): SpriteFrame {
		return this.preloadCardsResource[ num ];
	}    

    public getChipImage( num: number ): SpriteFrame {
		return this.preloadChipsResource[ num ];
	}

	public getAvatarImage( num: number ): SpriteFrame {
		return this.preloadAvatarResouce[ num ];
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
		if ( Object.keys( this.preloadSoundsResouce ).length >= SOUNDS_NAME.length ) {
			return true;
		}
		return false;
	}

	public getSoundSource( name: string ): AudioClip {
		let values = Object.values ( SOUNDS_NAME );
		let clipName = values.find((e)=>{
			return e['name'] == name;
		})['name'];

		return this.preloadSoundsResouce[ clipName ];
	}

	public resetCardsPreload() {
		this.preloadCardsResource = {};
	}

	public resetChipsPreload() {
		this.preloadChipsResource = {};
	}
}

