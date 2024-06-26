"use strict";

import { AbstractWindowText } from "./AbstractWindowText.js";

// interessant mais pas géré par firefox TODO : quand géré mettre text en voir config en json
// import * as text from "./test.json" with {type: "json"}; 
// console.log(text);

/**
 * HTML custom element for a window
 */
export default class AbstractWindow extends HTMLElement
{
    /** class of the window HTML Element */
    static windowClass = "nwm-window";
    /** path for the folder of the tools */
    static href = "./assets/scripts/nwmDevTools/";
    /** Key for local storage settings as static property*/
    static storageSettingsKey = "devToolsSettings";
    /** Key for local storage settings as property*/
    storageSettingsKey = this.constructor.storageSettingsKey;
    /** Name for task manager */
    taskManagerName = "devToolsNWM";
    /** Name for task manager property */
    taskManagerProperty = "_taskManager";
    /** default language of the window */
    lang = "fr";
    /** default position of the window */
    defaultPosition = {
        height : "80dvh",
        width : "80dvw",
        top : "10dvh",
        left : "10dvw"
    };
    /** Verify if the main cursor is a touch screen */
    isOnTouchScreen = window.matchMedia("(pointer: coarse)").matches;
    /** Text of the windows */
    text = AbstractWindowText;
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
        const name = this.constructor.name;
        this.attachShadow({mode:"open"});

        this.#setFullCSS(this.constructor);

        this.classList.add("open", this.constructor.windowClass, name);
        this.addEventListener("pointerdown", this.activeWindow.bind(this));
        this.activeWindow();
        this.#generateID();

        this.container = document.createElement("div");
        this.container.classList.add("window-container")

        const header = document.createElement("div");
        header.classList.add("window-header");
        this.header = header;
        if(!this.isOnTouchScreen) header.addEventListener("pointerdown", this.#startMoveWindow.bind(this));
            
        const btnsHeader = document.createElement("div")
        btnsHeader.classList.add("btns-container")

        const infoDisplay = document.createElement("div");
        infoDisplay.classList.add("information", "hide");
        this.info = infoDisplay;

        const closeBTN = document.createElement("button");
        closeBTN.classList.add("close", "btn");
        closeBTN.innerHTML = "&#10060;";
        closeBTN.title = this.getText("buttons.close");
        closeBTN.addEventListener("pointerup", this.closeWindow.bind(this));
        
        const toggleBTN = document.createElement("button");
        toggleBTN.classList.add("toggle", "btn");
        toggleBTN.innerHTML = "&#x23AF;";
        toggleBTN.title = this.getText("buttons.minimize");
        toggleBTN.addEventListener("pointerup", this.#handleToggleWindow.bind(this));

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
        this.setTitle();

        const logo = this.constructor.getLogo();

        btnsHeader.append(infoBTN, toggleBTN, fsBTN, closeBTN)
        header.append(logo, this.#title, btnsHeader);
        this.container.append(infoDisplay);

        this.shadowRoot.append(header, this.container);
        
    }
    static getLogo()
    {
        const name = this.name;
        const logo = document.createElement("img");
        logo.alt = "logo " + this.getTitle;
        logo.src = `${this.href}${name}/${name}.svg`;
        logo.classList.add("logo");
        return logo;
    }
    static get getTitle()
    {
        return this.title?this.title[document.documentElement.lang]??"no title":"no title";
    }
    /**
     * LifeCycle called if the window is added to DOM
     */
    connectedCallback()
    {
        if(!this.isOnTouchScreen) document.addEventListener("pointerup", this.#events.endMoveWindow);
        this.info.innerHTML = this.getText("info");
        if(!this.style.top) this.setPosition();
        this.addToTaskManager();
    }
    /**
     * LifeCycle called if the window is removed from DOM
     */
    disconnectedCallback()
    {
        if(!this.isOnTouchScreen) document.removeEventListener("pointerup", this.#events.endMoveWindow);
        this.removeFromTaskManager();
        window.activeNWMWindow = undefined;
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
        if(window[this.taskManagerProperty] === undefined) window[this.taskManagerProperty] = {name: this.taskManagerName, toolsList:{}};
        if(window[this.taskManagerProperty]?.name != this.taskManagerName) return;

        window[this.taskManagerProperty].toolsList[this.id] = this.#title.textContent;
    }
    /**
     * Remove the window from the task manager list
     */
    removeFromTaskManager()
    {
        if(window[this.taskManagerProperty]?.name != this.taskManagerName || !window[this.taskManagerProperty].toolsList[this.id]) return;
        
        delete window[this.taskManagerProperty].toolsList[this.id];
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
        style.href = this.constructor.href+href;
        if(!this.lastStyle)
        {
            this.shadowRoot.append(style);
            this.lastStyle = style;
            return;
        }
        this.lastStyle.after(style);
    }
    /**
     * Take the inheriting class and add CSS files with the same name
     * Then do the same with the inherited classes until find this class.
     * @param {class} constructor class of the current object
     */
    #setFullCSS(constructor)
    {
        
        const 
            parent = Object.getPrototypeOf(constructor),
            name = constructor.name;
        
        this.setCSS(`${name}/${name}.css`);

        if(constructor.name === "AbstractWindow")return;

        this.#setFullCSS(parent);
    }
    /**
     * set the title of the window.
     */
    setTitle()
    {
        const title = this.constructor.title;
        if(title) this.#title.textContent = title[this.lang];
    }
    /**
     * handle click on toggle window
     * @param {PointerEvent|MouseEvent} e Pointer or mouse Event
     */
    #handleToggleWindow(e)
    {
        if(e.target.classList.contains(".close")) return;
        this.#toggleWindow();
    }
    /**
     * expand or close the window.
     * @param {boolean|undefined} force 
     */
    #toggleWindow(force = undefined)
    {
        this.classList.toggle("open", force);
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
    closeWindow()
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
    /**
     * close the window for reopen it.
     */
    reloadWindow()
    {
        const container = this.parentElement;
        this.remove();
        container.append(new this.constructor());
    }
    /**
     * Set the window to the default position and size
     */
    setPosition()
    {
        this.style.height = this.defaultPosition.height;
        this.style.width = this.defaultPosition.width;
        this.style.top = this.defaultPosition.top;
        this.style.left = this.defaultPosition.left;
    }
    /**
     * put the last clicked window over the others
     * @param {boolean|undefined} forceToggle force Window to Open if reduced
     */
    activeWindow(forceToggle = undefined)
    {
        if(window.activeNWMWindow === this) return;
        if(window.activeNWMWindow)
        {
            window.activeNWMWindow.style.zIndex = "";
        }
        this.style.zIndex = 10;
        if(forceToggle)this.#toggleWindow(true);
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
customElements.define("nwm-window", AbstractWindow);