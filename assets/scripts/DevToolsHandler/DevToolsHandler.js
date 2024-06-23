"use strict";

import AbstractWindow from "../nwmDevTools/AbstractWindow/AbstractWindow.js";
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
    /** Delay between click for swap */
    delay = 200;
    /** navigation of the app */
    nav = document.querySelector(".tools-menu");
    /** container for the tools */
    container = document.querySelector(".tools-container");
    /** Verify if the main cursor is a touch screen */
    isOnTouchScreen = window.matchMedia("(pointer: coarse)").matches;
    /** @type {MutationObserverInit} configuration of the observer */
    configObserver = {childList: true};
    /** @type {HTMLButtonElement[]} list of button for touchScreen Interface */
    btnTouchscreenList = [];
    /** @type {HTMLElement} block containing dot buttons in touchScreen Interface */
    dotContainer; 
    /** @type {HTMLButtonElement} current active dot button */
    activeDot;
    /** @type {NodeList} list of the tools open button */
    toolsMenu; 
    /** @type {HTMLElement} container for the menu */
    menuContainer;
    /** @type {string} current lang of the application */
    lang;
    /** @type {number|undefined}  timestamp to wait before next click */
    nextSwap;
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
        this.generateInterface();
        this.handleTutorial();
        this.titleLanguage();
    }
    /**
     * handle the first appearence of the tutorial.
     */
    handleTutorial()
    {
        if(!this.tools.WindowTutorial)return;
        this.tools.WindowTutorial.firstTime(this.container);
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
     * Generate interface of the app.
     */
    generateInterface()
    {
        if(!this.isOnTouchScreen)return;

        const prevBtn = document.createElement("button");
        prevBtn.textContent = "<";
        prevBtn.disabled = true;
        prevBtn.classList.add("btn", "previous-btn", "swap-btn");
        prevBtn.addEventListener("click",this.handleSwapApp.bind(this));

        const nextBtn = document.createElement("button");
        nextBtn.textContent = ">";
        nextBtn.disabled = true;
        nextBtn.classList.add("btn", "next-btn", "swap-btn");
        nextBtn.addEventListener("click",this.handleSwapApp.bind(this));

        const dotContainer = document.createElement("div");
        dotContainer.classList.add("dot-container");
        this.dotContainer = dotContainer;

        document.body.append(prevBtn, nextBtn, dotContainer);
        this.btnTouchscreenList.push(prevBtn, nextBtn);

        const obs = new MutationObserver(this.handleToolObserver.bind(this));

        obs.observe(this.container, this.configObserver);

    }
    /**
     * swap to the next or previous app
     * @param {PointerEvent|MouseEvent} e click on swap button
     */
    handleSwapApp(e)
    {
        if(this.container.children.length <= 1 )return;
        const time = Date.now();
        if(this.nextSwap && this.nextSwap > time)return;
        this.nextSwap = time + this.delay;
        /** @type {HTMLElement} current active app */
        const current = window.activeNWMWindow;
        /** @type {AbstractWindow} next or previous app */
        let newCurrent;
        if(e.target.classList.contains("next-btn"))
        {
            newCurrent = current.nextElementSibling;
            if(!newCurrent) newCurrent = this.getToolContainerChild(0);
        }
        else
        {
            newCurrent = current.previousElementSibling;
            if(!newCurrent) newCurrent = this.getToolContainerChild(-1);
        }
        const dot = this.selectDot(newCurrent.id);
        this.toggleActiveDot(dot);
        newCurrent.activeWindow(true);
    }
    /**
     * Select the app at the parameter index.
     * @param {number} index index of the wanted children (negative enabled)
     * @returns {AbstractWindow|undefined} app at this index 
     */
    getToolContainerChild(index)
    {
        const children = this.container.children;
        return index < 0? children[children.length+index]: children[index];
    }
    /**
     * handle mutation oberser on the tool container
     * adding dot if tool added, 
     * removing dot if tool removed,
     * disabled next and previous button if tools are too few
     * @param {MutationRecord[]} mutations 
     */
    handleToolObserver(mutations)
    {
        for (const mutation of mutations) 
        {
            for (const added of mutation.addedNodes) 
            {
                const dot = document.createElement("button");
                dot.classList.add("btn", "dot-btn");
                dot.dataset.id = added.id;
                const logo = added.constructor.getLogo();
                dot.append(logo);
                if(added === window.activeNWMWindow) this.toggleActiveDot(dot);

                dot.addEventListener("click", this.handleDotEvent.bind(this));

                this.dotContainer.append(dot);
            }
            for(const removed of mutation.removedNodes)
            {
                const oldDot = this.selectDot(removed.id);
                oldDot?.remove();

                const newActive = this.getToolContainerChild(-1);

                if(!newActive) continue;
                
                newActive.activeWindow();

                const newDot = this.selectDot(newActive.id);
                if(newDot)this.toggleActiveDot(newDot);
            }
        }
        for (const btn of this.btnTouchscreenList) 
        {
            btn.disabled = this.container.children.length <= 1
        }
    }
    /**
     * handle click on dot btn.
     * bringing the selected tool in front of others
     * @param {PointerEvent|MouseEvent} e click on dot button
     */
    handleDotEvent(e)
    {
        const dot = e.target.classList.contains("btn")? e.target: e.target.closest(".btn");
        console.log(dot);
        if(!dot)return;
        const id = dot.dataset.id;
        if(!id)return
        const tool = this.container.querySelector(`#${id}`);
        if(!tool)return;
        this.toggleActiveDot(dot);

        tool.activeWindow(true);
    }
    /**
     * Add active class to the dot in parameter and remove this class from previous active dot
     * @param {HTMLButtonElement} activeDot dot button to active
     */
    toggleActiveDot(activeDot)
    {
        this.activeDot?.classList.remove("active");
        this.activeDot = activeDot;
        activeDot.classList.add("active");
    }
    /**
     * Return button with the id gave in parameter or null.
     * @param {string} id id of an app
     * @returns {HTMLButtonElement|null}
     */
    selectDot(id)
    {
        return this.dotContainer.querySelector(`.btn[data-id="${id}"]`);
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
        selectTheme.ariaLabel = this.text.themeLabel[this.lang];

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
            /** @type {AbstractWindow} appli to list in the menu */
            const tool = this.tools[toolName];
            const title = tool.getTitle;
            const logo = tool.getLogo();
            if(!title) continue;

            const li = document.createElement("li");
            li.dataset.tool = title;
            const btn = document.createElement("button");

            btn.textContent = title;    
            btn.prepend(logo)
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
            const 
                saved = this.localStorage(),
                navigLang = navigator.language?.slice(0,2),
                defaultLang = this.text.langs[navigLang]? navigLang:"en";
            l = saved?.language ?? defaultLang;
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
        const savedDataString = localStorage.getItem(AbstractWindow.storageSettingsKey);
        let savedData = JSON.parse(savedDataString);
        if(data)
        {
            savedData = {...savedData, ...data};
            const dataString = JSON.stringify(savedData);
            localStorage.setItem(AbstractWindow.storageSettingsKey, dataString);
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