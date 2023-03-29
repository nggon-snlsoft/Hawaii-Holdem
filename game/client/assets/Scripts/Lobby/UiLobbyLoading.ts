import { _decorator, Component, Node, director, Scene, resources, SpriteFrame } from 'cc';
import { ResourceManager } from '../ResourceManager';
import { UiTable } from '../UiTable';

const { ccclass, property } = _decorator;

@ccclass('UiLobbyLoading')
export class UiLobbyLoading extends Component {
    private progress: number = 0.0;

    public init() {
        this.node.active = false;
    }

    public show() {
        this.preLoadResource ();
        this.node.active = true;
    }

    private preLoadResource() {
        this.loadCards();
    }

    private loadCards() {
        ResourceManager.Instance().loadCards(()=>{
            console.log('preload cards complete');
            this.progress = 0.2;
            this.loadChips();
        });
    }

    private loadChips() {
        ResourceManager.Instance().loadChips(()=>{
            console.log('preload chips complete');
            this.progress = 0.4;

            this.launch();
        });
    }

    private launch() {
        director.preloadScene('GameScene', ()=>{
            console.log('preload scene complete');
            director.loadScene('GameScene');
        });
    }

    public hide() {
        this.node.active = false;
    }
}