import { _decorator, Component, Node, Label, Button } from 'cc';
import {UiControls} from "./UiControls";
const { ccclass, property } = _decorator;

@ccclass('UiGameSystemPopup')
export class UiGameSystemPopup extends Component {
    public static instance: UiGameSystemPopup = null;

    @property(Node) nodeOkPopup: Node = null;
    @property(Node) nodeYesNoPopup: Node = null;

    @property(Label) labelTitle: Label = null;
    @property(Label) labelDescription: Label = null;

    @property(Button) buttonOk: Label = null;
    @property(Button) buttonYes: Label = null;
    @property(Button) buttonNo: Label = null;

    private cbOk: ()=>void = null;
    private cbYes: ()=>void = null;
    private cbNo: ()=>void = null;
    private initialized: boolean = false;

    init() {
        this.labelTitle.string = '';
        this.labelDescription.string = '';

        this.nodeOkPopup.active = false;
        this.nodeYesNoPopup.active = false;

        this.buttonOk.node.on('click', this.onClickOk.bind(this));
        this.buttonYes.node.on('click', this.onClickYes.bind(this));
        this.buttonNo.node.on('click', this.onClickNo.bind(this));

        this.cbOk = null;
        this.cbYes = null;
        this.cbNo = null;

        this.initialized = true;
        this.node.active = false;

        UiGameSystemPopup.instance = this;
    }

    public showOkPopup( title: string, desc: string, cbOk: ()=>void ) {
        if ( this.initialized == false ) {
            this.init();
        }

        this.clear();

        if ( cbOk != null ) {
            this.cbOk = cbOk;
        }

        this.labelTitle.string = title;
        this.labelDescription.string = desc;

        this.nodeOkPopup.active = true;
        this.node.active = true;
    }

    public showYesNoPopup( title: string, desc: string, cbYes: ()=>void, cbNo: ()=>void ) {
        if ( this.initialized == false ) {
            this.init();
        }

        this.clear();

        if ( cbYes != null ) {
            this.cbYes = cbYes;
        }

        if ( cbNo != null ) {
            this.cbNo = cbNo;
        }

        this.labelTitle.string = title;
        this.labelDescription.string = desc;

        this.nodeYesNoPopup.active = true;
        this.node.active = true;
    }

    private onClickOk( button: Button ) {
        if ( this.cbOk != null ) {
            this.cbOk();
        }
    }

    private onClickYes( button: Button ) {
        if ( this.cbYes != null ) {
            this.cbYes();
        }
    }

    private onClickNo( button: Button ) {
        if ( this.cbNo != null ) {
            this.cbNo();
        }
    }

    private clear() {
        this.labelTitle.string = '';
        this.labelDescription.string = '';

        this.nodeOkPopup.active = false;
        this.nodeYesNoPopup.active = false;

        this.cbOk = null;
        this.cbYes = null;
        this.cbNo = null;
    }

    public closePopup() {
        this.clear();
        this.node.active = false;
    }
}


