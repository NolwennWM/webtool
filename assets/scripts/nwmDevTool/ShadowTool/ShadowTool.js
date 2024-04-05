"use strict";

import Tool from "../Tool/Tool.js";



export default class ShadowTool extends Tool
{
    static title = {
        fr: "Générateur d'Ombre",
        en: "Shadow Generator"
    };
    shadows = [];
    #href = "ShadowTool/ShadowTool.css"
    colorRegex = /^#[\da-fA-F]{3,6}$/;
    text = {
        languages:["fr", "en"],
        form:{
            legend: {
                fr: "Ombre",
                en: "Shadow"
            },
            addButton: {
                fr: "Ajouter Ombre",
                en: "Add Shadow"
            },
            delButton: {
                fr: "Supprimer cette Ombre",
                en: "Delete this Shadow"
            },
            offsetX: {
                fr:"Décalage X",
                en:"Offset X"
            },
            offsetY: {
                fr:"Décalage Y",
                en:"Offset Y"
            },
            blurRadius: {
                fr:"Rayon du Flou",
                en:"Blur Radius"
            },
            spreadRadius: {
                fr:"Rayon de l'Étalement",
                en:"Spread Radius"
            },
            color: {
                fr:"Couleur",
                en:"Color"
            },
            opacity: {
                fr:"Opacité",
                en:"Opacity"
            },
            inset:{
                fr: "Incrusté",
                en: "Inset"
            }
        }
    };
    defaultShadow = {
        offsetX: 5,
        offsetY: 5,
        blurRadius: 0,
        spreadRadius: 0,
        color: "#000000",
        opacity: 1,
        inset: false
    };
    formInfo = [
        {type: "number", name: "offsetX", min: -50, max:50, value: this.defaultShadow.offsetX, event:this.#setProperty.bind(this)},
        {type: "number", name: "offsetY", min: -50, max:50, value: this.defaultShadow.offsetY, event:this.#setProperty.bind(this)},
        {type: "number", name: "blurRadius", min: 0, max:50, value:this.defaultShadow.blurRadius, event:this.#setProperty.bind(this)},
        {type: "number", name: "spreadRadius", min:-50 ,max:50, value:this.defaultShadow.spreadRadius, event:this.#setProperty.bind(this)},
        {type: "color", name: "color", value: this.defaultShadow.color, event:this.#setProperty.bind(this)},
        {type: "number", name: "opacity", min:0, max:1, step: 0.1,  value:this.defaultShadow.opacity, event:this.#setProperty.bind(this)},
        {type: "checkbox", name: "inset", event:this.#setInset.bind(this)}
    ];
    nbShadow = 0;
    constructor()
    {
        super();

        this.chooseLanguage();
        this.setTitle(this.constructor.title[this.lang]);

        this.#init();
    }

    #init()
    {
        this.setCSS(this.#href);
        this.generateDisplayFormTool();

        const block = document.createElement("div");
        block.classList.add("box-shadow-target");
        this.target = block;

        this.display.append(block);

        this.#createForm();
    }
    #createForm()
    {
        const btnAdd = document.createElement("button");
        btnAdd.textContent = this.text.form.addButton[this.lang];
        btnAdd.classList.add("add-button");
        btnAdd.addEventListener("click", this.#generateShadow.bind(this));
        this.form.append(btnAdd);

        this.#generateShadow();

        this.generateCodeButton(this.display, this.#getCode);
    }
    #generateShadow()
    {
        const formContainer = this.form;
        this.form = document.createElement("fieldset");
        this.form.classList.add("shadow-set");
        this.shadows[this.nbShadow] = {...this.defaultShadow};
        this.form.dataset.id = this.nbShadow++;

        const leg = document.createElement("legend");
        leg.textContent = this.text.form.legend[this.lang] +' '+ this.nbShadow;
        this.form.append(leg);

        const delButton = document.createElement("button");
        delButton.textContent = this.text.form.delButton[this.lang];
        delButton.addEventListener("pointerup", this.#deleteShadow.bind(this));

        this.generateForm(this.formInfo, this.text.form);

        this.form.append(delButton);

        formContainer.append(this.form);
        this.form = formContainer;

        this.#updateShadow();
    }
    #getId(target)
    {
        const shadow = target.closest(".shadow-set");
        return shadow.dataset.id;
    }
    #setProperty(e)
    {
        const  
            id = this.#getId(e.target),
            {value, name} = e.target;

        if(isNaN(value) && !this.colorRegex.test(value))return;

        this.shadows[id][name] = value;

        this.#updateShadow();
    }
    #setInset(e)
    {
        const id = this.#getId(e.target);
        this.shadows[id][e.target.name] = e.target.checked;
        this.#updateShadow();
    }
    #updateShadow()
    {
        let shadow = "\r\t\t";
        for (const i in this.shadows) 
        {
            const s = this.shadows[i];
            const sr = s.spreadRadius != 0;
            let op = Math.floor(+s.opacity*255).toString(16);
            if(op == 0)op+="0";

            shadow += s.inset? "inset ":"";
            shadow += `${s.offsetX}px ${s.offsetY}px `;
            shadow += s.blurRadius != 0 ? s.blurRadius+"px ": sr?" 0 ":"";
            shadow += sr ? s.spreadRadius+"px ":"";
            shadow += s.color + op;
            if(i == this.shadows.length-1)break;
            shadow += ",\r\t\t ";
        }
        this.shadowProperty = shadow; 
        this.target.style.boxShadow = shadow;       
    } 

    #deleteShadow(e)
    {
        const id = this.#getId(e.target);
        this.shadows.splice(id, 1);
        e.target.closest(".shadow-set")?.remove();
        this.#updateShadow();
    }
    #getCode()
    {
        const overlay = this.generateOverlay();
        overlay.setCSS = this.#getCSS();
        overlay.displayCSS();
    }
    #getCSS()
    {
        let displayCode = `<span class='selector'>.target</span>\r{\r\t<span class='property'>box-shadow</span>: <span class='value'>${this.shadowProperty}</span>;\r}`;
        let copyCode = `.target\r{\r\tbox-shadow: ${this.shadowProperty};\r}`;
        return {display: displayCode, copy: copyCode}
    }
}
customElements.define("nwm-box-shadow", ShadowTool);
