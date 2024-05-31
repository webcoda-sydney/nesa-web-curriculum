import { getAllAssets } from '@/lib/api'
import type { NextApiRequest, NextApiResponse } from 'next/types'

export default async function getItemByCodenameApi(
	_req: NextApiRequest,
	res: NextApiResponse,
) {
	const result = await Promise.all([
		getAllAssets(),
		getAllAssets(),
		getAllAssets(),
		getAllAssets(),
		getAllAssets(),
		getAllAssets(),
		getAllAssets(),
		getAllAssets(),
		getAllAssets(),
		getAllAssets(),
		getAllAssets(),
		getAllAssets(),
		getAllAssets(),
		getAllAssets(),
		getAllAssets(),
		getAllAssets(),
		getAllAssets(),
		getAllAssets(),
		getAllAssets(),
		getAllAssets(),
		getAllAssets(),
	])

	return res.json(result.length)
}
