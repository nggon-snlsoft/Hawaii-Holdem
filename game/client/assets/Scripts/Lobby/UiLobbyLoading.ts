import { _decorator, Component, Node, director, Scene, resources, SpriteFrame } from 'cc';
import { UiTable } from '../UiTable';

const { ccclass, property } = _decorator;

@ccclass('UiLobbyLoading')
export class UiLobbyLoading extends Component {

    public init() {
        this.node.active = false;
    }

    public show() {
        this.preLoadResource ( this.launch.bind(this));
        this.node.active = true;
    }

    private preLoadResource( cb: ()=> void ) {

		for( let i = 0; i < 12; i++ ) {
			const url = `BettingChips/${ i }/spriteFrame`;

			resources.load<SpriteFrame>( url, ( err, res ) => {

				if( null != err ) {
                    console.log('err');
				}

                UiTable.preLoadChipRes[ res.name ] = res;
				if( 11 == Object.keys( UiTable.preLoadChipRes ).length ) {
					cb();
				}
			} );
		}
    }

    private launch() {
        director.loadScene('GameScene', ( err: null | Error, scene?: Scene )=>{

        }, ()=>{

        });
    }

    public hide() {
        this.node.active = false;
    }
}