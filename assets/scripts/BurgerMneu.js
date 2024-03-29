"use strict"
export default class BurgerMenu extends HTMLElement
{
    constructor()
    {
        super();
    }
    /**
     * Append or prepend an HTML to the menu
     * @param {HTMLElement} element element HTML to add in the menu
     * @param {Boolean} append append if true otherwise prepend
     */
    apppendTo(element, append = true)
    {
        if(append) this.menu.append(element);
        else this.menu.prepend(element);
    }
}