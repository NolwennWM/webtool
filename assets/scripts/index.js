import ShadowTool from "./nwmDevTool/ShadowTool/ShadowTool.js";
import GridTool from "./nwmDevTool/GridTool/GridTool.js";
import TutorialTool from "./nwmDevTool/TutorialTool/TutorialTool.js";
import DevToolsHandler from "./DevToolsHandler/DevToolsHandler.js";
import Tool from "./nwmDevTool/Tool/Tool.js";
import BurgerMenu from "./BurgerMenu/BurgerMenu.js";

const tools = {GridTool, ShadowTool, TutorialTool};

const handler = new DevToolsHandler(tools);

Tool.getLocalStorageTools(handler.container, tools);
Tool.setLocalStorageEvent();
/* 
    TODO :
    - lister tout les outils ouverts dans un tableau dans l'objet window et vérifier qu'ils ont bien chargé avant de désactiver le loader
    - on ctrl + arrow move the window as windows arrow
    - Ajouter worker
    - changer curseur grid
    - finir le tutoriel
    - ajouter titles sur les boutons de la fenêtre.
*/