<script>

import { createEventDispatcher, onMount } from 'svelte';
import { focuspos, getActiveDiv, getOffset, getTotalLines, getWrapped, getCurrRow, getIndexFromOffset, rgbToHex } from '../utils/utils';
import {v4 as uuidv4} from 'uuid';
import Paragraph from './Paragraph.svelte';

export let contents = [];
export let id;
export let type;

const dispatch = createEventDispatcher();

const enterPresed = (e, index) => {
    let id = uuidv4();
    let bs = e.detail.blocks;
    contents.splice(index + 1, 0, {
        type: type,
        id: id, 
        content: bs
    })
    contents = [...contents]
    setTimeout(() => {
        let newline = document.getElementById(id.toString());
        if (newline) {
            newline.focus();
        }
    }, 100);
    // dispatch('enter', e.detail.blocks)
}

const ondelete = (e) => {
    dispatch('delete', { index: e.detail.title })
}

const updown = (e, direction) => {
    dispatch(direction, { index: e.detail.index })
}

const leftright = (direction) => {
    dispatch(direction);
}

</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div >
{#if type == 'ordered'}
<ol class='list-decimal'>
    {#each contents as line, index}
        <Paragraph id={line.id} bind:contents={line.content} fontsize=16 type='list'
                on:enter={(e) => enterPresed(e, index)}
                on:delete={(e) => ondelete(e)} 
                on:up={(e) => updown(e)} on:down={(e) => updown(e)}
                on:right={(e) => leftright(e)} on:left={(e) => leftright(e)}/>
    {/each}
</ol>
{:else}
<ul class='list-disc'>
    {#each contents as line, index}
        <Paragraph id={line.id} bind:contents={line.content} fontsize=16 type='list'
                    on:enter={(e) => enterPresed(e, index)}
                    on:delete={(e) => ondelete(e)} 
                    on:up={(e) => updown(e, 'up')} on:down={(e) => updown(e, 'down')}
                    on:right={(e) => leftright('right')} on:left={(e) => leftright('left')}/>
    {/each}
</ul>
{/if}
</div>    
