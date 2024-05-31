import { PageApiAllAssetResult } from '@/pages/page-api/all-assets'

import { commonFetch, getBaseHost } from '../fetchUtils'
import { CommonPageAPIType, PAGE_API_BASE_PATH } from '../page-api'

export const fetchPageApiAllAssets = async () => {
	let baseHost = getBaseHost()

	const { ok, json } = await commonFetch<
		CommonPageAPIType<PageApiAllAssetResult>,
		null
	>(`${baseHost}/${PAGE_API_BASE_PATH}/page-api/all-assets.json`, null, {
		method: 'GET',
	})

	if (ok) {
		return json
	}
}
