"use strict";
import Tool from "../DevTool/Tool.js";
/**
 * Balise HTML créant un GRID generator
 */
export default class GridTool extends Tool
{
    // default value :
    columns = 2;
    rows = 2;
    defaultSize = "1fr";
    text = {
        languages: ["fr", "en"],
        title:{
            fr: "Générateur de Grid",
            en: "Grid Generator"
        },
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
            },
            codeButton:{
                fr: "Voir le Code",
                en: "See the Code"
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
    }
    formInfo = [
        {type:"number",name:"columns",min:0, max:20, default:this.columns, event:this.#setGrid.bind(this)},
        {type:"number",name:"rows",min:0, max:20, default:this.rows, event:this.#setGrid.bind(this)},
        {type:"number",name:"columnGap",min:0, max:50, default:0, event:this.#setGrid.bind(this)},
        {type:"number",name:"rowGap",min:0, max:50, default:0, event:this.#setGrid.bind(this)},
    ];
    // fonctionnal properties :
    columnsId = 0;
    rowsId = 0;
    totalBox = 0;
    columnsSizes = [];
    rowsSizes = [];
    css = {};
    
    constructor()
    {
        super();

        this.chooseLanguage();
        this.setTitle(this.text.title[this.lang]);
        
        this.#init();
    }
    /**
     * Génère les éléments principaux du grid generator
     */
    #init()
    {
        this.setCSS("./nwmDevTool/gridTool/GridTool.css");

        this.generateDisplayFormTool();

        this.rowsForm = document.createElement("div");
        this.rowsForm.classList.add("rowsForm");

        this.columnsForm = document.createElement("div");
        this.columnsForm.classList.add("columnsForm");

        this.grid = document.createElement("div");
        this.grid.classList.add("grid");
        this.grid.style.display = "grid";

        this.#createForm();

        this.display.append(this.columnsForm, this.rowsForm, this.grid);

    }
    /**
     * Créer le formulaire de paramétrage de la grid.
     */
    #createForm()
    {
        const formInfo = this.formInfo;
        this.generateForm(formInfo, this.text.form);

        const codeBtn = document.createElement("button");
        codeBtn.textContent = this.text.form.codeButton[this.lang];
        codeBtn.addEventListener("click", this.#getCode.bind(this));
        this.form.append(codeBtn);
        
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
                div.classList.add("box"+this.totalBox);
                this.grid.append(div);
                this.totalBox++
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
        console.log("Afficher HTML");
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

        this.css.copy = copyCode + "}";
        return displayCode + "}";
    }
    #getCode()
    {
        const overlay = this.generateOverlay();
        overlay.innerHTML = this.#getCSS();
    }
}
customElements.define("nwm-grid", GridTool);