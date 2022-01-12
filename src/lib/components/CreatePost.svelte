<script>
    import { session } from '$app/stores';
    
    async function createPost(){
        console.log($session)
    }
</script>
<button on:click={createPost} class="btn btn-bordered">
    Create Post
</button> 