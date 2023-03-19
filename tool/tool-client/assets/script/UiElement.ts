import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export enum ENUM_UI_TYPE {
    NONE = 0,
    LOGIN = 1,
}

@ccclass('UiElement')
export abstract class UiElement extends Component {
    public uiType: ENUM_UI_TYPE = ENUM_UI_TYPE.NONE;

    public abstract show();
    public abstract hide();
}


