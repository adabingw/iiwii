<script>
import { createEventDispatcher } from 'svelte';
import { clickOutside } from './utils.js';
import { MENU } from './constants';

export let id;
export let selected = false;
export let selText = '';
let top;
let left;
let bottom;
let showMenu = false;
let index;
let item = [];
let style = "";

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

export const onPageClick = (e) => {
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

export const openMenu = (top_, left_, bottom_) => {
    showMenu = false;
    top = top_;
    left = left_;
    bottom = bottom_;
    if (bottom > 250) {
        style = `position: absolute; top:${top + 15}px; left:${left}px; z-index: 1;`
    } else {
        style = `position: absolute; bottom:${window.innerHeight - top + 5}px; left:${left}px; z-index: 1;`
    }
    showMenu = true;
    let body = document.getElementById('homepage');
    if (body) body.style.overflowY = 'hidden';
}

$: {
    selText;
    let filtered = []
    console.log(selText);
    for (const item of MENU) {
        for (const i of item.items) {
            if (i.displayText.toLowerCase().includes(selText)) {
                filtered.push(i.displayText);
            }
        }
    }
    if (filtered.length == 0) {
        dispatch('empty')
    }
}

</script>

{#if showMenu}
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->  
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div style={style} class:show={showMenu} use:clickOutside on:click_outside={onPageClick}>
    <div class={`navbar`} id="navbar">
        <ul>
            {#each MENU as item, index}
                {#if item.items}
                {#each item.items as i}
                {#if i.displayText.toLowerCase().includes(selText.toLowerCase())}
                    <li on:click={() => menuClick(item.name, i.name)}>
                        <i class={`${i.class}`}></i>
                        {i.displayText}
                    </li>
                {/if}
                {/each}
                {/if}
            {/each}
        </ul>
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
    flex-direction: column;
}

.navbar ul{
    margin: 6px;
}

ul li {
    display: block;
    list-style-type: none;
    width: 1fr;
}

ul li {
    color: #222;
    width: 100%;
    height: 30px;
    text-align: left;
    border: 0px;
    background-color: #fff;
    padding-top: 3px;
    padding-right: 8px;
}

ul li:hover{
    color: #000;
    cursor: pointer;
    text-align: left;
    border-radius: 5px;
    background-color: #eee;
}

ul li i{
    padding: 0px 15px 0px 10px;
    margin-right: 8px;
}

i {
    width: 15px;
}
</style>
