<script>

import { createEventDispatcher, onMount } from 'svelte';
import { focuspos, getWrapped, focusEnd, getOffsetFromIndex, focusElement } from '../utils/utils';
import {v4 as uuidv4} from 'uuid';
import Paragraph from './Paragraph.svelte';

export let contents = [];
export let id;
export let type;
export let start = 1;

const dispatch = createEventDispatcher();

const enterPresed = (e, index) => {
    let element = document.getElementById(contents[index].id);
    if (element) {
        let text = element.textContent;
        if (text.trimEnd().length == 0) {
            dispatch('text', {
                index: index
            });
            return;
        }
    }
    let id = uuidv4();
    let bs = e.detail.blocks;
    contents.splice(index + 1, 0, {
        type: 'text',
        id: id, 
        content: bs
    })
    contents = [...contents]
    focusElement(id);
    // dispatch('enter', e.detail.blocks)
}

const ondelete = (e, index) => {
    let element = document.getElementById(contents[index].id);
    let context = e.detail.text;
    if (element) {
        let text = element.textContent;
        if (text.trimEnd().length == 0 || context) {
            dispatch('text', {
                index: index,
                text: text.trimEnd().length == 0 ? '' : context
            });
            return;
        }
    }
    let i = parseInt(e.detail.index);
    if (contents[index].content.length != 1) {
        contents[index].content.splice(i, 1);
    } else if (contents[index].content.length == 1 && contents.length == 1) {
        contents[index]['content'][0]['content'] = ' ';
    } else if (contents[index].content.length == 1 && contents.length > 1) {
        contents.splice(index, 1)
        if (index > 0) {
            let block = contents[index - 1]
            focusElement(block.id)
        }
    }
    contents = [...contents]
    dispatch('delete', { index: e.detail.title })
}

const updown = (e, index, direction) => {
    if (direction == 'up') {
        if (index == 0) {
            dispatch('up', {
                index: e.detail.index
            });
            return;
        }
        let pos = e.detail.index;
        let block = document.getElementById(contents[index - 1].id.toString());
        let wrap = getWrapped(block, 16)
    
        if (block) {
            let len = block.textContent.length;
            let lines = wrap.length;
            if (lines > 1) {
                pos = getOffsetFromIndex(pos, wrap);
            }
            if (pos >= len) {
                focusEnd(block);
            } else {
                focusEnd(block);
            }
        }
    } else if (direction == 'down') {
        if (index == contents.length - 1) {
            dispatch('down', {
                index: e.detail.index
            });
            return;
        }
        let pos = e.detail.index;
        let block = document.getElementById(contents[index + 1].id.toString());
        if (block) {
            let len = block.textContent.length;
            if (pos > len) {
                focusEnd(block);
            } else {
                focuspos(block, pos);
            }
        }
    }
    // dispatch(direction, { index: e.detail.index })
}

const leftright = (index, direction) => {
    if (direction == 'left') {
        if (index == 0) {
            dispatch('left');
            return;
        }
        let block = document.getElementById(contents[index - 1].id.toString());
        if (block) {
            let len = 0
            contents[index - 1].content.forEach((val) => {
                len += val.content.length;
            })
            focusEnd(block);
        }
    } else {
        if (index == contents.length - 1) {
            dispatch('right');
            return;
        }
        let block = document.getElementById(contents[index + 1].id.toString());
        if (block) {
            block.focus();
        }
    }
    // dispatch(direction);
}

const transformElement = (e, index) => {
    dispatch('transform', {
        from: e.detail.from,
        to: e.detail.to,
        i: index
    })
}

const actionController = (e, index) => {
    const action = e.detail.action;
    if (action == 'duplicate') {
        const new_content = JSON.parse(JSON.stringify(contents[index]));
        contents.splice(index + 1, 0, new_content);
    } else if (action == 'delete') {
        contents.splice(index, 1)
    }
    contents = [...contents]
}

</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div >
{#if type == 'ordered'}
<ol class='list-decimal list-outside' start={start && start != 0 ? start : 1}>
    {#each contents as line, index}
        <Paragraph id={line.id} bind:contents={line.content} type='ordered'
            on:transform={(e) => transformElement(e, index)}
            on:enter={(e) => enterPresed(e, index)}
            on:action={(e) => actionController(e, index)} 
            on:delete={(e) => ondelete(e, index)} 
            on:up={(e) => updown(e, index, 'up')} on:down={(e) => updown(e, index, 'down')}
            on:right={(e) => leftright(index, 'right')} on:left={(e) => leftright(index, 'left')}/>
    {/each}
</ol>
{:else}
<ul class='list-disc list-outside'>
    {#each contents as line, index}
        <Paragraph id={line.id} bind:contents={line.content} type='unordered'
            on:transform={(e) => transformElement(e, index)}
            on:enter={(e) => enterPresed(e, index)}
            on:action={(e) => actionController(e, index)} 
            on:delete={(e) => ondelete(e, index)} 
            on:up={(e) => updown(e, index, 'up')} on:down={(e) => updown(e, index, 'down')}
            on:right={(e) => leftright(index, 'right')} on:left={(e) => leftright(index, 'left')}/>
    {/each}
</ul>
{/if}
</div>    

<style>


</style>
