<script>
import { setup } from "../utils/constants";
// @ts-ignore
// @ts-ignore
import {v4 as uuidv4} from 'uuid';

import Paragraph from "./Paragraph.svelte";
  // @ts-ignore
import { focusEnd, focuspos, getCursorPos, getPosFromIndex, getTotalLines } from "../utils/utils";

let blocks = setup;

// @ts-ignore
// @ts-ignore
const enterPresed = (type, index) => {
    let id = uuidv4();
    let id2 = uuidv4();
    blocks.splice(index + 1, 0, {
        type: 'text',
        id,
        content: [
            {
                content: ' ',
                id: id2,
                style: {
                    'bold': false, 
                    'italics': false,
                    'underline': false,
                    'color': '#000000'
                }
            }
        ]
    })
    blocks = [...blocks];
    setTimeout(() => {
        let newline = document.getElementById(id.toString());
        if (newline) {
            console.log('found newline');
            console.log(newline)
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
        if (block) {
            let len = block.textContent.length;
            console.log('len', len, pos)
            if (pos >= len) {
                focusEnd(block);
            } else {
                let lines = Math.ceil(getTotalLines(block));
                console.log(lines)
                if (lines > 1) {
                    pos = getPosFromIndex(pos, block, lines);
                }
                console.log(pos);
                focuspos(block, 33);
                console.log(getCursorPos(block))
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
        <Paragraph id={item.id} contents={item.content} 
            on:enter={(e) => enterPresed(item.type, index)}
            on:delete={(e) => ondelete(e, index)} 
            on:up={(e) => updown(e, index, 'up')} on:down={(e) => updown(e, index, 'down')}
            on:right={(e) => leftright(index, 'right')} on:left={(e) => leftright(index, 'left')}/>
    {/if}
{/each}
</div>
