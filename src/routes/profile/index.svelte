<script lang="ts" context="module">
    import {from} from '$lib/supabase'
    import { API_AUTH, ROUTE_HOME } from '$lib/constants'

    export async function load({ fetch, session }) {
        // const res = await fetch(API_AUTH);
        // if (!res.ok) return {
        //     status: res.status,
        //     error: new Error(`Could not load ${API_AUTH}`)
        // };            

        // const { user } = await res.json(); 
        const { user } = session
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
    import Config from '$lib/components/Config.svelte'
    import Spinner from '$lib/components/Spinner.svelte'
    import RemoveLink from '$lib/components/RemoveLink.svelte'
    import CreatePost from '$lib/components/CreatePost.svelte'

    export let profile
    export let user
    let loading = false
    let link = ''
    let links = []

    $: console.log(profile)
    $: links = profile.links.reverse()

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
    async function updateLink(){

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
        }
        link = ''
    }



    async function createPost(){
        if (!profile.telegraph_account) {
            const res = await fetch(`https://api.telegra.ph/getPage/${path}`,{mode:'cors'})
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
                <input
                name="title"
                type="text"
                class="w-full text-2xl text-center font-semibold"
                placeholder="Title"
                required
                bind:value={profile.title}
                on:change={updProfile}
                />
            </div>
        </div>
<!--         <div class="text-center">
    		<button class="btn btn-outline" on:click={updProfile}>
                Save
            </button>
        </div> -->
</div>
{#if profile.id}
<div class="flex items-center py-4 max-w-screen-sm mx-auto ">
    <div class="flex grow">
        <input
            name="title"
            type="text"
            class=" text-lg w-full input input-bordered rounded-r-none focus:ring-0 focus:border-gray-500 border-r-0"
            placeholder="Type the blog post URL"
            required
            bind:value={link}
            on:change={addLink}
        /> 
        <button class="btn rounded-l-none btn-outline">
            <Spinner class="text-gray-600 mr-2" />
            Add
        </button>
    </div>
<!--     <button class="btn ml-2">
        <span class="sm:hidden">+</span>
        <span class="hidden sm:inline">Create Post</span>
    </button> -->
</div>

<div class="py-8 max-w-screen-sm mx-auto space-y-10">
    {#each links as {id, data:link}, index}
    <div>
        <a href="/post/{link.path}" class="flex items-center">
            <div class="grow">
                <h3 class="text-lg sm:text-xl font-bold">{link.title}</h3>
                <p class="sm:text-lg mt-2 line-clamp-3 text-gray-600">{link.description}</p>
            </div>
            {#if link.image_url}
                <div class="w-1/3 shrink-0 ml-6">
                    <figure class="aspect-w-4 aspect-h-3">
                        <img alt="{link.title}" src="{link.image_url}" class="w-full h-full object-center object-cover ">
                    </figure>
                </div>
            {/if}
        </a>
        <div>
            <RemoveLink id={link.id} {links} />
        </div>
    </div>
            
    {/each}
    
</div>
{/if}

