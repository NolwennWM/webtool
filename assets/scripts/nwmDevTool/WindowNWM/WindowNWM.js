"use strict";

export default class WindowNWM extends HTMLElement
{
    /** class of the window HTML Element */
    static windowClass = "nwm-window"
    /** path for the folder of this class */
    #href = "./assets/scripts/nwmDevTool/";
    /** default language of the window */
    lang = "fr";
    /** @type {HTMLElement} HTML Element containing the title of the window */
    #title;
    /** list of functions binded for event listeners */
    #events= {};
    /** start position of the window during a movement */
    startPosition = {windowX: 0, windowY: 0};
    /** @type {HTMLElement|undefined} last HTML Link Element inserted */
    lastStyle;
    /** @type {HTMLElement} HTML Element containing the header of the window */
    header;

    constructor()
    {
        super();
        this.#events.movingWindow = this.#movingWindow.bind(this);
        this.#events.endMoveWindow = this.#endMoveWindow.bind(this);
        this.#init();
    }
    /**
     * Initialise the window.
     */
    #init()
    {
        this.attachShadow({mode:"open"});

        this.setCSS("WindowNWM/WindowNWM.css");

        this.classList.add("open", this.constructor.windowClass)
        this.addEventListener("pointerdown", this.activeWindow.bind(this));
        this.activeWindow();
        this.#generateID();

        this.container = document.createElement("div");
        this.container.classList.add("window-container")

        const header = document.createElement("div");
        header.classList.add("window-header");
        header.addEventListener("pointerdown", this.#startMoveWindow.bind(this));

        this.header = header;
        const btnsHeader = document.createElement("div")
        btnsHeader.classList.add("btns-container")

        const close = document.createElement("button");
        close.classList.add("close", "btn");
        close.innerHTML = "&#10060;";
        close.addEventListener("pointerup", this.#closeWindow.bind(this));
        
        const toggle = document.createElement("button");
        toggle.classList.add("toggle", "btn");
        toggle.innerHTML = "&#x23AF;";
        toggle.addEventListener("pointerup", this.#toggleWindow.bind(this));

        const fs = document.createElement("button");
        fs.classList.add("fullscreen", "btn");
        fs.innerHTML = "&#x26F6;";
        fs.addEventListener("pointerup", this.#toggleFullscreen.bind(this));

        this.#title = document.createElement("h2");
        btnsHeader.append(toggle,fs, close)
        header.append(this.#title, btnsHeader);

        this.shadowRoot.append(header, this.container);
        
    }
    /**
     * LifeCycle called if the window is added to DOM
     */
    connectedCallback()
    {
        document.addEventListener("pointerup", this.#events.endMoveWindow);
        if(!this.style.top) this.setPosition();
    }
    /**
     * LifeCycle called if the window is removed from DOM
     */
    disconnectedCallback()
    {
        document.removeEventListener("pointerup", this.#events.endMoveWindow);
    }
    /**
     * Create a "link" tag and insert it in the shadowDOM
     * @param {string} href href for a css file.
     */
    setCSS(href)
    {
        const style = document.createElement("link");
        style.rel = "stylesheet";
        style.href = this.#href+href;
        if(!this.lastStyle)
        {
            this.shadowRoot.prepend(style);
            this.lastStyle = style;
            return;
        }
        this.lastStyle.after(style);
    }
    /**
     * set the title of the window.
     * @param {string} title title of the window
     */
    setTitle(title)
    {
        this.#title.textContent = title;
    }
    /**
     * expand or close the window.
     * @param {PointerEvent|MouseEvent} e Pointer or mouse Event
     */
    #toggleWindow(e)
    {
        if(e.target.classList.contains(".close")) return;
        this.classList.toggle("open");
    }
    /**
     * Toggle the fullscreen of the window
     */
    #toggleFullscreen()
    {
        if(!document.fullscreenElement)
        {
            this.requestFullscreen()
            return;
        }
        document.exitFullscreen();
    }
    /**
     * remove the window from HTML
     */
    #closeWindow()
    {
        this.remove();
    }
    /**
     * Generate uniq id for the window.
     * @param {number} length size of the id
     */
    #generateID(length = 6)
    {
        let id = "id-";
        id += Math.random().toString(36).substring(2, length+2);
        
        const exist = document.querySelector("#"+id);
        if(exist)
        {
            this.#generateID(length);
            return;
        }
        this.id = id;
    }
    setPosition()
    {
        this.style.height = "80dvh";
        this.style.width = "80dvw";
        this.style.top = "10dvh";
        this.style.left = "10dvw";
    }
    /**
     * put the last clicked window over the others
     */
    activeWindow()
    {
        if(window.activeNWMWindow === this) return;
        if(window.activeNWMWindow)
        {
            window.activeNWMWindow.style.zIndex = "";
        }
        this.style.zIndex = 10;
        window.activeNWMWindow = this;

    }
    /**
     * Move the window
     * @param {PointerEvent} e pointermove event
     */
    #movingWindow(e)
    {
        const {clientX,clientY} = e;
        
        this.style.top = this.startPosition.windowY+ clientY+"px";
        this.style.left = this.startPosition.windowX+ clientX+"px";
    }
    /**
     * Start the movement of the window
     * @param {PointerEvent} e pointerdown event
     */
    #startMoveWindow(e)
    {
        if(e.target !== this.header && e.target !== this.#title)return;
        const {x, y} = this.getBoundingClientRect();
        this.startPosition = {windowX : x- e.clientX, windowY: y - e.clientY};
        this.classList.add("moving");
        document.addEventListener("pointermove", this.#events.movingWindow);
    }
    /**
     * Set end to the movement of the window and check if the last position is valid
     */
    #endMoveWindow()
    {
        this.classList.remove("moving");
        document.removeEventListener("pointermove", this.#events.movingWindow);

        const {x, y,width} = this.getBoundingClientRect();
        const headerHeight = this.header.getBoundingClientRect().height;

        if(y<0) this.style.top = "0";
        if(y>window.innerHeight) this.style.top = window.innerHeight - headerHeight+"px";
        if(x+width<150)this.style.left = 150-width+"px";
        if(x>window.innerWidth-150)this.style.left = window.innerWidth-150 + "px";
    }
    /**
     * set the language of the window.
     */
    chooseLanguage()
    {
        // TODO: save lang in localstorage
        const params = new URLSearchParams(document.location.search);
        const lang = params.get("lang");
        if(!lang || !this.text || !this.text.languages.includes(lang))
        {
            this.lang = "en";
            return;
        }
        this.lang = lang;
    }
}
customElements.define("nwm-window", WindowNWM);