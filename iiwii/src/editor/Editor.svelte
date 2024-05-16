<script>
import { setup } from "../utils/constants";
import {v4 as uuidv4} from 'uuid';
import Paragraph from "./Paragraph.svelte";
import { focusEnd, focuspos, getOffset, getOffsetFromIndex, getTotalLines, getWrapped } from "../utils/utils";
  import List from "./List.svelte";

let blocks = setup;

const enterPresed = (e, index) => {
    let id = uuidv4();
    let bs = e.detail.blocks;
    console.log(bs);
    blocks.splice(index + 1, 0, {
        type: 'text',
        id: id, 
        content: bs
    })
    blocks = [...blocks];
    setTimeout(() => {
        let newline = document.getElementById(id.toString());
        if (newline) {
            newline.focus();
        }
    }, 100);
}

const ondelete = (e, index) => {
    let i = parseInt(e.detail.index);
    if (blocks[index].content.length != 1) {
        blocks[index].content.splice(i, 1);
    } else if (blocks[index].content.length == 1 && blocks.length == 1) {
        blocks[index]['content'][0]['content'] = '';
    } else if (blocks[index].content.length == 1 && blocks.length > 1) {
        blocks.splice(index, 1)
        if (index > 0) {
            setTimeout(() => {
                let block = blocks[index - 1]
                let element = document.getElementById(block.id.toString());
                if (element) {
                    focusEnd(element);
                }
            }, 100);
        }
    }
    blocks = [...blocks]
}

const updown = (e, index, direction) => {
    if (direction == 'up') {
        if (index == 0) return;
        let pos = e.detail.index;
        let block = document.getElementById(blocks[index - 1].id.toString());
        let wrap = getWrapped(block)
    
        if (block) {
            let len = block.textContent.length;
            let lines = Math.ceil(getTotalLines(block));
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
        if (index == blocks.length - 1) return;
        let pos = e.detail.index;
        let block = document.getElementById(blocks[index + 1].id.toString());
        if (block) {
            let len = block.textContent;
            if (pos > len) {
                focusEnd(block);
            } else {
                focuspos(block, pos);
            }
        }
    }
}

// TODO: keep a record of the length 
const leftright = (index, direction) => {
    if (direction == 'left') {
        if (index == 0) return;
        let block = document.getElementById(blocks[index - 1].id.toString());
        if (block) {
            let len = 0
            blocks[index - 1].content.forEach((val) => {
                len += val.content.length;
            })
            focusEnd(block);
        }
    } else {
        if (index == blocks.length - 1) return;
        let block = document.getElementById(blocks[index + 1].id.toString());
        if (block) {
            block.focus();
        }
    }
}

</script>

<div class="px-72 pt-10" id='breh'>
    
{#each blocks as item, index}
    {#if item.type == 'text'}
        <Paragraph id={item.id} bind:contents={item.content} fontsize=16
            on:enter={(e) => enterPresed(e, index)}
            on:delete={(e) => ondelete(e, index)} 
            on:up={(e) => updown(e, index, 'up')} on:down={(e) => updown(e, index, 'down')}
            on:right={(e) => leftright(index, 'right')} on:left={(e) => leftright(index, 'left')}/>
    {:else if item.type == 'h1'}
        <Paragraph id={item.id} bind:contents={item.content} fontsize=28
                on:enter={(e) => enterPresed(e, index)}
                on:delete={(e) => ondelete(e, index)} 
                on:up={(e) => updown(e, index, 'up')} on:down={(e) => updown(e, index, 'down')}
                on:right={(e) => leftright(index, 'right')} on:left={(e) => leftright(index, 'left')}/>
    {:else if item.type == 'h2'}
        <Paragraph id={item.id} bind:contents={item.content} fontsize=24
                on:enter={(e) => enterPresed(e, index)}
                on:delete={(e) => ondelete(e, index)} 
                on:up={(e) => updown(e, index, 'up')} on:down={(e) => updown(e, index, 'down')}
                on:right={(e) => leftright(index, 'right')} on:left={(e) => leftright(index, 'left')}/>
    {:else if item.type == 'h3'}
        <Paragraph id={item.id} bind:contents={item.content} fontsize=20
                on:enter={(e) => enterPresed(e, index)}
                on:delete={(e) => ondelete(e, index)} 
                on:up={(e) => updown(e, index, 'up')} on:down={(e) => updown(e, index, 'down')}
                on:right={(e) => leftright(index, 'right')} on:left={(e) => leftright(index, 'left')}/>
    {:else if item.type == 'ordered'}
        <List id={item.id} bind:contents={item.content} type='ordered' />
    {:else if item.type == 'unordered'}
        <List id={item.id} bind:contents={item.content} type='unordered' />
    {/if}
{/each}
</div>
