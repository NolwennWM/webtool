import AbstractTool from "../AbstractTool/AbstractTool.js";
import { ToolEditorText } from "./ToolEditorText.js";

export default class ToolEditor extends AbstractTool
{
    /** title translation of the tool */
    static title = ToolEditorText.title;
    /** text translation of the tool */
    text = ToolEditorText;
    timerLimit = 2000;
    timerId = 0;
    iframe;
    editors = {};
    displayer = {};
    regex ={
        html: {
            specials: [
                [/&/g, "&amp;"],
                [/</g, "&lt;"],
                [/>/g, "&gt;"],
                [/"/g, "&quot;"],
                [/'/g, '&#x27;'],
            ],
            // TODO block on any character from &gt;
            tag: [/(&lt;\/?)([^(&gt;)!]*)(\s|\\|&gt;)/g, '$1<span class="tag">$2</span>$3'],
            attr: [/()()()/g, '$1<span class="attr">$2</span>$3'],
            value: [/()()()/g, '$1<span class="value">$2</span>$3'],
            comment: [/(&lt;!--[^(\-\-&gt;)]*)(--&gt;)?/g, '<span class="comment">$1$2</span>'],
        }
    }
    constructor()
    {
        super();
        this.#init();
    }
    /**
     * Initialize interface and events
     */
    #init()
    {
        const setEvent = this.setEvent.bind(this);

        this.generateDisplayFormTool();
        const iframe = document.createElement("iframe");
        this.iframe = iframe;

        this.display.append(iframe);
        const htmlContainer = document.createElement("div");
        htmlContainer.classList.add("code-container");
        const htmlCode = document.createElement("code");
        const htmlDisplayer = document.createElement("pre");
        this.displayer.html = htmlDisplayer;
        const htmlEditor = document.createElement("textarea");
        htmlEditor.name = "html";
        htmlEditor.addEventListener("input", setEvent);
        htmlEditor.addEventListener("input", setEvent);
        this.editors.html = htmlEditor;
        htmlCode.append(htmlDisplayer);
        htmlContainer.append(htmlCode, htmlEditor);

        const cssEditor = document.createElement("textarea");
        cssEditor.addEventListener("input", setEvent);
        this.editors.css = cssEditor;
        const jsEditor = document.createElement("textarea");
        jsEditor.addEventListener("input", setEvent);
        this.editors.js = jsEditor;

        this.form.append(htmlContainer, cssEditor, jsEditor)
    }
    handleSpecialKey()
    {

    }
    /**
     * Check which language is used and launch the good displayer
     * @param {Event} param0 Input Event
     */
    setEvent({data, target:{name, value}})
    {
        // console.log(data);
        this.runCode();
        // console.log(name);
        switch(name)
        {
            case "html": 
                this.displayHTML(value);
                break;
        }
    }
    /**
     * Display HTML highlighted
     * Regex are used to remplace characters and add coloration
     * @param {string} text text to display
     */
    displayHTML(text)
    {
        let newText = text;
        const regex = this.regex.html;
        for (const replace of regex.specials) 
        {
            newText = newText.replace(...replace);
        }
        console.log(newText);
        
        newText = newText.replace(...regex.comment);
        newText = newText.replace(...regex.tag);
        this.displayer.html.innerHTML = newText;
    }
    /**
     * Run the html, css and js code avec a waiting time.
     * If the user type something else, the waiting time is reset.
     */
    runCode()
    {
        clearTimeout(this.timerId);
        this.timerId = setTimeout(()=>{
            this.runHTML();
            this.runCSS();
            this.runJS();
        }, this.timerLimit);
    }
    /**
     * Run HTML code in the iframe.
     */
    runHTML()
    {
        const html = this.editors.html.value;
        this.iframe.contentDocument.body.innerHTML = html;
    }
    /**
     * Run CSS code in the iframe.
     */
    runCSS()
    {
        const css = this.editors.css.value;
        const style = document.createElement("style");
        style.textContent = css;
        this.iframe.contentDocument.head.append(style);
    }
    /**
     * Run Javascript code in the iframe.
     */
    runJS()
    {
        const js = this.editors.js.value;
        this.iframe.contentWindow.eval(js);
    }
}

customElements.define("nwm-editor", ToolEditor);