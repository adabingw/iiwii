<script>
// @ts-nocheck

import { createEventDispatcher } from 'svelte';
import { focusEnd, focuspos, getCaretCharacterOffsetWithin } from '../utils/utils';

export let contents = [];
export let id;

const dispatch = createEventDispatcher();

const keydown = (e) => {
    let element = document.getElementById(id);
    console.log(element);
    if (element) {
        console.log(getCaretCharacterOffsetWithin(element));
    }
    if (e.key == 'Backspace') {
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
    } else if (e.key == 'ArrowUp') {

    } else if (e.key == 'ArrowDown') {
        
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
        console.log(element.textContent)
        if (element.textContent == '') contents[element.title].content = ' ';
        else contents[element.title].content = element.textContent.trimEnd();
    }
}

// {#if contents.length == 1 && contents[0]['content'] == ''}<span class='text-gray-500 whitespace-pre-wrap' id="empty">   Empty</span>{/if}

</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:mousedown={focuslast} class='hover:cursor-text cursor-text whitespace-pre-wrap text-wrap break-all'>
<span id={id} class='hover:cursor-text cursor-text whitespace-pre-wrap text-wrap break-all' contenteditable="true" spellcheck="false" 
on:keydown={keydown} on:input={(e) => input(e)}>
    {#each contents as content, index}
    <span 
        class={`${content.style.bold ? 'font-bold' : ''} 
                ${content.style.italics ? 'italic' : ''} 
                ${content.style.underline ? 'underline underline-offset-8' : ''} 
                whitespace-pre-wrap editableSpan text-wrap break-all`} 
        style={`color: ${content.style.color}`} 
        contenteditable="true" title={index.toString()} id={content.id}>{#if content.content.length != 0}{content.content}{/if}</span>
    {/each}
</span>
</div>

