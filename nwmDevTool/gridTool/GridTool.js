"use strict";
/**
 * Balise HTML créant un GRID generator
 */
export default class GridTool extends HTMLElement
{
    columns = 2;
    rows = 2;
    totalBox = 0;
    defaultSize = "1fr";
    columnsSizes = [];
    rowsSizes = [];
    formInfo = [
        {label: "Columns", name:"columns", max:20, default:this.columns},
        {label: "Rows", name:"rows", max:20, default:this.rows},
        {label: "Columns Gap (in px)", name:"columnsGap", max:50, default:0},
        {label: "Rows Gap (in px)", name:"rowsGap", max:50, default:0},
    ];
    constructor()
    {
        super();
        this.#init();
        
    }
    /**
     * Génère les éléments principaux du grid generator
     */
    #init()
    {
        this.attachShadow({mode:"open"});

        const style = document.createElement("link");
        style.rel = "stylesheet";
        style.href = "./nwmDevTool/gridTool/GridTool.css";
        this.shadowRoot.append(style);

        const container = document.createElement("div");
        container.classList.add("grid-container");

        this.rowsForm = document.createElement("div");
        this.rowsForm.classList.add("rowsForm");

        this.columnsForm = document.createElement("div");
        this.columnsForm.classList.add("columnsForm");

        this.grid = document.createElement("div");
        this.grid.classList.add("grid");
        this.grid.style.display = "grid";

        this.form = document.createElement("div");
        this.form.classList.add("form");

        this.#createForm();

        container.append(this.columnsForm, this.rowsForm, this.grid);
        this.shadowRoot.append(container, this.form);
    }
    /**
     * Créer le formulaire de paramétrage de la grid.
     */
    #createForm()
    {
        const formInfo = this.formInfo;
        for(const field of formInfo)
        {
            const fieldSet = document.createElement("fieldset");

            const label = document.createElement("label");
            label.textContent = field.label;

            const input = document.createElement("input");
            input.type = "number";
            input.min = 0;
            input.max = field.max;
            input.value = field.default;
            input.name = field.name;
            input.addEventListener("input", this.#setGrid.bind(this));

            fieldSet.append(label, input);
            this.form.append(fieldSet);
        }
        
        this.#createDivs();
        this.#setTemplate(this.columns, this.columnsSizes);
        this.#setTemplate(this.rows, this.rowsSizes);
        this.#setSizes();
    }
    /**
     * Paramètre les colonnes et rangées de la grid ainsi que les gaps
     * @param {InputEvent} e Evènement d'input
     * @returns undefined
     */
    #setGrid(e)
    {
        let template, current;

        const nb = parseInt(e.target.value);
        if(nb<0) return;

        switch(e.target.name)
        {
            case "columns":
                template = this.columnsSizes;
                current = "columns";
                break;
            case "rows":
                template = this.rowsSizes;
                current = "rows";
                break;
            case "rowsGap":
                this.grid.style.rowGap = nb + "px";
                return;
            case "columnsGap":
                this.grid.style.columnGap = nb + "px";
                return;
            default:
                console.error("Input Name not find");
                return;
        }
        let diff = nb - this[current];
        this[current] = nb;
            
        this.#createDivs();
        this.#setTemplate(diff, template);
        this.#setSizes(current);
    }
    /**
     * Ajoute ou surprime des éléments du tableau de taille donné en argument.
     * @param {number} diff number of grid or row to add or remove
     * @param {Array} template Array of sizes for grid or column
     */
    #setTemplate(diff, template)
    {
        if(diff > 0)
        {
            for(let i = 0; i<diff; i++)
            {
                template.push(this.defaultSize);
            }
        }
        else
        {
            template.splice(diff, diff*-1)
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
                console.error("Select Rows, Columns or both only.");
                return 
        }
        let total = 0, 
            prev = "",
            template = "",
            count = arr.length;

        for (const line of arr) 
        {
            console.log(total, line);
            count--;
            if(prev === line || total === 0)
            {
                prev = line;
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
                    template += line + " ";
                }
                total = 0;
            }
        }
        this.grid.style[property] = template;
        this[form].style[property] = template;
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

        console.log(this.totalBox);
    }
    #createInputs()
    {
        if(target === "columns" || target === "both")
        {
            this.columnsForm
        }
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
        console.log("Afficher CSS");
    }
}
customElements.define("nwm-grid", GridTool);