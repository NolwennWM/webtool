import WindowNWM from "../WindowNWM/WindowNWM.js";
import { TaskManagerToolText } from "./TaskManagerToolText.js";

export default class TaskManagerTool extends WindowNWM
{
    static title = TaskManagerToolText.title;
    text = TaskManagerToolText;
    configObserver = {attributes: true};
    constructor()
    {
        super();
        this.setTitle(this.getText("title"));
    }
    connectedCallback()
    {
        super.connectedCallback();
        this.setTaskObserver();
    }
    disconnectedCallback()
    {
        super.disconnectedCallback();
        this.obs.disconnect();
    }
    setTaskObserver()
    {
        this.obs = new MutationObserver(this.handleTaskObserver.bind(this));
        this.obs.observe(window, this.configObserver);
        // Ne fonctionne pas, mettre en place un setter?
    }
    handleTaskObserver(mutations)
    {
        console.log(mutations);
    }
}
customElements.define("nwm-task-manager", TaskManagerTool);