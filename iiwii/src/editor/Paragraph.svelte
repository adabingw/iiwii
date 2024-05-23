<script>

import { createEventDispatcher, onMount } from 'svelte';
import { focuspos, getActiveDiv, getOffset, getWrapped, getCurrRow, getIndexFromOffset, rgbToHex, getCoverage } from '../utils/utils';
import {v4 as uuidv4} from 'uuid';
  import ContextMenu from '../utils/ContextMenu.svelte';
  import TextTool from '../utils/TextTool.svelte';

export let contents = [];
export let id;
export let fontsize;
export let type = 'text';

let selText = '';
let selected = false;
let menu;
let tool;
let lengths = [];
const dispatch = createEventDispatcher();
let shift = false;

const keydown = (e) => {            
    let element = document.getElementById(id);
    let wrap = getWrapped(element, fontsize)
    if (element) {
        let caret = getOffset(element);
        if (e.key == 'Shift') {
            shift = true;
        } else if (e.key == 'ArrowUp') {
            let currLine = getCurrRow(caret, wrap);
            if (currLine == 1) {
                dispatch('up', { index: caret })
            }
        } else if (e.key == 'ArrowDown') {
            let lines = wrap.length;
            let currLine = getCurrRow(caret, wrap);
            let lineIndex = getIndexFromOffset(caret, currLine);
            if (currLine == lines || (currLine == lines - 1 && lineIndex == 0 && caret != 0)) {
                dispatch('down', { index: lineIndex })
            }
        } else if (e.key == 'ArrowRight') {
            if (shift) {
                console.log('shifty right')
                dispatch('shift-down', {type: 'right'})
            } else {
                let len = lengths.reduce((p, a) => a + p, 0);
                if (caret == len) {
                    dispatch('right')
                }
            }
        } else if (e.key == 'ArrowLeft') {
            if (shift) {
                console.log('shifty left')
                dispatch('shift-down', {type: 'left'})
            } else {
                if (caret == 0) {
                    dispatch('left')
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
    let start = window.getSelection().extentOffset;
    let end = window.getSelection().anchorOffset;
    let element = document.getElementById(id);
    let selection = window.getSelection().anchorNode.textContent.substring(
      start, 
      end
    );
    let ids = getCoverage(start, end, contents);
    if (ids.length > 1) {
        // don't highlight style in toolbox
    } else if (ids.length == 1) {
        // highlight style in toolbox
    }
    if (e.key == 'Shift') {
        shift = false;
        dispatch('shift-up', {type: 'up'})
    } else if (e.key == '/') {
        if (element && element.textContent.trimEnd().length == 1) {
            e.preventDefault();
            e.stopPropagation(); 
            const rect = element.getBoundingClientRect();
            let top = rect.top;
            let bottom = rect.bottom;
            let left = rect.left;
            let icons = document.getElementsByClassName('fa-plus');
            for (const icon of icons) {
                icon.style.visibility = 'hidden';
            }
            menu.openMenu(top, left, bottom);
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

const mouseup = (e) => {
    let selection = window.getSelection().anchorNode.textContent.substring(
      window.getSelection().extentOffset, 
      window.getSelection().anchorOffset
    );
}

const input = (e) => {
    let element = getActiveDiv();
    if (element && contents[element.title]) {
        if (element.textContent.trimEnd() == '') contents[element.title].content = ' ';
        else contents[element.title].content = element.textContent.trimEnd();
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
            // menu.openMenu(e.clientY, e.clientX, e.clientY);
        }
    }
}

$: {
    contents;
    lengths = [];
    for (const content of contents) {
        if (content && content.content && content.length)
            lengths.push(content.content.length);
    }
}

// <ContextMenu bind:this={menu} id={id} bind:selected={selected} selText={selText} 
//     on:empty={(e) => menu.onPageClick(e)}/>
</script>

<TextTool bind:this={menu} id={id} bind:selected={selected} />
<div class='flex flex-row flex-start'>
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->

<i class={`fa-solid fa-plus fa-ms ${selected ? 'selected' : ''}`} style={`line-height: ${parseInt(fontsize) + 8}px;`} 
    on:click={addclick} id={`icon-${id}`}></i>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
{#if type == 'text'}
<div on:mousedown={focuslast} class='hover:cursor-text  cursor-text whitespace-pre-wrap text-wrap break-all'>
<span id={id} class='hover:cursor-text cursor-text whitespace-pre-wrap text-wrap break-all' contenteditable="true" spellcheck="false" 
on:keydown={keydown} on:keyup={keyup} on:input={(e) => input(e)}
style={`line-height: 18px;`}>

    {#each contents as content, index}
    <span 
        class={`${content.style.bold ? 'font-bold' : ''} 
                ${content.style.italics ? 'italic' : ''} 
                ${content.style.underline ? 'underline underline-offset-8' : ''} 
                whitespace-pre-wrap editableSpan text-wrap break-all`} 
        style={`color: ${content.style.color}; font-size: ${fontsize}px; line-height: ${parseInt(fontsize) + 8}px`} 
        title={index.toString()} id={content.id}>{#if content.content.length != 0}{content.content}{/if}</span>
    {/each}
</span>
</div>
{:else if type == 'list'}
<li class='hover:cursor-text  cursor-text'>
<span on:mousedown={focuslast} class='whitespace-pre-wrap text-wrap break-all'>
<span id={id} class='hover:cursor-text cursor-text whitespace-pre-wrap text-wrap break-all' contenteditable="true" spellcheck="false" 
on:keydown={keydown} on:input={(e) => input(e)} on:keyup={keyup}
style={`line-height: 18px;`}>
    {#each contents as content, index}
    <span 
        class={`${content.style.bold ? 'font-bold' : ''} 
                ${content.style.italics ? 'italic' : ''} 
                ${content.style.underline ? 'underline underline-offset-8' : ''} 
                whitespace-pre-wrap editableSpan text-wrap break-all`} 
        style={`color: ${content.style.color}; font-size: ${fontsize}px; line-height: ${parseInt(fontsize) + 8}px`} 
        title={index.toString()} id={content.id}>{#if content.content.length != 0}{content.content}{/if}</span>
    {/each}
</span>
</span>
</li>
{/if}
</div>

<style>
i {
    margin-left: -15px;
    margin-right: 10px;
    color: #b1b1b1 !important;
    opacity: 0;
}

.selected {
    opacity: 1;
}

i:hover {
    cursor: pointer;
    opacity: 1;
}
</style>
