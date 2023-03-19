import { _decorator, Component, Node, EditBox, Button, director } from 'cc';
import { NetworkManager } from '../NetworkManager';
import { ENUM_UI_TYPE, UiElement } from '../UiElement';
const { ccclass, property } = _decorator;

@ccclass('Login')
export class Login extends UiElement {
    @property(EditBox) editboxPINs: EditBox = null;
    @property(Button) buttonLogin: Button = null;

    init() {
        this.uiType = ENUM_UI_TYPE.LOGIN;
        this.buttonLogin.node.on('click', this.onClickLogin.bind(this), this);

        this.node.active = false;
    }

    private onClickLogin( button: Button ) {
        button.interactable = false;
        NetworkManager.Instance().reqLogin( this.editboxPINs.string, ( res )=>{
            button.interactable = true;
            director.loadScene('Main', ()=>{
                console.log('LOAD_MAIN_SCENE_COMPLETE');

            }, ()=>{
                console.log('UNLOAD_MAIN_SCENE_COMPLETE');
            });
        }, ( err )=>{
            button.interactable = true;
        });
    }

    public show() {
        this.node.active = true;
    }

    public hide() {
        this.node.active = true;
    }
}


