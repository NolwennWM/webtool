import ToolShadow from "./nwmDevTools/ToolShadow/ToolShadow.js";
import ToolGrid from "./nwmDevTools/ToolGrid/ToolGrid.js";
import WindowTutorial from "./nwmDevTools/WindowTutorial/WindowTutorial.js";
import DevToolsHandler from "./DevToolsHandler/DevToolsHandler.js";
import AbstractTool from "./nwmDevTools/AbstractTool/AbstractTool.js";
import BurgerMenu from "./BurgerMenu/BurgerMenu.js";
import WindowTaskManager from "./nwmDevTools/WindowTaskManager/WindowTaskManager.js";
import ToolEditor from "./nwmDevTools/ToolEditor/ToolEditor.js";

try
{
    const tools = {ToolGrid, ToolShadow,ToolEditor, WindowTaskManager, WindowTutorial};

    const handler = new DevToolsHandler(tools);

    AbstractTool.getLocalStorageTools(handler.container, tools);
    AbstractTool.setLocalStorageEvent();
    registerServiceWorker();
}catch(e)
{
    console.error(e);
}


async function registerServiceWorker()
{
    if("serviceWorker" in navigator)
    {
        const registration = await navigator.serviceWorker.register("/sw.js", {scope: "/"});
    }
}
/* 
    TODO :
    - on shift + arrow move the window as windows arrow
    - dark mode optimisation
    - justify content align items pour grid
    - flex generator
    - code editor
    - color wheel
    - cubic bezier
    - code share ?
*/