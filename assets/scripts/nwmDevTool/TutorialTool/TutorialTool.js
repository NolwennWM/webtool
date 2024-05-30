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
        this.chooseLanguage();
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
        const saved = localStorage.getItem(this.constructor.name);
        if(saved || !container) return;
        const tutorial = new this();
        container.append(tutorial);
        localStorage.setItem(this.constructor.name, "true");
    }
    init()
    {
        this.container.append("Work In Progress");
    }
}
customElements.define("nwm-tutorial-tool", TutorialTool);
