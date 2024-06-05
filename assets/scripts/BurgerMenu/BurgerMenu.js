"use strict"
/**
 * Generate a burger menu with overlay
 */
export default class BurgerMenu extends HTMLElement
{
    /** url of CSS file */
    #href = "./assets/scripts/BurgerMenu/BurgerMenu.css";
    /** Indicate if the menu is open */
    #open = false;
    /** Indicate if the menu is transitionning */
    #transitionning = false;
    /** @type {HTMLElement} container of the whole menu */
    container;
    /** @type {HTMLElement} button opening or closing menu */
    button;
    /** @type {HTMLElement} container for the navigation */
    nav;
    /**
     * generate the Menu HTML Element
     */
    constructor()
    {
        super();
        this.#generateHTML()
    }
    /**
     * Generate HTML of the menu
     */
    #generateHTML()
    {
        this.attachShadow({mode:"open"});

        this.generateCSS(this.#href);

        const container = document.createElement("div");
        container.classList.add("container");
        this.container = container;

        const button = document.createElement("button");
        button.classList.add("burger");
        button.ariaLabel = "Menu Button"
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
        
        this.shadowRoot.append(button, container);

    }
    /**
     * Generate a link tag and append it in the custom element.
     * @param {string} href url for a css link
     */
    generateCSS(href)
    {
        const style = document.createElement("link");
        style.rel = "stylesheet";
        style.href = href;
        this.shadowRoot.prepend(style);
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
        if(this.transitioning || e && (e.target.classList.contains("navigation") || e.target.closest(".navigation")))return;
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