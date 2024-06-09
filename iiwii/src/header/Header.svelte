<script>
import Light from '../utils/assets/LIGHT.svelte'
import Dark from '../utils/assets/DARK.svelte';
import { dark } from '../utils/store';
let expand = false;

let darkMode = false;
const subscribe = dark.subscribe((value) => darkMode = value)

</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->    
<div class={`absolute top-2.5 left-3.5 ${darkMode ? 'darktext' : 'lighttext'}`}>
    {#if expand}
        <i class="fa-solid fa-minus" on:click={() => expand = false}></i>
    {:else}
        <i class="fa-solid fa-plus" on:click={() => expand = true}></i>
    {/if}
    <div class={`dropdown ${expand ? 'expand' : ''}`}>
        <div class={`mt-3 ml-1 flex flex-row cursor-pointer item-${darkMode ? 'dark' : 'light'} px-2 py-1 rounded-md`}
            on:click={() => dark.set(!darkMode)}>
            <div class="w-10">
            {#if !darkMode}
                <Dark /> 
            {:else}
                <Light />
            {/if}
            </div>
            Switch themes
        </div>
        <a href="https://github.com/adabingw/iiwii" target="_blank">
        <div class={`mt-3 ml-1 flex flex-row cursor-pointer item-${darkMode ? 'dark' : 'light'} px-2 py-1 rounded-md`}>
            <div class="w-10">
                <i class="fa-brands fa-github fa-lg"></i>
            </div>
            Github
        </div>
        </a> 
    </div>
</div>

<style>
.darktext {
    color: #f8f8f8 !important;
}

.lighttext {
    color: #2e3036 !important;
}

i:hover {
    cursor: pointer;
}

.item-dark:hover {
    background-color: #4f5157;
}

.item-light:hover {
    background-color: #e8e4da;
}

.dropdown {
    transition: all 0.5s ease;
    height: 0;
    overflow: hidden;
    opacity: 0;
}

.dropdown.expand {
    height: 100px; /* Adjust based on content size */
    opacity: 1;
}
</style>
