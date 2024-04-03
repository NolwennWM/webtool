import BoxShadowTool from "./ShadowTool/ShadowTool.js";
import GridTool from "./GridTool/GridTool.js";
import BurgerMenu from "../BurgerMenu/BurgerMenu.js";

const tools = [GridTool, BoxShadowTool];
const langs = {fr:"Français", en:"English"};
const container = document.querySelector(".tools-container");
const nav = document.querySelector(".tools-menu");

generateMenu();

function generateMenu()
{
    
    if(!nav) return;

    const menu = document.createElement("menu");

    for (const tool of tools) 
    {
        const li = document.createElement("li");
        li.textContent = tool.name;    
        li.addEventListener("click", appendTool.bind(tool));
        menu.append(li);
    }

    const select = document.createElement("select");

    for(const l in langs)
    {
        const opt = document.createElement("option");
        opt.value = l;
        opt.textContent = langs[l];
        select.append(opt);
    }

    nav.appendNav(menu,select);

}
function appendTool()
{
    container.append(new this());
    nav.toggleMenu();
}