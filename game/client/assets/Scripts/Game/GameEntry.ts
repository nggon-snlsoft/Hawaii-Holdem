import { _decorator, Component, Node, game, Game, Label } from 'cc';
import {UiGameSystemPopup} from "./UiGameSystemPopup";
import { UiControls } from './UiControls';
import { AudioController } from './AudioController';
import { ENUM_DEVICE_TYPE, GameManager } from '../GameManager';
import { UiTable } from '../UiTable';
import { Board } from '../Board';
const { ccclass, property } = _decorator;

@ccclass('GameEntry')
export class GameEntry extends Component {
    @property(AudioController) audioController: AudioController = null;

    @property(Node) rootPortrait: Node = null;
    @property(Node) rootLandscape: Node = null;

    private _root: Node = null;
    private _popup: UiGameSystemPopup = null;
    private _controls: UiControls = null;
    private _isChildrenRegisted: boolean = false;
    private _table: UiTable = null;
    private _rootInformation: Node = null;
    private _labelID: Label = null;    
    private _labelSB: Label = null;
    private _labelBB: Label = null;

    onLoad() {
		this.rootPortrait.active = false;
		this.rootLandscape.active = false;

		let Info: any = GameManager.Instance().GetInfo();
		switch ( Info.device ) {
			case ENUM_DEVICE_TYPE.MOBILE_PORTRAIT:
				this._root = this.rootPortrait;
			break;

			case ENUM_DEVICE_TYPE.PC_LANDSCAPE:
				this._root = this.rootLandscape;
			break;				
		}

		this.RegisterChildren();
		this.Init();

		this._root.active = true;
    }

    private Init() {
        this._popup.init();
        this._controls.init();
        this.audioController.init();

        this._table.init();
        this._table.show();

        if ( this._rootInformation != null ) {
            if ( this._labelID != null ) {
                this._labelID.string = (Board.id).toString();
                this._labelID.node.active = true;
            }

            if ( this._labelSB != null ) {
                this._labelSB.string = (Board.small).toString();
                this._labelSB.node.active = true;
            }

            if ( this._labelBB != null ) {
                this._labelBB.string = (Board.big).toString();
                this._labelBB.node.active = true;
            }

            this._rootInformation.active = true;
        }

        game.on( Game.EVENT_SHOW, this.onEVENT_SHOW.bind(this), this );
        game.on( Game.EVENT_HIDE, this.onEVENT_HIDE.bind(this), this );
    }

    private RegisterChildren() {
		if ( this._root == null || this._isChildrenRegisted == true ) {
			return;
		}

        this._popup = this._root.getChildByPath('GAME_SYSTEM_POPUP').getComponent(UiGameSystemPopup);
        if ( this._popup != null ) {
            this._popup.node.active = false;
        }


        this._controls = this._root.getChildByPath('GLOBAL_BUTTONS').getComponent(UiControls);
        if ( this._controls != null ) {
            this._controls.node.active = false;
        }

        this._table = this._root.getChildByPath('UI_TABLE').getComponent(UiTable);
        if ( this._table != null ) {
            this._table.node.active = false;
        }

        this._rootInformation = this._root.getChildByPath('INFO');
        if ( this._rootInformation != null ) {
            this._table.node.active = false;

            this._labelID = this._rootInformation.getChildByPath('LABEL_ID').getComponent(Label);
            if ( this._labelID != null ) {
                this._labelID.node.active = false;
                this._labelID.string = '0';
            }
            
            this._labelSB = this._rootInformation.getChildByPath('LABEL_SB').getComponent(Label);
            if ( this._labelSB != null ) {
                this._labelSB.node.active = false;
                this._labelSB.string = '0';
            }

            this._labelBB = this._rootInformation.getChildByPath('LABEL_BB').getComponent(Label);
            if ( this._labelBB != null ) {
                this._labelBB.node.active = false;
                this._labelBB.string = '0';
            }
        }

        this._isChildrenRegisted = true;
    }

    private onEVENT_SHOW() {
        console.log('onEVENT_SHOW');
        this._table.onEVENT_SHOW();
    }

    private onEVENT_HIDE() {
        console.log('onEVENT_HIDE');        
        this._table.onEVENT_HIDE();
    }
}


