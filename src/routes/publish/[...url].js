// import { getCache, setCache } from '$lib/upstash'
import { auth, set as setCache, get as getCache } from '@upstash/redis';
import { getArticle } from '$lib/getarticle'

export async function get({ params }) {
	let {url} = params
	let article

	const UPSTASH_REDIS_REST_URL =  import.meta.env.VITE_UPSTASH_REDIS_REST_URL
	const UPSTASH_REDIS_REST_TOKEN = import.meta.env.VITE_UPSTASH_REDIS_REST_TOKEN

	const headers = {
		'Cache-Control': 'public, immutable, no-transform, s-maxage=31536000, max-age=31536000'
	}	

	try	{

		// let article
		if (/telegra\.ph/.test(url) ) {
			// const path = url.match(/telegra.ph\/(.+)/)[1]
			// const resTelegraph = await fetch(`https://api.telegra.ph/getPage/${path}`)
			// const data = await resTelegraph.json()
			// return {
			// 	headers,
			// 	body: data.result
			// }			

		}

		auth(UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN);	
		// ({ data: article } = await getCache(url))
		if (!!article) return {
			headers,
			body: JSON.parse(article)
		}

		const fullUrl = /^http?/.test(url) ? url : `http://${url}`

		article = await getArticle( fullUrl )
		if (article) {
			await setCache(url,article)
		}

		return {
			headers,
			body: article
		}

	} catch(e) {
		console.log(e)
		return { status: 404 }
	}
}

