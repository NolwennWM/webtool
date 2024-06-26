"use strict";
import AbstractWindow from "../AbstractWindow/AbstractWindow.js";
import Overlay from "../ServiceOverlay/ServiceOverlay.js";
import { ToolText } from "./AbstractToolText.js";

/**
 * Abstract Class for HTML Dev Tools.
     * @param {any} settings (optionnal) tool settings 
 */
export default class AbstractTool extends AbstractWindow
{
    /** class of tool's window */
    static windowClass = "nwm-tool";
    /** name of the localstorage */
    static toolStorage = "devToolsList";
    /** @type {any} setting of the tool */
    settings = undefined;
    /** text translation of the tools */
    #text = ToolText;
    /** @type {HTMLElement} HTML Element containing the display of the tool */
    display;
    /** @type {HTMLElement} HTML Element containing the form of the tool */
    form;
    /**
     * Set CSS for tools
     */
    constructor()
    {
        super();
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
    generateForm(inputs)
    {
        for(const field of inputs)
        {
            const fieldSet = document.createElement("fieldset");

            const label = document.createElement("label");
            label.textContent = this.getText("form."+field.name);
            label.setAttribute("for", field.id??"noId");

            const input = document.createElement("input");
            for (const attr in field) 
            {
                if(attr === "event")continue;
                if(attr === "defaultText")
                {
                    input.value = this.getText("form."+field.name);
                    continue
                }
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
    /**
     * set object to stock in local storage
     */
    setToLocalStorage()
    {
        const tools = this.getLocalStorage();

        const tool = {
            name: this.constructor.name, 
            style: this.style.cssText, 
            open: this.classList.contains("open"),
            actif: this.style.zIndex !== "",
            settings: this.getToolSettings()
        };
        tools[this.id] = tool;

        this.saveLocalStorage(tools);
    }
    /**
     * Delete tool from local storage
     */
    deleteFromLocalStorage()
    {
        const tools = this.getLocalStorage();
        if(!tools[this.id])return;

        delete tools[this.id];
        this.saveLocalStorage(tools);
    }
    /**
     * get all tools saved
     * @returns {object} list of tools
     */
    getLocalStorage()
    {
        const key = this.constructor.toolStorage;
        let tools = localStorage.getItem(key);

        if(!tools) tools = {};
        else tools = JSON.parse(tools);
        return tools;
    }
    /**
     * Save in localstorage the list of tools
     * @param {object} data object to save
     */
    saveLocalStorage(data)
    {
        const key = this.constructor.toolStorage;
        localStorage.setItem(key, JSON.stringify(data));
    }
    /**
     * Add event before unload of the page for save opened tools
     */
    static setLocalStorageEvent()
    {
        window.addEventListener("beforeunload", ()=>{
            const tools = document.querySelectorAll("."+this.windowClass);
            for (const tool of tools) 
            {
                tool.setToLocalStorage();    
            }
        });
    }
    /**
     * Generate tools saved in local storage.
     * @param {HTMLElement} parent HTML Element where tools will be appened
     * @param {Object} tools list of classes of tools
     */
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
                /** @type {AbstractTool} HTML Element containing the display of the tool */
                const t = new tool(oldTool.settings);
                t.id = idTool;
                if(!t.isOnTouchScreen)t.style.cssText = oldTool.style;
                t.classList.toggle("open", oldTool.open)
                t.history = oldTool.history??undefined;
                parent.append(t);
                if(oldTool.actif) actifTool = t;
            }
        }
        actifTool?.activeWindow();
    }
    /**
     * should return settings of the tool
     * Have to be overided.
     * @returns {any} tool settings
     */
    getToolSettings()
    {
        return this.settings;
    }
    /**
     * should set the settings of the tool before initialization
     * Have to be overided.
     */
    setToolSettings(){}
    /**
     * should set the elements of the tool after initialization
     * Have to be overided.
     */
    setToolElements(){}
    
}