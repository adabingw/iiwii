<script>

import { createEventDispatcher, onMount } from 'svelte';
import { focusEnd, focuspos, getActiveDiv, getOffset, getTotalLines, getWrapped, getCurrRow, getIndexFromOffset, rgbToHex } from '../utils/utils';
import {v4 as uuidv4} from 'uuid';

export let contents = [];
export let id;
export let fontsize;
export let type = 'text';

let lengths = [];
const dispatch = createEventDispatcher();

const keydown = (e) => {
    let element = document.getElementById(id);
    let wrap = getWrapped(element)
    if (element) {
        let caret = getOffset(element);
        if (e.key == 'ArrowUp') {
            let currLine = getCurrRow(caret, wrap);
            if (currLine == 1) {
                dispatch('up', { index: caret })
            }
        } else if (e.key == 'ArrowDown') {
            let lines = Math.ceil(getTotalLines(element));
            let currLine = getCurrRow(caret, wrap);
            let lineIndex = getIndexFromOffset(caret, currLine, element);
            console.log(lines, currLine, lineIndex)
            if (currLine == lines || (currLine == lines - 1 && lineIndex == 0 && caret != 0)) {
                dispatch('down', { index: lineIndex })
            }
        } else if (e.key == 'ArrowRight') {
            let len = lengths.reduce((p, a) => a + p, 0);
            if (caret == len) {
                dispatch('right')
            }
        } else if (e.key == 'ArrowLeft') {
            if (caret == 0) {
                dispatch('left')
            }
        } else if (e.key == 'Backspace') {
            let element = getActiveDiv();
            // @ts-ignore
            if (element && (element.innerText.length == 1 || element.innerText.trimEnd().length == 0)) {
                // @ts-ignore
                dispatch('delete', { index: element.title })
            }
        } else if (e.key == 'Enter') {
            let element = getActiveDiv();
            if (element) {
                // element.blur();
                let caret = getOffset(element);
                let bs = [];
                let cutoff = 0;
                for (let i = 0; i < contents.length; i++) {
                    let id = uuidv4();
                    // @ts-ignore
                    if (contents[i].id == element.id) {
                        cutoff = i;
                        bs.push({...contents[i]});
                        bs[0].id = id;
                        let c = contents[i].content;
                        bs[0].content = c.substring(caret).length > 0 ? c.substring(caret) : ' ';
                        contents[i].content = c.substring(0, caret).length > 0 ? c.substring(0, caret) : ' ';
                    }
                    if (i > cutoff) {
                        bs.push(contents[i]);
                        bs[bs.length - 1].id = id;
                    }
                }
                if (cutoff < contents.length - 2) contents.splice(cutoff + 1);
                contents = [...contents];

                e.preventDefault();
                e.stopPropagation();
                dispatch('enter', { 
                    blocks: [...bs]
                });
            }
        }
    }
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

const input = (e) => {
    let element = getActiveDiv();
    if (element && contents[element.title]) {
        if (element.textContent == '' || element.textContent.trimEnd() == '') contents[element.title].content = ' ';
        else contents[element.title].content = element.textContent.trimEnd();
    }
}

$: {
    contents;
    lengths = [];
    console.log(contents)
    for (const content of contents) {
        console.log(content.content)
        lengths.push(content.content.length);
    }
}

// {#if contents.length == 1 && contents[0]['content'] == ''}<span class='text-gray-500 whitespace-pre-wrap' id="empty">   Empty</span>{/if}

</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
{#if type == 'text'}
<div on:mousedown={focuslast} class='hover:cursor-text  cursor-text whitespace-pre-wrap text-wrap break-all'>
<span id={id} class='hover:cursor-text cursor-text whitespace-pre-wrap text-wrap break-all' contenteditable="true" spellcheck="false" 
on:keydown={keydown} on:input={(e) => input(e)}
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
on:keydown={keydown} on:input={(e) => input(e)}
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
