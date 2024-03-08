"use strict";

export default class Tool extends HTMLElement
{
    #title;
    lang = "fr";
    constructor()
    {
        super();
        this.#init();
    }
    #init()
    {
        this.attachShadow({mode:"open"});

        this.setCSS("./nwmDevTool/DevTool/Tool.css");

        this.classList.add("open")
        this.draggable = false;

        this.container = document.createElement("div");
        this.container.classList.add("tool-container")

        const header = document.createElement("div");
        header.classList.add("tool-header");
        header.addEventListener("pointerup", this.#toggleTool.bind(this));
        header.addEventListener("pointerdown", )
        // TODO drag and drop

        const close = document.createElement("span");
        close.classList.add("close");
        close.innerHTML = "&#10060;";
        close.addEventListener("pointerup", this.#closeTool.bind(this));

        this.#title = document.createElement("h2");
        header.append(this.#title, close);

        this.shadowRoot.append(header, this.container);
    }
    setCSS(href)
    {
        const style = document.createElement("link");
        style.rel = "stylesheet";
        style.href = href;
        this.shadowRoot.prepend(style);
    }
    setTitle(title)
    {
        this.#title.textContent = title;
    }
    #toggleTool(e)
    {
        if(e.target.classList.contains(".close")) return;
        this.classList.toggle("open");
    }
    #closeTool()
    {
        this.remove();
    }
    chooseLanguage()
    {
        const params = new URLSearchParams(document.location.search);
        const lang = params.get("lang");
        if(!lang || !this.text || !this.text.languages.includes(lang))
        {
            this.lang = "en";
            return;
        }
        this.lang = lang;
    }
}