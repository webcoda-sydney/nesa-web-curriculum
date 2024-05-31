import { AssetWithRawElements } from '@/types'
import { commonFetch, getBaseHost } from '../fetchUtils'

export const fetchFromApiAssets = async () => {
	const baseHost = getBaseHost()

	const { ok, json } = await commonFetch<AssetWithRawElements[], null>(
		`${baseHost}/api/assets`,
	)
	if (!ok) throw new Error('Failed to fetch assets')
	return json
}
