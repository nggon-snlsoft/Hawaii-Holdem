import { _decorator, Component, Node, Button } from 'cc';
import { Main } from '../Main';
const { ccclass, property } = _decorator;

@ccclass('UiJoinPlayer')
export class UiJoinPlayer extends Component {
    @property(Button) buttonJoin: Button = null;
    @property(Button) buttonCancel: Button = null;

    private main: Main = null;

    init( main: Main ) {
        if ( main != null ) {
            this.main = main;
        }

        this.buttonJoin.node.on('click', this.onClickJoin.bind(this));
        this.buttonCancel.node.on('click', this.onClickCancel.bind(this));

        this.node.active = false;
    }

    hide() {
        this.node.active = false;
    }

    show() {
        this.node.active = true;
    }

    onClickJoin() {
    }

    onClickCancel() {
        this.main.onJoinCancel();
    }
}


