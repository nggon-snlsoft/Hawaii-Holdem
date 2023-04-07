import { _decorator, Component, Node, director, Scene, resources, SpriteFrame, tween, Sprite, UIOpacity, Color, ProgressBar } from 'cc';
import { ResourceManager } from '../ResourceManager';
import { UiTable } from '../UiTable';

const { ccclass, property } = _decorator;

@ccclass('UiLobbyLoading')
export class UiLobbyLoading extends Component {
    @property(Node) rootFadeIn: Node = null;
    @property(ProgressBar) progressBar: ProgressBar = null;

    private progress: number = 0.0;

    public init() {
        this.rootFadeIn.active = false;
        this.progressBar.progress = 0.0;
        this.node.active = false;
    }

    public show() {
        this.progressBar.progress = 0.0;
        this.FadeIn( this.rootFadeIn, 1.0, ()=>{
            this.preLoadResource ();
        });
    }

    private preLoadResource() {
        this.loadSounds();
        // this.loadCards();
    }

    private loadSounds() {
        if ( ResourceManager.Instance().getSoundsPreloadState() == true ) {
            console.log('loadSounds complete');
            this.progressBar.progress = 0.2;
            this.loadCards();
            return;
        }

        ResourceManager.Instance().loadSounds( ( progress: number )=>{
            this.progressBar.progress = (progress * 0.2) ;

        }, ()=>{
            this.progressBar.progress = 0.2 ;
            this.loadCards();
        });
    }

    private loadCards() {
        if ( ResourceManager.Instance().getCardPreloadState() == true ) {
            console.log('loadCards complete');
            this.progressBar.progress = 0.4;
            this.loadChips();
            return;
        }

        ResourceManager.Instance().loadCards(( progress: number )=>{
            this.progressBar.progress = 0.2 + (progress * 0.2) ;

        }, ()=>{
            this.progressBar.progress = 0.4;
            this.progress = 0.4;
            this.loadChips();
        });
    }

    private loadChips() {
        if ( ResourceManager.Instance().getChipPreloadState() == true ) {
            console.log('loadChips complete');            
            this.progressBar.progress = 0.6;
            this.launch();
            return;
        }

        ResourceManager.Instance().loadChips(( progress: number )=>{
            this.progressBar.progress = 0.4 + (progress * 0.2) ;            
        }, ()=>{
            this.progressBar.progress = 0.6;
            this.progress = 0.6;

            this.launch();
        });
    }

    private launch() {
        let cnt = 0;
        director.preloadScene('GameScene', ( completedCount: number, totalCount: number, item: any )=>{
            cnt++;
            let p: number = cnt / 313.0;
            this.progressBar.progress = 0.6 + p * 0.4;

        }, ()=>{
            this.progressBar.progress = 1.0;

            director.loadScene('GameScene');
        });
    }

    public hide() {
        this.node.active = false;
    }

    FadeIn( target: Node, duration: number, done: ()=>void ) {
        let s = target.getComponent(Sprite);
        s.color = new Color( 0, 0, 0, 255);

        s.node.active = true;
        this.node.active = true;

        if ( s != null ) {
            let tw = tween( s.node )
            .set( {
 
            })
            .to ( duration, {

            }, {
                onUpdate: ( target: Node, ratio: number) => {
                    let a = 255 - 255 * ratio;
                    if ( a <= 0 ) {
                        a = 0;
                    }
                    s.color = new Color (0, 0, 0, a);
                }
            });

            tw.call(()=>{
                s.color = new Color( 0, 0, 0, 255);                
                s.node.active = false;
                done();
            });

            tw.start();
        }
    }
}