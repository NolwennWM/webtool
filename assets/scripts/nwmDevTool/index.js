import BoxShadowTool from "./ShadowTool/ShadowTool.js";
import GridTool from "./GridTool/GridTool.js"

const tools = [GridTool, BoxShadowTool];
const columns = document.querySelectorAll(".column");
const btnTools = document.querySelector(".btn-tools");
const navTools = document.querySelector(".tools-header nav");
const container = document.querySelector(".tools-container");

generateMenu();
columns.forEach((col)=>GridTool.setDropZone(col));
btnTools.addEventListener("pointerup", toggleMenu);
navTools.addEventListener("pointerup", toggleMenu);

function generateMenu()
{
    const menu = navTools.querySelector("menu");
    
    if(!menu) return;

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
    // const column = [...columns].reduce(getSmallestColumn)
    // if(!column)return;
    container.append(new this());
}
// function getSmallestColumn(a,b)
// {
//     if(a.children.length<b.children.length) return a;
//     else return b; 
// }
function toggleMenu()
{
    navTools.classList.toggle("open");
}