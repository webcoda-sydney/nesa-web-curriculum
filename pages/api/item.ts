import { getItemByCodename } from '@/lib/api'
import type { NextApiRequest, NextApiResponse } from 'next/types'

export default async function getItemByCodenameApi(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const { codename, depth = 0, fields } = req.query

	const _depth = depth ? parseInt(depth as string) : (depth as number)

	const elementsParameter: string[] = (fields as string)?.split(',') || []

	const result = await getItemByCodename({
		codename: codename as string,
		depth: _depth,
		elementsParameter,
		preview: req.preview,
	})

	return res.json(result)
}
