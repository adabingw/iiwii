<script>

import { createEventDispatcher, onMount } from 'svelte';
import { dark, addToast } from '../utils/store';
import { 
    getActiveSpan, 
    getOffset, 
    getWrapped, 
    getCurrRow, 
    getIndexFromOffset, 
    getCoverage, 
    getSelectionOffsets, 
    deepEqual,
    getActiveDiv,
    hideIcons,
    focuspos,

    focusElement

} from '../utils/utils';
import { adjustBrightnessToLight } from '../utils/colors';
import {v4 as uuidv4} from 'uuid';
import ContextMenu from '../utils/ContextMenu.svelte';
import TextTool from '../utils/TextTool.svelte';
import { ACTIONS, FONTSIZE, MENU } from '../utils/constants';
import Slot from '../utils/Slot.svelte';
import World from '../utils/assets/WORLD.svelte';
import Toasts from '../utils/Toasts.svelte';

export let contents = [];
export let id;
export let type = 'text';
export let tab = 0;

let darkMode = false;
let subscribe = dark.subscribe((value) => darkMode = value);
let fontsize = FONTSIZE[type] ? FONTSIZE[type] : 16;
let selText = '';
let menu;
let tool;
let action;
let linkSelected = undefined;
let actionSelected = false;
let toolSelected = false;
let selected = false;
let linkSelectInfo = {
    link: undefined,
    text: undefined,
    index: -1,
    x: 0,
    y: 0
}
let lengths = [];
const dispatch = createEventDispatcher();
let shift = false;
let ctrl = false;

const keydown = (e) => {            
    const element = document.getElementById(id);
    const wrap = getWrapped(element, fontsize);
    if (element) {
        let caret = getOffset(element);
        if (ctrl) {
            const { start, end } = getSelectionOffsets(element);
            const [ids, srange] = getCoverage(start, end, contents);
            if (e.key == 'b') {
                applyStyles(ids, 'bold', ids.length > 1 ? true : !contents[ids[0]].style.bold, srange);
            } else if (e.key == 'S') {
                if (shift) {
                    applyStyles(ids, 'strikethrough', ids.length > 1 ? true : !contents[ids[0]].style.strikethrough, srange);
                }
            } else if (e.key == 'i') {
                applyStyles(ids, 'italics', ids.length > 1 ? true : !contents[ids[0]].style.italics, srange);
            } else if (e.key == 'm') {
                applyStyles(ids, 'code', ids.length > 1 ? true : !contents[ids[0]].style.code, srange);
            } else if (e.key == 'u') {
                applyStyles(ids, 'underline', ids.length > 1 ? true : !contents[ids[0]].style.underline, srange);
            }
        }

        if (e.key == 'Shift') {
            shift = true;
        } else if (e.key == 'Control') {
            ctrl = true;
        } else if (e.key == 'ArrowUp') {
            const currLine = getCurrRow(caret, wrap);
            if (currLine == 1) {
                dispatch('up', { index: caret })
            }
        } else if (e.key == 'ArrowDown') {
            const lines = wrap.length;
            const currLine = getCurrRow(caret, wrap);
            const lineIndex = getIndexFromOffset(caret, currLine);
            if (currLine == lines || (currLine == lines - 1 && lineIndex == 0 && caret != 0)) {
                dispatch('down', { index: lineIndex })
            }
        } else if (e.key == 'ArrowRight') {
            const len = lengths.reduce((p, a) => a + p, 0);
            if (caret == len) {
                if (!shift) {
                    dispatch('right');
                }
            }
        } else if (e.key == 'ArrowLeft') {
            const { start } = getSelectionOffsets(element);
            if (caret == 0 || (shift && start == 0)) {
                if (!shift) {
                    dispatch('left');
                }
            }
        } else if (e.key == 'Backspace') {
            const el2 = getActiveSpan(element);
            const el2caret = getOffset(el2);
            if (caret == 0) {
                dispatch('delete', {
                    index: element.dataset.title, 
                    text: element.textContent.trimEnd().length > 0 ? contents : undefined
                });
                if (element.textContent.trimEnd().length == 0) element.textContent = ' ';
                return;
            }
            if (el2caret == 1 && el2.textContent.length == 1) {
                if (contents.length > 1) {
                    // @ts-ignore
                    contents.splice(el2.dataset.title, 1);
                } else {
                    // @ts-ignore
                    contents[el2.dataset.title].content = ' ';
                    el2.textContent = ' '
                    e.preventDefault();
                } 
                contents = [...contents];
                focusElement(contents[0].id)
                return;
            }
            if (el2.textContent[0] == '\n') {
                // @ts-ignore
                contents[el2.dataset.title].content = contents[el2.dataset.title].content.substring(1);
                focuspos(el2, 0);
            }
        } else if (e.key == 'Tab') {
            e.preventDefault();
            e.stopPropagation();
            if (shift) {
                dispatch('tab', { direction: -1 });
            } else {
                dispatch('tab', { direction: 1 });
            }
        } else if (e.key == 'Enter') {
            const el2 = getActiveSpan(element);    
            e.preventDefault();
            e.stopPropagation();

            if (el2) {
                if (toolSelected) {
                    const { start, end } = getSelectionOffsets(element);
                    const [ids, srange] = getCoverage(start, end, contents);
                    if (ids.length == 1) {
                        contents[ids[0]].content = contents[ids[0]].content.slice(0, srange[0]) + contents[ids[0]].content.slice(srange[1]);
                        if (contents[ids[0]].content.trimEnd() == '' && contents.length > 1) contents.splice(ids[0], 1);
                        else if (contents[ids[0]].content.trimEnd() == '' && contents.length == 1) contents[ids[0]].content = ' ';
                    } else {
                        for (let j = ids.length - 1; j >= 0; j--) {
                            if (j == 0) {
                                contents[ids[j]].content = contents[ids[j]].content.substring(0, srange[0]);
                                if (contents[ids[j]].content.trimEnd() == '' && contents.length > 1) contents.splice(ids[j], 1);
                                else if (contents[ids[j]].content.trimEnd() == '' && contents.length == 1) contents[ids[j]].content = ' ';
                            } else if (j == ids.length - 1) {
                                contents[ids[j]].content = contents[ids[j]].content.substring(srange[1]);
                                if (contents[ids[j]].content.trimEnd() == '' && contents.length > 1) contents.splice(ids[j], 1);
                                else if (contents[ids[j]].content.trimEnd() == '' && contents.length == 1) contents[ids[j]].content = ' ';
                            } else {
                                contents.splice(ids[j], 1);
                            }
                        }
                    }
                    caret = ids.length > 1 ? 0 : srange[0];
                }
                const caret2 = getOffset(el2);
                const bs = [];
                let cutoff = 0;
                const id = uuidv4();
                if (caret == element.textContent.length || element.textContent.trimEnd().length == 0) {
                    bs.push({...contents[contents.length - 1]});
                    bs[0].id = id;
                    bs[0].content = '\u0020';
                } else {
                    for (let i = 0; i < contents.length; i++) {
                        // @ts-ignore
                        if (contents[i].id == el2.id) {
                            cutoff = i;
                            bs.push({...contents[i]});
                            bs[0].id = id;
                            const c = contents[i].content;
                            bs[0].content = c.substring(caret2).length > 0 ? c.substring(caret2) : ' ';
                            contents[i].content = c.substring(0, caret2).length > 0 ? c.substring(0, caret2) : ' ';
                            el2.textContent = contents[i].content;
                        }
                        if (i > cutoff) {
                            const [c] = contents.splice(i, 1);
                            bs.push(c);
                        }
                    }
                    if (cutoff < contents.length - 2) contents.splice(cutoff + 1);
                    if (shift) {
                        bs[0].content = '\n' + bs[0].content;
                        contents.push(...bs);
                        contents = [...contents];
                        focusElement(bs[0].id);
                        return;
                    }
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
    const element = document.getElementById(id);
    if ((e.key == 'ArrowRight' || e.key == 'ArrowLeft' || e.key == 'ArrowUp' || e.key == 'ArrowDown')) {
        if (shift) {
            const { start, end } = getSelectionOffsets(element);
            const [ids, srange] = getCoverage(start, end, contents);
            const rect = element.getBoundingClientRect();
            hideIcons();
            if (ids.length > 1) {
                tool.openMenu(rect.top, rect.left - 50, rect.bottom, undefined, [ids, srange], [start, end]);
                linkSelected = undefined;
                toolSelected = true;
                // don't highlight style in toolbox
            } else if (ids.length == 1) {
                tool.openMenu(rect.top, rect.left - 50, rect.bottom, contents[ids[0]].style, [ids, srange], [start, end]);
                linkSelected = undefined;
                toolSelected = true;
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
            hideIcons();
            menu.openMenu(rect.top, rect.left, rect.bottom);
            linkSelected = undefined;
            selected = true;
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

let selectionIndices = undefined;
const mouseup = (e, index) => {
    e.stopPropagation();
    e.preventDefault();
    const element = document.getElementById(id);
    const { start, end } = getSelectionOffsets(element);
    if (start != end) {
        selectionIndices = {start, end};
        const [ids, srange] = getCoverage(start, end, contents);
        const rect = element.getBoundingClientRect();
        hideIcons();
        if (ids.length > 1) {
            tool.openMenu(rect.top, rect.left - 50, rect.bottom, undefined, [ids, srange], [start, end], true);
            toolSelected = true;
            linkSelected = undefined;
            // don't highlight style in toolbox
        } else if (ids.length == 1) {
            tool.openMenu(rect.top, rect.left - 50, rect.bottom, contents[ids[0]].style, [ids, srange], [start, end], true);
            toolSelected = true;
            linkSelected = undefined;
            // highlight style in toolbox
        }
    }
}

const blur = (e) => {
    if (!selectionIndices) return;
    e.preventDefault();
    e.stopPropagation();
    const element = document.getElementById(id);
    if (element) {
        const selection = window.getSelection();
        const range = document.createRange();

        // Find the text node containing the selection start
        let startNode = element.firstChild;
        let startOffset = selectionIndices.start;
        while (startNode && startNode.nodeType !== Node.TEXT_NODE) {
            if (startOffset >= startNode.textContent.length) {
                startOffset -= startNode.textContent.length;
                startNode = startNode.nextSibling;
            } else {
                break;
            }
        }

        // Find the text node containing the selection end
        let endNode = startNode;
        let endOffset = startOffset + (selectionIndices.end - selectionIndices.start);
        while (endNode && endNode.nodeType !== Node.TEXT_NODE) {
            if (endOffset >= endNode.textContent.length) {
                endOffset -= endNode.textContent.length;
                endNode = endNode.nextSibling;
            } else {
                break;
            }
        }

        // Set the range
        range.setStart(startNode, startOffset);
        range.setEnd(endNode, endOffset);

        // Clear any existing selection and set the new range
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

const input = (e) => {
    const element = getActiveDiv();
    // @ts-ignore
    if (element && contents[element.dataset.title]) {
        // @ts-ignore
        if (element.textContent.trimEnd().length == 0) {
            contents[element.dataset.title].content = ' ';
        } 
        else {
            const content = element.textContent.trimEnd();
            const caret = getOffset(element);
            // @ts-ignore
            contents[element.dataset.title].content = content;
            element.textContent = content;
            focuspos(element, caret)            
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
            linkSelected = undefined;
            selected = true;
        }
    }
}

const actionclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!actionSelected) {
        const element = document.getElementById(`icon-${id}`);
        if (element) {
            const rect = element.getBoundingClientRect();
            const top = rect.top;
            const bottom = rect.bottom;
            const left = rect.left;
            action.openMenu(top, left, bottom);
            linkSelected = undefined;
            actionSelected = true;
        }
    }
}

const applyStyles = (elements, attribute, value, srange) => {
    for (let j = elements.length - 1; j >= 0; j--) {
        const i = elements[j];
        if (i >= contents.length) console.error('toolcontroller id greater than length');
        const newNode = JSON.parse(JSON.stringify(contents[i]));
        const id = uuidv4();        
        newNode.id = id;
        newNode['style'][attribute] = value;  
        let merged = false;
        const style1 = JSON.parse(JSON.stringify(contents[i].style));
        if (i < contents.length - 1 && contents.length > 1 && srange[1] == contents[i].content.length && (j == 0 || elements.length == 1)) {
            const style2 = contents[i + 1].style;
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
            const style2 = contents[i - 1].style;
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

                const oldNode = JSON.parse(JSON.stringify(contents[i]));
                const id2 = uuidv4();        
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
    selectionIndices = undefined;
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

const codeStyle = (index) => {
    if (contents.length == 1) return 'code';
    if (index == 0 && contents.length > 1) {
        return contents[index + 1].style.code ? 'code-left' : 'code'
    } else if (index == contents.length - 1) {
        return contents[index - 1].style.code ? 'code-right' : 'code'
    } else if (index > 0 && index < contents.length - 1) {
        if (contents[index - 1].style.code && contents[index + 1].style.code) {
            return 'code-mid'
        } else if (contents[index - 1].style.code && !contents[index + 1].style.code) {
            return 'code-left'
        } else if (!contents[index - 1].style.code && contents[index + 1].style.code) {
            return 'code-right'
        }
    }
}

let hover = false;
const hoverTimerSet = () => {
    hover = false;
    setTimeout(() => {
        if (hover) return;
        else {
            linkSelected = undefined;
        }
    }, 100);
}

const addElement = (e) => {
    if (selText || document.getElementById(id) && document.getElementById(id).textContent.trimEnd().trimStart() == '/') {
        contents[0].content = ' ';
        contents = [...contents]
        selText = "";
        dispatch('transform', {
            from: type,
            to: e.detail.subcontext
        })
        return;
    }
    dispatch('add', {
        type: e.detail.subcontext
    })
}

const actionController = (e) => {
    dispatch('action', {
        action: e.detail.subcontext
    })
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

<ContextMenu bind:this={menu} menu={MENU} id={id} bind:selected={selected} selText={selText} on:empty={(e) => menu.onPageClick(e)} on:context={addElement}/>
<ContextMenu bind:this={action} menu={ACTIONS} id={id} bind:selected={actionSelected} on:context={actionController} />
<TextTool bind:this={tool} id={id} bind:selected={toolSelected} on:tool={(e) => toolcontroller(e)} />
<Toasts />
{#if linkSelected == 'hover'} 
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-mouse-events-have-key-events -->    
<!-- svelte-ignore a11y-click-events-have-key-events -->
<Slot>
    <span class={`flex flex-row items-center justify-evenly border-2 rounded-md px-5 py-1`}
        on:mouseover={() => {
            hover = true;
        }}
        on:mouseleave={() => {
            hoverTimerSet();
        }}
        style={`
            border: 1px solid ${darkMode ? '#919191' : '#d3d3d3'};
            background-color: ${darkMode ? '#515151' : 'white'};
            width: fit-content;
            position: absolute; 
            left: ${linkSelectInfo.x}px; 
            top: ${linkSelectInfo.y}px;
        `}>
        <World theme={darkMode ? 'dark' : 'light'} />
        <a class={`mx-5 w-fit`} target="_blank" href={linkSelectInfo.link}
            style={`
                color: ${darkMode? '#c9c9c9' : '#717171'};
                font-size: 15px;
            `}>{linkSelectInfo.link}</a>
        <span>
            <i class={`fa-regular fa-copy fa-ms link-icon-${darkMode ? 'dark' : 'light'}`} on:click={() => {
                navigator.clipboard.writeText(linkSelectInfo.link);
                addToast({
                    message: 'copied!', 
                    type: 'info', 
                    dismissible: true, 
                    timeout: 2000
                })
            }}></i>
            <i class={`fa-regular fa-pen-to-square fa-ms link-icon-${darkMode ? 'dark' : 'light'}`} on:click={() => {
                linkSelected = 'edit';
            }}></i>
        </span>
    </span>
</Slot>
{:else if linkSelected == 'edit'}
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-mouse-events-have-key-events -->    
<!-- svelte-ignore a11y-click-events-have-key-events -->
<Slot>
    <span class={`flex flex-col items-center justify-evenly border-2 rounded-md px-5 py-1`}
        on:mouseover={() => {
            hover = true;
        }}
        on:mouseleave={() => {
            hoverTimerSet();
        }}
        style={`
            color: ${darkMode ? '#e2e2e2' : '#818181'};
            border: 1px solid ${darkMode ? '#919191' : '#d3d3d3'};
            background-color: ${darkMode ? '#515151' : 'white'};
            width: fit-content;
            font-size: 15px;
            position: absolute; 
            left: ${linkSelectInfo.x}px; 
            top: ${linkSelectInfo.y}px;
        `}>
        <span class={`flex flex-col mt-2`}>
            <p>URL</p>
            <input placeholder="Input link" value={linkSelectInfo.link} 
                class={`link-input-${darkMode ? 'dark' : 'light'}`}
                on:input={(e) => {
                    contents[linkSelectInfo.index].style.link = e.target.value;
                }}
            />
        </span>
        <span class={`flex flex-col mt-2`}>
            <p>Link text</p>
            <input placeholder="Placement text" value={linkSelectInfo.text}
                class={`link-input-${darkMode ? 'dark' : 'light'}`}
                on:input={(e) => {
                    contents[linkSelectInfo.index].content = e.target.value;
                }}
            />
        </span>
        <span class={`flex flex-row items-center py-1 my-1 remove-link-${darkMode ? 'dark' : 'light'}`}
            on:click={() => {
                contents[linkSelectInfo.index].style.link = undefined;
                linkSelected = undefined;
            }}>
            <i class="fa-regular fa-trash-can"></i>
            <p>Remove link</p>
        </span>
    </span>
</Slot>
{/if}
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<span class='flex flex-row flex-start hover:cursor-text cursor-text' >
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->

<span id={`icon-${id}`} class={`icons ${selected || actionSelected ? 'selected' : ''}`} 
    style={`line-height: ${parseInt(fontsize) + 8}px; height: ${parseInt(fontsize) + 8}px;`}>
    <i class={`fa-solid fa-plus fa-ms`}  on:click={addclick} ></i>
    <i class={`fa-solid fa-ellipsis-vertical fa-ms`}  on:click={actionclick} ></i>
</span>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<li class={`hover:cursor-text cursor-text`} 
    style={`
        list-style-type: ${type == 'unordered' || type == 'ordered' ? '' : 'none'};
        color: ${darkMode ? '#f8f8f8' : '#000000'};
        margin-left: ${tab ? (tab * 4) + 'px' : '0px'} !important;
    `}>
<span class='text-wrap break-all box-border block w-full'>
    <span id={id} class='hover:cursor-text cursor-text text-wrap break-all block whitespace-normal' contenteditable="true" spellcheck="false" 
on:keydown={keydown} on:keyup={keyup} on:input={(e) => input(e)} on:mouseup={(e) => mouseup(e)} on:blur={blur}
style={`line-height: 18px; border-right: solid rgba(0,0,0,0) 1px;
        width: 100%;
        display: block;
        padding-left: ${type == 'quote' ? '15px' : ''};
        border-left: ${type == 'quote' ? darkMode ? '2.5px solid #dfdfdf' : '2.5px solid #313131' : ''};
`}>
    {#each contents as content, index}
    <span
        class={`${!content.style.link && content.style.bold ? 'font-bold' : ''} 
                ${!content.style.link && content.style.italics ? 'italic' : ''} 
                ${!content.style.link && content.content.trimEnd().length > 0 && content.style.code ? codeStyle(index) : ''}
                ${!content.style.link && content.content.trimEnd().length > 0 && content.style.strikethrough ? 'line-through' : ''}
                ${content.style.link ? 'underline' : ''}
                ${!content.style.link && content.content.trimEnd().length > 0 && content.style.underline ? 'border-b-2' : ''} 
                editableSpan text-wrap break-all
                whitespace-pre-wrap ${content.style.link ? 'link' : ''}`} 
        style={`
            text-underline-offset: ${content.style.link ? '0.2em' : ''};
            color: ${content.style.link ? 
                darkMode ? '#c2c2c2' : '#818181' : 
                darkMode ? adjustBrightnessToLight(content.style.color) : content.style.color}; 
            font-size: ${content.content.trimEnd().length > 0 && content.style.code ? fontsize - 2 : fontsize}px; 
            line-height: ${parseInt(fontsize) + 8}px;
            background-color: ${content.content.trimEnd().length > 0 && content.style.code ? darkMode ? '#4f5157' : '#dedede' : ''};
            border-color: ${darkMode ? adjustBrightnessToLight(content.style.color) : content.style.color};
            -webkit-box-decoration-break: clone;
            box-decoration-break: clone;
        `} 
        contenteditable="true"
        data-title={index.toString()} id={content.id}><!--
            -->{#if content.content.length != 0 && !content.style.code && !content.style.link}<!--
                -->{content.content}<!--
            -->{:else if content.content.length != 0 && content.style.code}<!--
                --><code>{content.content}</code><!--
            -->{:else if content.content.length != 0 && content.style.link}<!--
                --><a href={content.style.link} contenteditable="false" target="_blank"
                on:mouseenter={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    hover = true;
                    let element = document.elementFromPoint(e.clientX, e.clientY);
                    let rect = element.getBoundingClientRect();
                    linkSelected = "hover";
                    linkSelectInfo.index = index;
                    linkSelectInfo.link = content.style.link;
                    linkSelectInfo.text = content.content;
                    linkSelectInfo.x = rect.left;
                    linkSelectInfo.y = rect.bottom + 5;
                }} on:mouseleave={() => {
                    hoverTimerSet();
                }}>{content.content}</a><!--
            -->{/if}<!--
        --></span>
    {/each}
</span>
</span>
</li>
</span>

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

.link:hover {
    cursor: pointer !important;
}

i {
    margin-right: 12px;
}

.selected {
    opacity: 1;
}

.code {
    padding-top: 0.1em;
    padding-bottom: 0.1em;
    padding-right: 0.5em;
    padding-left: 0.5em;
    border-radius: 5px;
}

.code-left {
    padding-top: 0.1em;
    padding-bottom: 0.1em;
    padding-left: 0.3em;
    border-radius: 5px 0px 0px 5px;
}

.code-right {
    padding-top: 0.1em;
    padding-bottom: 0.1em;
    padding-right: 0.3em;
    border-radius: 0px 5px 5px 0px;
}

.code-mid {
    padding-top: 0.1em;
    padding-bottom: 0.1em;
}

.icons:hover {
    cursor: pointer;
    opacity: 1;
}

li {
    list-style-position: outside !important;
    width: 100%;
}

.link-icon-light {
    cursor: pointer;
    color: #818181;
    padding: 5px;
    border-radius: 3px;
    margin-right: 0px;
}

.link-icon-light:hover {
    background-color: #e1e1e1;
}

.link-icon-dark {
    cursor: pointer;
    color: #e2e2e2;
    padding: 5px;
    border-radius: 3px;
    margin-right: 0px;
}

.link-icon-dark:hover {
    background-color: #818181;
}

.remove-link-light:hover {
    background-color: #f1f1f1;
    width: 100%;
    justify-content: center;
    border-radius: 3px;
    cursor: pointer;
}

.remove-link-dark:hover {
    background-color: #717171;
    width: 100%;
    justify-content: center;
    border-radius: 3px;
    cursor: pointer;
}

</style>
