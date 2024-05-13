<script>
import { setup } from "../utils/constants";
// @ts-ignore
// @ts-ignore
import {v4 as uuidv4} from 'uuid';

import Paragraph from "./Paragraph.svelte";
  // @ts-ignore
  import { afterUpdate } from "svelte";
  import { focusEnd } from "../utils/utils";

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

</script>

<div class="px-72 pt-10" id='breh'>
{#each blocks as item, index}
    {#if item.type == 'text'}
        <Paragraph id={item.id} contents={item.content} 
            on:enter={(e) => enterPresed(item.type, index)}
            on:delete={(e) => ondelete(e, index)} />
    {/if}
{/each}
</div>
