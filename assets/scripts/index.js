import ShadowTool from "./nwmDevTool/ShadowTool/ShadowTool.js";
import GridTool from "./nwmDevTool/GridTool/GridTool.js";
import BurgerMenu from "./BurgerMenu/BurgerMenu.js";
// TODO: save history of tools, add child selector to grid and shadowText
const tools = {GridTool, ShadowTool};
const langs = {fr:"Français", en:"English"};
const searchLangs = {fr: "Rechercher un Outil", en: "Search a Tool"}
const container = document.querySelector(".tools-container");
const nav = document.querySelector(".tools-menu");

let toolsMenu, menuContainer;
document.addEventListener("DOMContentLoaded", disableLoader);

generateMenu();
GridTool.getLocalStorageTools(container, tools);
GridTool.setLocalStorageEvent();
// disableLoader();
/**
 * Generate Navigation Menu
 */
function generateMenu()
{
    
    if(!nav) return;
    menuContainer = document.createElement("div")
    menuContainer.classList.add("navigation-container");
    const select = document.createElement("select");
    select.ariaLabel = "Lang Selection"

    for(const l in langs)
    {
        const opt = document.createElement("option");
        opt.value = l;
        opt.textContent = langs[l];
        select.append(opt);
    }
    const selectedLang = checkLang(select);
    select.addEventListener("input", selectLang);

    const menu = document.createElement("menu");

    const searchInput = document.createElement("input");
    searchInput.type = "search";
    searchInput.setAttribute("list", "toolsList");
    searchInput.placeholder = searchLangs[selectedLang];
    searchInput.addEventListener("input", toggleItemsMenu);

    const toolsList = document.createElement("datalist");
    toolsList.id = "toolsList";
    
    for (const toolName in tools) 
    {
        const tool = tools[toolName];
        const title = tool.title[selectedLang];
        if(!title) continue;

        const li = document.createElement("li");
        li.dataset.tool = title;
        const btn = document.createElement("button");

        btn.textContent = title;    
        btn.addEventListener("click", appendTool.bind(tool));

        li.append(btn);
        menu.append(li);

        const opt = document.createElement("option");
        opt.value = title;
        toolsList.append(opt);
    }

    
    toolsMenu = menu.querySelectorAll("li");

    menuContainer.append(menu, searchInput, toolsList, select);
    nav.appendNav(menuContainer);
    nav.generateCSS("./assets/styles/toolMenu.css");
}
/**
 * Append a new tool
 */
function appendTool()
{
    container.append(new this());
    nav.toggleMenu();
}
/**
 * Change the language and reload the page
 */
function selectLang()
{
    const l = this.value;
    if(!langs[l])return;
    const url = new URL(window.location.href)
    url.searchParams.set("lang", l);
    window.location.replace(url);
}
/**
 * Check if a language is selected and set the select element.
 * @param {HTMLSelectElement} select select handling the language
 * @returns {string} language selected
 */
function checkLang(select)
{
    const url = new URL(window.location.href)
    let l = url.searchParams.get("lang");
    if(!l || !langs[l]) l = 'en';
    select.value = l;
    document.documentElement.lang = l;
    return l;
}
/**
 * Hide or Show item list during the search of tools
 */
function toggleItemsMenu()
{
    for (const li of toolsMenu) 
    {
        const data = li.dataset.tool.toLowerCase();
        const value = this.value.toLowerCase();
        if(data.includes(value))
        {
            li.style.display = "";
        }
        else
        {
            li.style.display = "none";
        }
    }
}
function disableLoader()
{
    const loader = document.querySelector(".loader-container");
    if(!loader)return;
    setTimeout(()=>{
        loader.addEventListener("transitionend", ()=>{
            const credit = document.querySelector(".footer-credit")??"";
            menuContainer?.append(credit);
            loader.remove()
        });
        loader.style.opacity = 0;
    },1000)
    
}
/* 
    TODO :
    - lister tout les outils ouverts dans un tableau dans l'objet window et vérifier qu'ils ont bien chargé avant de désactiver le loader
    - on ctrl + arrow move the window as windows arrow
    - Ajouter worker
*/