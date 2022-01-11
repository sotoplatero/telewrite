<script lang="ts">
    import { fromBucket } from '$lib/supabase'
    export let src
    export let email

    let loading = false
    // $: src = src ?? `https://avatars.dicebear.com/api/croodles-neutral/default.svg?b=%23f0f0f0`
    $: src = src ?? `https://unavatar.io/${email}`

    const uploadAvatar = async (file: File) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        let { error: uploadError } = await fromBucket('avatars').upload(filePath, file)
        if (uploadError) { throw uploadError }
        return {filePath}
        // return await from('profiles').upsert({ avatar_url: filePath })
    }

    const getAvatar = async(url: string) => {
        const { data, error: downloadError } = await fromBucket('avatars').download(url)
        if (downloadError) { throw downloadError }

        return URL.createObjectURL(data)
    }

    async function updateAvatar(event: any) {
        const { target } = event
        try {
            if (!target!.files || target.files.length == 0) {
                throw 'You must select an image to upload.'
            }
            loading = true
            let { filePath, error: updateError } = await uploadAvatar(target.files[0])

            if (updateError) {
                throw updateError
            }

            src = await getAvatar(filePath)
            // profile.update((profile) => ({ ...profile, avatar_url }))

        } catch (error) {
            // handleAlert({ type: 'error', text: error.message })
            alert(error.message )
        } finally {
            loading = false
        }
    }

</script>

<div class="">
    <label class="avatar" for="single">
        <div class="w-24 h-24 rounded-full">
            <img class="" alt="Profile avatar" {src} />
        </div>
        <!-- {loading ? 'Updating..' : '(click to update)'} -->
    </label>
    <input
     class="sr-only"
      type="file"
      id="single"
      accept="image/*"
      on:change={updateAvatar}
      disabled={loading}
    />
</div>
