"use strict";

import WindowNWM from "../nwmDevTools/WindowNWM/WindowNWM.js";
import { DevToolsHandlerText } from "./DevToolsHandlerText.js";
/**
 * Handle the working flow of the app
 */
export default class DevToolsHandler
{
    /** list of the tools currently enabled */
    tools = {};
    /** languages available for the app */
    // langs = DevToolsHandlerText.langs;
    /** title of the application */
    // title = DevToolsHandlerText.title;
    /** text for the search input */
    // searchLangs = DevToolsHandlerText.searchLangs;
    text = DevToolsHandlerText;
    /** navigation of the app */
    nav = document.querySelector(".tools-menu");
    /** container for the tools */
    container = document.querySelector(".tools-container");
    /** @type {NodeList} list of the tools open button */
    toolsMenu; 
    /** @type {HTMLElement} container for the menu */
    menuContainer;
    /** @type {string} current lang of the application */
    lang;
    /**
     * disable loader, generate menu and handle start menu
     * @param {Object} tools list of tools 
     */
    constructor(tools)
    {
        this.tools = tools;
        document.addEventListener("DOMContentLoaded", this.disableLoader.bind(this));
        this.checkLang();
        this.checkTheme();
        this.generateMenu();
        this.handleTutorial();
        this.titleLanguage();
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
     * Select title for the current language
     */
    titleLanguage()
    {
        const title = document.querySelector(".main-title");
        if(!title)return;
        title.textContent = this.text.title[document.documentElement.lang]??this.text.title.en;
    }
    /**
     * Generate Navigation Menu
     */
    generateMenu()
    {
        if(!this.nav) return;

        this.menuContainer = document.createElement("div")
        this.menuContainer.classList.add("navigation-container");

        const selectLang = document.createElement("select");
        selectLang.ariaLabel = this.text.langsLabel[this.lang];

        const selectTheme = document.createElement("select");
        selectTheme.ariaLabel = this.text.themeSelect[this.lang];

        for(const l in this.text.langs)
        {
            const opt = document.createElement("option");
            opt.value = l;
            opt.textContent = this.text.langs[l];
            selectLang.append(opt);
        }
        selectLang.value = this.lang;
        selectLang.addEventListener("input", this.selectLang.bind(this));

        for (const t in this.text.themeSelect) 
        {
            const opt = document.createElement("option");
            opt.value = t;
            opt.textContent = this.text.themeSelect[t][this.lang];
            selectTheme.append(opt);
        }
        selectTheme.value = this.theme;
        selectTheme.addEventListener("input", this.selectTheme.bind(this));

        const menu = document.createElement("menu");

        const searchInput = document.createElement("input");
        searchInput.type = "search";
        searchInput.setAttribute("list", "toolsList");
        searchInput.placeholder = this.text.search[this.lang];
        searchInput.addEventListener("input", this.toggleItemsMenu.bind(this));

        const toolsList = document.createElement("datalist");
        toolsList.id = "toolsList";
        
        for (const toolName in this.tools) 
        {
            const tool = this.tools[toolName];
            const title = tool.title?tool.title[this.lang]:"no title";
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

        this.menuContainer.append(menu, searchInput, toolsList, selectLang, selectTheme);
        this.nav.appendNav(this.menuContainer);
        this.nav.generateCSS("./assets/styles/toolMenu.css");
    }
    
    /**
     * Change the language and reload the page on lang selection
     * @param {InputEvent} e Input Event
     */
    selectLang(e)
    {
        if(!e.target instanceof HTMLSelectElement) return;
        const l = e.target.value;
        if(!this.text.langs[l])return;
        this.localStorage({language: l});
        const url = new URL(window.location.href)
        url.searchParams.set("lang", l);
        window.location.replace(url);
    }
    /**
     * Check if a language is selected and return it
     * @returns {string} language selected
     */
    checkLang()
    {
        const url = new URL(window.location.href)
        let l = url.searchParams.get("lang");
        if(!l || !this.text.langs[l])
        {
            const saved = this.localStorage();
            l = saved?.language ?? "en";
        } 
        document.documentElement.lang = l;
        this.lang = l;
        return l;
    }
    /**
     * Change the theme of the app
     * @param {InputEvent} e Input Event
     */
    selectTheme(e)
    {
        if(!e.target instanceof HTMLSelectElement) return;
        const t = e.target.value;
        if(!this.text.themeSelect[t])return;
        this.localStorage({theme: t});
        document.documentElement.dataset.theme = t;
    }
    /**
     * Check if a theme is selected and return it
     * @returns {string} theme selected
     */
    checkTheme()
    {
        let t = document.documentElement.dataset.theme;
        if(!t || !this.text.selectTheme[t])
        {
            const saved = this.localStorage();
            if(saved && saved.theme) t = saved.theme;
            else if(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) t = "dark";
            else t = "light";
        } 
        document.documentElement.dataset.theme = t;
        this.theme = t;
        return t;
    }
    /**
     * Save data object in parameter and return all saved data.
     * @param {object|undefined} data object to save in storage.
     * @returns {object} data saved in storage.
     */
    localStorage(data = undefined)
    {
        const savedDataString = localStorage.getItem(WindowNWM.storageSettingsKey);
        let savedData = JSON.parse(savedDataString);
        if(data)
        {
            savedData = {...savedData, ...data};
            const dataString = JSON.stringify(savedData);
            localStorage.setItem(WindowNWM.storageSettingsKey, dataString);
        }
        return savedData;
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