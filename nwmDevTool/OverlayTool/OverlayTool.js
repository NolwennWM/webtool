"use strict";
/**
 * HTML Overlay Element
 */
export default class Overlay extends HTMLElement
{

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
        style.href = "./nwmDevTool/OverlayTool/OverlayTool.css";

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

        const pre = document.createElement("pre");

        this.code = document.createElement("code");
        
        pre.append(copy, this.code);
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
}
customElements.define("nwm-overlay", Overlay);