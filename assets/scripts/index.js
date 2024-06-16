import ShadowTool from "./nwmDevTools/ShadowTool/ShadowTool.js";
import GridTool from "./nwmDevTools/GridTool/GridTool.js";
import TutorialTool from "./nwmDevTools/TutorialTool/TutorialTool.js";
import DevToolsHandler from "./DevToolsHandler/DevToolsHandler.js";
import Tool from "./nwmDevTools/Tool/Tool.js";
import BurgerMenu from "./BurgerMenu/BurgerMenu.js";
import TaskManagerTool from "./nwmDevTools/TaskManagerTool/TaskManagerTool.js";

try
{
    const tools = {GridTool, ShadowTool,TaskManagerTool, TutorialTool};

    const handler = new DevToolsHandler(tools);

    Tool.getLocalStorageTools(handler.container, tools);
    Tool.setLocalStorageEvent();
}catch(e)
{
    console.error(e);
}

/* 
    TODO :
    - on ctrl + arrow move the window as windows arrow
    - Ajouter worker ?
    - add logo for each tool to add in dot (next and previous too?)
    - improve selection of block in touchscreen grid generator
    - add interface explanation of mobile version to tutorial.
*/