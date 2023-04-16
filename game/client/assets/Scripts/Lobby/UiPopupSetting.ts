import { _decorator, Component, Node, Button, Toggle, ToggleContainer, Slider, Label, EventHandler } from 'cc';
import { LobbySystemPopup } from '../LobbySystemPopup';
import { NetworkManager } from '../NetworkManager';
import { LobbyAudioContoller } from './LobbyAudioContoller';
const { ccclass, property } = _decorator;

export const VOLUMNE_MULTIPLIER:number = 10.0;

@ccclass('UiPopupSetting')
export class UiPopupSetting extends Component {
    @property(ToggleContainer) togglesCard: ToggleContainer = null;
    @property(ToggleContainer) togglesTable: ToggleContainer = null;
    @property(ToggleContainer) togglesBackground: ToggleContainer = null;
    @property(Slider) sliderVolumn: Slider = null;
    @property(Label) labelVolumn: Label = null;    

    private selectCard: number = 0;
    private selectTable: number = 0;
    private selectBackground: number = 0;

    private initSetting: boolean = false;
    private volumn: number = 0;

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

        this.togglesCard.toggleItems.forEach( (e)=>{
            e.node.on('toggle', this.onToggleCardsChanged.bind(this) );            
        } );

        this.togglesTable.toggleItems.forEach( (e)=>{
            e.node.on('toggle', this.onToggleTablesChanged.bind(this) );            
        } );

        this.togglesBackground.toggleItems.forEach( (e)=>{
            e.node.on('toggle', this.onToggleBackgroundChanged.bind(this) );            
        } );

        const sliderEventHandler = new EventHandler();
        sliderEventHandler.target = this.node;
        sliderEventHandler.component = 'UiPopupSetting';
        sliderEventHandler.handler = 'onSliderChangeVolumn';
        sliderEventHandler.customEventData = '???'
        this.sliderVolumn.slideEvents.push( sliderEventHandler );

        this.labelVolumn.string = '';

        this.buttonExit.node.on("click", this.onClickExit.bind(this));
        this.buttonApply.node.on('click', this.onClickApply.bind(this));
    
        this.selectCard = 0;
        this.selectTable = 0;
        this.selectBackground = 0;

        this.initSetting = false;
        this.node.active = false;
    }

    onSliderChangeVolumn( slider: Slider ) {
        this.volumn = Math.floor( slider.progress * VOLUMNE_MULTIPLIER );
        this.labelVolumn.string = this.volumn.toString();
    }

    private onToggleCardsChanged( toggle: Toggle ) {
        if ( toggle.isChecked == false || this.initSetting == true ) {
            return;
        }

        LobbyAudioContoller.instance.playButtonClick();

        for ( let index = 0; index < this.togglesCard.toggleItems.length; index++ ) {
            if ( this.togglesCard.toggleItems[index].isChecked == true ) {

                this.selectCard = index;
            }
        }
    }

    private onToggleBackgroundChanged( toggle: Toggle ) {
        if ( toggle.isChecked == false || this.initSetting == true ) {
            return;
        }

        LobbyAudioContoller.instance.playButtonClick();

        for ( let index = 0; index < this.togglesBackground.toggleItems.length; index++ ) {
            if ( this.togglesBackground.toggleItems[index].isChecked == true ) {
                this.selectBackground = index;
            }
        }
    }

    private onToggleTablesChanged( toggle: Toggle ) {
        if ( toggle.isChecked == false || this.initSetting == true) {
            return;
        }

        LobbyAudioContoller.instance.playButtonClick();

        for ( let index = 0; index < this.togglesTable.toggleItems.length; index++ ) {
            if ( this.togglesTable.toggleItems[index].isChecked == true ) {
                this.selectTable = index;
            }
        }
    }

    public show() {
        let info = NetworkManager.Instance().getUserInfo();

        NetworkManager.Instance().reqSetting( info.id, (res)=>{
            let setting = res.setting;

            this.node.active = true;
            this.togglesCard.toggleItems[ setting.card ].isChecked = true;
            this.togglesTable.toggleItems[ setting.board ].isChecked = true;
            this.togglesBackground.toggleItems[ setting.background ].isChecked = true;

            this.selectCard = setting.card;
            this.selectTable = setting.board;
            this.selectBackground = setting.background;

            this.volumn = setting.sound;
            this.labelVolumn.string = ( this.volumn ).toString();
            this.sliderVolumn.progress = ( this.volumn / VOLUMNE_MULTIPLIER);
            
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
                sound: this.volumn,
                card: this.selectCard,
                table: this.selectTable,
                background: this.selectBackground
            });
        }
    }
}


