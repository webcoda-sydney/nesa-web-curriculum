import { AssetWithRawElements } from '@/types'
import { getFnFilterOnlyPublishedAssets } from '@/utils'
import fs from 'fs'
import { GetStaticProps } from 'next'
import path from 'path'

export interface PageApiAllAssetResult {
	assets: AssetWithRawElements[]
}

export default function PageApiAllAssetsPage() {
	return null
}

const filePath = path.join(process.cwd(), 'public', 'assets.json')

export const getStaticProps: GetStaticProps<PageApiAllAssetResult> = async ({
	preview,
}) => {
	//if purge query param is set to true, purge the cache
	// read public/assets.json file
	if (fs.existsSync(filePath)) {
		const data = fs.readFileSync(filePath, 'utf8')
		const assets = JSON.parse(data).filter(
			getFnFilterOnlyPublishedAssets(preview),
		)
		return {
			props: {
				assets,
			},
		}
	}
	return {
		props: {
			assets: [],
		},
	}
}
