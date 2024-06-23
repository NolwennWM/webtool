"use strict";

import AbstractWindow from "../AbstractWindow/AbstractWindow.js";
import { TutorialToolText } from "./WindowTutorialText.js";

/**
 * Tutorial about this application
 */
export default class WindowTutorial extends AbstractWindow
{
    /** Title of this application */
    static title = TutorialToolText.title;
    /** Tutorial's text */
    text = TutorialToolText;
    /**
     * Initialize the tutorial window
     */
    constructor()
    {
        super();
        this.init();
    }
    connectedCallback()
    {
        super.connectedCallback();
        this.openOnce();
    }
    /**
     * Generate tutorial window if it's the first time on the app.
     * @param {HTMLElement} container container for tutorial window
     */
    static firstTime(container)
    {
        const saved = localStorage.getItem(this.storageSettingsKey);
        let settings = {}
        try{
            settings = saved?JSON.parse(saved):{};
        }catch(e)
        {
            console.warn(e);
        }
        
        if(settings.tutorial || !container)return;

        const tutorial = new this();
        container.append(tutorial);

        settings.tutorial = true;
        localStorage.setItem(this.storageSettingsKey, JSON.stringify(settings));
    }
    /**
     * Initialize HTML and CSS for tutorial.
     */
    init()
    {
        const tutorialContainer = document.createElement("div");
        tutorialContainer.classList.add("tutorial-container");

        for (const key in this.text.tutorial) 
        {
            if((this.isOnTouchScreen && key.includes("desktop")) ||(!this.isOnTouchScreen && key.includes("touchscreen")))continue;
            const tutorialSection = document.createElement("section");
            tutorialSection.classList.add("tutorial-section");
            tutorialSection.innerHTML = this.getText(`tutorial.${key}`);
            tutorialContainer.append(tutorialSection);
        }
        
        this.container.append(tutorialContainer);
    }
}
customElements.define("nwm-tutorial-tool", WindowTutorial);
