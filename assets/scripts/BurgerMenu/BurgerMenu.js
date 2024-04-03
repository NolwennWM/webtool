"use strict"
export default class BurgerMenu extends HTMLElement
{
    #href = "./assets/scripts/BurgerMenu/BurgerMenu.css";
    #open = false;
    #transitionning = false;
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
        this.container = container;

        const button = document.createElement("button");
        button.classList.add("burger");
        this.button = button;

        for(let i = 0; i < 3; i++)
        {
            const span = document.createElement("span");
            button.append(span);
        }
        this.toggleMenuEvent(container, button);

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
    appendNav(...elements)
    {
        this.nav.append(...elements);
    }
    /**
     * add event Listeners to the menu
     */
    toggleMenuEvent()
    {
        this.button.addEventListener("click", this.toggleMenu.bind(this));
        this.container.addEventListener("click",this.toggleMenu.bind(this));
        this.button.addEventListener("transitionend", this.transitionMenu.bind(this));
    }
    /**
     * open or close the menu.
     * @param {MouseEvent} e Event from click
     */
    toggleMenu(e)
    {
        if(this.transitioning || e.target.classList.contains("navigation") || !this.nav.children.includes(e.target))return;
        this.transitioning = true;
        if(this.open) 
        {
            this.button.classList.remove("move");
            this.container.classList.remove("open");
        }
        else this.button.classList.add("open");
        this.open = !this.open;
    }
    /**
     * add or remove class after transitions
     * @param {TransitionEvent} e transition End event
     * @returns 
     */
    transitionMenu(e)
    {
        if(e.propertyName === "opacity" && this.open)
        {
            this.button.classList.add("move");
            this.container.classList.add("open");
            return;
        }
        this.transitioning = false;
        if(this.open)return
        this.button.classList.remove("open");
    }
}

customElements.define("nwm-burger-menu", BurgerMenu);