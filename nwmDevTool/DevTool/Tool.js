"use strict";
/**
 * Abstract Class for HTML Dev Tools.
 */
export default class Tool extends HTMLElement
{
    static dragoverClass = "nwm-dragover";
    static toolClass = "nwm-tool";
    #title;
    lang = "fr";
    #text = {
        display:{
            title:{
                fr: "Copiez et adaptez le code ci-dessous",
                en: "Copy and adapt the code below"
            },
            close: {
                fr: "Fermer le Code",
                en: "Close the Code"
            },
            copy:{
                fr: "Copier dans le presse-papier",
                en: "Copy in the clipboard"
            },
            copied:{
                fr: "Code Copié",
                en: "Code Copied"
            },
            html:{

            }
        }
    }
    
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

        this.setCSS("./nwmDevTool/DevTool/Tool.css");

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
        
        this.setResponsive = this.setResponsive.bind(this);
        window.addEventListener("resize", this.setResponsive);
    }
    connectedCallback()
    {
        this.setResponsive();
        window.addEventListener("resize", this.setResponsive);
    }
    disconnectedCallback()
    {
        window.removeEventListener("resize", this.setResponsive);
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
        this.shadowRoot.prepend(style);
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
    }
    /**
     * desactive the drag and drop.
     */
    #DragAndDropOff()
    {
        window.ondragend = "";
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
        
        dropZone.addEventListener("dragover", (e)=>e.preventDefault());
        dropZone.addEventListener("dragenter", (e)=>dropZone.classList.add(this.dragoverClass));
        dropZone.addEventListener("dragleave", (e)=>dropZone.classList.remove(this.dragoverClass));
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

        if(src && src != target)
        {
            if(target.classList.contains(this.dragoverClass))
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
     * generate an overlay for display code, can be closed.
     * @returns {HTMLElement} "code" tag.
     */
    generateOverlay()
    {
        const overlay = document.createElement("div");
        overlay.classList.add("overlay");

        const displayBlock = document.createElement("div");
        displayBlock.classList.add("displayBlock");
        
        const h3 = document.createElement("h3");
        h3.textContent = this.#text.display.title[this.lang];

        const close = document.createElement("button");
        close.classList.add("close");
        close.textContent = this.#text.display.close[this.lang];
        
        const copy = document.createElement("button");
        copy.classList.add("copy");
        copy.textContent = this.#text.display.copy[this.lang];

        const pre = document.createElement("pre");

        const code = document.createElement("code");
        
        pre.append(copy, code);
        displayBlock.append(h3, pre, close);
        overlay.append(displayBlock);
        this.shadowRoot.append(overlay);

        copy.addEventListener("click", ()=>
        {
            navigator.clipboard.writeText(this.css.copy);
            copy.textContent = this.#text.display.copied[this.lang];
            setTimeout(() => {
                copy.textContent = this.#text.display.copy[this.lang];
                
            }, 2000);
        });
        close.addEventListener("click", ()=>overlay.remove());

        return code;
    }
    /**
     * Generate and append a div for display and a div for form
     */
    generateDisplayFormTool()
    {
        this.type = "display-form"
        this.display = document.createElement("div");
        this.display.classList.add("display-container");
        
        this.form = document.createElement("div");
        this.form.classList.add("form-container");

        this.container.append(this.display, this.form);
    }
    /**
     * if the element is too short, change the container grid.
     */
    setResponsive()
    {
        // TODO : utiliser une classe :
        if(this.type != "display-form")return;

        const {width} = this.getBoundingClientRect();

        if(width > 700)
        {
            this.classList.add("landscape");
        }
        else
        {
            this.classList.remove("landscape");
        }
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