"use strict";

import { DevToolsHandlerText } from "./DevToolsHandlerText.js";
/**
 * Handle the working flow of the app
 */
export default class DevToolsHandler
{
    /** list of the tools currently enabled */
    tools = {};
    /** languages available for the app */
    langs = DevToolsHandlerText.langs;
    /** text for the search input */
    searchLangs = DevToolsHandlerText.searchLangs;
    /** navigation of the app */
    nav = document.querySelector(".tools-menu");
    /** container for the tools */
    container = document.querySelector(".tools-container");
    /** @type {NodeList} list of the tools open button */
    toolsMenu; 
    /** @type {HTMLElement} container for the menu */
    menuContainer;
    /**
     * disable loader, generate menu and handle start menu
     * @param {Object} tools list of tools 
     */
    constructor(tools)
    {
        this.tools = tools;
        document.addEventListener("DOMContentLoaded", this.disableLoader.bind(this));
        this.generateMenu();
        this.handleTutorial();
    }
    /**
     * handle the first appearence of the tutorial.
     */
    handleTutorial()
    {
        if(!this.tools.TutorialTool)return;
        this.tools.TutorialTool.firstTime(this.container);
    }
    /**
     * Generate Navigation Menu
     */
    generateMenu()
    {
        if(!this.nav) return;
        this.menuContainer = document.createElement("div")
        this.menuContainer.classList.add("navigation-container");
        const select = document.createElement("select");
        select.ariaLabel = "Lang Selection"

        for(const l in this.langs)
        {
            const opt = document.createElement("option");
            opt.value = l;
            opt.textContent = this.langs[l];
            select.append(opt);
        }
        const selectedLang = this.checkLang(select);
        select.addEventListener("input", this.selectLang.bind(this));

        const menu = document.createElement("menu");

        const searchInput = document.createElement("input");
        searchInput.type = "search";
        searchInput.setAttribute("list", "toolsList");
        searchInput.placeholder = this.searchLangs[selectedLang];
        searchInput.addEventListener("input", this.toggleItemsMenu.bind(this));

        const toolsList = document.createElement("datalist");
        toolsList.id = "toolsList";
        
        for (const toolName in this.tools) 
        {
            const tool = this.tools[toolName];
            const title = tool.title?tool.title[selectedLang]:"no title";
            if(!title) continue;

            const li = document.createElement("li");
            li.dataset.tool = title;
            const btn = document.createElement("button");

            btn.textContent = title;    
            btn.addEventListener("click", ()=>this.appendTool(tool));

            li.append(btn);
            menu.append(li);

            const opt = document.createElement("option");
            opt.value = title;
            toolsList.append(opt);
        }

        this.toolsMenu = menu.querySelectorAll("li");

        this.menuContainer.append(menu, searchInput, toolsList, select);
        this.nav.appendNav(this.menuContainer);
        this.nav.generateCSS("./assets/styles/toolMenu.css");
    }
    
    /**
     * Change the language and reload the page
     * @param {InputEvent} e Input Event
     */
    selectLang(e)
    {
        if(!e.target instanceof HTMLSelectElement) return;
        const l = e.target.value;
        if(!this.langs[l])return;
        const url = new URL(window.location.href)
        url.searchParams.set("lang", l);
        window.location.replace(url);
    }
    /**
     * Check if a language is selected and set the select element.
     * @param {HTMLSelectElement} select select handling the language
     * @returns {string} language selected
     */
    checkLang(select)
    {
        const url = new URL(window.location.href)
        let l = url.searchParams.get("lang");
        if(!l || !this.langs[l]) l = 'en';
        select.value = l;
        document.documentElement.lang = l;
        return l;
    }
    /**
     * Append a new tool
     * @param {Window} tool tool window object
     */
    appendTool(tool)
    {
        this.container.append(new tool());
        this.nav.toggleMenu();
    }
    /**
     * Hide or Show item list during the search of tools
     * @param {InputEvent} e Input Event
     */
    toggleItemsMenu(e)
    {
        if(!e.target instanceof HTMLInputElement) return;
        for (const li of this.toolsMenu) 
        {
            const data = li.dataset.tool.toLowerCase();
            const value = e.target.value.toLowerCase();
            if(data.includes(value))
            {
                li.style.display = "";
            }
            else
            {
                li.style.display = "none";
            }
        }
    }
    /**
     * Disabled the loader
     */
    disableLoader()
    {
        const loader = document.querySelector(".loader-container");
        if(!loader)return;
        setTimeout(()=>{
            loader.addEventListener("transitionend", ()=>{
                const credit = document.querySelector(".footer-credit")??"";
                
                this.menuContainer?.append(credit);
                loader.remove()
            });
            loader.style.opacity = 0;
        },1000)
        
    }
}