import { _decorator, Component, Node, Button, UITransform, director, Scene, Label, instantiate, Layout, ToggleContainer, Toggle } from 'cc';
import { Board } from '../Board';
import { CommonUtil } from '../CommonUtil';
import { LobbySystemPopup } from '../LobbySystemPopup';
import { ENUM_RESULT_CODE, NetworkManager } from '../NetworkManager';
import { UiTable } from '../UiTable';
import { LobbyAudioContoller } from './LobbyAudioContoller';
const { ccclass, property } = _decorator;

@ccclass('TableListUiElement')
export class TableListUiElement {
    @property(Node) nodeRoot: Node = null;
    @property(Label) labelTableName: Label = null;
    @property(Label) labelTableMax: Label = null;
    @property(Label) labelBlind: Label = null;
    @property(Label) labelAnte: Label = null;
    @property(Label) labelBuyIn: Label = null;
    @property(Label) labelPlayers: Label = null;
    @property(Button) buttonJoin: Button = null;

    private table: any = null;
    private cbJoinTable: ( button:Button, table: any ) => void = null;

    public copy(): TableListUiElement {
        let copyObject: TableListUiElement = new TableListUiElement();
        let newObject = instantiate (this.nodeRoot );

        copyObject.nodeRoot = newObject;
        copyObject.labelTableName = newObject.getChildByPath("LABEL_TABLE_NAME")?.getComponent(Label);
        copyObject.labelTableMax = newObject.getChildByPath("LABEL_TABLE_MAX")?.getComponent(Label);        
        copyObject.labelBlind = newObject.getChildByPath("VALUES/LABEL_BLIND")?.getComponent(Label);
        copyObject.labelAnte = newObject.getChildByPath("VALUES/LABEL_ANTE")?.getComponent(Label);        
        copyObject.labelBuyIn = newObject.getChildByPath("VALUES/LABEL_MIN_BUYIN")?.getComponent(Label);
        copyObject.labelPlayers = newObject.getChildByPath("VALUES/LABEL_PLAYERS")?.getComponent(Label);        
        copyObject.buttonJoin = newObject.getChildByPath("BUTTON_JOIN")?.getComponent(Button);

        return copyObject;
    }

    public clear() {
        this.labelTableName.string = "";
        this.labelTableMax.string = "";        
        this.labelBlind.string = "";
        this.labelAnte.string = '';
        this.labelBuyIn.string = "";

        if ( this.cbJoinTable != null ) {
            this.cbJoinTable = null;
        }
    }

    public setTable( table: any, cb: ( button:Button, table: any )=>void ) {
        this.table = table;
        this.labelTableName.string = '[' + this.table.id + '] ' + this.table.name;

        if ( table.maxPlayers == 9 ) {
            this.labelTableMax.string = '9인';

        } else if ( table.maxPlayers == 6 ) {
            this.labelTableMax.string = '6인';
        }

        this.labelBlind.string = 
            CommonUtil.getNumberStringWithComma( this.table.smallBlind )  + " / " + 
            CommonUtil.getNumberStringWithComma( this.table.bigBlind );
        this.labelAnte.string = CommonUtil.getNumberStringWithComma ( this.table.ante );
        this.labelBuyIn.string = CommonUtil.getNumberStringWithComma( this.table.minBuyIn );
        this.labelPlayers.string = table.players;

        this.cbJoinTable = null;
        this.cbJoinTable = cb;

        this.buttonJoin.node.off("click");        
        this.buttonJoin.node.on("click", this.onClickJoinTable.bind(this), this);
    }

    public setActive( active: boolean ) {
        this.nodeRoot.active = active;
    }

    public setParent( parent: Node ) {        
        this.nodeRoot.parent = parent;
    }

    private onClickJoinTable( button: Button ) {
        LobbyAudioContoller.instance.PlayButtonClick();

        this.cbJoinTable( button, this.table );
    }
}

@ccclass('UiTableList')
export class UiTableList extends Component {

    @property(Layout) contents: Layout = null;
    @property(TableListUiElement) origin: TableListUiElement = new TableListUiElement();
    @property(Toggle) toggleHoldemTable: Toggle = null;
    @property(Toggle) toggleTournament: Toggle = null;

    @property(ToggleContainer) tg: ToggleContainer = null;

    private info: any = null;
    private res: any = null;

    private tables: any[] = [];
    private elementOnList: TableListUiElement[] = [];
    private elementPool: TableListUiElement[] = [];

    private cbJoinTable: (table: any)=>void = null;
    private cbExitLobby: ()=>void = null;

    public init( cbJoinTable: (table: any)=>void, exitLobby: ()=> void  ) {
        if ( cbJoinTable != null ) {
            this.cbJoinTable = cbJoinTable;
        }

        if ( exitLobby != null ) {
            this.cbExitLobby = exitLobby;
        }

        this.toggleHoldemTable.node.on('toggle', this.onToggleHoldemTable.bind(this), this);
        this.toggleTournament.node.on('toggle', this.onToggleTournament.bind(this), this);

        this.origin.nodeRoot.active = false;
        this.node.active = false;
    }

    private onToggleHoldemTable( toggle: Toggle ) {
        if ( toggle.isChecked == false ) {
            return;
        }

        LobbyAudioContoller.instance.PlayButtonClick();
    }

    private onToggleTournament( toggle: Toggle ) {
        if ( toggle.isChecked == false ) {
            return;
        }

        LobbyAudioContoller.instance.PlayButtonClick();
    }

    private clearList() {
        this.elementOnList.forEach( (e)=> {
            e.clear();
            e.setActive(false);
            e.setParent(this.node);

            this.elementPool.push(e);
        } );

        this.elementOnList.splice(0);
    }

    private showTableList(tables: any[]) {
        if (tables == null) {
            return;
        }

        this.clearList();
        this.tables = [];
        this.tables = tables;

        this.elementOnList = [];
        this.elementPool = [];

        if ( this.tables.length < this.elementOnList.length ) {
            let toPool: TableListUiElement[] = this.elementOnList.splice( this.tables.length - 1 );

            toPool.forEach( (e)=>{
                e.clear();
                e.setActive(false);
                e.setParent(this.node);
            } );
            this.elementOnList.push(...toPool);
        }

        for ( let i = 0 ; i < this.tables.length; i++ ) {
            let table: any = this.tables[i];

            if ( this.elementOnList.length - 1 < i ) {
                let e: TableListUiElement = null;

                if ( this.elementPool.length > 0 ) {
                    e = this.elementPool.pop();
                } else {
                    e = this.origin.copy();
                }

                e.clear();
                e.setTable( table, this.onClickJoinRoom.bind(this) );
                e.setParent( this.contents.node );
                e.setActive( true );

                this.elementOnList.push( e );
                continue;
            }

            this.elementOnList[i].setTable( table, this.onClickJoinRoom.bind(this) );
            this.elementOnList[i].setActive( true );
        }
    }

    private onClickJoinRoom( button: Button, table: any) {
        if ( button == null ) {
            return;
        }

        LobbyAudioContoller.instance.PlayButtonClick();

        button.interactable = true;
        this.cbJoinTable( table );
    }

    public show() {
        this.node.active = true;
        // this.getTableList();

        // this.schedule( ()=>{
        //     this.getTableList();
        // }, 10 );
    }

    public end() {
        // this.unscheduleAllCallbacks();
    }

    public getTableList() {
        NetworkManager.Instance().getTABLE_LIST( (res)=>{
            if ( res.code == ENUM_RESULT_CODE.SUCCESS ) {
                this.showTableList(res.tables);
            } else {

            }
        }, (err)=>{
            if ( err.code == ENUM_RESULT_CODE.DISCONNECT_SERVER ) {
                LobbySystemPopup.instance.showPopUpOk('로비', '게임서버에 연결할 수 없습니다.', ()=>{
                    if ( this.cbExitLobby != null ) {
                        this.cbExitLobby();

                    }

                    // this.end();
                    // director.loadScene('LoginScene', ()=>{

                    // }, ()=>{

                    // });
                });
            }
        });
    }
}


