import { _decorator, Component, Node, Label, Layout } from 'cc';
import { CommonUtil } from '../CommonUtil';
const { ccclass, property } = _decorator;

@ccclass('UiRoundPotValue')
export class UiRoundPotValue extends Component {
    @property(Label) labelPotValue: Label = null;
    private value: number = 0;

    public init() {
        this.labelPotValue.string = '';
        this.node.active = false;
    }

    public show( value: number ) {
        if ( this.labelPotValue == null ) {
            return;
        }

        if ( value > -1 ) {
            this.value = value;
            this.labelPotValue.string = CommonUtil.getKoreanNumber( this.value );            
        } else {            
            this.labelPotValue.string = CommonUtil.getKoreanNumber( this.value );
        }


        this.node.active = true;
        let layout: Layout = this.node.getComponent(Layout);
        if ( layout != null ) {
            layout.updateLayout(true);
        }
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

