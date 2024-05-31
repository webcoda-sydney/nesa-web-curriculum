// create kontent/website-config.json, kontent/sitemap-mappings.json and kontent/assets.json files if they don't exist
// and if they do exist, update them with the latest data from the Kontent project

const fs = require('fs')
const path = require('path')

const writeJSONTOFile = (
	json,
	filename,
	cacheFolder = path.join(process.cwd(), 'kontent'),
) => {
	fs.writeFileSync(path.join(cacheFolder, filename), JSON.stringify(json))
}

writeJSONTOFile({}, 'assets.json', path.join(process.cwd(), 'public'))
writeJSONTOFile({}, 'published-assets.json')
writeJSONTOFile({}, 'sitemap-mappings.json')
writeJSONTOFile({}, 'website-config.json')
