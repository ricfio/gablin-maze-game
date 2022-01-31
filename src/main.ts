import './pixi'
import Game from './game';
//
//import * as scaleToWindow from '../lib/various/scaleToWindow.js';
declare const scaleToWindow: any;

new class Main {
    app: PIXI.Application;
    game: Game;

    settings: object = {
        width: 1280,
        height: 720,
        antialias: true,
        transparent: false,
        resolution: 1,
        backgroundColor: 0x000000,
    };

    scale: number;

    constructor() {
        const type = ((PIXI.utils.isWebGLSupported()) ? "WebGL" : "canvas");
        PIXI.utils.sayHello(type);

        // Create the Pixi Application
        this.app = new PIXI.Application(this.settings);
        //
        window.addEventListener("resize", this.onResize.bind(this));
        // Add the canvas that Pixi automatically created for you to the HTML document
        document.body.appendChild(this.app.view);
        //
        this.app.renderer.view.style.position = "absolute";
        this.app.renderer.view.style.display = "block";
        this.app.renderer.autoDensity = true;
        //
        this.onResize(null);
        // 
        this.game = new Game(this.app, false);
        this.game.boot();
    }

    public onResize(event: Event) {
        this.scale = scaleToWindow(this.app.renderer.view);    
    }

}
