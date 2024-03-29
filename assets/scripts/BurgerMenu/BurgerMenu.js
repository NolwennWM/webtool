"use strict"
export default class BurgerMenu extends HTMLElement
{
    #href = "./assets/scripts/BurgerMenu/BurgerMenu.css";
    constructor()
    {
        super();
        this.generateHTML()
    }
    generateHTML()
    {
        this.attachShadow({mode:"open"});

        const style = document.createElement("link");
        style.rel = "stylesheet";
        style.href = this.#href;

        const container = document.createElement("div");
        container.classList.add("container");

        const button = document.createElement("button");
        button.classList.add("burger");

        let span;
        for(let i = 0; i < 3; i++)
        {
            span = document.createElement("span");
            button.append(span);
        }
        this.toggleMenuEvent(container, button, span);

        const nav = document.createElement("nav");
        nav.classList.add("navigation");
        container.append(nav);
        this.nav = nav;
        
        this.shadowRoot.append(style,button, container);

    }
    /**
     * Append or prepend an HTML to the nav
     * @param {HTMLElement} element element HTML to add in the nav
     * @param {Boolean} append append if true otherwise prepend
     */
    appendNav(element, append = true)
    {
        if(append) this.nav.append(element);
        else this.nav.prepend(element);
    }
    /**
     * add events opening or closing navigation
     * @param {HTMLDivElement} container container to open
     * @param {HTMLButtonElement} button button open/close
     * @param {HTMLSpanElement} span element of the button
     */
    toggleMenuEvent(container, button, span)
    {
        let open = false, transitioning = false;
        button.addEventListener("click", ()=>{
            if(transitioning)return;
            transitioning = true;
            if(open) 
            {
                button.classList.remove("move");
                container.classList.remove("open");
            }
            else button.classList.add("open");
            open = !open;
        });
        container.addEventListener("click", e=>{
            if(e.target !== container)return;
            button.classList.remove("move");
            container.classList.remove("open");
            open = false;
        });
        // span.addEventListener("transitionend", (e)=>{
        //     if(e.propertyName !== "rotate" || !open)return;
            
        // })
        button.addEventListener("transitionend", (e)=>{
            if(e.propertyName === "opacity" && open)
            {
                button.classList.add("move");
                container.classList.add("open");
                return;
            }
            transitioning = false;
            if(open)return
            button.classList.remove("open");
        })
    }
}

customElements.define("nwm-burger-menu", BurgerMenu);