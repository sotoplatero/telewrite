<script lang="ts">
    import { page } from '$app/stores'
    import { signOut } from '$lib/user'
    import { user } from '$lib/user'
</script>
<nav class="h-14 bg-white w-screen mx-auto max-w-7xl px-2 sm:px-6 lg:px-8" >
    <ul class="list-none h-full flex items-center justify-end gap-3">
        {#if $user}
<!--             <li class="nav__item">
                <a rel="prefetch" href="/settings" class:active={$page.url.pathname === '/settings'}>
					<i class="ion-gear-a" />
				</a>
            </li> -->
<!--             <li class="nav__item">
                <a href="/profile">
                    <img class="w-7 h-7 rounded-full" src="https://unavatar.io/{$user.email}" alt="avatar">
                </a>
            </li> -->
            <button class="text-gray-500 hover:text-gray-700" on:click={() => signOut()}>Sign Out</button>
        {:else}
            <li class="nav__item">
                <a rel="prefetch" href="/auth" title="Sign In">
                    Sign In
                </a>
            </li>
            <li class="nav__item">
                <a rel="prefetch" href="/auth?reg=true" title="Sign Up">
                    Sign Up
                </a>
            </li>
        {/if}
    </ul>
</nav>

