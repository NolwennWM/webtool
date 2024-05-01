"use strict";
import Tool from "../Tool/Tool.js";
/**
 * Balise HTML créant un GRID generator
 */
export default class GridTool extends Tool
{
    #href = "GridTool/GridTool.css";
    // default value :
    columns = 2;
    rows = 2;
    defaultSize = "1fr";
    nbChildrenColors = 5;
    static title ={
            fr: "Générateur de Grid",
            en: "Grid Generator"
        };
    text = {
        languages: ["fr", "en"],
        form:{
            columns:{
                fr: "Colonnes",
                en: "Columns"
            },
            rows:{
                fr: "Rangées",
                en: "Rows"
            },
            columnGap:{
                fr: "Écart des Colonnes (en px)",
                en: "Columns Gap (in px)"
            },
            rowGap:{
                fr: "Écart des Rangées (en px)",
                en: "Rows Gap (in px)"
            }
        },
        errors:{
            input:{
                fr: "name de l'input inconnu",
                en: "Input's name unknown"
            },
            sizes:{
                fr: "Selectionnez seulement rows, columns ou both",
                en: "Select rows, columns or both only."
            }
        }
    };
    formInfo = [
        {type:"number",name:"columns",min:0, max:20, value:this.columns, event:this.#setGrid.bind(this)},
        {type:"number",name:"rows",min:0, max:20, value:this.rows, event:this.#setGrid.bind(this)},
        {type:"number",name:"columnGap",min:0, max:50, value:0, event:this.#setGrid.bind(this)},
        {type:"number",name:"rowGap",min:0, max:50, value:0, event:this.#setGrid.bind(this)},
    ];
    // fonctionnal properties :
    columnsId = 0;
    rowsId = 0;
    totalBox = 0;
    columnsSizes = [];
    rowsSizes = [];
    css = {};
    childrenList = [];
    parentId = "";
    
    constructor()
    {
        super();

        this.chooseLanguage();
        this.setTitle(this.constructor.title[this.lang]);
        
        this.#init();
    }
    connectedCallback()
    {
        super.connectedCallback();
        if(!this.history)return;
        console.log("grid TOOL !");
    }
    /**
     * Génère les éléments principaux du grid generator
     */
    #init()
    {
        this.setCSS(this.#href);

        this.generateDisplayFormTool();

        this.rowsForm = document.createElement("div");
        this.rowsForm.classList.add("rowsForm");

        this.columnsForm = document.createElement("div");
        this.columnsForm.classList.add("columnsForm");

        this.grid = document.createElement("div");
        this.grid.classList.add("grid");
        this.grid.style.display = "grid";
        this.grid.draggable = false;

        this.gridChildren = this.grid.cloneNode();

        this.#createForm();

        this.display.append(this.columnsForm, this.rowsForm, this.gridChildren, this.grid);
    }
    /**
     * Créer le formulaire de paramétrage de la grid.
     */
    #createForm()
    {
        const formInfo = this.formInfo;
        this.generateForm(formInfo, this.text.form);

        this.generateCodeButton(this.form, this.#getCode);
        
        this.#createDivs();
        this.#setTemplate(this.columns, "columns");
        this.#setTemplate(this.rows, "rows");
        this.#setSizes();
    }
    /**
     * Paramètre les colonnes et rangées de la grid ainsi que les gaps
     * @param {InputEvent} e Evènement d'input
     * @returns undefined
     */
    #setGrid(e)
    {
        /** @type {string}*/
        let current = e.target.name;

        const nb = parseInt(e.target.value);
        if(nb<0) return;

        switch(current)
        {
            case "columns":
            case "rows":
                break;
            case "rowGap":
            case "columnGap":
                this.grid.style[current] = nb + "px";
                this.gridChildren.style[current] = nb + "px";
                this.css[current] = nb;
                return;
            default:
                console.error(this.text.errors.input[this.lang]);
                return;
        }
        let diff = nb - this[current];
        this[current] = nb;
            
        this.#createDivs();
        this.#setTemplate(diff, current);
        this.#setSizes(current);
    }
    /**
     * Ajoute ou surprime des éléments du tableau de taille donné en argument.
     * @param {number} diff number of grid or row to add or remove
     * @param {string} target 
     */
    #setTemplate(diff, target)
    {
        const form = this[target+"Form"];
        if(diff > 0)
        {
            for(let i = 0; i<diff; i++)
            {
                this[target+"Sizes"].push(this.defaultSize);

                const inp = document.createElement("input");
                inp.dataset.id = this[target+"Id"]++;
                inp.dataset.name = target;
                inp.value = this.defaultSize;
                inp.addEventListener("change", this.#inputToSize.bind(this));
                form.append(inp);
            }
        }
        else
        {
            this[target+"Sizes"].splice(diff, diff*-1);
            form.children[--this[target+"Id"]].remove();
        }
    }
    /**
     * Paramètre les templates de la grid
     * @param {string} target string valant "rows", "columns" ou "both"
     * @returns undefined
     */
    #setSizes(target = "both")
    {
        let arr, property, form;
        switch(target)
        {
            case "columns":
                arr = this.columnsSizes;
                property = "gridTemplateColumns";
                form = "columnsForm";
                break;
            case "rows":
                arr = this.rowsSizes;
                property = "gridTemplateRows"
                form = "rowsForm";
                break;
            case "both":
                this.#setSizes("columns");
                this.#setSizes("rows");
                return; 
            default:
                console.error(this.text.errors.sizes[this.lang]);
                return 
        }
        let total = 1, 
            prev = "",
            template = "",
            count = arr.length;

        for (const line of arr) 
        {
            count--;
            if(prev === line)
            {
                total++;
            } 
            
            if(prev !== line || count === 0)
            {
                if(total > 1)
                {
                    template += `repeat(${total}, ${prev}) `;
                }
                else
                {
                    template += prev + " ";
                }
                if(prev !== line && count === 0)
                {
                    template += line;
                }
                total = 1;
            }
            prev = line;
        }
        this.grid.style[property] = template;
        this.gridChildren.style[property] = template;
        this[form].style[property] = template;
        this.css[target] = template;
    }
    /**
     * Crée les blocs de la grid
     */
    #createDivs()
    {
        const nbDiv = this.columns * this.rows;
        const diff = nbDiv - this.totalBox ;
        if(diff > 0)
        {
            for (let i = 0; i < diff; i++) 
            {
                const div = document.createElement("div");
                div.classList.add("box","box"+this.totalBox);
                div.dataset.id = this.totalBox+1;
                div.draggable = false;
                this.grid.append(div);
                this.totalBox++

                div.addEventListener("mousedown", (e)=>this.#GenerateChild(e, div));
                div.addEventListener("mouseup", (e)=>this.#GenerateChild(e, div));
            }
        }
        else
        {
            for (let i = 0; i > diff; i--)
            {
                this.grid.children[this.totalBox-1].remove();
                this.totalBox--;
            }
        }
    }
    #inputToSize(e)
    {
        const   id = e.target.dataset.id,
                name = e.target.dataset.name;
        this[name + "Sizes"][id] = e.target.value;
        
        this.#setSizes(name);
    }
    /**
     * Affiche un exemple de code HTML correspondant à la grid
     */
    #getHTML()
    {
        let displayCode = '&lt;<span class="tag">div</span> <span class="attribute">class</span>=<span class="string">"parent"</span>&gt;';
        let copyCode = '<div class="parent">';

        if(this.childrenList.length)
        {
            displayCode += "\r";
            copyCode += "\r";
        }
        for (let i = 0; i< this.childrenList.length; i++) 
        {
            displayCode += `\t&lt;<span class='tag'>div</span> <span class="attribute">class</span>=<span class="string">"div${i+1}"</span>&gt;&lt;/<span class="tag">div</span>&gt;\r`
            copyCode += `\t<div class="div${i+1}"></div>\r`;
        }

        displayCode += '&lt;/<span class="tag">div</span>&gt;';
        copyCode += '</div>';
        
        return {display: displayCode, copy: copyCode}
    }
    /**
     * Affiche un exemple de code CSS correspondant à la grid
     */
    #getCSS()
    {
        let displayCode = "<span class='selector'>.parent</span>\r{\r\t<span class='property'>display</span>: <span class='value'>grid</span>;\r";
        let copyCode = ".parent\r{\r\tdisplay: grid;\r";

        if(this.css.columns)
        {
            displayCode += `\t<span class='property'>grid-template-columns</span>: <span class='value'>${this.css.columns}</span>;\r`;
            copyCode += `\tgrid-template-columns: ${this.css.columns};\r`;
        } 
        if(this.css.rows)
        {
            displayCode += `\t<span class='property'>grid-template-rows</span>: <span class='value'>${this.css.rows}</span>;\r`;
            copyCode += `\tgrid-template-rows: ${this.css.rows};\r`;
        } 
        if(this.css.columnGap)
        {
            displayCode += `\t<span class='property'>column-gap</span>: <span class='value'>${this.css.columnGap}px</span>;\r`;
            copyCode += `\tcolumn-gap: ${this.css.columnGap}px;\r`;
        } 
        if(this.css.rowGap)
        {
            displayCode += `\t<span class='property'>row-gap</span>: <span class='value'>${this.css.rowGap}px</span>;\r`;
            copyCode += `\trow-gap: ${this.css.rowGap}px;\r`;
        }
        copyCode += "}";
        displayCode += "}";
        for (let i = 0; i< this.childrenList.length; i++) 
        {
            const child = this.childrenList[i];
            displayCode += `\r<span class='selector'>.div${i+1}</span> { <span class='property'>grid-area</span>: <span class='value'>${child}</span>; }`
            copyCode += `\r.div${i+1} { grid-area: ${child}; }`
        }

        return {display: displayCode, copy: copyCode}
    }
    #getCode()
    {
        const overlay = this.generateOverlay();
        overlay.setCSS = this.#getCSS();
        overlay.setHTML = this.#getHTML();
        overlay.displayCode();
    }
    /**
     * 
     * @param {MouseEvent} event 
     * @param {HTMLElement} target 
     */
    #GenerateChild(event, target)
    {
        event.preventDefault();
        const   
            x = [], 
            y =[],
            oldId = this.parentId,
            newId = target.dataset.id;
        if(!newId)return;
        if(event.type === "mouseup" && oldId)
        {
            x.push(
                (oldId % this.columns)||this.columns, 
                (newId % this.columns)||this.columns
            );
            y.push(
                Math.ceil(oldId / this.columns),
                Math.ceil(newId / this.columns)
            );
            
            const 
                div = document.createElement("div"),
                span = document.createElement("span"),
                closeBtn = document.createElement("button"),
                area = `${Math.min(...y)} / ${Math.min(...x)} / ${Math.max(...y)+1} / ${Math.max(...x)+1}`;

            this.childrenList.push(area);
            const length = this.childrenList.length

            div.style.gridArea = area;
            div.classList.add("grid-child", "child"+(length%this.nbChildrenColors));

            span.textContent = ".div"+ length;

            closeBtn.innerHTML = "&#10060;";
            closeBtn.dataset.id = length-1;
            closeBtn.addEventListener("click", this.#deleteChild.bind(this));

            div.append(span, closeBtn);
            this.gridChildren.append(div);

            this.parentId = "";
        }
        else if (event.type === "mousedown")
        {
            this.parentId = newId;
        }
    }
    /**
     * 
     * @param {MouseEvent} event 
     */
    #deleteChild(event)
    {
        if(!(event.target instanceof HTMLButtonElement)||!event.target.dataset.id)return;
        this.childrenList.splice(event.target.dataset.id, 1);
        event.target.parentElement.remove();
    }
}
// TODO: Sauvegarde interne à l'outil.
customElements.define("nwm-grid", GridTool);