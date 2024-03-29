"use strict";

import Overlay from "../OverlayTool/OverlayTool.js";

/**
 * Abstract Class for HTML Dev Tools.
 */
export default class Tool extends HTMLElement
{
    static toolClass = "nwm-tool";
    #href = "./assets/scripts/nwmDevTool/"
    lang = "fr";
    #text = {
        form: {
            codeButton:{
                fr: "Voir le Code",
                en: "See the Code"
            }
        }
    }
    #title;
    #events= {};
    
    constructor()
    {
        super();
        this.#events.movingTool = this.#movingTool.bind(this);
        this.#events.endMoveTool = this.#endMoveTool.bind(this);
        this.#init();
    }
    /**
     * Initialise the tool.
     */
    #init()
    {
        this.attachShadow({mode:"open"});

        this.setCSS("Tool/Tool.css");

        this.classList.add("open", this.constructor.toolClass)
        this.addEventListener("pointerdown", this.#activeTool.bind(this));
        this.#activeTool();
        this.#generateID();

        this.container = document.createElement("div");
        this.container.classList.add("tool-container")

        const header = document.createElement("div");
        header.classList.add("tool-header");
        header.addEventListener("pointerdown", this.#startMoveTool.bind(this));

        this.header = header;
        const btnsHeader = document.createElement("div")
        btnsHeader.classList.add("btns-container")

        const close = document.createElement("button");
        close.classList.add("close", "btn");
        close.innerHTML = "&#10060;";
        close.addEventListener("pointerup", this.#closeTool.bind(this));
        
        const toggle = document.createElement("button");
        toggle.classList.add("toggle", "btn");
        toggle.innerHTML = "&#x23AF;";
        toggle.addEventListener("pointerup", this.#toggleTool.bind(this));

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
     * LifeCycle called if the tool is added to DOM
     */
    connectedCallback()
    {
        document.addEventListener("pointerup", this.#events.endMoveTool);
    }
    /**
     * LifeCycle called if the tool is removed from DOM
     */
    disconnectedCallback()
    {
        document.removeEventListener("pointerup", this.#events.endMoveTool);
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
     * set the title of the tool.
     * @param {string} title title of the tool
     */
    setTitle(title)
    {
        this.#title.textContent = title;
    }
    /**
     * expand or close the tool.
     * @param {PointerEvent|MouseEvent} e Pointer or mouse Event
     */
    #toggleTool(e)
    {
        if(e.target.classList.contains(".close")) return;
        this.classList.toggle("open");
    }
    /**
     * remove the tool from HTML
     */
    #closeTool()
    {
        this.remove();
    }
    /**
     * Toggle the fullscreen of the tool
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
     * set the language of the tool.
     */
    chooseLanguage()
    {
        // TODO: save lang in localstorage, and launch the 
        const params = new URLSearchParams(document.location.search);
        const lang = params.get("lang");
        if(!lang || !this.text || !this.text.languages.includes(lang))
        {
            this.lang = "en";
            return;
        }
        this.lang = lang;
    }
    /**
     * Generate uniq id for the tool.
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
     * put the last clicked tool over the others
     */
    #activeTool()
    {
        if(window.activeNWMTool === this) return;
        if(window.activeNWMTool)
        {
            window.activeNWMTool.style.zIndex = "";
        }
        this.style.zIndex = 10;
        window.activeNWMTool = this;

    }
    /**
     * Start the movement of the tool
     * @param {PointerEvent} e pointerdown event
     */
    #startMoveTool(e)
    {
        if(e.target !== this.header && e.target !== this.#title)return;
        const {x, y} = this.getBoundingClientRect();
        this.startPosition = {toolX : x- e.clientX, toolY: y - e.clientY};
        this.classList.add("moving");
        document.addEventListener("pointermove", this.#events.movingTool);
    }
    /**
     * Set end to the movement of the tool and check if the last position is valid
     */
    #endMoveTool()
    {
        this.classList.remove("moving");
        document.removeEventListener("pointermove", this.#events.movingTool);

        const {x, y,width} = this.getBoundingClientRect();
        const headerHeight = this.header.getBoundingClientRect().height;

        if(y<0) this.style.top = "0";
        if(y>window.innerHeight) this.style.top = window.innerHeight - headerHeight+"px";
        if(x+width<150)this.style.left = 150-width+"px";
        if(x>window.innerWidth-150)this.style.left = window.innerWidth-150 + "px";
    }
    /**
     * Move the tool
     * @param {PointerEvent} e pointermove event
     */
    #movingTool(e)
    {
        const {clientX,clientY} = e;
        
        this.style.top = this.startPosition.toolY+ clientY+"px";
        this.style.left = this.startPosition.toolX+ clientX+"px";
    }
    /**
     * generate an overlay for display code, can be closed.
     * @returns {HTMLElement} "code" tag.
     */
    generateOverlay()
    {
        const overlay = new Overlay(this.lang);

        return overlay;
    }
    /**
     * Generate and append a div for display and a div for form
     */
    generateDisplayFormTool()
    {
        this.display = document.createElement("div");
        this.display.classList.add("display-container");
        
        this.form = document.createElement("div");
        this.form.classList.add("form-container");

        this.container.append(this.display, this.form);
    }
    /**
     * Generate form's input for the tool.
     * @param {Array} inputs Array of objects containing information about inputs
     * @param {object} text object containing all translations.
     */
    generateForm(inputs, text)
    {
        for(const field of inputs)
        {
            const fieldSet = document.createElement("fieldset");

            const label = document.createElement("label");
            label.textContent = text[field.name][this.lang];

            const input = document.createElement("input");
            for (const attr in field) 
            {
                if(attr === "event")continue;
                input[attr] = field[attr];   
            }
            input.addEventListener("input", field.event);

            fieldSet.append(label, input);
            this.form.append(fieldSet);
        }
    }
    /**
     * Generate a button for show the code
     * @param {HTMLElement} parent parent of the code button
     * @param {CallableFunction} event function to send in callback of the event listener  
     */
    generateCodeButton(parent,event)
    {
        const codeBtn = document.createElement("button");
        codeBtn.textContent = this.#text.form.codeButton[this.lang];
        codeBtn.classList.add("code-button");
        codeBtn.addEventListener("click", event.bind(this));
        parent.append(codeBtn);
    }
    setHeight()
    {
        // TODO: garder  ou supprimer cette fonction ?
        const hHeight = this.header.getBoundingClientRect().height;
        const cHeight = this.container.getBoundingClientRect().height;
        
        this.style.height = Math.ceil(cHeight+hHeight)+"px";
    }
}