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
    #init()
    {
        const setEvent = this.setEvent.bind(this);

        this.generateDisplayFormTool();
        const iframe = document.createElement("iframe");
        this.iframe = iframe;

        this.display.append(iframe);
        const htmlContainer = document.createElement("div");
        htmlContainer.classList.add("code-container");
        const htmlEditor = document.createElement("code");
        const defaultLine = document.createElement("div");
        defaultLine.innerHTML = "<br>";
        htmlEditor.append(defaultLine)
        htmlEditor.contentEditable = true;
        htmlEditor.dataset.name = "html";
        htmlEditor.addEventListener("input", setEvent);
        this.editors.html = htmlEditor;
        htmlContainer.append(htmlEditor);

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
    setEvent({data, target:{dataset:{name}, textContent}})
    // setEvent(e)
    {
        console.log(textContent);
        const selection = getSelection();
        const currentLine = selection?.focusNode?.parentElement;
        console.log(selection);
        this.runCode();
        console.log(data);
        if(data === null)return;
        const sel = getSelection();
        const node = sel.focusNode;
        const offset = sel.focusOffset;
        const pos = this.getCursorPosition(this.editors.html, node, offset, { pos: 0, done: false });
        if (offset === 0) pos.pos += 0.5;

        switch(name)
        {
            case "html": 
                this.displayHTML(selection, currentLine);
                break;
        }
        console.log("endEvent");
        sel.removeAllRanges()
        const range = this.setCursorPosition(this.editors.html, document.createRange(), {
    pos: pos.pos,
    done: false,
  });
  range.collapse(true);
  sel.addRange(range);
    }
    getCursorPosition(parent, node, offset, stat) {
        if (stat.done) return stat;
      
        let currentNode = null;
        if (parent.childNodes.length == 0) {
          stat.pos += parent.textContent.length;
        } else {
          for (let i = 0; i < parent.childNodes.length && !stat.done; i++) {
            currentNode = parent.childNodes[i];
            if (currentNode === node) {
              stat.pos += offset;
              stat.done = true;
              return stat;
            } else this.getCursorPosition(currentNode, node, offset, stat);
          }
        }
        return stat;
      }
      setCursorPosition(parent, range, stat) {
        if (stat.done) return range;
      
        if (parent.childNodes.length == 0) {
          if (parent.textContent.length >= stat.pos) {
            range.setStart(parent, stat.pos);
            stat.done = true;
          } else {
            stat.pos = stat.pos - parent.textContent.length;
          }
        } else {
          for (let i = 0; i < parent.childNodes.length && !stat.done; i++) {
            let currentNode = parent.childNodes[i];
            this.setCursorPosition(currentNode, range, stat);
          }
        }
        return range;
      }
    displayHTML(selection, line)
    {
        let newText = line.textContent;
        const range = selection.focusOffset
        console.log(range);
        const regex = this.regex.html;
        for (const replace of regex.specials) 
        {
            newText = newText.replace(...replace);
        }
        newText = newText.replace(...regex.comment);
        newText = newText.replace(...regex.tag);
        line.innerHTML = newText;
        console.log("endDisplay");
    }
    runCode()
    {
        clearTimeout(this.timerId);
        this.timerId = setTimeout(()=>{
            this.runHTML();
            this.runCSS();
            this.runJS();
        }, this.timerLimit);
    }
    runHTML()
    {
        const html = this.editors.html.value;
        this.iframe.contentDocument.body.innerHTML = html;
    }
    runCSS()
    {
        const css = this.editors.css.value;
        const style = document.createElement("style");
        style.textContent = css;
        this.iframe.contentDocument.head.append(style);
    }
    runJS()
    {
        const js = this.editors.js.value;
        this.iframe.contentWindow.eval(js);
    }
}

customElements.define("nwm-editor", ToolEditor);