import { getAllItemsByType } from '@/lib/api'
import type { NextApiRequest, NextApiResponse } from 'next/types'

export default async function getItemByCodenameApi(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const { type, depth = 0, fields } = req.query

	const _depth = depth ? parseInt(depth as string) : (depth as number)

	const elementsParameter: string[] =
		(fields as string)?.split(',') || undefined

	let anyFilter
	let containsFilter
	if (req.query['any.element'] && req.query['any.value']) {
		anyFilter = {
			element: req.query['any.element'],
			value: (req.query['any.value'] as string)?.split(',') || [],
		}
	}
	if (req.query['contains.element'] && req.query['contains.value']) {
		containsFilter = {
			element: req.query['contains.element'],
			value: (req.query['contains.value'] as string)?.split(',') || [],
		}
	}

	const result = await getAllItemsByType({
		type: type as string,
		depth: _depth,
		elementsParameter,
		anyFilter,
		containsFilter,
		preview: req.preview,
	})

	return res.json(result)
}
