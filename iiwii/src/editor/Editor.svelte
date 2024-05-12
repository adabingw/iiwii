<script>
import { setup } from "../utils/constants";
// @ts-ignore
import {v4 as uuidv4} from 'uuid';

import Paragraph from "./Paragraph.svelte";

let blocks = setup;

// @ts-ignore
const enterPresed = (type, index) => {
    let id = uuidv4();
    let id2 = uuidv4();
    blocks.splice(index + 1, 0, {
        type: 'text',
        id,
        content: [
            {
                content: '',
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
        let newline = document.getElementById(id2.toString());
        if (newline) {
            console.log('found newline')
            newline.focus();
        }
    }, 500);
}

const ondelete = (e, index) => {
    let i = parseInt(e.detail.index);
    if (blocks[index].content.length != 1) {
        blocks[index].content.splice(i, 1);
    }
    console.log(blocks)
    blocks = [...blocks]
}

</script>

<div class="px-72 pt-10" id='breh'>
{#each blocks as item, index}
    {#if item.type == 'text'}
        <Paragraph id={item.id} contents={item.content} 
            on:enter={(e) => enterPresed(item.type, index)}
            on:delete={(e) => ondelete(e, index)}/>
    {/if}
{/each}
</div>
