import gridTool from "./gridTool/GridTool.js"

const tools = [gridTool];
const columns = document.querySelectorAll(".column");

generateMenu();

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