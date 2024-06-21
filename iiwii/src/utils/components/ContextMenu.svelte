<script>
import { createEventDispatcher } from 'svelte';
import { clickOutside } from '../scripts/utils.js';
import { dark, menuState } from '../store.js';

export let id;
export let selected = false;
export let selText = '';
export let menu = [];
let top;
let left;
let bottom;
let showMenu = false;
let style = "";
let darkMode = false;
const subscribe = dark.subscribe((value) => darkMode = value);
const dispatch = createEventDispatcher();

const menuClick = (context, subcontext) => {
    returnPage();
    dispatch('context', {
        context: context,
        subcontext: subcontext
    })
}

const returnPage = () => {
    showMenu = false; 
    let body = document.getElementById('homepage');
    if (body) body.style.overflowY = 'auto';
    selected = false;
    menuState.set(false);
    let icons = document.getElementsByClassName('icons');
    for (const icon of icons) {
        // @ts-ignore
        icon.style.visibility = 'visible';
    }
}

export const onPageClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    returnPage();
    dispatch('close')
}

export const openMenu = (top_, left_, bottom_) => {
    showMenu = false;
    top = top_;
    left = left_;
    bottom = bottom_;
    if (top < 300) {
        style = `position: absolute; top:${top + 30}px; left:${left}px; z-index: 1;`
    } else {
        style = `position: absolute; bottom:${window.innerHeight - bottom + 25}px; left:${left}px; z-index: 1;`
    }
    showMenu = true;
    menuState.set(true);
}

$: {
    selText;
    let filtered = []
    for (const item of menu) {
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
    <div class={`navbar navbar-${darkMode ? 'dark' : 'light'}`} id="navbar">
        <ul>
            {#each menu as item, index}
                {#if item.items}
                {#each item.items as i}
                {#if i.displayText.toLowerCase().includes(selText.toLowerCase())}
                    <li on:click={() => {
                        if (i.unavailable) return;
                        menuClick(item.name, i.name);
                    }}>
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

.navbar {
    display: inline-flex;
    width: fit-content;
    border-radius: 5px;
    overflow: hidden;
    flex-direction: column;
}

.navbar-dark {
    border: 1px #616161 solid;
    background-color: #333;
}

.navbar-light {
    border: 1px #999 solid;
    background-color: #fff;
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
    width: 100%;
    height: 30px;
    text-align: left;
    border: 0px;
    padding-top: 3px;
    padding-right: 8px;
    cursor: pointer;
    text-align: left;
    border-radius: 5px;
}

.navbar-light ul li {
    color: #222;
    background-color: #fff;
}

.navbar-dark ul li {
    color: #fff;
    background-color: #333;
}

.navbar-light ul li:hover{
    color: #000;
    background-color: #eee;
}

.navbar-dark ul li:hover{
    color: #fff;
    background-color: #616161;
}

ul li i{
    padding: 0px 15px 0px 10px;
    margin-right: 8px;
}

i {
    width: 15px;
}
</style>
