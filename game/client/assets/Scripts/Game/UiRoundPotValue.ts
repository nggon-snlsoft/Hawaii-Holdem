import { _decorator, Component, Node, Label } from 'cc';
import { CommonUtil } from '../CommonUtil';
const { ccclass, property } = _decorator;

@ccclass('UiRoundPotValue')
export class UiRoundPotValue extends Component {
    @property(Label) labelPotValue: Label = null;

    public init() {
        this.labelPotValue.string = '';
        this.node.active = false;
    }

    public show(value: number) {
        if ( this.labelPotValue == null ) {
            return;
        }

        this.labelPotValue.string = CommonUtil.getKoreanNumber( value );
        this.node.active = true;
    }

    public updatePotVaule( value: number ) {
        if ( this.labelPotValue == null ) {
            return;
        }
                
        this.labelPotValue.string = CommonUtil.getKoreanNumber( value );
    }

    public hide() {
        this.node.active = false;
    }
}

