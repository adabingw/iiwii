<script>

import { createEventDispatcher } from 'svelte';
import { 
    focuspos, 
    getActiveDiv, 
    getOffset, 
    getWrapped, 
    getCurrRow, 
    getIndexFromOffset, 
    rgbToHex, 
    getCoverage, 
    getSelectionOffsets, 
    deepEqual 
} from '../utils/utils';
import {v4 as uuidv4} from 'uuid';
import ContextMenu from '../utils/ContextMenu.svelte';
import TextTool from '../utils/TextTool.svelte';
import { FONTSIZE } from '../utils/constants';

export let contents = [];
export let id;
export let type = 'text';

let fontsize = FONTSIZE[type] ? FONTSIZE[type] : 16;
let selText = '';
let selected = false;
let menu;
let tool;
let toolSelected = false;
let lengths = [];
const dispatch = createEventDispatcher();
let shift = false;
let ctrl = false;

const keydown = (e) => {            
    let element = document.getElementById(id);
    let wrap = getWrapped(element, fontsize)
    if (element) {
        let caret = getOffset(element);
        if (e.key == 'Shift') {
            shift = true;
        } else if (e.key == 'Control') {
            ctrl = true;
        } else if (e.key == 'ArrowUp') {
            // TODO: implement cross section selection
            if (shift) return;
            let currLine = getCurrRow(caret, wrap);
            if (currLine == 1) {
                dispatch('up', { index: caret })
            }
        } else if (e.key == 'ArrowDown') {
            // TODO: implement cross section selection
            if (shift) return;
            let lines = wrap.length;
            let currLine = getCurrRow(caret, wrap);
            let lineIndex = getIndexFromOffset(caret, currLine);
            if (currLine == lines || (currLine == lines - 1 && lineIndex == 0 && caret != 0)) {
                dispatch('down', { index: lineIndex })
            }
        } else if (e.key == 'ArrowRight') {
            let len = lengths.reduce((p, a) => a + p, 0);
            if (caret == len) {
                if (shift) {
                    console.log('shifty right');
                    // dispatch('shift-down', {type: 'right'});
                } else {
                    dispatch('right');
                }
            }
        } else if (e.key == 'ArrowLeft') {
            let { start, end } = getSelectionOffsets(element);
            if (caret == 0 || (shift && start == 0)) {
                if (shift) {
                    console.log('shifty left');
                    // dispatch('shift-down', {type: 'left'});
                } else {
                    dispatch('left');
                }
            }
        } else if (e.key == 'Backspace') {
            let el2 = getActiveDiv();
            let el2caret = getOffset(el2);
            if (caret == 0) {
                dispatch('delete', {
                    index: element.title, 
                    text: element.textContent.trimEnd().length > 0 ? contents : undefined
                });
                element.textContent = ' ';
                return;
            }
            if (el2caret == 0) {
                // @ts-ignore
                dispatch('delete', { index: el2.title });
                return;
            }
        } else if (e.key == 'Enter') {
            let el2 = getActiveDiv();       
            e.preventDefault();
            e.stopPropagation();
            if (el2) {
                let caret = getOffset(element);
                let bs = [];
                let cutoff = 0;
                let id = uuidv4();
                if (caret == element.textContent.length) {
                    bs.push({...contents[contents.length - 1]});
                    bs[0].id = id;
                    bs[0].content = ' ';
                } else {
                    for (let i = 0; i < contents.length; i++) {
                        // @ts-ignore
                        if (contents[i].id == el2.id) {
                            cutoff = i;
                            bs.push({...contents[i]});
                            bs[0].id = id;
                            let c = contents[i].content;
                            bs[0].content = c.substring(caret).length > 0 ? c.substring(caret) : ' ';
                            contents[i].content = c.substring(0, caret).length > 0 ? c.substring(0, caret) : ' ';
                            el2.textContent = contents[i].content;
                        }
                        if (i > cutoff) {
                            const [c] = contents.splice(i, 1);
                            bs.push(c);
                            bs[bs.length - 1].id = id;
                        }
                    }
                    if (cutoff < contents.length - 2) contents.splice(cutoff + 1);
                }
                contents = [...contents];
                dispatch('enter', { 
                    blocks: [...bs]
                });
            }
        }
    }
}

const keyup = (e) => {
    let element = document.getElementById(id);
    if ((e.key == 'ArrowRight' || e.key == 'ArrowLeft' || e.key == 'ArrowUp' || e.key == 'ArrowDown')) {
        if (shift) {
            let { start, end } = getSelectionOffsets(element);
            let [ids, srange] = getCoverage(start, end, contents);
            const rect = element.getBoundingClientRect();
            let icons = document.getElementsByClassName('fa-plus');
            for (const icon of icons) {
                // @ts-ignore
                icon.style.visibility = 'hidden';
            }
            if (ids.length > 1) {
                tool.openMenu(rect.top, rect.left, rect.bottom, undefined, [ids, srange], [start, end]);
                // don't highlight style in toolbox
            } else if (ids.length == 1) {
                tool.openMenu(rect.top, rect.left, rect.bottom, contents[ids[0]].style, [ids, srange], [start, end]);
                // highlight style in toolbox
            }
        } else {
            tool.onPageClick(e);
        }
    } else if (e.key == 'Shift') {
        shift = false;
        dispatch('shift-up', {type: 'up'})
    } else if (e.key == 'Control') {
        ctrl = false;
    } else if (e.key == '/') {
        if (element && (element.textContent.trimEnd().length == 1 || element.textContent.trimStart().length == 1)) {
            e.preventDefault();
            e.stopPropagation(); 
            const rect = element.getBoundingClientRect();
            let icons = document.getElementsByClassName('fa-plus');
            for (const icon of icons) {
                // @ts-ignore
                icon.style.visibility = 'hidden';
            }
            menu.openMenu(rect.top, rect.left, rect.bottom);
        }
    } else if (e.key == ' ') {
        if (element && element.textContent.trimEnd() == '*') {
            dispatch('unordered')
        } else if (element && !isNaN(parseInt(element.textContent.trimEnd().slice(0, -1))) && !/\s/g.test(element.textContent.trimEnd().slice(0, -1))) {
            dispatch('ordered', { start: parseInt(element.textContent.trimEnd().slice(0, -1))})
        }
    }
    if (!element.textContent.includes('/')) {
        menu.onPageClick(e);
    }
    selText = element.textContent.replace('/', '').trimStart().trimEnd();
}

const focuslast = (e) => {
    if (contents.length < 1) return;
    let element = document.getElementById(id);
    
    if (element) {
        if (contents[0].content.length == 0) {
            e.preventDefault();
            e.stopPropagation();
            let range = document.createRange()
            let sel = window.getSelection()
            
            range.setStart(element, 0)
            range.collapse(true)
            
            sel.removeAllRanges()
            sel.addRange(range)
        } else {
            focuspos(element, 3)
        }
    } 
}

const mouseup = (e, index) => {
    e.stopPropagation();
    e.preventDefault();
    let element = document.getElementById(id);
    let { start, end } = getSelectionOffsets(element);
    if (start != end) {
        let [ids, srange] = getCoverage(start, end, contents);
        const rect = element.getBoundingClientRect();
        let icons = document.getElementsByClassName('fa-plus');
        for (const icon of icons) {
            // @ts-ignore
            icon.style.visibility = 'hidden';
        }
        if (ids.length > 1) {
            tool.openMenu(rect.top, rect.left, rect.bottom, undefined, [ids, srange], [start, end], true);
            // don't highlight style in toolbox
        } else if (ids.length == 1) {
            tool.openMenu(rect.top, rect.left, rect.bottom, contents[ids[0]].style, [ids, srange], [start, end], true);
            // highlight style in toolbox
        }
    }
}

const input = (e) => {
    let element = getActiveDiv();
    // @ts-ignore
    if (element && contents[element.title]) {
        // @ts-ignore
        if (element.textContent.trimEnd() == '') contents[element.title].content = ' ';
        else {
            // TODO: fix weird behaviour this leads to
            // contents[element.title].content = element.textContent.trimEnd();
            // element.textContent = contents[element.title].content;
        }
    }
}

const addclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selected) {
        let element = document.getElementById(`icon-${id}`);
        if (element) {
            const rect = element.getBoundingClientRect();
            let top = rect.top;
            let bottom = rect.bottom;
            let left = rect.left;
            menu.openMenu(top, left, bottom);
            selected = true;
        }
    }
}

const applyStyles = (elements, attribute, value, srange) => {
    for (let j = elements.length - 1; j >= 0; j--) {
        const i = elements[j];
        if (i >= contents.length) console.error('toolcontroller id greater than length');
        let newNode = JSON.parse(JSON.stringify(contents[i]));
        let id = uuidv4();        
        newNode.id = id;
        newNode['style'][attribute] = value;    
        let merged = false;
        if (i < contents.length - 1 && contents.length > 1 && srange[1] == contents[i].content.length && (j == 0 || elements.length == 1)) {
            let style2 = contents[i + 1].style;
            let style1 = JSON.parse(JSON.stringify(contents[i].style));
            style1[attribute] = value;
            if (deepEqual(style1, style2)) {
                contents[i + 1].content = contents[i].content.substring(srange[0]) + contents[i + 1].content;
                if (contents[i].content.length == srange[1] - srange[0]) { // entire block gets merged
                    contents.splice(i, 1);
                } else {
                    contents[i].content = contents[i].content.substring(0, srange[0])
                }
                merged = true;
            }
        } 
        if (i >= 1 && contents.length > 1 && srange[0] == 0 && (j == elements.length - 1 || elements.length == 1)) {
            let style2 = contents[i - 1].style;
            let style1 = JSON.parse(JSON.stringify(contents[i].style));
            style1[attribute] = value;
            if (deepEqual(style1, style2)) {
                contents[i - 1].content += contents[i].content.substring(0, srange[1]);
                if (contents[i].content.length == srange[1] - srange[0]) { // entire block gets merged
                    contents.splice(i, 1);
                } else {
                    contents[i].content = contents[i].content.substring(srange[1]);
                }
                merged = true;
            }
        }
        if (merged) return;

        if (elements.length == 1) {
            if (srange[0] == 0 && srange[1] == contents[i].content.length) { // ship entire thing
                contents[i]['style'][attribute] = value;
            } else if (srange[0] == 0) { // new + old
                newNode.content = contents[i].content.substring(0, srange[1]);
                contents[i].content = contents[i].content.substring(srange[1]);
                contents.splice(i, 0, newNode);
            } else if (srange[1] == contents[i].content.length) { // old + new
                newNode.content = contents[i].content.substring(srange[0]);
                contents[i].content = contents[i].content.substring(0, srange[0]);
                contents.splice(i + 1, 0, newNode);
            } else { // old + new + old
                newNode.content = contents[i].content.substring(srange[0], srange[1]);

                let oldNode = JSON.parse(JSON.stringify(contents[i]));
                let id2 = uuidv4();        
                oldNode.id = id2;
                oldNode.content = contents[i].content.substring(srange[1]);

                contents[i].content = contents[i].content.substring(0, srange[0]);
                contents.splice(i + 1, 0, oldNode);
                contents.splice(i + 1, 0, newNode);
            }
        } else if (j == 0) {
            if (contents[i]['style'][attribute] == value) continue;
            if (srange[0] == 0) { // ship entire thing
                contents[i]['style'][attribute] = value;
            } else { // ship start of selection -> end of node
                newNode.content = contents[i].content.substring(srange[0]);
                contents[i].content = contents[i].content.substring(0, srange[0]);
                contents.splice(i + 1, 0, newNode);
            }                
        } else if (j == elements.length - 1) {
            if (contents[i]['style'][attribute] == value) continue;
            if (srange[1] == contents[i].content.length) { // ship entire thing
                contents[i]['style'][attribute] = value;
            } else { // start -> end of select
                newNode.content = contents[i].content.substring(0, srange[1]);
                contents[i].content = contents[i].content.substring(srange[1]);
                contents.splice(i, 0, newNode);
            }
        } else { // this entire nde is selected, so we can just take the entire thing and just apply the style
            if (contents[i]['style'][attribute] == value) continue;
            contents[i]['style'][attribute] = value;
        }
    }
}

const toolcontroller = (e) => {
    const context = e.detail.context;
    const subcontext = e.detail.subcontext;         // styles we are applying
    if (context == 'elements') {
        const value = e.detail.value;
        const [elements, srange] = e.detail.elements;     // elements that are being applied
        applyStyles(elements, subcontext, value, srange);
    } else if (context == 'transform') {
        if (subcontext == type) return;
        if (type != 'unordered' && type != 'ordered' && subcontext != 'unordered' && subcontext != 'ordered') {
            type = subcontext;
        } else {
            dispatch('transform', {
                from: type,
                to: subcontext,
            })
        }
    }
}

$: {
    contents;
    lengths = [];
    for (const content of contents) {
        if (content && content.content) lengths.push(content.content.length);
    }
}

$: {
    type;
    fontsize = FONTSIZE[type] ? FONTSIZE[type] : 16;
}

</script>

<ContextMenu bind:this={menu} id={id} bind:selected={selected} selText={selText} on:empty={(e) => menu.onPageClick(e)}/>
<TextTool bind:this={tool} id={id} bind:selected={toolSelected} on:tool={(e) => toolcontroller(e)} />
<div class='flex flex-row flex-start'>
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->

<span id={`icon-${id}`} class={`icons ${selected ? 'selected' : ''}`} 
    style={`line-height: ${parseInt(fontsize) + 8}px; height: ${parseInt(fontsize) + 8}px;`}>
    <i class={`fa-solid fa-plus fa-ms `}  on:click={addclick} ></i>
    <i class={`fa-solid fa-ellipsis-vertical fa-ms`}  on:click={addclick} ></i>
</span>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
{#if type != 'ordered' && type != 'unordered'}
<div on:mousedown={focuslast} class='hover:cursor-text  cursor-text whitespace-pre-wrap text-wrap break-all'>
<span id={id} class='hover:cursor-text cursor-text whitespace-pre-wrap text-wrap break-all block' contenteditable="true" spellcheck="false" 
on:keydown={keydown} on:keyup={keyup} on:input={(e) => input(e)} on:mouseup={(e) => mouseup(e)}
style={`line-height: 18px;`}>
    {#each contents as content, index}
    <span 
        class={`${content.style.bold ? 'font-bold' : ''} 
                ${content.style.italics ? 'italic' : ''} 
                ${content.content.trimEnd().length > 0 && content.style.code ? 'code' : ''}
                ${content.content.trimEnd().length > 0 && content.style.strikethrough ? 'line-through' : ''}
                ${content.content.trimEnd().length > 0 && content.style.underline ? 'border-b-2' : ''} 
                whitespace-pre-wrap editableSpan text-wrap break-all`} 
        style={`
            color: ${content.style.color}; 
            font-size: ${fontsize}px; 
            line-height: ${parseInt(fontsize) + 8}px;
            border-color: ${content.style.color};
            -webkit-box-decoration-break: clone;
            box-decoration-break: clone;
        `} 
        title={index.toString()} id={content.id}>{#if content.content.length != 0 && !content.style.code}{content.content}{/if}{#if content.content.length != 0 && content.style.code}<code>{content.content}</code>{/if}</span>
    {/each}
</span>
</div>
{:else}
<li class='hover:cursor-text  cursor-text'>
<span on:mousedown={focuslast} class='whitespace-pre-wrap text-wrap break-all box-border'>
<span id={id} class='hover:cursor-text cursor-text whitespace-pre-wrap text-wrap break-all box-border' contenteditable="true" spellcheck="false" 
on:keydown={keydown} on:input={(e) => input(e)} on:keyup={keyup} on:mouseup={(e) => mouseup(e)}
style={`line-height: 18px;`}>
    {#each contents as content, index}
    <span class={`${content.content.trimEnd().length > 0 && content.style.code ? 'code' : ''}`}><span 
        class={`${content.style.bold ? 'font-bold' : ''} 
                ${content.style.italics ? 'italic' : ''} 
                ${content.content.trimEnd().length > 0 && content.style.strikethrough ? 'line-through' : ''}
                ${content.content.trimEnd().length > 0 && content.style.underline ? 'border-b-2' : ''} 
                whitespace-pre-wrap editableSpan text-wrap break-all overflow-hidden`} 
        style={`
            color: ${content.style.color}; 
            font-size: ${fontsize}px; 
            line-height: ${parseInt(fontsize) + 8}px;
            border-color: ${content.style.color};
            -webkit-box-decoration-break: clone;
            box-decoration-break: clone;
        `}  
        title={index.toString()} id={content.id}>{#if content.content.length != 0 && !content.style.code}{content.content}{/if}{#if content.content.length != 0 && content.style.code}<code>{content.content}</code>{/if}</span></span>
    {/each}
</span>
</span>
</li>
{/if}
</div>

<style>
.icons {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-left: -15px;
    margin-right: 10px;
    color: #b1b1b1 !important;
    opacity: 0;
}

i {
    margin-right: 12px;
}

.selected {
    opacity: 1;
}

.code {
    background-color: #dedede;
    padding-left: 0.3em;
    padding-right: 0.3em;
    padding-top: 0.1em;
    padding-bottom: 0.1em;
    padding-bottom: 3px;
    border-radius: 5px;
}

.icons:hover {
    cursor: pointer;
    opacity: 1;
}

li {
    list-style-position: outside !important;
}

</style>
