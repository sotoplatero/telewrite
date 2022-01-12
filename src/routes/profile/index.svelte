<script lang="ts" context="module">
    import {from} from '$lib/supabase'
    import { API_AUTH, ROUTE_HOME } from '$lib/constants'

    export async function load({ fetch, session }) {
        const res = await fetch(API_AUTH);
        if (!res.ok) return {
            status: res.status,
            error: new Error(`Could not load ${API_AUTH}`)
        };            

        const { user } = await res.json(); 
        // const { user } = session
        if (user?.guest) return {
            redirect:  ROUTE_HOME,
            status: 302
        }

        let { data: profile, error } = await from('profiles')
            .select('*, links(*)')
            .eq('user_id',user.id)
            .single()

        profile = profile || { 
            title: '',
            bio: '',
            user_id: user.id,
            avatar_url: ''
        }

        return {
            props: {
                user, profile
            }
        };
    }
</script>

<script lang="ts">
    import { onMount } from 'svelte'
    import type{ ProfileAttrs } from '$lib/user'
    import { handleAlert } from '$lib/alert'
    import Seo from '$lib/components/SEO.svelte'
    import Avatar from '$lib/components/Avatar.svelte'

    export let profile
    export let user
    let loading = false
    let link = ''
    let links = []

    $: console.log(profile)

    async function updProfile() {
        loading = true
        try {
            // await from('profiles').select('slug').like('slug',profile.title)
            let { 
                data: profileDB, 
                error: updateError 
            } = await from('profiles').insert(profile)

            if (updateError) throw updateError
            profile = profileDB
            // profile.update((profile) => ({ ...profile }))

        } catch (error) {
            handleAlert({ type: 'error', text: error.message })
        } finally {
            loading = false
        }
    }

    async function addLink(){
        const path = link.match(/telegra.ph\/(.+)/)[1]
        const res = await fetch(`https://api.telegra.ph/getPage/${path}`,{mode:'cors'})
        const { result: data } = await res.json()
        if (data) {
            const { data: [linkdDB], error } = await from('links').upsert({
                link, profile_id: profile.id, data
            },{ onConflict: 'link, profile_id' })
            profile = {...profile, links: [ ...profile.links, linkdDB]}
            console.log(profile)
        }
        link = ''
    }
    async function removeLink(id){
        console.log(id)
        const { data, error } = await from('links').delete().match({ id })
        console.log(data)
        if (!error) {
            const links = profile.links.filter(el=>el.id!==id)
            profile = {...profile, links}
        }
    }
</script>
<Seo title="Profile"/>

<div class="flex flex-col justify-center items-center relative">
    <div class="p-2 flex flex-col place-items-center">
        <div class="mt-2">
            <Avatar bind:src={profile.avatar_url} email={user.email}/>
        </div>
    </div>
</div>

<div class="max-w-sm mx-auto">
    
        <div class="">
            <div class="mb-4">
                <!-- <label for="title" class="label">Title</label> -->
                <input
                name="title"
                type="text"
                class="w-full text-2xl text-center font-semibold"
                placeholder="Title"
                required
                bind:value={profile.title}
                />
            </div>
<!--             <div class="mb-4">
                <label for="website" class="label">Website</label>
                <input
                id="website"
                name="website"
                type="website"
                class="input input-bordered w-full"
                placeholder="Your website"
                bind:value={profileState.website}
                />
            </div> -->
        </div>
        <div class="text-center">
    		<button class="btn btn-outline" on:click={updProfile}>
                Save
            </button>
        </div>

</div>
{#if profile.id}
<div class="mt-10 max-w-screen-sm mx-auto">
    <input
        name="title"
        type="text"
        class="w-full text-xl text-center pb-2 border-b"
        placeholder="Type the blog post URL"
        required
        bind:value={link}
        on:change={addLink}
    />            
</div>

<div class="mt-10 max-w-screen-sm mx-auto space-y-10">
    {#each profile.links as {id, data:link}, index}
    <div>
        <a href="{link.url}" class="flex">
            <div class="w-1/3 flex-none mr-6">
                <figure class="aspect-w-4 aspect-h-3">
                    <img alet="{link.title}" src="{link.image_url}" class="w-full h-full object-center object-cover ">
                </figure>
            </div>
            <div>
                <h3 class="text-xl font-bold">{link.title}</h3>
                <p class="text-lg mt-2 line-clamp-3 text-gray-600">{link.description}</p>
            </div>
        </a>
        <div>
            <button on:click={removeLink(id)}>X</button>
        </div>
    </div>
            
    {/each}
    
</div>
{/if}

