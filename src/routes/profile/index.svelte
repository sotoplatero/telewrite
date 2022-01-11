<script lang="ts" context="module">
    import {from} from '$lib/supabase'
    import { API_AUTH, ROUTE_HOME } from '$lib/constants'

    function response(user) {
        if (user && !user.guest) {
            return {
                props: {
                    user
                }
            };
        } else {
            return {
                redirect:  ROUTE_HOME,
                status: 302
            }
        }
    }

    export async function load({ fetch, session }) {
        // Approach #1 - Call the session getter API
		// const res = await fetch(API_AUTH);
		// if (res.ok) {
  //           const { user } = await res.json();
  //           console.log(user)
  //           return response(user)
  //       } else {
  //           return {
  //               status: res.status,
  //               error: new Error(`Could not load ${API_AUTH}`)
  //           };
  //       }

        // Approach #2 - Use the session parameter (refer hooks/index.ts to see how it got populated)
        const { user } = session
        console.log(user)
        if (user?.guest) return {
            redirect:  ROUTE_HOME,
            status: 302
        }

        const { data: profile } = from('profiles').select('*').single() 
        // if (!profile) return {
        //     redirect:  '/profile/create',
        //     status: 302
        // }

        return {
            props: {
                user, profile
            }
        };
    }
</script>

<script lang="ts">
    import { onMount } from 'svelte'
    // import { ChromeIcon } from 'svelte-feather-icons'
    import type{ ProfileAttrs } from '$lib/user'
    // import { signOut, getCurrUserProfile, updCurrUserProfile, updCurrUserAvatar, getAvatar, profile } from '$lib/user'
    import { handleAlert } from '$lib/alert'
    import Seo from '$lib/components/SEO.svelte'
    // import Modal from '$lib/components/Modal.svelte'
    import Avatar from '$lib/components/Avatar.svelte'

    // export let profile 
    // Approach #3 (non-effective): Enable when using client-side user session. If you're purely using the client-side supabase-maintained session comment out the approach #1. There would be a flash of unstyled content tho
    // import { browser } from '$app/env';
    // import { user } from '$lib/user'
    // if(browser && !$user) goto('/')

    let loading = false
    export let profile: ProfileAttrs = {
        title: '',
        bio: '',
    }

    // async function getProfile() {
    //     try {
    //         loading = true
    //         // let { data: profile, error } = await getCurrUserProfile()
    //         // let { data: profile, error } = await from('profiles').select('*').single()
    //         // if (error) {
    //         //     handleAlert({ type: 'default', text: 'First login? You wanna update your profile details? 🙂' })
    //         // }

    //         // avatar_url = await getAvatar(avatar_url)
    //         profileState = profile
    //         profile.set({ ...profileState })

    //     } catch (error) {
    //         if(error instanceof TypeError) {
    //             // handleAlert({ type: 'default', text: 'First login? You wanna update your profile details? 🙂' })
    //         } else if(error.message === 'The resource was not found') {
    //             handleAlert({ type: 'default', text: 'You know? You can click on the randomly generated avatar to update your profile picture.' })
    //         } else {
    //             handleAlert({ type: 'error', text: error.message })
    //         }
    //     } finally {
    //         loading = false
    //     }
    // }

    async function updProfile() {
        try {
            loading = true

            let { 
                data: profileDB, 
                error: updateError 
            } = await from('profiles').insert({
                title: profile.title,
                slug: profile.title,
            })
            if (updateError) {
                throw updateError
            }
            profile = profileDB
            // profile.update((profile) => ({ ...profile }))

        } catch (error) {
            handleAlert({ type: 'error', text: error.message })
        } finally {
            // isModalOpened = false
            loading = false
        }
    }

    // onMount(getProfile)


    export let user /* When using approach #3 (client-side user session) comment this out and replace `user` with `(dollar)user` in the template */
</script>
<Seo title="Profile"/>

<div class="flex flex-col justify-center items-center relative">
    <div class="p-2 flex flex-col place-items-center">
        <div class="mt-2">
            <Avatar bind:src={profile.avatar_url} alt={profile.title}/>
        </div>
    </div>
</div>

<!-- {#if isModalOpened}
	<Modal {toggleModal}> -->
<div class="max-w-sm mx-auto">
    
        <!-- <h2 class="text-3xl my-4">Update Profile</h2> -->
        <!-- <hr class="my-4"/> -->
        <div class="">
            <div class="mb-4">
                <label for="title" class="label">Title</label>
                <input
                name="title"
                type="text"
                class="input input-bordered input-lg w-full"
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
		<button class="btn btn-lg btn-primary" on:click={updProfile}>Update Profile</button>
</div>
<!-- 	</Modal>
{/if} -->
