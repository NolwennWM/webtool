"use strict";
import WindowNWM from "../WindowNWM/WindowNWM.js";
import Overlay from "../OverlayTool/OverlayTool.js";

/**
 * Abstract Class for HTML Dev Tools.
 */
export default class Tool extends WindowNWM
{
    static windowClass = "nwm-tool";
    static toolStorage = "tools";
    #text = {
        form: {
            codeButton:{
                fr: "Voir le Code",
                en: "See the Code"
            }
        }
    }
    
    constructor()
    {
        super();
        this.setCSS("Tool/Tool.css")
    }
    /**
     * LifeCycle called if the tool is added to DOM
     */
    connectedCallback()
    {
        super.connectedCallback();
        this.setToLocalStorage();
    }
    /**
     * LifeCycle called if the tool is removed from DOM
     */
    disconnectedCallback()
    {
        super.disconnectedCallback();
        this.deleteFromLocalStorage();
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
    setToLocalStorage()
    {
        const tools = this.getLocalStorage();

        const tool = {
            name: this.constructor.name, 
            style: this.style.cssText, 
            open: this.classList.contains("open"),
            actif: this.style.zIndex !== ""
        };
        tools[this.id] = tool;

        this.saveLocalStorage(tools);
    }
    deleteFromLocalStorage()
    {
        const tools = this.getLocalStorage();
        if(!tools[this.id])return;

        delete tools[this.id];
        this.saveLocalStorage(tools);
    }
    getLocalStorage()
    {
        const key = this.constructor.toolStorage;
        let tools = localStorage.getItem(key);

        if(!tools) tools = {};
        else tools = JSON.parse(tools);
        return tools;
    }
    saveLocalStorage(data)
    {
        const key = this.constructor.toolStorage;
        localStorage.setItem(key, JSON.stringify(data));
    }
    static setLocalStorageEvent()
    {
        console.log("setEvent");
        window.addEventListener("beforeunload", ()=>{
            const tools = document.querySelectorAll("."+this.windowClass);
            console.log(tools);
            for (const tool of tools) 
            {
                console.log("test");
                tool.setToLocalStorage();    
            }
        });
    }
    static getLocalStorageTools(parent, tools)
    {
        let toolsSave = localStorage.getItem(this.toolStorage);
        if(!toolsSave)return;
        toolsSave = JSON.parse(toolsSave);
        let actifTool;
        for (const idTool in toolsSave) 
        {
            if(document.querySelector("#"+idTool))continue;
            const oldTool = toolsSave[idTool];
            const tool = tools[oldTool.name];
            if(tool)
            {
                const t = new tool();
                t.id = idTool;
                t.style.cssText = oldTool.style;
                t.classList.toggle("open", oldTool.open)
                t.history = oldTool.history??undefined;
                parent.append(t);
                if(oldTool.actif) actifTool = t;
            }
        }
        actifTool.activeWindow();
    }
}