"use strict";

import { WindowNWMText } from "./WindowNWMText.js";

// interessant mais pas géré par firefox TODO : quand géré mettre text en voir config en json
// import * as text from "./test.json" with {type: "json"}; 
// console.log(text);
/**
 * HTML custom element for a window
 */
export default class WindowNWM extends HTMLElement
{
    /** class of the window HTML Element */
    static windowClass = "nwm-window";
    /** Key for local storage settings */
    localStorageSettings = "devToolsSettings";
    /** Name for task manager */
    taskManagerName = "devToolsNWM";
    /** Name for task manager property */
    taskManagerProperty = "_taskManager";
    /** path for the folder of the tools */
    #href = "./assets/scripts/nwmDevTools/";
    /** default language of the window */
    lang = "fr";
    /** Text of the windows */
    text = WindowNWMText;
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
    /** @type {HTMLElement} HTML Element containing the explanation of the window */
    info;
    /** @type {HTMLElement} HTML Element containing the main content of the window */
    container;
    /**
     * Set language and initialize the window
     */
    constructor()
    {
        super();
        this.#events.movingWindow = this.#movingWindow.bind(this);
        this.#events.endMoveWindow = this.#endMoveWindow.bind(this);

        this.chooseLanguage();
        this.#init();
    }
    /**
     * Initialise the window.
     */
    #init()
    {
        this.attachShadow({mode:"open"});

        this.setCSS("WindowNWM/WindowNWM.css");

        this.classList.add("open", this.constructor.windowClass, this.constructor.name);
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

        const infoDisplay = document.createElement("div");
        infoDisplay.classList.add("information", "hide");
        this.info = infoDisplay;

        const closeBTN = document.createElement("button");
        closeBTN.classList.add("close", "btn");
        closeBTN.innerHTML = "&#10060;";
        closeBTN.title = this.getText("buttons.close");
        closeBTN.addEventListener("pointerup", this.#closeWindow.bind(this));
        
        const toggleBTN = document.createElement("button");
        toggleBTN.classList.add("toggle", "btn");
        toggleBTN.innerHTML = "&#x23AF;";
        toggleBTN.title = this.getText("buttons.minimize");
        toggleBTN.addEventListener("pointerup", this.#toggleWindow.bind(this));

        const fsBTN = document.createElement("button");
        fsBTN.classList.add("fullscreen", "btn");
        fsBTN.innerHTML = "&#x26F6;";
        fsBTN.title = this.getText("buttons.fullscreen");
        fsBTN.addEventListener("pointerup", this.#toggleFullscreen.bind(this));

        const infoBTN = document.createElement("button");
        infoBTN.classList.add("info", "btn");
        infoBTN.innerHTML = "&#x2754;";
        infoBTN.title = this.getText("buttons.help");
        infoBTN.addEventListener("pointerup", this.#toggleInfo.bind(this));

        this.#title = document.createElement("h2");

        btnsHeader.append(infoBTN, toggleBTN, fsBTN, closeBTN)
        header.append(this.#title, btnsHeader);
        this.container.append(infoDisplay);

        this.shadowRoot.append(header, this.container);
        
    }
    /**
     * LifeCycle called if the window is added to DOM
     */
    connectedCallback()
    {
        document.addEventListener("pointerup", this.#events.endMoveWindow);
        this.info.innerHTML = this.getText("info");
        if(!this.style.top) this.setPosition();
        this.addToTaskManager();
    }
    /**
     * LifeCycle called if the window is removed from DOM
     */
    disconnectedCallback()
    {
        document.removeEventListener("pointerup", this.#events.endMoveWindow);
        this.removeFromTaskManager();
    }
    /**
     * If the window is opened two times, the second is canceled and the first put as active.
     * Called in the connectedCallback
     */
    openOnce()
    {
        const other = document.querySelector(`.${this.constructor.name}:not(#${this.id})`);
        if(!other) return;
        other.activeWindow();
        this.remove();
    }
    /**
     * Add a property taskManager to the window object if doesn't exist.
     * Then add the window to the task manager list
     */
    addToTaskManager()
    {
        if(window["_taskManager"] === undefined) window["_taskManager"] = {name: this.taskManagerName, toolsList:{}};
        if(window["_taskManager"]?.name != this.taskManagerName) return;

        window["_taskManager"].toolsList[this.id] = this.#title.textContent;
    }
    /**
     * Remove the window from the task manager list
     */
    removeFromTaskManager()
    {
        if(window["_taskManager"]?.name != this.taskManagerName || !window["_taskManager"].toolsList[this.id]) return;
        
        delete window["_taskManager"].toolsList[this.id];
    }
    /**
     * get data from the task manager
     * @returns {object|undefined} task manager data
     */
    getTaskManagerData()
    {
        if(window["_taskManager"]?.name != this.taskManagerName) return;
        return window["_taskManager"];
    }
    /**
     * Get the text wanted in the selected language.
     * @param {string} path path to text.
     * @returns {string}
     */
    getText(path)
    {
        let text = this.text;
        for (const prop of path.split(".")) 
        {
            text = text[prop];
            if(!text)return "NO TEXT";
        }
        return text[this.lang];
    }
    /**
     * toggle the informations about the window
     */
    #toggleInfo()
    {
        this.info.classList.toggle("hide");
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
        const lang = document.documentElement.lang;
        
        if(!lang || !this.text || !this.text.languages.includes(lang))
        {
            this.lang = "en";
            return;
        }
        this.lang = lang;
    }
}
customElements.define("nwm-window", WindowNWM);