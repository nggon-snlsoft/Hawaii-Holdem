import { _decorator, Component, Node, AudioSource, AudioClip } from 'cc';
import { ResourceManager } from '../ResourceManager';
const { ccclass, property } = _decorator;

@ccclass('AudioController')
export class AudioController extends Component {
    static instance: AudioController;

    @property(AudioClip) clipButtonClick: AudioClip = null;
    @property(AudioClip) clipShufflingCard: AudioClip = null;
    @property(AudioClip) clipCardDispensing: AudioClip = null;
    @property(AudioClip) clipPutHandCard: AudioClip = null;
    @property(AudioClip) clipHideHiddenCard: AudioClip = null;

    @property(AudioClip) clipAllIn: AudioClip = null;
    @property(AudioClip) clipCall: AudioClip = null;    
    @property(AudioClip) clipCheck: AudioClip = null;
    @property(AudioClip) clipFold: AudioClip = null;
    @property(AudioClip) clipBet: AudioClip = null;
    @property(AudioClip) clipRaise: AudioClip = null;

    @property(AudioClip) clipMyTurn: AudioClip = null;
    @property(AudioClip) clipShowHands: AudioClip = null;
    @property(AudioClip) clipFlipHands: AudioClip = null;    
    @property(AudioClip) clipWin: AudioClip = null;
    @property(AudioClip) clipShowCommunityCards: AudioClip = null;
    @property(AudioClip) clipFlipCommunityCards: AudioClip = null;

    @property(AudioClip) clipChipMoveStart: AudioClip = null;
    @property(AudioClip) clipChipMoveEnd: AudioClip = null;    

    @property(AudioClip) clipShowDown: AudioClip = null;    

    @property(AudioSource) audioSource: AudioSource = null;
    @property(AudioSource) audioSourceTimeLimitFourSec: AudioSource = null;

    init() {
        AudioController.instance = this;
    }

    public playBGM() {

    }

    public playStop() {

    }

    public pauseBGM() {

    }

    public resumeBGM() {

    }

    public playButtonClick() {
        this.audioSource.playOneShot( this.clipButtonClick );
    }

    public playAllIn() {
        this.audioSource.playOneShot( this.clipAllIn );
    }

    public playFold() {
        this.audioSource.playOneShot( this.clipFold );
    }

    public playBet() {
        this.audioSource.playOneShot( this.clipBet );
    }

    public playCheck() {
        this.audioSource.playOneShot( this.clipCheck );
    }

    public playCall() {
        this.audioSource.playOneShot( this.clipCall );
    }

    public playRaise() {
        this.audioSource.playOneShot( this.clipBet);

    }

    public playShufflingCard() {
        this.audioSource.playOneShot( this.clipShufflingCard );
    }

    playChipMoveStart() {
        this.audioSource.playOneShot( this.clipChipMoveStart );
    }

    playChipMoveEnd() {
        this.audioSource.playOneShot( this.clipChipMoveEnd );
    }

    public playCardDispensing() {
        this.audioSource.playOneShot( this.clipCardDispensing );
    }

    public playPutHandCard() {
        this.audioSource.playOneShot( this.clipPutHandCard );
    }

    public playFlipHandCard() {
        this.audioSource.playOneShot( this.clipFlipHands );
    }

    public playHideHiddenCard() {
        this.audioSource.playOneShot( this.clipHideHiddenCard );        
    }

    public playShowCommunityCards() {
        this.audioSource.playOneShot( this.clipShowCommunityCards );        
    }

    public playFlipCommnityCards() {
        this.audioSource.playOneShot( this.clipFlipCommunityCards );        
    }

    public playWin() {
        this.audioSource.playOneShot( this.clipWin );
    }

    public playShowHands() {
        this.audioSource.playOneShot( this.clipShowHands );
    }

    public playShowDown() {
        this.audioSource.playOneShot( this.clipShowDown );
    }

    public playTimeLimitForSec() {
        this.audioSourceTimeLimitFourSec.play();
    }

    public stopTimeLimitForSec() {
        this.audioSourceTimeLimitFourSec.stop();
    }

    playMyTurn() {
        this.audioSource.playOneShot( this.clipMyTurn );
    }

    PlaySound( name: string ) {
        let source: AudioClip = null;
        source = ResourceManager.Instance().getSoundSource(name);
        if ( source != null ) {
            console.log('PlaySound');
            this.audioSource.playOneShot(source);
        }
    }


}


