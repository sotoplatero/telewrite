<script>
	import {from} from '$lib/supabase'

	export let id
	export let links = []
	let deleting = false

    async function removeLink(){
    	try {
	    	deleting = true
	        const { data, error } = await from('links').delete().match({ id })

	        if (!error) throw error

            links = links.filter(el=>el.id!==id)

    	} catch(error) {
    		console.log(error)
    	} finally {
	    	deleting = false
    	}
    }	
</script>

<button on:click={removeLink} class="uppercase text-sm text-gray-500 hover:text-red-600">
	{#if deleting}
		<Spinner class="mr-2" />
	{/if}
	Remove
</button>