import ShadowTool from "./nwmDevTools/ShadowTool/ShadowTool.js";
import GridTool from "./nwmDevTools/GridTool/GridTool.js";
import TutorialTool from "./nwmDevTools/TutorialTool/TutorialTool.js";
import DevToolsHandler from "./DevToolsHandler/DevToolsHandler.js";
import Tool from "./nwmDevTools/Tool/Tool.js";
import BurgerMenu from "./BurgerMenu/BurgerMenu.js";
import TaskManagerTool from "./nwmDevTools/TaskManagerTool/TaskManagerTool.js";

const tools = {GridTool, ShadowTool,TaskManagerTool, TutorialTool};

const handler = new DevToolsHandler(tools);

Tool.getLocalStorageTools(handler.container, tools);
Tool.setLocalStorageEvent();
/* 
    TODO :
    - lister tout les outils ouverts dans un tableau dans l'objet window et vérifier qu'ils ont bien chargé avant de désactiver le loader
    - on ctrl + arrow move the window as windows arrow
    - Ajouter worker
    - finir le tutoriel
    - ajouter un confirm optionnel à openOnce

    peut être ? 
    https://hub.docker.com/r/rofl256/whiteboard
*/