import type { NextApiRequest, NextApiResponse } from 'next'
import { getSiteMappings } from '../../lib/api'
import { getUrlFromMapping } from '../../utils'
const setCookieSameSite = (res, value) => {
	const cookies = res.getHeader('Set-Cookie')
	const updatedCookies = cookies?.map((cookie) =>
		cookie.replace('SameSite=Lax', `SameSite=${value}; Secure;`),
	)
	res.setHeader('Set-Cookie', updatedCookies)
}

export default async function preview(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	// Check the secret and next parameters
	// This secret should only be known to this API route and the CMS

	if (req.query.secret !== process.env.PREVIEW_SECRET) {
		return res.status(401).json({ message: 'Invalid token' })
	}

	console.log('🚀 ~ file: preview.ts ~ line 23 ~ Entering preview')

	const showpublished = typeof req.query.showpublished !== 'undefined'
	// Enable Preview Mode by setting the cookies
	const previewData = showpublished
		? {
				showpublished,
		  }
		: {}
	res.setPreviewData(previewData)
	setCookieSameSite(res, 'None')

	const redirectItemCodename = req.query.redirectItemCodename as string
	if (redirectItemCodename) {
		const mappings = await getSiteMappings(true)
		const redirectTo = getUrlFromMapping(mappings, redirectItemCodename)
		console.log(
			'🚀 ~ file: preview.ts ~ line 25 ~ preview ~ redirectTo',
			redirectTo,
		)
		res.redirect(redirectTo || '/')
		return
	}
	if (req.query.redirect) {
		res.redirect((req.query.redirect as string) || '/')
		return
	}

	res.redirect('/')
}
