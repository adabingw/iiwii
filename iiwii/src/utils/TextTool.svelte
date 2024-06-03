<script>
import { createEventDispatcher } from 'svelte';
import { clickOutside } from './utils.js';
import { TOOL } from './constants';
import ContextMenu from './ContextMenu.svelte';
import { tooltip } from "@svelte-plugins/tooltips";
import ColorPicker from 'svelte-awesome-color-picker';

export let id;
export let selected;
export let textStyle = undefined;
let top;
let left;
let bottom;
let showMenu = false;
let index;
let menu;
let item = [];
let turninto = false;
let style = "";
let firstShown = false;

const dispatch = createEventDispatcher();

const menuClick = (context, subcontext) => {
    showMenu = false; 
    let body = document.getElementById('homepage');
    if (body) body.style.overflowY = 'auto';
    selected = false;
    let icons = document.getElementsByClassName('fa-plus');
    for (const icon of icons) {
        icon.style.visibility = 'visible';
    }
    dispatch('context', {
        context: context,
        subcontext: subcontext,
        index: index, 
        item: item
    })
}

const dropdown = (e) => {
    if (turninto) {
        menu.onPageClick(e);
        turninto = false;
    } else {
        let element = document.getElementById('navbar');
        if (element) {
            const rect = element.getBoundingClientRect();
            let top = rect.top;
            let bottom = rect.bottom;
            let left = rect.left;
            let icons = document.getElementsByClassName('fa-plus');
            for (const icon of icons) {
                icon.style.visibility = 'hidden';
            }
            menu.openMenu(bottom - top - 10, 0, bottom);
        }
        turninto = true;
    }
}

export const onPageClick = (e) => {
    if (firstShown) {
        firstShown = false;
        return;
    }
    e.preventDefault();
    e.stopPropagation();
    showMenu = false;
    selected = false;
    let body = document.getElementById('homepage');
    if (body) body.style.overflowY = 'auto';
    let icons = document.getElementsByClassName('fa-plus');
    for (const icon of icons) {
        icon.style.visibility = 'visible';
    }
    dispatch('close')
}

export const openMenu = (top_, left_, bottom_, textStyle_, flagFirst = false) => {
    firstShown = flagFirst;
    textStyle = textStyle_;
    showMenu = false;
    top = top_;
    left = left_;
    bottom = bottom_;
    // if (bottom > 200) {
    //     style = `position: absolute; top:${bottom + 5}px; left:${left}px; z-index: 1;`
    // } else {
    //     style = `position: absolute; bottom:${window.innerHeight - top + 5}px; left:${left}px; z-index: 1;`
    // }
    if (top < 250) {
        style = `position: absolute; top:${top + 30}px; left:${left}px; z-index: 1;`
    } else {
        style = `position: absolute; bottom:${window.innerHeight - bottom + 25}px; left:${left}px; z-index: 1;`
    }
    showMenu = true;
    let body = document.getElementById('homepage');
    if (body) body.style.overflowY = 'hidden';
}

</script>

{#if showMenu}
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->  
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div style={style} class:show={showMenu} use:clickOutside on:click_outside={onPageClick}>
    <ContextMenu bind:this={menu} id={id} />
    <div class={`navbar`} id="navbar">
            {#each TOOL as item, index}
                {#if item.items}
                    {#each item.items as i}
                        <span on:click={() => menuClick(item.name, i.name)}
                            class={textStyle && textStyle[i.name] ? 'in-use' : ''}
                            use:tooltip={{
                                content: `${i.displayText}`,
                                style: { backgroundColor: '#515151', color: '#ffffff', padding: '5px 5px 5px 5px' },
                                position: `top`,
                                animation: 'slide',
                                arrow: false
                            }}>
                            <i class={`${i.class}`}></i>
                        </span>
                    {/each}
                {:else if item.name == 'color'}
                    <span class="pt-3">
                        <ColorPicker
                            --picker-z-index="9999"
                            label={textStyle && textStyle[item.name] ? textStyle[item.name] : '#000000'}
                            hex={textStyle && textStyle[item.name] ? textStyle[item.name] : '#000000'}
                        />
                    </span>
                {:else}
                    <span on:click={(e) => dropdown(e)}>
                        <i class={`${item.class}`}></i>
                        {item.displayText}
                    </span>
                {/if}
            {/each}
    </div>
</div>
{/if}

<style>
* {
    padding: 0;
    margin: 0;
}

.navbar{
    display: inline-flex;
    border: 1px #999 solid;
    width: fit-content;
    background-color: #fff;
    border-radius: 5px;
    overflow: hidden;
    flex-direction: row;
    padding-left: 8px;
    padding-right: 8px;
}

.navbar span {
    margin: 6px;
    padding: 5px;
    min-width: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.navbar span:hover {
    cursor: pointer;
    background-color: #e9e9e9;
    border-radius: 3px;
}

.in-use {
    cursor: pointer;
    background-color: #e9e9e9;
    border-radius: 3px;
}

i {
    width: 15px;
}

.fa-arrow-right-arrow-left {
    margin-right: 8px;
}
</style>
    