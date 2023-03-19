import { _decorator, Component, Node, Input, resources, SpriteFrame } from 'cc';
import { UiJoinPlayer } from './Lobby/UiJoinPlayer';
import { LoginSystemPopup } from './Login/LoginSystemPopup';
import { UiLogin } from './UiLogin';
import { UiTable } from './UiTable';
const { ccclass, property } = _decorator;

@ccclass('Main')
export class Main extends Component {
	@property(UiLogin) uiLogin: UiLogin = null;
	@property(UiJoinPlayer) uiJoinPlayer: UiLogin = null;
	@property(LoginSystemPopup) loginSystemPopup: LoginSystemPopup = null;	

    start() {
		this.uiLogin.init( this );		
		this.uiJoinPlayer.init( this );
		this.loginSystemPopup.initialize();

		if( 52 == Object.keys( UiTable.preLoadCardRes ).length ) {
			this.onPreloadDone();
			return;
		}

        this.preLoadCardRes( this.onPreloadDone.bind( this ));
    }

    preLoadCardRes( cbPreloadDone: ()=> void ) {
		for( let i = 0; i < 53; i++ ) {
			const url = `PlayingCards/${ i }/spriteFrame`;

			resources.load<SpriteFrame>( url, ( err, res ) => {

				if( null != err ) {
					// BNFLog.error( err );
				}

				UiTable.preLoadCardRes[ res.name ] = res;

				if( 52 == Object.keys( UiTable.preLoadCardRes ).length ) {
					cbPreloadDone();
				}
			} );
		}
    }

    onPreloadDone() {
        this.uiLogin.show();
    }

	public onShowJoin() {
		this.uiLogin.hide();
		this.uiJoinPlayer.show();		
	}
	
	public onJoin() {

	}

	public onJoinCancel() {
		this.uiJoinPlayer.hide();
		this.uiLogin.show();
	}
}


