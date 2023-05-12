import { _decorator, Component, Node, Button, Label, Sprite, assetManager, ImageAsset, SpriteFrame, Texture2D, Color } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UiLOBBY_POPUP_EVENT')
export class UiLOBBY_POPUP_EVENT extends Component {
    @property(Label) labelTitle: Label = null;
    @property(Label) labelDescription: Label = null;
    @property(Label) labelLoadingMessage: Label = null;    
    @property(Label) labelButtonLabel: Label = null;    
    @property(Sprite) spriteEvent: Sprite = null;   
    @property(SpriteFrame) defaultSpriteFrame: SpriteFrame = null;
    @property(Button) buttonConfirm: Button = null;
    @property(Button) buttonConfirmDisable: Button = null;

    private popups: any[] = null;
    private current: number = 0;
    private maxPopup: number = 0;
    private cbDONE: ()=>void = null;

    public Init() {
        this.labelTitle.string = '';
        this.labelDescription.string = '';
        this.labelLoadingMessage.string = '';
        this.spriteEvent.color = Color.BLACK;
        this.spriteEvent.spriteFrame = this.defaultSpriteFrame;

        this.buttonConfirm.node.off( 'click' );
        this.buttonConfirm.node.on( 'click', this.onCONFIRM.bind(this), this );
        this.labelButtonLabel.string = '닫기';

        this.node.active = false;
    }

    public Show( popups: any[], done:()=>void ) {
        if ( done != null ) {
            this.cbDONE = done;
        }

        this.popups = popups;
        this.spriteEvent.spriteFrame = this.defaultSpriteFrame;

        this.buttonConfirm.node.active = false;
        this.buttonConfirmDisable.node.active = true;

        if ( this.popups.length > 0 ) {

            this.current = 0;
            this.labelButtonLabel.string = '확인';
            this.maxPopup = this.popups.length;
            this.spriteEvent.color = Color.BLACK;
            let popup = this.popups[ this.current ];
            this.SetPopup( popup );
            this.node.active = true;

        } else {
            this.onDONE();
        }
    }

    public Hide() {
        this.spriteEvent.spriteFrame = null;
        this.node.active = false;
    }

    private onDONE() {
        if ( this.cbDONE != null ) {
            this.cbDONE();
        }
    }

    private onCONFIRM( button: Button ) {
        let next = this.current + 1;
        if ( next < this.maxPopup ) {
            this.current = next;            
            this.SetPopup( this.popups[next] );
        } else {
            this.onDONE();
        }
    }

    private async SetPopup( popup: any ) {
        this.labelTitle.string = popup.title;
        this.labelDescription.string = popup.desc;

        this.labelLoadingMessage.string = '이미지를 불러오고 있습니다.';
        this.labelLoadingMessage.node.active = true;

        this.spriteEvent.spriteFrame = null;
        this.spriteEvent.spriteFrame = this.defaultSpriteFrame;

        this.spriteEvent.color = Color.BLACK;

        this.buttonConfirm.node.active = false;
        this.buttonConfirmDisable.node.active = true;

        await this.GetSpriteFromUrl( popup.url, (sf: any )=>{
            
            this.spriteEvent.spriteFrame = sf;
            this.spriteEvent.color = Color.WHITE;
            this.labelLoadingMessage.node.active = false;

            this.buttonConfirm.node.active = true;
            this.buttonConfirmDisable.node.active = false;

            let next = this.current + 1;
            if ( next >= this.maxPopup ) {
                this.labelButtonLabel.string = '닫기';
            }

        }, ( err: any )=>{
            this.labelLoadingMessage.string = '이미지를 로드할 수 없습니다.';
            this.labelLoadingMessage.node.active = true;

            this.buttonConfirm.node.active = true;
            this.buttonConfirmDisable.node.active = false;

            let next = this.current + 1;
            if ( next >= this.maxPopup ) {
                this.labelButtonLabel.string = '닫기';
            }            
        } );
    }

    private async GetSpriteFromUrl( url: string, onSUCCESS: (sf: any )=>void, onFAIL:( err: any )=>void ) {
        assetManager.loadRemote<ImageAsset>( url, {xhrMimeType: 'image/png'}, (error, imageAsset)=>{
            if ( !error ) {
                const spriteFrame = new SpriteFrame();
                const texture = new Texture2D();
                texture.image = imageAsset;
                spriteFrame.texture = texture;

                onSUCCESS(spriteFrame);
            } else {
                onFAIL(error);
            }
        });
    }
}

