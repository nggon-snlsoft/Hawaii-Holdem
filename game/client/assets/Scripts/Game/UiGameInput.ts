import { _decorator, Component, Node, Button, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UiGameInput')
export class UiGameInput extends Component {
    public  static instance: UiGameInput = null;

    @property(Button) buttonExit: Button = null;
    @property(Label) labelValue: Label = null;

    private inputValue: number = -1;
    private minValue: number = -1;
    private maxValue: number = -1;

    init() {
        UiGameInput.instance = this;
        this.node.active = false;

        this.buttonExit.node.on('click', this.onClickExit.bind(this));
    }

    private onClickExit() {
        this.node.active = false;
    }

    show( minValue: number, maxValue: number ) {
        this.minValue = minValue;
        this.node.active = true;
    }

    clear() {

    }

    hide() {
        this.node.active = false;

    }
}


