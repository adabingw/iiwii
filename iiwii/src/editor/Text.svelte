<script>
import { createEventDispatcher, onMount } from 'svelte';

export let style = {};
export let text;

let bold = style.bold;
let italics = style.italics;
let underline = style.underline;
let color = style.color;

const dispatch = createEventDispatcher();

const keydown = (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    dispatch('enter', {
        text: 'enter'
    })
}

</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<span class={`${bold ? 'font-bold' : ''} ${italics ? 'italic' : ''} ${underline ? 'underline underline-offset-8' : ''}`}
    style={`color: ${color}`} contenteditable="true" spellcheck="false" on:keydown={keydown}>
    {text}&nbsp;
</span>
