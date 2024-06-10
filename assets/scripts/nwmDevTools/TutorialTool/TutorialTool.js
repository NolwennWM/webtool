"use strict";

import WindowNWM from "../WindowNWM/WindowNWM.js";
import { TutorialToolText } from "./TutorialToolText.js";

export default class TutorialTool extends WindowNWM
{
    #src = "TutorialTool/TutorialTool.css";
    static title = TutorialToolText.title;
    text = TutorialToolText;
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
    static firstTime(container)
    {
        const saved = localStorage.getItem(this.localStorageSettings);

        const settings = saved?JSON.parse(saved):{};
        if(settings.tutorial || !container)return;

        const tutorial = new this();
        container.append(tutorial);

        settings.tutorial = true;
        localStorage.setItem(this.localStorageSettings, JSON.stringify(settings));
    }
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
