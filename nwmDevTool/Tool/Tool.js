"use strict";

import Overlay from "../OverlayTool/OverlayTool.js";

/**
 * Abstract Class for HTML Dev Tools.
 */
export default class Tool extends HTMLElement
{
    static dragoverClass = "nwm-drag-over";
    static dragZoneClass = "nwm-drag-zone";
    static toolClass = "nwm-tool";
    #title;
    lang = "fr";
    
    constructor()
    {
        super();
        this.#init();
    }
    /**
     * Initialise the tool.
     */
    #init()
    {
        this.attachShadow({mode:"open"});

        this.setCSS("./nwmDevTool/Tool/Tool.css");

        this.classList.add("open", this.constructor.toolClass)
        this.draggable = false;
        this.#generateID();

        this.container = document.createElement("div");
        this.container.classList.add("tool-container")

        const header = document.createElement("div");
        header.classList.add("tool-header");
        header.addEventListener("pointerup", this.#toggleTool.bind(this));
        header.addEventListener("pointerdown", this.#DragAndDropOn.bind(this));

        this.addEventListener("dragstart", this.#dragStart);

        const close = document.createElement("span");
        close.classList.add("close");
        close.innerHTML = "&#10060;";
        close.addEventListener("pointerup", this.#closeTool.bind(this));

        const fs = document.createElement("span");
        fs.classList.add("fullscreen");
        fs.innerHTML = "&#x26F6;";
        fs.addEventListener("pointerup", this.#toggleFullscreen.bind(this));

        this.#title = document.createElement("h2");
        header.append(fs, this.#title, close);

        this.shadowRoot.append(header, this.container);
        
    }
    /**
     * Create a "link" tag and insert it in the shadowDOM
     * @param {string} href href for a css file.
     */
    setCSS(href)
    {
        const style = document.createElement("link");
        style.rel = "stylesheet";
        style.href = href;
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
     * Active drag and drop
     */
    #DragAndDropOn()
    {
        this.draggable = true;
        window.ondragend = this.#DragAndDropOff.bind(this);
        window.onpointerup = this.#DragAndDropOff.bind(this);
    }
    /**
     * desactive the drag and drop.
     */
    #DragAndDropOff()
    {
        window.ondragend = "";
        window.onpointerup = ";"
        this.style.opacity = "";
        this.draggable = false;
    }
    /**
     * prepare the tool for a drag and drop.
     * @param {DragEvent} e DragEvent gave by a dragStart
     */
    #dragStart(e)
    {  
        this.style.opacity = '0.8';
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData("text/plain", this.id);
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
     * set Event Listener on HTMLElement for the drag and drop.
     * @param {HTMLElement} dropZone HTMLElement where the tools can be dropped
     */
    static setDropZone(dropZone)
    {
        dropZone.classList.add(this.dragZoneClass);
        dropZone.addEventListener("dragover", (e)=>e.preventDefault());
        dropZone.addEventListener("dragenter", this.onDragEnter.bind(this));
        dropZone.addEventListener("dragleave", ()=>dropZone.classList.remove(this.dragoverClass));
        dropZone.addEventListener("drop", (e)=>this.onDrop(dropZone, e));
    }
    /**
     * Move the dragged tool to an empty column or before or after an other tool.
     * @param {HTMLElement} dropZone HTMLElement where the element can be dropped
     * @param {DragEvent} dropEvent DragEvent gave by a drop.
     */
    static onDrop(dropZone, dropEvent)
    {

        const {clientY, target} = dropEvent;
        const data = dropEvent.dataTransfer.getData("text");
        const src = document.querySelector("#"+data);
        console.log(src, target);
        if(src && src != target)
        {
            if(target.classList.contains(this.dragZoneClass))
            {
                dropZone.append(src);
            }
            else if(target.classList.contains(this.toolClass))
            {
                const {height, top} = target.getBoundingClientRect();
                if(top+height/2 > clientY)target.before(src);
                else target.after(src);
            }
        }
        dropZone.classList.remove(this.dragoverClass);
    }
    /**
     * Add a class when we drag a tool over a dragzone
     * @param {DragEvent} e DragEvent gave by a dragenter
     */
    static onDragEnter(e)
    {
        let target;
        if(e.target.classList.contains(this.dragZoneClass))
        {
            target = e.target
        }
        else
        {
            target = e.target.closest('.'+this.dragZoneClass);
        }
        target.classList.add(this.dragoverClass);
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

            input.type = field.type;
            input.min = field.min??"";
            input.max = field.max??"";
            input.value = field.default??"";
            input.name = field.name;
            input.addEventListener("input", field.event);

            fieldSet.append(label, input);
            this.form.append(fieldSet);
        }
    }
}