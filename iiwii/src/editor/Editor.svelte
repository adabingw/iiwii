<script>
import { setup } from "../utils/scripts/constants";
import {v4 as uuidv4} from 'uuid';
import Paragraph from "./Paragraph.svelte";
import { createBlock, createContent, createListBlock, focusElement, focusEnd, getOffsetFromIndex, getWrapped } from "../utils/scripts/utils";
import List from "./List.svelte";

let blocks = setup;

const enterPresed = (e, index, type) => {
    const id = uuidv4();
    const bs = e.detail.blocks;
    if (bs.length == 0) console.error('blocks empty');
    const tab = blocks[index].tab ? blocks[index].tab : 0;
    blocks.splice(index + 1, 0, createBlock(id, type, tab, false, bs))
    blocks = [...blocks]
    focusElement(bs[0].id);
}

const addElement = (e, index) => {
    const type = e.detail.type;
    const id = uuidv4();
    const id2 = uuidv4();
    const tab = blocks[index].tab ? blocks[index].tab : 0;
    const content = createContent(id2, ' ');
    blocks.splice(index + 1, 0, createBlock(id, type, tab, false, [content]))
    blocks = [...blocks]
}

const tab = (e, index) => {
    const direction = e.detail.direction;
    blocks[index].tab = blocks[index].tab != undefined ? blocks[index].tab : 0;
    if (index == 0) {
        if (blocks[index].tab == 0 && direction == 1) {
            blocks[index].tab = 4;
        } else if (blocks[index].tab == 4 && direction == -1) {
            blocks[index].tab = 0;
        }
        return;
    }

    // deepest indent allowed
    if (direction == 1 && blocks[index].tab == 12) return;

    blocks[index - 1].tab = blocks[index - 1].tab != undefined ? blocks[index - 1].tab : 0;
    if (blocks[index].tab <= blocks[index - 1].tab && direction == 1) {
        blocks[index].tab += 4;
    } else if (blocks[index].tab > 0 && direction == -1) {
        blocks[index].tab -= 4;
    }
}

const actionController = (e, index) => {
    const action = e.detail.action;
    if (action == 'duplicate') {
        const new_content = JSON.parse(JSON.stringify(blocks[index]));
        blocks.splice(index + 1, 0, new_content);
    } else if (action == 'delete') {
        blocks.splice(index, 1)
    }
    blocks = [...blocks]
}

// list -> text when enter / delete on empty entry
const textEnter = (e, index, type) => {
    const i = e.detail.index;
    const id = uuidv4();
    let insertAt = index;
    if (i == blocks[index].content.length - 1) {
        if (blocks[index]['content'].length != 0) {
            insertAt = index + 1;  
        }
    } else {
        let new_b = blocks[index]['content'].splice(i + 1);
        insertAt = index + 1;
        blocks.splice(index + 1, 0, createBlock(id, type, blocks[index].tab ? blocks[index].tab : 0, false, new_b));
    }
    const [new_content] = blocks[index]['content'].splice(i, 1);
    blocks.splice(insertAt, 0, createBlock(
        new_content.id,
        new_content.type,
        blocks[index].tab ? blocks[index].tab : 0,
        false,
        new_content.content
    ));
    focusElement(new_content.id);
    blocks = [...blocks]
}

const ondelete = (e, index) => {
    const content = e.detail.text;
    // backspace on an element that isn't empty should append that element to the previous element
    console.log(content)
    if (content) {
        if (index < 1) return;
        let id;
        if (blocks[index - 1].type == 'unordered' || blocks[index - 1].type == 'ordered') {
            let c = blocks[index - 1].content;
            if (Array.isArray(c[c.length - 1].content)) {
                // @ts-ignore
                c[c.length - 1].content.push(...content);
            }
            id = c[c.length - 1].id;
        } else {
            blocks[index - 1].content.push(...content)
            id = blocks[index - 1].id;
        }
        blocks.splice(index, 1);
        focusElement(id);
    } else {
        // deleted all the text in the page, retain structure
        if (blocks[index].content.length == 1 && blocks.length == 1) {
            blocks[index]['content'][0]['content'] = ' ';
        // delete entire element 
        } else if (blocks[index].content.length == 1 && blocks.length > 1) {
            blocks.splice(index, 1);
            let id;
            if (blocks[index - 1].type == 'unordered' || blocks[index - 1].type == 'ordered') {
                let c = blocks[index - 1].content;
                id = c[c.length - 1].id;
            } else {
                id = blocks[index - 1].id;
            }
            if (index > 0) focusElement(id);
        }
    }
    blocks = [...blocks]
}

const updown = (e, index, direction) => {
    e.preventDefault();
    if (direction == 'up') {
        if (index == 0) return;
        let block;
        let pos = e.detail.index;
        let f = 16;
        if (blocks[index - 1].type == 'ordered' || blocks[index - 1].type == 'unordered') {
            const c = blocks[index - 1].content;
            if (c.length < 1) return;
            block = document.getElementById(c[c.length - 1].id.toString());
        } else {
            block = document.getElementById(blocks[index - 1].id.toString());
            if (blocks[index - 1].type == 'h3') f = 20;
            else if (blocks[index - 1].type == 'h2') f = 24;
            else if (blocks[index - 1].type == 'h3') f = 28;
        }

        let wrap = getWrapped(block, f);
        if (block) {
            let len = block.textContent.length;
            let lines = wrap.length;
            if (lines > 1) {
                pos = getOffsetFromIndex(pos, wrap);
            }
            if (pos >= len) focusEnd(block);
            else focusEnd(block);
        }
    } else if (direction == 'down') {
        if (index == blocks.length - 1) return;
        let block;
        if (blocks[index + 1].type == 'ordered' || blocks[index + 1].type == 'unordered') {
            let c = blocks[index + 1].content;
            if (c.length < 1) return;
            block = document.getElementById(c[0].id.toString());
        } else {
            block = document.getElementById(blocks[index + 1].id.toString());
        }

        if (block) focusEnd(block)
    }
}

const leftright = (index, direction) => {
    if (direction == 'left') {
        if (index == 0) return;
        let block;
        if (blocks[index - 1].type == 'ordered' || blocks[index - 1].type == 'unordered') {
            const c = blocks[index - 1].content;
            if (c.length < 1) return;
            block = document.getElementById(c[c.length - 1].id.toString());
        } else {
            block = document.getElementById(blocks[index - 1].id.toString());
        }
        if (block) focusEnd(block);
    } else {
        if (index == blocks.length - 1) return;
        let block;
        if (blocks[index + 1].type == 'ordered' || blocks[index + 1].type == 'unordered') {
            const c = blocks[index + 1].content;
            if (c.length < 1) return;
            block = document.getElementById(c[0].id.toString());
        } else {
            block = document.getElementById(blocks[index + 1].id.toString());
        }
        if (block) block.focus();
    }
}

const makeList = (e, type, index) => {
    e.preventDefault();
    const id = uuidv4();
    const content = {...blocks[index]};
    for (let i = 0; i < content.content.length; i++) {
        if (i == 0) content.content[i].content = ' ';
        else content.content[i].content = '';
    }
    if (type == 'ordered' && e.detail.start) blocks[index].start = e.detail.start;
    blocks[index] = createBlock(
        id, 
        type, 
        blocks[index].tab ? blocks[index].tab : 0, 
        false, 
        [ createListBlock(content.id, content.type, content.content) ]
    )
    focusElement(content.id);
}

const transformElement = (e, type, index) => {
    const from = e.detail.from; 
    const to = e.detail.to; 
    const i = e.detail.i;
    const t = blocks[index].tab;

    if (from == 'ordered' || from == 'unordered') {
        const id = uuidv4();
        let new_b = blocks[index]['content'].splice(i);
        const [new_content] = new_b.splice(0, 1);
        new_content.type = to;
        if (to != 'ordered' && to != 'unordered') {
            blocks.splice(index + 1, 0, createBlock(
                new_content.id, 
                to,
                blocks[index].tab ? blocks[index].tab : 0,
                false, 
                new_content.content
            ));
            focusElement(new_content.id);   
        } else {
            blocks.splice(index + 1, 0, createBlock(id, to, t, false, [new_content]));
        }
        blocks.splice(index + 2, 0, createBlock(id, type, t, false, new_b));
    } else {
        blocks[index].type = to;
        focusElement(blocks[index].content[0].id);
    }
    blocks = [...blocks]
}

</script>

<div class="px-72 py-10" id='breh'>
{#each blocks as item, index}
    {#if item.type == 'text' || item.type == 'h1' || item.type == 'h2' || item.type == 'h3' || 
        item.type == 'quote' || item.type == 'callout' || item.type == 'checkbox'}
        <Paragraph id={item.id} bind:contents={item.content} tab={item.tab == undefined ? 0 : item.tab}
            bind:state={item.state} bind:type={item.type} 
            on:transform={(e) => transformElement(e, item.type, index)}
            on:enter={(e) => enterPresed(e, index, 'text')}
            on:delete={(e) => ondelete(e, index)} on:tab={(e) => tab(e, index)}
            on:ordered={(e) => makeList(e, 'ordered', index)} on:unordered={(e) => makeList(e, 'unordered', index)} 
            on:up={(e) => updown(e, index, 'up')} on:down={(e) => updown(e, index, 'down')}
            on:action={(e) => actionController(e, index)} on:add={(e) => addElement(e, index)}
            on:right={(e) => leftright(index, 'right')} on:left={(e) => leftright(index, 'left')} />
    {:else if item.type == 'ordered' || item.type == 'unordered'}
        <List id={item.id} bind:contents={item.content} type={item.type} start={item.start ? item.start : 1} 
            tab={item.tab == undefined ? 0 : item.tab}
            canIndent={() => console.log('can indent')}
            on:left={() => leftright(index, 'left')} on:right={(e) => leftright(index, 'right')} 
            on:up={(e) => updown(e, index, 'up')} on:down={(e) => updown(e, index, 'down')} 
            on:transform={(e) => transformElement(e, item.type, index)}
            on:text={(e) => textEnter(e, index, item.type)} />
    {/if}
{/each}
</div>
