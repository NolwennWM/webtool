"use strict";

import { OverlayToolText } from "./OverlayToolText.js";

/**
 * HTML Overlay Element
 */
export default class Overlay extends HTMLElement
{
    #href = "./assets/scripts/nwmDevTool/OverlayTool/OverlayTool.css";
    #text = OverlayToolText;
    showHTML = false;
    constructor(lang)
    {
        super();
        this.lang = lang;
        this.#init();
    }
    #init()
    {
        this.attachShadow({mode:"open"});
        this.classList.add("overlay");

        const style = document.createElement("link");
        style.rel = "stylesheet";
        style.href = this.#href;

        this.shadowRoot.prepend(style);
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

        const changeCode = document.createElement("button");
        changeCode.classList.add("changeCode");
        changeCode.textContent = this.#text.display.html[this.lang];
        changeCode.style.display = "none";
        this.changeBTN = changeCode;

        const pre = document.createElement("pre");

        this.code = document.createElement("code");
        
        pre.append(copy, this.code, changeCode);
        displayBlock.append(h3, pre, close);
        this.shadowRoot.append(displayBlock);
        document.body.append(this);



        copy.addEventListener("click", ()=>
        {
            navigator.clipboard.writeText(this.copy);
            copy.textContent = this.#text.display.copied[this.lang];
            setTimeout(() => {
                copy.textContent = this.#text.display.copy[this.lang];
                
            }, 2000);
        });
        changeCode.addEventListener("click", ()=>{
            if(this.showHTML)
            {
                changeCode.textContent = this.#text.display.html[this.lang];
                this.displayCSS();
            }
            else
            {
                changeCode.textContent = this.#text.display.css[this.lang];
                this.displayHTML();
            }
            this.showHTML = !this.showHTML;
        });
        close.addEventListener("click", ()=>this.remove());
    }
    set setCSS(content)
    {
        if(!content.copy || !content.display)
        {
            console.error("Property copy or display not found for CSS");
            return;
        }
        this.CSS = content;
    }
    set setHTML(content)
    {
        if(!content.copy || !content.display)
        {
            console.error("Property copy or display not found for HTML");
            return;
        }
        this.HTML = content;
    }
    displayCSS()
    {
        this.code.innerHTML = this.CSS.display;
        this.copy = this.CSS.copy;
    }
    displayHTML()
    {
        this.code.innerHTML = this.HTML.display;
        this.copy = this.HTML.copy;
    }
    displayCode()
    {
        if(this.CSS)
        {
            this.displayCSS();
            if(this.HTML) this.changeBTN.style.display = "";
            return;
        }
        if(this.HTML) this.displayHTML();
    }
}
customElements.define("nwm-overlay", Overlay);