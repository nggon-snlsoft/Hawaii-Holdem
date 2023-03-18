import { _decorator, Component, Node, AudioSource, AudioClip } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LobbyAudioContoller')
export class LobbyAudioContoller extends Component {
    static instance: LobbyAudioContoller;
    @property(AudioClip) clipButtonClick: AudioClip = null;

    @property(AudioSource) audioSource: AudioSource = null;

    init() {
        LobbyAudioContoller.instance = this;
    }

    playButtonClick() {
        this.audioSource.playOneShot( this.clipButtonClick );
    }

}


