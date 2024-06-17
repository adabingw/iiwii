<script>
    import { createEventDispatcher } from "svelte";
    import { fade } from "svelte/transition";
  
    const dispatch = createEventDispatcher();
  
    export let type = "error";
    export let dismissible = true;
</script>
  
<article class={type} role="alert" transition:fade>
    {#if type === "success"}
        <i class="fa-solid fa-carrot"></i>
    {:else if type === "error"}
        <i class="fa-solid fa-bomb"></i>
    {:else}
        <i class="fa-solid fa-ghost"></i>
    {/if}
  
    <div class="text">
      <slot />
    </div>
  
    {#if dismissible}
      <button class="close" on:click={() => dispatch("dismiss")}>
        <i class="fa-solid fa-xmark"></i>
      </button>
    {/if}
</article>
  
<style lang="postcss">
    article {
      color: #414141;
      padding: 0.75rem 1.5rem;
      border-radius: 0.2rem;
      display: flex;
      align-items: center;
      margin: 0 auto 0.5rem auto;
      width: 20rem;
    }
    .error {
      background: #d6aba3;
    }
    .success {
      background: #b4d4bd;
    }
    .info {
      background: #e8e8e8;
    }
    .text {
      margin-left: 1rem;
    }
    button {
      color: #414141;
      background: transparent;
      border: 0 none;
      padding: 0;
      margin: 0 0 0 auto;
      line-height: 1;
      font-size: 1rem;
    }
</style>
  