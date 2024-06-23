"use strict";

import { OverlayToolText } from "./ServiceOverlayText.js";

/**
 * HTML Overlay Element
 */
export default class Overlay extends HTMLElement
{
    /** Source for CSS file */
    #src = "./assets/scripts/nwmDevTools/ServiceOverlay/ServiceOverlay.css";
    /** text for overlay */
    #text = OverlayToolText;
    /** Is HTML currently displayed */
    showHTML = false;
    /** @type {HTMLButtonElement} button for change between HTML and CSS */
    changeBTN;
    /** @type {HTMLElement} code tag for display code */
    code;
    /** @type {{copy: string, display: string}}  CSS code to display and copy*/
    CSS;
    /** @type {{copy: string, display: string}}  HTML code to display and copy*/
    HTML;
    /** @type {string} code to copy on click */
    copy;
    /**
     * Set and display overlay for show tool code.
     * @param {string} lang current lang for the overlay 
     */
    constructor(lang)
    {
        super();
        this.lang = lang;
        this.#init();
    }
    /**
     * Initialize HTML and CSS for overlay
     */
    #init()
    {
        this.attachShadow({mode:"open"});
        this.classList.add("overlay");

        const style = document.createElement("link");
        style.rel = "stylesheet";
        style.href = this.#src;

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



        copy.addEventListener("click", ()=>this.copyCode(copy));
        changeCode.addEventListener("click", ()=>this.changeCode(changeCode));
        close.addEventListener("click", ()=>this.remove());
    }
    /**
     * set CSS property if available otherwise display error in console
     */
    set setCSS(content)
    {
        if(!content.copy || !content.display)
        {
            console.error("Property copy or display not found for CSS");
            return;
        }
        this.CSS = content;
    }
    /**
     * set HTML property if available otherwise display error in console
     */
    set setHTML(content)
    {
        if(!content.copy || !content.display)
        {
            console.error("Property copy or display not found for HTML");
            return;
        }
        this.HTML = content;
    }
    /**
     * Copy current code in the clipboard.
     * @param {HTMLButtonElement} copyBTN copy button
     */
    copyCode(copyBTN)
    {
        navigator.clipboard.writeText(this.copy);
        copyBTN.textContent = this.#text.display.copied[this.lang];
        setTimeout(() => {
            copyBTN.textContent = this.#text.display.copy[this.lang];
            
        }, 2000);
    }
    /**
     * Change code between CSS and HTML
     * @param {HTMLButtonElement} copyBTN change code button
     */
    changeCode(changeBTN)
    {
        if(this.showHTML)
        {
            changeBTN.textContent = this.#text.display.html[this.lang];
            this.displayCSS();
        }
        else
        {
            changeBTN.textContent = this.#text.display.css[this.lang];
            this.displayHTML();
        }
        this.showHTML = !this.showHTML;
    }
    /**
     * Display CSS code.
     */
    displayCSS()
    {
        this.code.innerHTML = this.CSS.display;
        this.copy = this.CSS.copy;
    }
    /**
     * Display HTML code.
     */
    displayHTML()
    {
        this.code.innerHTML = this.HTML.display;
        this.copy = this.HTML.copy;
    }
    /**
     * Display CSS if available otherwise display HTML.
     * If both are available CSS is displayed and button for change is visible.
     */
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