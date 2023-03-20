import { _decorator, Component, Node, Button, Toggle, ToggleContainer } from 'cc';
import { LobbySystemPopup } from '../LobbySystemPopup';
import { NetworkManager } from '../NetworkManager';
import { LobbyAudioContoller } from './LobbyAudioContoller';
const { ccclass, property } = _decorator;

@ccclass('UiPopupSetting')
export class UiPopupSetting extends Component {
    @property(ToggleContainer) toggleContainerCardFronts: ToggleContainer = null;
    @property(ToggleContainer) toggleContainerCardBacks: ToggleContainer = null;
    @property(ToggleContainer) toggleTables: ToggleContainer = null;

    private currentCardFront: number = -1;
    private currentCardBack: number = -1;
    private currentTable: number = -1;

    private selectCardFront: number = -1;
    private selectCardBack: number = -1;
    private selectTable: number = -1;

    private initSetting: boolean = false;

    @property(Button) buttonExit: Button = null;
    @property(Button) buttonApply: Button = null;    

    private cbExit: ()=>void = null;
    private cbApply: ( selected: any )=>void = null;    

    public init( cbExit: ()=>void , cbApply: (selected: any )=>void ){
        if ( cbExit != null ) {
            this.cbExit = cbExit;
        }

        if ( cbApply != null ) {
            this.cbApply = cbApply;
        }

        this.toggleContainerCardFronts.toggleItems.forEach( (e)=>{
            e.node.on('toggle', this.onToggleCardFrontsChanged.bind(this) );            
        } );

        this.toggleContainerCardBacks.toggleItems.forEach( (e)=>{
            e.node.on('toggle', this.onToggleCardBacksChanged.bind(this) );            
        } );

        this.toggleTables.toggleItems.forEach( (e)=>{
            e.node.on('toggle', this.onToggleTablesChanged.bind(this) );            
        } );

        this.buttonExit.node.on("click", this.onClickExit.bind(this));
        this.buttonApply.node.on('click', this.onClickApply.bind(this));

        this.initSetting = false;
        this.node.active = false;
    }

    private onToggleCardFrontsChanged( toggle: Toggle ) {
        if ( toggle.isChecked == false || this.initSetting == true ) {
            return;
        }

        LobbyAudioContoller.instance.playButtonClick();

        for ( let index = 0; index < this.toggleContainerCardFronts.toggleItems.length; index++ ) {
            if ( this.toggleContainerCardFronts.toggleItems[index].isChecked == true ) {

                this.selectCardFront = index;
            }
        }
    }

    private onToggleCardBacksChanged( toggle: Toggle ) {
        if ( toggle.isChecked == false || this.initSetting == true ) {
            return;
        }

        LobbyAudioContoller.instance.playButtonClick();

        for ( let index = 0; index < this.toggleContainerCardBacks.toggleItems.length; index++ ) {
            if ( this.toggleContainerCardBacks.toggleItems[index].isChecked == true ) {
                this.selectCardBack = index;
            }
        }
    }

    private onToggleTablesChanged( toggle: Toggle ) {
        if ( toggle.isChecked == false || this.initSetting == true) {
            return;
        }

        LobbyAudioContoller.instance.playButtonClick();

        for ( let index = 0; index < this.toggleTables.toggleItems.length; index++ ) {
            if ( this.toggleTables.toggleItems[index].isChecked == true ) {
                this.selectTable = index;
            }
        }
    }

    public show() {
        let info = NetworkManager.Instance().getUserInfo();

        NetworkManager.Instance().reqSetting( info.id, (res)=>{
            console.log(res);
            let setting = res.setting;
            this.node.active = true;

            this.toggleContainerCardFronts.toggleItems[ Number(setting.cardFront) ].isChecked = true;
            this.toggleContainerCardBacks.toggleItems[ Number(setting.cardBack) ].isChecked = true;
            this.toggleTables.toggleItems[ Number(setting.board) ].isChecked = true;

        }, (err)=>{
            LobbySystemPopup.instance.showPopUpOk('설정', '설정을 얻어올 수 없습니다.', ()=>{
                LobbySystemPopup.instance.closePopup();
            });
        });
    }

    public hide() {
        this.node.active = false;
    }

    private onClickExit( button: Button ) {
        if ( this.cbExit != null ) {
            LobbyAudioContoller.instance.playButtonClick();

            this.cbExit();
        }

        this.node.active = false;
    }

    private onClickApply( button: Button ) {

        if ( this.cbApply != null ) {
            LobbyAudioContoller.instance.playButtonClick();
            this.cbApply( {
                cardFront: this.selectCardFront,
                cardBack: this.selectCardBack,
                tableType: this.selectTable
            });
        }
    }
}


