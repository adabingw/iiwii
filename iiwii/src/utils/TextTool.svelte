<script>
import { createEventDispatcher } from 'svelte';
import { clickOutside } from './utils.js';
import { TOOL } from './constants';
import ContextMenu from './ContextMenu.svelte';
import { tooltip } from "@svelte-plugins/tooltips";
import ColorPicker from 'svelte-awesome-color-picker';
import Wrapper from './Wrapper.svelte';
import { dark } from './store.js';
  import { adjustBrightnessToDark, adjustBrightnessToLight } from './colors.js';

export let id;
export let selected;
export let textStyle = undefined;

let top;
let left;
let bottom;
let showMenu = false;
let index;
let range;
let menu;
let turninto = false;
let style = "";
let firstShown = false;
let darkMode = false;
const subscribe = dark.subscribe((value) => darkMode = value)
const dispatch = createEventDispatcher();

const returnPage = () => {
    showMenu = false; 
    let body = document.getElementById('homepage');
    if (body) body.style.overflowY = 'auto';
    selected = false;
    let icons = document.getElementsByClassName('fa-plus');
    for (const icon of icons) {
        // @ts-ignore
        icon.style.visibility = 'visible';
    }
}

const menuClick = (context, subcontext, value) => {
    if (subcontext != 'color') returnPage();

    if (subcontext == 'color') {
        if (value == (textStyle && textStyle.color ? textStyle.color : '#000000')) {
            return;
        }
    }

    if (context == 'elements') {
        dispatch('tool', {
            context: context,
            subcontext: subcontext,
            elements: index,
            range: range,
            value: subcontext == 'color' ? value : value == 'true'
        })
        onPageClick();
    }
}

const dropdown = (e) => {
    if (turninto) {
        menu.onPageClick(e);
        turninto = false;
    } else {
        let element = document.getElementById('navbar');
        if (element) {
            const rect = element.getBoundingClientRect();
            let icons = document.getElementsByClassName('fa-plus');
            for (const icon of icons) {
                // @ts-ignore
                icon.style.visibility = 'hidden';
            }
            menu.openMenu(rect.bottom - rect.top - 10, 0, rect.bottom);
        }
        turninto = true;
    }
}

export const onPageClick = (e) => {
    if (firstShown) {
        firstShown = false;
        return;
    }
    // e.preventDefault();
    // e.stopPropagation();
    selected = false;
    returnPage();
    dispatch('close')
}

export const openMenu = (top_, left_, bottom_, textStyle_, index_, range_, flagFirst = false) => {
    firstShown = flagFirst;
    index = index_;
    range = range_;
    textStyle = textStyle_;
    showMenu = false;
    top = top_;
    left = left_;
    bottom = bottom_;
    if (top < 250) {
        style = `position: absolute; top:${bottom + 10}px; left:${left}px; z-index: 1;`
    } else {
        style = `position: absolute; bottom:${window.innerHeight - top + 15}px; left:${left}px; z-index: 1;`
    }
    showMenu = true;
    let body = document.getElementById('homepage');
    if (body) body.style.overflowY = 'hidden';
}

const contextController = (e) => {
    let subcontext = e.detail.subcontext;
    dispatch('tool', {
        context: 'transform',
        subcontext: subcontext
    });
    returnPage();
}

</script>

{#if showMenu}
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->  
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div style={style} class:show={showMenu} use:clickOutside on:click_outside={onPageClick}>
    <ContextMenu bind:this={menu} id={id} on:context={(e) => contextController(e)}/>
    <div class={`navbar navbar-${darkMode ? 'dark' : 'light'} overflow-hidden`} id="navbar">
            {#each TOOL as item, index}
                {#if item.items}
                    {#each item.items as i}
                        <span on:click={() => menuClick(item.name, i.name, textStyle && textStyle[i.name] ? !textStyle[i.name] : 'true')}
                            class={textStyle && textStyle[i.name] ? 'in-use' : ''}
                            use:tooltip={{
                                content: `${i.displayText} (${i.shortcut})`,
                                // @ts-ignore
                                style: { backgroundColor: '#515151', color: '#ffffff', padding: '5px 5px 5px 5px' },
                                position: `top`,
                                animation: 'slide',
                                arrow: false
                            }}>
                            <i class={`${i.class}`}></i>
                        </span>
                    {/each}
                {:else if item.name == 'color'}
                    <span class={`pt-3 overflow-hidden`}>
                        <ColorPicker
                            on:input={(e) => {
                                menuClick('elements', 'color', e.detail.hex);
                            }}
                            components={{wrapper: Wrapper}}
                            label={textStyle && textStyle[item.name] ? darkMode ? adjustBrightnessToDark(textStyle[item.name]) : textStyle[item.name] : darkMode ? '#ffffff' : '#000000'}
                            hex={textStyle && textStyle[item.name] ? darkMode ? adjustBrightnessToDark(textStyle[item.name]) : textStyle[item.name] : darkMode ? '#ffffff' : '#000000'}
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
    <span id="colour" class={`${darkMode ? 'dark' : 'light'}`}>
                        
    </span>
</div>
{/if}

<style>
* {
    padding: 0;
    margin: 0;
}

.navbar-dark {
    background-color: #333;
    overflow: hidden;
    color: #fff;
    border: 1px #616161 solid;
    border-radius: 5px;
    --cp-bg-color: #333;
    --cp-border-color: #333;
    --cp-text-color: white;
    --cp-input-color: #555;
    --cp-button-hover-color: #333;
}

.navbar-light {
    border: 1px #c9c9c9 solid;
    overflow: hidden;
    background-color: #fff;
    border-radius: 5px;
    color: #000;
}

#colour {
    margin-top: 10px;
}

.navbar {
    display: inline-flex;
    width: fit-content;
    height: 50px;
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

.navbar-light span:hover {
    cursor: pointer;
    background-color: #e9e9e9;
    border-radius: 3px;
}

.navbar-dark span:hover {
    cursor: pointer;
    background-color: #616161;
    border-radius: 3px;
}

.navbar-light .in-use {
    cursor: pointer;
    background-color: #e9e9e9;
    border-radius: 3px;
}

.navbar-dark .in-use {
    cursor: pointer;
    background-color: #616161;
    border-radius: 3px;
}

i {
    width: 15px;
}

.fa-arrow-right-arrow-left {
    margin-right: 8px;
}
</style>
    