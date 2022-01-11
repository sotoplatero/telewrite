import { writable } from 'svelte/store'
import type{ ProfileAttrs } from './profile.type'


export const profile = writable<ProfileAttrs>({
    title: '',
    bio: '',
    slug: '',
    og_url: '',
    avatar_url: ''
});
