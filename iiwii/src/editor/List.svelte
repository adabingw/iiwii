<script>

import { createEventDispatcher, onMount } from 'svelte';
import { focuspos, getWrapped, focusEnd, getOffsetFromIndex, focusElement } from '../utils/utils';
import {v4 as uuidv4} from 'uuid';
import Paragraph from './Paragraph.svelte';

export let contents = [];
export let id;
export let type;
export let start = 1;
export let tab = 0;
export let canIndent;

const dispatch = createEventDispatcher();

const enterPresed = (e, index) => {
    const element = document.getElementById(contents[index].id);
    if (element) {
        if (element.textContent.trimEnd().length == 0) {
            dispatch('text', {
                index: index
            });
            return;
        }
    }
    const id = uuidv4();
    const bs = e.detail.blocks;
    contents.splice(index + 1, 0, {
        type: 'text',
        id: id, 
        content: bs
    })
    contents = [...contents];    
    focusElement(id);
}

const canIndentFunc = (index) => {
    if (contents[index].tab == tab + 4) return false;
    return true;
}

const updateTab = (e, index) => {
    const direction = e.detail.direction;
    // want to merge indented list at index i back in
    if (tab > 0 && direction == -1) {
        dispatch('untab', { index: index });
        return;
    } else if (direction == 1 && tab > 0) {
        // more than one indent -> we want to see if we are able to indent
        if (tab == 12) return; // deepest indent
        if (canIndent && !canIndent(index)) return;
    }

    const content = JSON.parse(JSON.stringify(contents[index]));
    const id = uuidv4();

    let merged = false;
    contents[index].tab = contents[index].tab ? contents[index].tab + 4 : tab + 4; 
    if (index != 0) {
        if (contents[index - 1].tab == contents[index].tab && contents[index - 1].type != 'text') {
            contents[index - 1].content.push(content);
            merged = true;
        }
    }

    if (index != contents.length - 1) {
        if (contents[index + 1].tab == contents[index].tab && contents[index + 1].type != 'text') {
            if (merged) {
                contents[index - 1].content.push(...contents[index + 1].content);
                contents.splice(index + 1, 1);
            } else {
                contents[index + 1].content.splice(0, 0, content);
                merged = true;
            }
        }
    }

    const id2 = content.id;
    if (merged) {
        contents.splice(index, 1)
    } else {
        contents[index].type = type;
        contents[index].id = id;
        contents[index].tab = tab + 4;

        // @ts-ignore
        contents[index].content = [content];
    }
    focusElement(id2);
    contents = [...contents]
}

const deleteTab = (i, index) => {
    const content = contents.splice(index, 1)[0];
    if (content.tab == 0) return;
    // @ts-ignore
    if (content.length == 1) {
        contents[0].content.splice(index, 0, content.content[0])
    } else {
        let line = content.content.splice(i, 1)[0];
        if (i == 0) {
            contents.splice(index, 0, line)
            contents.splice(index + 1, 0, content)
        } else if (i == content.content.length) {
            contents.splice(index, 0, content)
            contents.splice(index + 1, 0, line)
        } else {
            const id2 = uuidv4();
            const pre = content.content.splice(0, i);
            contents.splice(index, 0, {
                id: id2, 
                type: content.type, 
                tab: content.tab, 
                content: [ ...pre ]
            })
            line.tab = line.tab ? line.tab - 4 : tab - 4;
            contents.splice(index + 1, 0, line);
            contents.splice(index + 2, 0, content);
        }
    }
    contents = [...contents]
}

const ontext = (e, index) => {
    // if this function gets called, it means there's a nested list at index that wants to delete
    // if we're deleting from front of a list item
    // and the list is in an indented list
    // then we should add a paragraph
    /**
     *      1. text
     *      text
     *      1. text
    */
    // should break up list

    // currently doesn't handle this
    // future feature? if i figure out how to encapsulate the functions in Editor

    // right now just append previous
    deleteTab(e.detail.index, index);
}

const onindent = (e, index) => {
    // paragraph at index wants to indent
    // should merge it to above/below list
}

const makelist = (e, index) => {
    // paragraph at index wants to make list
}

const ondelete = (e, index) => {
    const element = document.getElementById(contents[index].id);
    const context = e.detail.text;
    if (element) {
        const text = element.textContent;
        if (text.trimEnd().length == 0 || context) {
            if (tab) {
                // indented list delete -> just append to previous
                if (contents.length > 1 && index != 0) {
                    contents[index - 1].content.push(...context);
                    contents.splice(index, 1);
                    contents = [...contents]
                } else if (contents.length == 1 || index == 0) {
                    // merge into prev indent list
                    dispatch('text', {
                        index: index,
                    });
                }
                return;
            } else {
                dispatch('text', {
                    index: index,
                });
                return;
            }
        }
    }
    const i = parseInt(e.detail.index);
    if (contents[index].content.length != 1) {
        contents[index].content.splice(i, 1);
    } else if (contents[index].content.length == 1 && contents.length == 1) {
        contents[index]['content'][0]['content'] = ' ';
    } else if (contents[index].content.length == 1 && contents.length > 1) {
        contents.splice(index, 1)
        if (index > 0) {
            const block = contents[index - 1]
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
        const block = document.getElementById(contents[index - 1].id.toString());
        const wrap = getWrapped(block, 16)
    
        if (block) {
            if (wrap.length > 1) {
                pos = getOffsetFromIndex(pos, wrap);
            }
            if (pos >= block.textContent.length) {
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
        const pos = e.detail.index;
        const block = document.getElementById(contents[index + 1].id.toString());
        if (block) {
            if (pos > block.textContent.length) {
                focusEnd(block);
            } else {
                focuspos(block, pos);
            }
        }
    }
}

const leftright = (index, direction) => {
    if (direction == 'left') {
        if (index == 0) {
            dispatch('left');
            return;
        }
        const block = document.getElementById(contents[index - 1].id.toString());
        if (block) {
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
{#if type == 'ordered'}
<ol class='list-decimal list-outside' start={start && start != 0 ? start : 1}>
    {#each contents as line, index}
    {#if line.type == 'ordered'}
        <svelte:self id={line.id} bind:contents={line.content} type='ordered' start={line.start} tab={line.tab}
            canIndent={() => canIndentFunc(index)}
            on:left={() => leftright(index, 'left')} on:right={(e) => leftright(index, 'right')} 
            on:up={(e) => updown(e, index, 'up')} on:down={(e) => updown(e, index, 'down')} 
            on:untab={(e) => deleteTab(e.detail.index, index)} 
            on:text={(e) => ontext(e, index)}
            on:transform={(e) => transformElement(e, index)} />
    {:else if line.type == 'text'}
        <Paragraph id={line.id} bind:contents={line.content} type='ordered' tab={tab}
            on:transform={(e) => transformElement(e, index)}
            on:enter={(e) => enterPresed(e, index)}
            on:action={(e) => actionController(e, index)} 
            on:delete={(e) => ondelete(e, index)} on:tab={(e) => updateTab(e, index)}
            on:up={(e) => updown(e, index, 'up')} on:down={(e) => updown(e, index, 'down')}
            on:right={(e) => leftright(index, 'right')} on:left={(e) => leftright(index, 'left')}/>
    {/if}
    {/each}
</ol>
{:else}
<ul class='list-disc list-outside'>
    {#each contents as line, index}
        <Paragraph id={line.id} bind:contents={line.content} type='unordered' tab={tab}
            on:transform={(e) => transformElement(e, index)}
            on:enter={(e) => enterPresed(e, index)}
            on:action={(e) => actionController(e, index)} 
            on:delete={(e) => ondelete(e, index)} 
            on:up={(e) => updown(e, index, 'up')} on:down={(e) => updown(e, index, 'down')}
            on:right={(e) => leftright(index, 'right')} on:left={(e) => leftright(index, 'left')}/>
    {/each}
</ul>
{/if}
    

<style>


</style>
