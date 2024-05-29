"use strict";

import Tool from "../Tool/Tool.js";
import { ShadowToolText } from "./ShadowToolText.js";



export default class ShadowTool extends Tool
{
    static title = {
        fr: "Générateur d'Ombre",
        en: "Shadow Generator"
    };
    shadows = [];
    #href = "ShadowTool/ShadowTool.css"
    colorRegex = /^#[\da-fA-F]{3,6}$/;
    text = ShadowToolText;
    isTextShadow = false;
    defaultShadow = {
        offsetX: 5,
        offsetY: 5,
        blurRadius: 5,
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
        {type: "checkbox", name: "inset", event:this.#setInset.bind(this), checked: this.defaultShadow.inset},
    ];
    nbShadow = 0;
    constructor(settings = undefined)
    {
        super();
        this.settings = settings;
        this.setToolSettings();

        this.chooseLanguage();
        this.setTitle(this.constructor.title[this.lang]);

        this.#init();
        this.setToolElements();
    }
    connectedCallback()
    {
        super.connectedCallback();
        if(!this.history)return;
    }
    #init()
    {
        this.setCSS(this.#href);
        this.generateDisplayFormTool();

        
        this.#createForm();
        this.#generateTarget();
        this.#generateShadow();
    }
    #generateTarget()
    {
        this.target?.remove();
        const target = document.createElement("div");
        this.target = target;
        if(this.isTextShadow)
        {
            target.classList.add("text-shadow-target");
            this.#setExampleText();
        }
        else
        {
            target.classList.add("box-shadow-target");
        }
        this.display.append(target);
        this.#updateShadow();
    }
    #createForm()
    {
        const btnAdd = document.createElement("button");
        btnAdd.textContent = this.getText("form.addButton");
        btnAdd.classList.add("add-button");
        btnAdd.addEventListener("click", this.#generateShadow.bind(this));
        this.form.append(btnAdd);

        const shadow = document.createElement("button");
        shadow.textContent = this.isTextShadow?this.getText("form.shadow.box"):this.getText("form.shadow.text");
        shadow.classList.add("shadow-switch-button");
        shadow.addEventListener("click", this.#switchShadow.bind(this));

        const textExample = document.createElement("input");
        textExample.type = "text";
        textExample.name = "exampleText";
        textExample.addEventListener("input", this.#setExampleText.bind(this));
        textExample.value = this.getText("form.exampleText");
        textExample.classList.add("example-text");
        textExample.classList.toggle("hide", !this.isTextShadow);
        this.textExample = textExample;

        this.display.append(shadow, textExample);

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
        leg.textContent = this.getText("form.legend") +' '+ this.nbShadow;
        this.form.append(leg);

        const delButton = document.createElement("button");
        delButton.textContent = this.getText("form.delButton");
        delButton.addEventListener("pointerup", this.#deleteShadow.bind(this));

        const filteredForm = this.formInfo.filter((input)=>{
            input.value = this.defaultShadow[input.name];
            switch(input.name)
            {
                case "inset": 
                    input.checked = this.defaultShadow[input.name];
                case "spreadRadius":
                    return this.isTextShadow? undefined:input;
                default: return input;
            }
        })
        this.generateForm(filteredForm);

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
        
        if(this.isTextShadow) this.target.style.textShadow = shadow;
        else this.target.style.boxShadow = shadow;  
             
    } 

    #deleteShadow(e)
    {
        const id = this.#getId(e.target);
        this.shadows.splice(id, 1);
        e.target.closest(".shadow-set")?.remove();
        this.#updateShadow();
    }
    #deleteShadows()
    {
        this.shadows = [];
        this.nbShadow = 0;
        const shadows = this.shadowRoot.querySelectorAll(".shadow-set");
        for (const shadow of shadows) 
        {
            shadow.remove();    
        }
    }
    #switchShadow(e)
    {
        this.isTextShadow = !this.isTextShadow;

        if(this.isTextShadow)
        {
            e.target.textContent = this.getText("form.shadow.box");
        }else
        {
            e.target.textContent = this.getText("form.shadow.text");
        }
        this.textExample.classList.toggle("hide", !this.isTextShadow);

        this.#deleteShadows();
        this.#generateTarget();
        this.#generateShadow();
    }
    #setExampleText(e)
    {
        if(!this.textExample.value)return;
        this.target.textContent = this.textExample.value;
    }
    #getCode()
    {
        const overlay = this.generateOverlay();
        overlay.setCSS = this.#getCSS();
        overlay.displayCSS();
    }
    #getCSS()
    {
        const shadow = this.isTextShadow?"text-shadow":"box-shadow";
        let displayCode = `<span class='selector'>.target</span>\r{\r\t<span class='property'>${shadow}</span>: <span class='value'>${this.shadowProperty}</span>;\r}`;
        let copyCode = `.target\r{\r\t${shadow}: ${this.shadowProperty};\r}`;
        return {display: displayCode, copy: copyCode}
    }
    getToolSettings()
    {
        const tool = {isTextShadow: this.isTextShadow, shadows: this.shadows}
        return tool;
    }
    setToolSettings()
    {
        if(!this.settings)return;
        this.isTextShadow = this.settings.isTextShadow;
    }
    setToolElements()
    {
        if(!this.settings)return;
        this.#deleteShadows();
        const tmp = this.defaultShadow;
        for (const shadow of this.settings.shadows) 
        {
            if(!shadow) continue;  
            this.defaultShadow = shadow;
            this.#generateShadow();
        }
        this.defaultShadow = tmp;
    }
}
customElements.define("nwm-box-shadow", ShadowTool);
/* 
    TODO: reset compteur d'ombre et tableau d'ombre sauvegardé
*/