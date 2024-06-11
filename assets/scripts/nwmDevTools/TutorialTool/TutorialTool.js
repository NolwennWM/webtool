"use strict";

import WindowNWM from "../WindowNWM/WindowNWM.js";
import { TutorialToolText } from "./TutorialToolText.js";

/**
 * Tutorial about this application
 */
export default class TutorialTool extends WindowNWM
{
    /** source of CSS file */
    #src = "TutorialTool/TutorialTool.css";
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
        
        this.setTitle(this.getText("title"));
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
        this.setCSS(this.#src);

        const tutorialContainer = document.createElement("div");
        tutorialContainer.classList.add("tutorial-container");

        for (const key in this.text.tutorial) 
        {
            const tutorialSection = document.createElement("section");
            tutorialSection.classList.add("tutorial-section");
            tutorialSection.innerHTML = this.getText(`tutorial.${key}`);
            tutorialContainer.append(tutorialSection);
        }
        
        this.container.append(tutorialContainer);
    }
}
customElements.define("nwm-tutorial-tool", TutorialTool);
