<script>
import { setup } from "../utils/constants";
import {v4 as uuidv4} from 'uuid';
import Paragraph from "./Paragraph.svelte";
import { focusEnd, focuspos, getOffset, getOffsetFromIndex, getWrapped } from "../utils/utils";
import List from "./List.svelte";

let blocks = setup;

const enterPresed = (e, index, type) => {
    let id = uuidv4();
    let bs = e.detail.blocks;
    blocks.splice(index + 1, 0, {
        type: type,
        id: id, 
        content: bs
    })
    blocks = [...blocks]
    setTimeout(() => {
        let newline = document.getElementById(id.toString());
        if (newline) {
            newline.focus();
        }
    }, 100);
}

// list -> text when enter / delete on empty entry
const textEnter = (e, index, type) => {
    let i = e.detail.index;
    let c = blocks[index].content;
    let id = uuidv4();

    console.log(JSON.stringify(c))
    console.log(i, c.length)
    
    if (i == c.length - 1) {
        let [new_content] = blocks[index]['content'].splice(i, 1);
        blocks.splice(index + 1, 0, new_content);
        setTimeout(() => {
            let element = document.getElementById(new_content.id);
            if (element) {
                element.focus();
            }
        }, 100);
    } else if (i == 0) {
        let [new_content] = blocks[index]['content'].splice(0, 1);
        blocks.splice(index + 1, 0, new_content);
        setTimeout(() => {
            let element = document.getElementById(new_content.id);
            if (element) {
                element.focus();
            }
        }, 100);
    } else {
        console.log('ai')
        let new_b = blocks[index]['content'].splice(i);
        let [new_content] = new_b.splice(0, 1);
        blocks.splice(index + 1, 0, new_content);
        setTimeout(() => {
            let element = document.getElementById(new_content.id);
            if (element) {
                element.focus();
            }
        }, 100);
        blocks.splice(index + 2, 0, {
            type: type,
            id: id, 
            content: new_b
        });
    }
    blocks = [...blocks]
}

const ondelete = (e, index) => {
    let i = parseInt(e.detail.index);
    let content = e.detail.text;
    // backspace on an element that isn't empty should append that element to the previous element
    if (content) {
        if (index < 1) return;
        let id;
        if (blocks[index - 1].type == 'unordered' || blocks[index - 1].type == 'ordered') {
            let c = blocks[index - 1].content;
            c[c.length - 1].content.push(...c);
            id = c[c.length - 1].id;
        } else {
            blocks[index - 1].content.push(...content)
            id = blocks[index - 1].id;
        }
        setTimeout(() => {
            blocks.splice(index, 1);
            let element = document.getElementById(id.toString());
            if (element) {
                focusEnd(element);
            }
        }, 100);
    } else {
        // deleting an item in an element
        if (blocks[index].content.length != 1) {
            blocks[index].content.splice(i, 1);
        // deleted everything
        } else if (blocks[index].content.length == 1 && blocks.length == 1) {
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
            console.log(blocks[index - 1].content)
            if (index > 0) {
                setTimeout(() => {
                    let element = document.getElementById(id.toString());
                    if (element) {
                        focusEnd(element);
                    }
                }, 100);
            }
        }
    }
    blocks = [...blocks]
}

const updown = (e, index, direction) => {
    if (direction == 'up') {
        if (index == 0) return;
        let block;
        let pos = e.detail.index;
        let f = 16;
        if (blocks[index - 1].type == 'ordered' || blocks[index - 1].type == 'unordered') {
            let c = blocks[index - 1].content;
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
            if (pos >= len) {
                focusEnd(block);
            } else {
                focusEnd(block);
            }
        }
    } else if (direction == 'down') {
        if (index == blocks.length - 1) return;
        let pos = e.detail.index;
        let block;
        if (blocks[index + 1].type == 'ordered' || blocks[index + 1].type == 'unordered') {
            let c = blocks[index + 1].content;
            if (c.length < 1) return;
            block = document.getElementById(c[0].id.toString());
        } else {
            block = document.getElementById(blocks[index + 1].id.toString());
        }

        if (block) {
            let len = block.textContent.length;
            focusEnd(block)
            // TODO: fix positioning issue
            return;
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
        let block;
        if (blocks[index - 1].type == 'ordered' || blocks[index - 1].type == 'unordered') {
            let c = blocks[index - 1].content;
            if (c.length < 1) return;
            block = document.getElementById(c[c.length - 1].id.toString());
        } else {
            block = document.getElementById(blocks[index - 1].id.toString());
        }
        if (block) {
            focusEnd(block);
        }
    } else {
        if (index == blocks.length - 1) return;
        let block;
        if (blocks[index + 1].type == 'ordered' || blocks[index + 1].type == 'unordered') {
            let c = blocks[index + 1].content;
            if (c.length < 1) return;
            block = document.getElementById(c[0].id.toString());
        } else {
            block = document.getElementById(blocks[index + 1].id.toString());
        }
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
            on:enter={(e) => enterPresed(e, index, 'text')}
            on:delete={(e) => ondelete(e, index)} 
            on:up={(e) => updown(e, index, 'up')} on:down={(e) => updown(e, index, 'down')}
            on:right={(e) => leftright(index, 'right')} on:left={(e) => leftright(index, 'left')}/>
    {:else if item.type == 'h1'}
        <Paragraph id={item.id} bind:contents={item.content} fontsize=28
                on:enter={(e) => enterPresed(e, index, 'h1')}
                on:delete={(e) => ondelete(e, index)} 
                on:up={(e) => updown(e, index, 'up')} on:down={(e) => updown(e, index, 'down')}
                on:right={(e) => leftright(index, 'right')} on:left={(e) => leftright(index, 'left')}/>
    {:else if item.type == 'h2'}
        <Paragraph id={item.id} bind:contents={item.content} fontsize=24
                on:enter={(e) => enterPresed(e, index, 'h2')}
                on:delete={(e) => ondelete(e, index)} 
                on:up={(e) => updown(e, index, 'up')} on:down={(e) => updown(e, index, 'down')}
                on:right={(e) => leftright(index, 'right')} on:left={(e) => leftright(index, 'left')}/>
    {:else if item.type == 'h3'}
        <Paragraph id={item.id} bind:contents={item.content} fontsize=20
                on:enter={(e) => enterPresed(e, index, 'h3')}
                on:delete={(e) => ondelete(e, index)} 
                on:up={(e) => updown(e, index, 'up')} on:down={(e) => updown(e, index, 'down')}
                on:right={(e) => leftright(index, 'right')} on:left={(e) => leftright(index, 'left')}/>
    {:else if item.type == 'ordered'}
        <List id={item.id} bind:contents={item.content} type='ordered' 
            on:left={() => leftright(index, 'left')} on:right={() => leftright(index, 'right')} 
            on:up={(e) => updown(e, index, 'up')} on:down={(e) => updown(e, index, 'down')} 
            on:text={(e) => textEnter(e, index, 'ordered')} />
    {:else if item.type == 'unordered'}
        <List id={item.id} bind:contents={item.content} type='unordered'
            on:left={() => leftright(index, 'left')} on:right={() => leftright(index, 'right')} 
            on:up={(e) => updown(e, index, 'up')} on:down={(e) => updown(e, index, 'down')} 
            on:text={(e) => textEnter(e, index, 'unordered')}/>
    {/if}
{/each}
</div>
