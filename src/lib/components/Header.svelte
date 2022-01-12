<script lang="ts">
    import Navigation from './Navigation.svelte'
    import NavBar from './NavBar.svelte'
    let isNavOpened = false

    function toggleNav() {
        isNavOpened = !isNavOpened
    }
</script>

<header class="w-full">
    <NavBar />

    {#if isNavOpened}
        <Navigation {toggleNav} />
    {/if}
    <button on:click={toggleNav}>
        Menu
    </button>
    <slot/>
</header>
