<script>
import { setup } from "../utils/constants";
import {v4 as uuidv4} from 'uuid';
import Paragraph from "./Paragraph.svelte";
import { focusElement, focusEnd, focuspos, getOffset, getOffsetFromIndex, getWrapped } from "../utils/utils";
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
    focusElement(id);
}

const addElement = (e, index) => {
    const type = e.detail.type;
    let id = uuidv4();
    let id2 = uuidv4();
    blocks.splice(index + 1, 0, {
        type: type,
        id: id, 
        content: [
            {
                content: ' ',
                id: id2,
                style: {
                    'bold': false, 
                    'italics': false,
                    'underline': false,
                    'code': false,
                    'strikethrough': false,
                    'color': '#000000'
                }
            },
        ]
    })
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
    let i = e.detail.index;
    let c = blocks[index].content;
    let id = uuidv4();

    if (i == c.length - 1) {
        let [new_content] = blocks[index]['content'].splice(i, 1);
        if (blocks[index]['content'].length != 0) {
            // @ts-ignore
            blocks.splice(index + 1, 0, new_content);   
        } else {
            // @ts-ignore
            blocks.splice(index, 0, new_content);   
        }
        focusElement(new_content.id);
    } else if (i == 0) {
        let [new_content] = blocks[index]['content'].splice(0, 1);
        // @ts-ignore
        blocks.splice(index + 1, 0, new_content);
        focusElement(new_content.id);
    } else {
        let new_b = blocks[index]['content'].splice(i);
        let [new_content] = new_b.splice(0, 1);
        // @ts-ignore
        blocks.splice(index + 1, 0, new_content);
        focusElement(new_content.id);
        // @ts-ignore
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
            // @ts-ignore
            c[c.length - 1].content.push(...c);
            id = c[c.length - 1].id;
        } else {
            blocks[index - 1].content.push(...content)
            id = blocks[index - 1].id;
        }
        blocks.splice(index, 1);
        focusElement(id);
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
            if (index > 0) {
                focusElement(id);
            }
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

const shiftdown = (e, index) => {
    if (e.detail.type == 'left') {
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
            // extendSelection(block, false);
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

const makeList = (e, type, index) => {
    e.preventDefault();
    let id = uuidv4();
    let content = {...blocks[index]};
    let id2 = content.id;
    for (let i = 0; i < content.content.length; i++) {
        if (i == 0) content.content[i].content = ' ';
        else content.content[i].content = '';
    }
    if (type == 'ordered' && e.detail.start) blocks[index].start = e.detail.start;
    blocks[index].type = type;
    blocks[index].id = id;
    // @ts-ignore
    blocks[index].content = [content];
    focusElement(id2);
}

const transformElement = (e, type, index) => {
    const from = e.detail.from; 
    const to = e.detail.to; 
    const i = e.detail.i;

    if (from == 'ordered' || from == 'unordered') {
        let id = uuidv4();
        let new_b = blocks[index]['content'].splice(i);
        let [new_content] = new_b.splice(0, 1);
        new_content.type = to;
        if (to == 'h1' || to == 'h2' || to == 'h3' || to == 'text') {
            // @ts-ignore
            blocks.splice(index + 1, 0, new_content);
            focusElement(new_content.id);   
        } else {
            // @ts-ignore
            blocks.splice(index + 1, 0, {
                type: to,
                id: id, 
                // @ts-ignore
                content: [new_content]
            });
        }
        // @ts-ignore
        blocks.splice(index + 2, 0, {
            type: type,
            id: id, 
            content: new_b
        });
    } else {
        let id = uuidv4();
        let new_content = JSON.parse(JSON.stringify(blocks[index]));
        new_content.type = 'text';
        blocks[index] = {
            type: to, 
            id: id,
            content: [new_content]
        }
    }
    blocks = [...blocks]
}

</script>

<div class="px-72 pt-10" id='breh'>
{#each blocks as item, index}
    {#if item.type == 'text' || item.type == 'h1' || item.type == 'h2' || item.type == 'h3'}
        <Paragraph id={item.id} bind:contents={item.content} tab={item.tab == undefined ? 0 : item.tab}
            bind:type={item.type} on:transform={(e) => transformElement(e, item.type, index)}
            on:enter={(e) => enterPresed(e, index, 'text')}
            on:delete={(e) => ondelete(e, index)} on:tab={(e) => tab(e, index)}
            on:shift-down={(e) => shiftdown(e, index)}
            on:ordered={(e) => makeList(e, 'ordered', index)} on:unordered={(e) => makeList(e, 'unordered', index)} 
            on:up={(e) => updown(e, index, 'up')} on:down={(e) => updown(e, index, 'down')}
            on:action={(e) => actionController(e, index)} on:add={(e) => addElement(e, index)}
            on:right={(e) => leftright(index, 'right')} on:left={(e) => leftright(index, 'left')} />
    {:else if item.type == 'ordered'}
        <List id={item.id} bind:contents={item.content} type='ordered' start={item.start} tab={item.tab == undefined ? 0 : item.tab}
            on:left={() => leftright(index, 'left')} on:right={(e) => leftright(index, 'right')} 
            on:up={(e) => updown(e, index, 'up')} on:down={(e) => updown(e, index, 'down')} 
            on:transform={(e) => transformElement(e, item.type, index)}
            on:text={(e) => textEnter(e, index, 'ordered')} />
    {:else if item.type == 'unordered'}
        <List id={item.id} bind:contents={item.content} type='unordered' tab={item.tab == undefined ? 0 : item.tab}
            on:left={() => leftright(index, 'left')} on:right={(e) => leftright(index, 'right')} 
            on:up={(e) => updown(e, index, 'up')} on:down={(e) => updown(e, index, 'down')} 
            on:transform={(e) => transformElement(e, item.type, index)}
            on:text={(e) => textEnter(e, index, 'unordered')} />
    {/if}
{/each}
</div>
