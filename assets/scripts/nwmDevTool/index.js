import BoxShadowTool from "./ShadowTool/ShadowTool.js";
import GridTool from "./GridTool/GridTool.js";
import BurgerMenu from "../BurgerMenu/BurgerMenu.js";

const tools = [GridTool, BoxShadowTool];
const container = document.querySelector(".tools-container");

generateMenu();

function generateMenu()
{
    const nav = document.querySelector(".tools-menu");
    
    if(!nav) return;

    const menu = document.createElement("menu");
    nav.appendNav(menu);

    for (const tool of tools) 
    {
        const li = document.createElement("li");
        li.textContent = tool.name;    
        li.addEventListener("click", appendTool.bind(tool));
        menu.append(li);
    }
}
function appendTool()
{
    container.append(new this());
}