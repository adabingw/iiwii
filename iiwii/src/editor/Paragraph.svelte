<script>
// @ts-nocheck

import { createEventDispatcher, onMount } from 'svelte';
import { focusEnd, focuspos, getCursorPos, getLine, getTotalLines, getIndexInCurrentLine, getWrapped, getCurrRow } from '../utils/utils';

export let contents = [];
export let id;

let lengths = [];
const dispatch = createEventDispatcher();

const keydown = (e) => {
    
    let element = document.getElementById(id);
    console.log(element.childNodes)
    let wrap = getWrapped(element)
    if (element) {
        let caret = getCursorPos(element);
        if (e.key == 'ArrowUp') {
            let currLine = getCurrRow(caret, wrap);
            console.log(currLine)
            if (currLine == 1) {
                dispatch('up', { index: caret })
            }
        } else if (e.key == 'ArrowDown') {
            let lines = Math.ceil(getTotalLines(element));
            let currLine = getLine(element);
            let lineIndex = getIndexInCurrentLine(caret, currLine, element);
            if (currLine == lines || (currLine == lines - 1 && lineIndex == 0 && caret != 0)) {
                dispatch('down', { index: lineIndex })
            }
        } else if (e.key == 'ArrowRight') {
            // TODO: len
            // if (caret == len) {
            //     dispatch('right')
            // }
        } else if (e.key == 'ArrowLeft') {
            if (caret == 0) {
                dispatch('left')
            }
        } else if (e.key == 'Backspace') {
            let element = getActiveDiv();
            if (element && (element.innerText.length == 1 || element.innerText.trimEnd().length == 0)) {
                dispatch('delete', { index: element.title })
            }
        } else if (e.key == 'Enter') {
            let element = getActiveDiv();
            if (element) {
                element.blur();
            }
            e.preventDefault();
            e.stopPropagation();
            dispatch('enter')
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

const getActiveDiv = () => {
    let sel = window.getSelection();
    let range = sel.getRangeAt(0);
    let node = document.createElement('span');
    range.insertNode(node);
    range = range.cloneRange();
    range.selectNodeContents(node);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    let activeDiv = node.parentNode;
    node.parentNode.removeChild(node);
    return activeDiv;
}

const input = (e) => {
    let element = getActiveDiv();
    if (element && contents[element.title]) {
        if (element.textContent == '') contents[element.title].content = ' ';
        else contents[element.title].content = element.textContent;
    }
}

$: {
    contents;
    lengths = [];
    for (const content of contents) {
        lengths.push(content.content.length);
    }
}

// {#if contents.length == 1 && contents[0]['content'] == ''}<span class='text-gray-500 whitespace-pre-wrap' id="empty">   Empty</span>{/if}

</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
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
        style={`color: ${content.style.color}`} 
        title={index.toString()} id={content.id}>{#if content.content.length != 0}{content.content}{/if}</span>
    {/each}
</span>
</div>

