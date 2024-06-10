import WindowNWM from "../WindowNWM/WindowNWM.js";
import { TaskManagerToolText } from "./TaskManagerToolText.js";

/**
 * Task manager having power of life and death on other windows
 */
export default class TaskManagerTool extends WindowNWM
{
    /** url for the CSS file */
    #href = "TaskManagerTool/TaskManagerTool.css";
    /** title of the window */
    static title = TaskManagerToolText.title;
    text = TaskManagerToolText;
    /** @type {MutationObserverInit} configuration of the observer */
    configObserver = {childList: true};
    /** @type {MutationObserver} observer checking the add or delete of windows */
    obs;
    /** @type {HTMLTableSectionElement}  body of the table */
    tbody;
    /**
     * Generate the task manager
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
        this.setTaskObserver();
    }
    disconnectedCallback()
    {
        super.disconnectedCallback();
        this.obs?.disconnect();
    }
    /**
     * Set observer for check if a new window appear or is deleted
     */
    setTaskObserver()
    {
        const toolsContainer = document.querySelector(".tools-container");
        if(!toolsContainer)return;
        this.obs = new MutationObserver(this.handleTaskObserver.bind(this));
        this.obs.observe(toolsContainer, this.configObserver);
    }
    /**
     * Generate or remove row in the task manager
     * @param {MutationRecord} mutations 
     */
    handleTaskObserver(mutations)
    {
        for (const mutation of mutations) 
        {
            for (const tool of mutation.addedNodes) 
            {
                if(!tool.id)return;
                this.generateRow(tool.id);
            }
            for (const tool of mutation.removedNodes) 
            {
                if(!tool.id)return;
                this.removeRow(tool.id);
            }
        }
    }
    /**
     * Initialize HTML table for the task manager
     */
    init()
    {
        this.setCSS(this.#href);
        const 
            managerContainer = document.createElement("div"),
            table = document.createElement("table"), 
            thead = document.createElement("thead"),
            tbody = document.createElement("tbody"),
            theadRow = document.createElement("tr"),
            colGroup = document.createElement("colgroup"),
            colGroupText = document.createElement("col"),
            colGroupBtn = document.createElement("col");

        colGroupText.span = "2";
        colGroupText.classList.add("col-group-text");
        colGroupBtn.span = "2";
        colGroupBtn.classList.add("col-group-btn");

        this.tbody = tbody;

        managerContainer.classList.add("manager-container");

        for (const thName in this.text.table.th) 
        {
            const th = document.createElement("th");
            th.textContent = this.getText(`table.th.${thName}`);
            th.scope = "col";
            theadRow.append(th);
        }
        const toolsList = this.getTaskManagerData()?.toolsList
        if(toolsList)
        {
            for (const toolId in toolsList) 
            {
                this.generateRow(toolId);
            }
        }
        colGroup.append(colGroupText, colGroupBtn);
        thead.append(theadRow);
        table.append(colGroup,thead, tbody);
        managerContainer.append(table);
        this.container.append(managerContainer);
    }
    /**
     * Generate the html of a row in the task manager table depending of the id gave in parameter
     * @param {string} toolId window's id
     */
    generateRow(toolId)
    {
        const toolsList = this.getTaskManagerData()?.toolsList;
        const 
            tool = toolsList[toolId], 
            tr = document.createElement("tr"),
            tdName = document.createElement("td"),
            tdId = document.createElement("td"),
            tdDisplay = document.createElement("td"),
            tdReload = document.createElement("td"),
            tdClose = document.createElement("td"),
            btnDisplay = document.createElement("button"),
            btnReload = document.createElement("button"),
            btnClose = document.createElement("button");

        tr.classList.add(toolId);

        tdName.textContent = tool;
        tdId.textContent = toolId;

        btnDisplay.textContent = this.getText("table.td.appDisplay");
        btnReload.textContent = this.getText("table.td.appReload");
        btnClose.textContent = this.getText("table.td.appClose");
        btnDisplay.addEventListener("click", this.handleToolAction.bind(this));
        btnReload.addEventListener("click", this.handleToolAction.bind(this));
        btnClose.addEventListener("click", this.handleToolAction.bind(this));
        btnDisplay.dataset.id = toolId;
        btnReload.dataset.id = toolId;
        btnClose.dataset.id = toolId;
        btnDisplay.dataset.action = "display";
        btnReload.dataset.action = "reload";
        btnClose.dataset.action = "close";

        tdDisplay.append(btnDisplay);
        tdReload.append(btnReload);
        tdClose.append(btnClose);
        tr.append(tdName, tdId, tdDisplay, tdReload, tdClose);
        this.tbody.append(tr);
    }
    /**
     * Remove a row from the task manager table depending of the id.
     * @param {string} toolId window's id
     */
    removeRow(toolId)
    {
        const row = this.tbody.querySelector(`.${toolId}`);
        if(!row) return;
        row.remove();
    }
    /**
     * Handle action to make on a window
     * @param {PointerEvent|MouseEvent} e event from the click on a button of the task manager table
     */
    handleToolAction(e)
    {
        const 
            id = e.target.dataset.id,
            action = e.target.dataset.action,
            /** @type {WindowNWM} tool selected by the manager */
            target = document.querySelector(`#${id}`);
        if(!target || !action)return;
        switch(action)
        {
            case "display": 
                target.setPosition();
                target.activeWindow();
                break;
            case "reload": 
                target.reloadWindow();
                break;
            case "close": 
                target.closeWindow();
                break;
        }
    }
}
customElements.define("nwm-task-manager", TaskManagerTool);