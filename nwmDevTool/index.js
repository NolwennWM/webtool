import BoxShadowTool from "./BoxShadowTool/BoxShadowTool.js";
import GridTool from "./GridTool/GridTool.js"

const tools = [GridTool, BoxShadowTool];
const columns = document.querySelectorAll(".column");

generateMenu();
columns.forEach((col)=>GridTool.setDropZone(col));


function generateMenu()
{
    const menu = document.querySelector(".tools-header menu");
    
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
    const column = [...columns].reduce(getSmallestColumn)
    if(!column)return;
    column.append(new this());
}
function getSmallestColumn(a,b)
{
    if(a.children.length<b.children.length) return a;
    else return b; 
}