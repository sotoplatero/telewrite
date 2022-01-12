import { Readability } from '@mozilla/readability'
import { Window } from 'happy-dom';
import cheerio from 'cheerio'; 
import VM from 'vm';


export const getArticle = async (url) => {
	try {
		const res = await fetch( url )

		if (!res.ok) return null

		const html = await res.text()
		const $ = cheerio.load(html)
		$('script,link[rel="stylesheet"]').remove()
		const pureHtml = $.html()

		const window = new Window();
		const document = window.document;	
		document.write(pureHtml)

		const reader = new Readability( document );
		article = reader.parse();
		document.body.innerHTML = formatContent(article.content)
		const nodes = domToNode( document.querySelector('.page') ).children

		const resPost =  await fetch('https://api.telegra.ph/createPage',{
			method: 'POST',
		    headers: { 'Content-Type': 'application/json' },		
				body: JSON.stringify({	
					access_token: await createAccount(article.byline || article.siteName), 
					title: article.title || $('h1').text() || $('title').text(), 
					author_name: article.byline || article.siteName || 'Telegrapher', 
					content: nodes,
				}),
		})

		const { result: {path} } = await resPost.json()	
		let { result } = await(await fetch(`https://api.telegra.ph/getPage/${path}`)).json()
		result = {
			...result,
			image_url: result.image_url ?? $('meta[name="twitter:image"],meta[property="og:image"]')?.attr('content'),
			description: result.description ?? 
		}

		console.log(result)
		return result

	} catch( error) {
		console.log(error)
		return null
	}

}

function formatContent(content) {
	return content.replace(/\n|\t|\r/g,'')
}

function domToNode(domNode) {
  if (domNode.nodeType == 3  ) { // TEXT_NODE
    return domNode.data;
  }

  if (domNode.nodeType != 1) { //ELEMENT_NODE 
    return false;
  }

  var nodeElement = {};
  const tags = ['a', 'aside', 'b', 'blockquote', 'br', 'code', 'em', 'figcaption', 'figure', 'h3', 'h4', 'hr', 'i', 'iframe', 'img', 'li', 'ol', 'p', 'pre', 's', 'strong', 'u', 'ul', 'video']
  const tag = domNode.tagName.toLowerCase()
  nodeElement.tag = tags.includes(tag) ? tag : 'span';

  for (var i = 0; i < domNode.attributes.length; i++) {
    var attr = domNode.attributes[i];
    if (attr.name == 'href' || attr.name == 'src') {
      if (!nodeElement.attrs) {
        nodeElement.attrs = {};
      }
      nodeElement.attrs[attr.name] = attr.value;
    }
  }

  if (domNode.childNodes.length > 0) {
    nodeElement.children = [];
    let childContent 
    for (var i = 0; i < domNode.childNodes.length; i++) {
      	var child = domNode.childNodes[i];
    	childContent = domToNode(child)
      	if ( !!childContent ) {
	      	nodeElement.children.push(childContent);
      	}
    }
  }

  return nodeElement;
}

async function createAccount(author) {
	const res = await fetch(`https://api.telegra.ph/createAccount?short_name=${author}&author_name=${author}`)
	const { result: { access_token } } = await res.json()
	return access_token
}