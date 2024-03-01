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

        this.grid = document.createElement("div");
        this.grid.classList.add("grid");
        this.grid.style.display = "grid";

        this.form = document.createElement("div");
        this.form.classList.add("form");

        this.#createForm();

        this.shadowRoot.append(this.grid, this.form);
    }
    /**
     * Créer le formulaire de paramétrage de la grid.
     */
    #createForm()
    {
        const formInfo = [
            {label: "Columns", max:20, default:this.columns, function: this.#setColumns.bind(this)},
            {label: "Rows", max:20, default:this.rows, function: this.#setRows.bind(this)},
            {label: "Columns Gap (in px)", max:50, default:0, function: this.#setColumnGap.bind(this)},
            {label: "Rows Gap (in px)", max:50, default:0, function: this.#setRowGap.bind(this)},
        ];
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
            input.addEventListener("input", field.function);

            fieldSet.append(label, input);
            this.form.append(fieldSet);
        }
        this.#setColumns();
        this.#setRows();
        this.#setSizes();
    }
    #setColumns(e)
    {
        let diff = this.columns;
        if(e instanceof InputEvent)
        {
            const nbColumn = parseInt(e.target.value);
            if(nbColumn<0) return;
            diff = nbColumn - this.columns;
            this.columns = nbColumn;
        }
        this.#createDivs();

        if(diff > 0)
        {
            for(let i = 0; i<diff; i++)
            {
                this.columnsSizes.push(this.defaultSize);
            }
        }
        else
        {
            this.columnsSizes.splice(diff, diff*-1)
        }
        
        this.#setSizes();
        // this.grid.style.gridTemplateColumns = template;
        console.log(this.columns);
    }
    #setRows(e)
    {
        let diff = this.rows;
        if(e instanceof InputEvent)
        {
            const nbRow = parseInt(e.target.value);
            if(nbRow<0) return;
            diff = nbRow - this.rows;
            this.rows = nbRow;
        }
        
        this.#createDivs();

        if(diff > 0)
        {
            for(let i = 0; i<diff; i++)
            {
                this.rowsSizes.push(this.defaultSize);
            }
        }
        else
        {
            this.rowsSizes.splice(diff, diff*-1)
        }
        
        this.#setSizes();
        console.log(this.rows);
    }
    #setSizes(target = "both")
    {
        let arr, property;
        switch(target)
        {
            case "column":
                arr = this.columnsSizes;
                property = "gridTemplateColumns";
                break;
            case "row":
                arr = this.rowsSizes;
                property = "gridTemplateRows"
                break;
            case "both":
                this.#setSizes("column");
                this.#setSizes("row");
                return;  
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
        console.log(template);
    }
    #setColumnGap()
    {
        console.log(this.value);
    }
    #setRowGap()
    {
        console.log(this.value);
    }
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
    #getHTML()
    {
        console.log("Afficher HTML");
    }
    #getCSS()
    {
        console.log("Afficher CSS");
    }
}
customElements.define("nwm-grid", GridTool);