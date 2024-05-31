"use strict";

import WindowNWM from "../WindowNWM/WindowNWM.js";
import { TutorialToolText } from "./TutorialToolText.js";

export default class TutorialTool extends WindowNWM
{
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
        this.container.append("Work In Progress");
    }
}
customElements.define("nwm-tutorial-tool", TutorialTool);
