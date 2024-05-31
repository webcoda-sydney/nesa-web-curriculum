import { getAllAssets, getAllTaxonomies } from '@/lib/api'
import { getFnFilterOnlyPublishedAssets } from '@/utils'
import { getAllAssetsWithTaxo } from '@/utils/assets'
import fs from 'fs'
import { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'

const writeJSONTOFile = (json: unknown, path) => {
	fs.writeFileSync(path, JSON.stringify(json))
}

const filePath = path.join(process.cwd(), '/public/assets.json') // Change the path to your kontent/assets.json file

function cachedIsMoreThanTenMinutes() {
	const timestamp = Date.now()
	const tenMinutes = 1000 * 60 * 10
	const tenMinutesAgo = timestamp - tenMinutes
	const stats = fs.statSync(filePath)
	const lastModified = new Date(stats.mtime).getTime()

	//remaining cache TTL
	const remainingTtl = lastModified - tenMinutesAgo
	const remainingTtlMinutes = Math.floor(remainingTtl / 60000)
	const remainingTtlSeconds = Math.floor((remainingTtl % 60000) / 1000)
	const remainingTtlMilliseconds = remainingTtl % 1000
	const remainingTtlString = `${remainingTtlMinutes}m ${remainingTtlSeconds}s ${remainingTtlMilliseconds}ms`
	console.log(`/api/assets - remaining cache TTL: ${remainingTtlString}`)
	return {
		lastModified,
		tenMinutesAgo,
		isMoreThanTenMinutes: lastModified > tenMinutesAgo,
	}
}

export default async function handler(
	req: NextApiRequest,
	response: NextApiResponse,
) {
	//if purge query param is set to true, purge the cache
	const isPurge = !!(req.query['purge'] as string)
	const preview = req.preview

	// read kontent/assets.json file
	if (fs.existsSync(filePath) && !isPurge) {
		const data = fs.readFileSync(filePath, 'utf8')
		const assets = JSON.parse(data).filter(
			getFnFilterOnlyPublishedAssets(preview),
		)
		return response.status(200).json(assets)
	}

	const _assets = await getAllAssets()
	const taxonomies = await getAllTaxonomies()
	const __assets = getAllAssetsWithTaxo(_assets.items, taxonomies.items)

	//write assets into kontent/assets.json
	writeJSONTOFile(__assets, filePath)

	if (isPurge) {
		// return ok
		return response.status(200).json({ ok: true })
	}

	return response
		.status(200)
		.json(__assets.filter(getFnFilterOnlyPublishedAssets(preview)))
}
