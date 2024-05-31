require('dotenv').config()
const fs = require('fs')
const path = require('path')
import {
	getAllAssets,
	getAllTaxonomies,
	getSiteMappings,
	loadWebsiteConfig,
} from './lib/api'
import { getFnFilterOnlyPublishedAssets } from './utils'
import { getAllAssetsWithTaxo } from './utils/assets'

const writeJSONTOFile = (
	json: unknown,
	filename,
	cacheFolder = path.join(process.cwd(), 'kontent'),
) => {
	fs.writeFileSync(path.join(cacheFolder, filename), JSON.stringify(json))
}

async function run() {
	console.log('Generating assets and config cache...')

	// store timestamp
	const timestamp = Date.now()

	const assets = await getAllAssets()
	const taxonomies = await getAllTaxonomies()
	const assetsJson = getAllAssetsWithTaxo(assets.items, taxonomies.items)
	const publishedAssetsJson = assetsJson.filter(
		getFnFilterOnlyPublishedAssets(false),
	)

	//write json into assets.json into /kontent folder
	writeJSONTOFile(publishedAssetsJson, 'published-assets.json')
	writeJSONTOFile(
		assetsJson,
		'assets.json',
		path.join(process.cwd(), 'public'),
	)

	const [websiteConfigJson, sitemapMappings] = await Promise.all([
		loadWebsiteConfig(false, true),
		getSiteMappings(false, true),
	])
	writeJSONTOFile(websiteConfigJson, 'website-config.json')
	writeJSONTOFile(sitemapMappings, 'sitemap-mappings.json')

	// calculate how many seconds it took to generate the cache in seconds
	const timeTaken = (Date.now() - timestamp) / 1000

	console.log(
		`${publishedAssetsJson.length} published assets, ${assetsJson.length} assets and config cache generated in ${timeTaken} seconds`,
	)
}

run()
