import { _decorator, Component, Node, Button, UITransform, director, Scene, Label, instantiate, Layout, ToggleContainer, Toggle } from 'cc';
import { Board } from '../Board';
import { CommonUtil } from '../CommonUtil';
import { LobbySystemPopup } from '../LobbySystemPopup';
import { NetworkManager } from '../NetworkManager';
import { UiTable } from '../UiTable';
import { LobbyAudioContoller } from './LobbyAudioContoller';
const { ccclass, property } = _decorator;

@ccclass('TableListUiElement')
export class TableListUiElement {
    @property(Node) nodeRoot: Node = null;
    @property(Label) labelTableName: Label = null;
    @property(Label) labelBlind: Label = null;
    @property(Label) labelBuyIn: Label = null;
    @property(Button) buttonJoin: Button = null;

    private table: any = null;
    private cbJoinTable: ( button:Button, table: any ) => void = null;

    public copy(): TableListUiElement {
        let copyObject: TableListUiElement = new TableListUiElement();
        let newObject = instantiate (this.nodeRoot );

        copyObject.nodeRoot = newObject;
        copyObject.labelTableName = newObject.getChildByPath("LABEL_TABLE_NAME")?.getComponent(Label);
        copyObject.labelBlind = newObject.getChildByPath("VALUES/LABEL_BLIND")?.getComponent(Label);
        copyObject.labelBuyIn = newObject.getChildByPath("VALUES/LABEL_MIN_BUYIN")?.getComponent(Label);
        copyObject.buttonJoin = newObject.getChildByPath("BUTTON_JOIN")?.getComponent(Button);

        return copyObject;
    }

    public clear() {
        this.labelTableName.string = "";
        this.labelBlind.string = "";
        this.labelBuyIn.string = "";
    }

    public setTable( table: any, cb: ( button:Button, table: any )=>void ) {
        this.table = table;
        this.labelTableName.string = "Hold'em Table " + this.table.id;
        this.labelBlind.string = 
            CommonUtil.getNumberStringWithComma( this.table.info.smallBlind )  + " / " + 
            CommonUtil.getNumberStringWithComma( this.table.info.bigBlind );
        this.labelBuyIn.string = CommonUtil.getNumberStringWithComma( this.table.info.minStakePrice );

        this.cbJoinTable = cb;

        this.buttonJoin.node.on("click", this.onClickJoinTable.bind(this), this);
    }

    public setActive( active: boolean ) {
        this.nodeRoot.active = active;
    }

    public setParent( parent: Node ) {        
        this.nodeRoot.parent = parent;
    }

    private onClickJoinTable( button: Button ) {
        LobbyAudioContoller.instance.playButtonClick();

        this.cbJoinTable( button, this.table )
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

    public init( cbJoinTable: (table: any)=>void ) {
        if ( cbJoinTable != null ) {
            this.cbJoinTable = cbJoinTable;
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

        LobbyAudioContoller.instance.playButtonClick();
    }

    private onToggleTournament( toggle: Toggle ) {
        if ( toggle.isChecked == false ) {
            return;
        }

        LobbyAudioContoller.instance.playButtonClick();
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
        this.tables = tables;

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

        LobbyAudioContoller.instance.playButtonClick();

        button.interactable = true;
        this.cbJoinTable( table );
    }

    private onClickQuickStart()
    {
        this.searchQuickStartRoom();
    }

    private searchQuickStartRoom(){
        let roomId: number = 141;        
        NetworkManager.Instance().reqPublicRoomList(
            (res)=>{
                
                let info = res.find((elem)=> {
                    return elem.id == roomId;

                });

                if (info == null)
                {
                    return;
                }

                NetworkManager.Instance().reqPublicRoomInfo(141, (roomInfo)=>{
                    this.setTableInfo(info, roomInfo);                    
                    this.onJoinQuickRoom(roomId);

                }, (msg)=>{

                });
            }, 
            (msg)=>{

            });
    }

    private setTableInfo(info: any, res: any) {
        this.info = info;
        this.res = res;
    }

    private getTableInfo(): any {
        return {
            isPublic: true,
            id: this.info.id,
            maxPlayers: this.info.maxPlayers,
            name: this.info.name,
            type: this.info.rule,
            sb: this.info.sb,
            bb: this.info.bb,
            betSpeed: this.res.betTimeLimit,
            min: this.res.minStakePrice,
            max: this.res.maxStakePrice,
            passTerm: this.res.timePassTerm,
            passPrice: this.res.timePassPrice,
            useTimePass: this.info.useTimePass,
            useRake: this.info.useRake,
            useFlopRake: this.info.useFlopRake,
            rake: this.info.rake
        };
    }

    private onJoinQuickRoom(roomId: number) {
        NetworkManager.Instance().reqJoinPublicRoom(roomId, (room, count)=>{

            Board.info = this.getTableInfo();

            Board.isPublic = true;
            Board.room = room;
            Board.buyin = 10000;
            
            UiTable.seatMaxFromServer = count;

            director.loadScene("GameScene", 
            (error: null | Error, scene?: Scene)=>{

            }, 
            ()=>{

            });
        }, 
        (msg, exitLobby)=>{

        })
    }

    private onClickSearchRoom()
    {
        LobbySystemPopup.instance.showPopUpOk("SEARCH ROOM", "아직 지원하지 않는 기능", ()=>{

        });
    }

    private onClickTournament()
    {
        LobbySystemPopup.instance.showPopUpOk("TOURNAMENT", "아직 지원하지 않는 기능", ()=>{

        });
    }

    private onClickMakeRoom()
    {
        // this.uiLobby.makeInstanceRoom();
    }

    public show() {
        this.getTableList();
        this.node.active = true;
    }

    public getTableList() {

        NetworkManager.Instance().reqTableList((res)=>{
            console.log(res);

            // this.showTableList(res.tables);

        }, (msg)=>{

        });
    }
}


