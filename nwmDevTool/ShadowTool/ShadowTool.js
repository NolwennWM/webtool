"use strict";

import Tool from "../Tool/Tool.js";



export default class BoxShadowTool extends Tool
{
    offsetX = 5;
    offSetY = 5;
    text = {
        languages:["fr", "en"],
        title:{
            fr: "Générateur de Box Shadow",
            en: "Box Shadow Generator"
        },
        form:{
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
            }
        }
    }
    formInfo = [
        {name:"offsetX", max:20, default:this.offsetX, event:this.#setOffset.bind(this)},
        {name:"offsetY", max:20, default:this.offsetY, event:this.#setOffset.bind(this)},
        {name:"blurRadius", max:20, default:0, event:this.#setBlur.bind(this)},
        {name:"spreadRadius", max:20, default:0, event:this.#setSpread.bind(this)},
        {name:"color", event:this.#setColor.bind(this)},
        {name:"opacity", max:50, default:1, event:this.#setOpacity
        .bind(this)},
    ];
    constructor()
    {
        super();

        this.chooseLanguage();
        this.setTitle(this.text.title[this.lang]);

        this.#init();
    }

    #init()
    {
        this.setCSS("./nwmDevTool/ShadowTool/ShadowTool.css")
        this.generateDisplayFormTool();
        this.#createForm();
    }
    #createForm()
    {
        const formInfo = this.formInfo;
        this.generateForm(formInfo, this.text.form);
    }
    #setOffset()
    {
        console.log("TODO setOffset");
    }
    #setBlur()
    {
        console.log("TODO setBlur");
    } 
    #setSpread()
    {
        console.log("TODO setSpread");
    }
    #setColor()
    {
        console.log("TODO setColor");
    }
    #setOpacity()
    {
        console.log("TODO setOpacity");
    }
}
customElements.define("nwm-box-shadow", BoxShadowTool);