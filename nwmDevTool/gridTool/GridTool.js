"use strict";
/**
 * Balise HTML créant un GRID generator
 */
export default class GridTool extends HTMLElement
{
    // default value :
    columns = 2;
    rows = 2;
    defaultSize = "1fr";
    lang = "fr";
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
        },
        display:{
            title:{
                fr: "Copiez et adaptez le code ci-dessous",
                en: "Copy and adapt the code below"
            },
            close: {
                fr: "Fermer le Code",
                en: "Close the Code"
            },
            copy:{
                fr: "Copier dans le presse-papier",
                en: "Copy in the clipboard"
            },
            copied:{
                fr: "Code Copié",
                en: "Code Copied"
            },
            html:{

            }
        }
    }
    formInfo = [
        {name:"columns", max:20, default:this.columns},
        {name:"rows", max:20, default:this.rows},
        {name:"columnGap", max:50, default:0},
        {name:"rowGap", max:50, default:0},
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
        this.#init();
        
    }
    /**
     * Génère les éléments principaux du grid generator
     */
    #init()
    {
        this.attachShadow({mode:"open"});
        console.log(document.URL);

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

        this.#chooseLanguage();
        this.#createForm();

        container.append(this.columnsForm, this.rowsForm, this.grid);
        this.shadowRoot.append(container, this.form);
    }
    #chooseLanguage()
    {
        const params = new URLSearchParams(document.location.search);
        const lang = params.get("lang");
        if(!lang || !this.text.languages.includes(lang))
        {
            this.lang = "en";
            return;
        }
        this.lang = lang;
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
            label.textContent = this.text.form[field.name][this.lang];

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
            console.log(prev !== line || count === 0);
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

        console.log(this.totalBox);
    }
    #inputToSize(e)
    {
        const   id = e.target.dataset.id,
                name = e.target.dataset.name;
        this[name + "Sizes"][id] = e.target.value;
        console.log(this.columnsSizes, this.rowsSizes);
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
        const overlay = document.createElement("div");
        overlay.classList.add("overlay");

        const displayBlock = document.createElement("div");
        displayBlock.classList.add("displayBlock");
        
        const h3 = document.createElement("h3");
        h3.textContent = this.text.display.title[this.lang];

        const close = document.createElement("button");
        close.classList.add("close");
        close.textContent = this.text.display.close[this.lang];
        
        const copy = document.createElement("button");
        copy.classList.add("copy");
        copy.textContent = this.text.display.copy[this.lang];

        const pre = document.createElement("pre");

        const code = document.createElement("code");
        code.innerHTML = this.#getCSS();

        pre.append(copy, code);
        displayBlock.append(h3, pre, close);
        overlay.append(displayBlock);
        this.shadowRoot.append(overlay);

        copy.addEventListener("click", ()=>
        {
            navigator.clipboard.writeText(this.css.copy);
            copy.textContent = this.text.display.copied[this.lang];
            setTimeout(() => {
                copy.textContent = this.text.display.copy[this.lang];
                
            }, 2000);
        });
        close.addEventListener("click", ()=>overlay.remove());
    }
}
customElements.define("nwm-grid", GridTool);