<script>
// @ts-nocheck

import { createEventDispatcher } from 'svelte';

export let contents = [];
export let id;

const dispatch = createEventDispatcher();

const keydown = (e) => {
    if (e.key == 'Backspace') {
        let element = getActiveDiv();
        if (element && element.innerText.length == 1) {
            dispatch('delete', { index: element.title })
        }
    } else if (e.key == 'Enter') {
        e.preventDefault();
        dispatch('enter')
    }
}

const focuslast = (e) => {
    if (contents.length < 1) return;
    let block = contents[contents.length - 1];
    let element = document.getElementById(block.id);
    
    if (element) {
        if (!(contents.length > 1 || contents[0].content.length != 0)) {
            e.preventDefault();
            e.stopPropagation();
        }
        let range = document.createRange()
        let sel = window.getSelection()
        
        range.setStart(element.childNodes[0], !(contents.length > 1 || contents[0].content.length != 0) ? 0 : block.content.length)
        range.collapse(true)
        
        sel.removeAllRanges()
        sel.addRange(range)
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

</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div id={id} class='hover:cursor-text cursor-text' on:mousedown={focuslast} contenteditable="true" spellcheck="false" on:keydown={keydown}>
    {#each contents as content, index}
    <span 
        class={`${content.style.bold ? 'font-bold' : ''} 
                ${content.style.italics ? 'italic' : ''} 
                ${content.style.underline ? 'underline underline-offset-8' : ''} 
                whitespace-pre-wrap editableSpan`} 
        style={`color: ${content.style.color}`} 
        contenteditable="true" title={index.toString()} id={content.id}>
            {#if content.content.length != 0}{content.content}{:else if content.content.length == 0 && contents.length == 1}
            <span class='text-gray-500'>Empty</span>{/if}</span>
    {/each}
</div>

