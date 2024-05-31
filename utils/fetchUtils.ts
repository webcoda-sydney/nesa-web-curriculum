export type CommonFetchResponse<TResult> = Pick<
	Response,
	'ok' | 'status' | 'statusText'
> & {
	json: TResult
}

export const commonFetch = async <TResult, TParam>(
	url: string,
	params?: TParam,
	// type of requestInit is native RequestInit from lib.dom.d.ts
	// eslint-disable-next-line no-undef
	options?: RequestInit,
): Promise<CommonFetchResponse<TResult>> => {
	const _options = {
		method: 'POST',
		cache: 'no-cache',
		headers: {
			'Content-Type': 'application/json',
		},
		...(options || {}),
		// eslint-disable-next-line no-undef
	} as RequestInit
	let json
	const result = await fetch(url, {
		..._options,
		// eslint-disable-next-line no-undef
		body: (params ? JSON.stringify(params) : params) as BodyInit,
	}).catch((err: TypeError) => {
		return {
			ok: false,
			status: 0,
			statusText: err.message,
			json: null,
		}
	})

	if (result.ok) {
		json = await result.json()
	}
	return {
		ok: result.ok,
		status: result.status,
		statusText: result.statusText,
		json,
	}
}

export const fetchKontentRESTManagementAPI = async (
	endpoint,
	continuationToken = '',
) => {
	const headers = {
		Authorization: `Bearer ${process.env.KONTENT_MANAGEMENT_API_KEY}`,
		'Content-Type': 'application/json',
	}

	if (continuationToken) {
		headers['x-continuation'] = continuationToken
	}

	const response = await fetch(
		`https://manage.kontent.ai/v2/projects/${process.env.NEXT_PUBLIC_KONTENT_PROJECT_ID}/${endpoint}`,
		{
			headers,
		},
	)
	const json = await response.json()
	return json
}

export const fetchKontentRESTManagementAPIWithContinuationToken = async (
	endpoint,
	responseKey,
) => {
	//continue to fetch until there is no continuation token
	let continuationToken = null
	let results = []
	do {
		const response = await fetchKontentRESTManagementAPI(
			endpoint,
			continuationToken,
		)
		results = results.concat(response[responseKey])
		continuationToken = response?.pagination?.continuation_token
	} while (continuationToken)

	return results
}

/**
 * Get the base host of the current environment, useful when window.location is not available (e.g. in server-side functions or tests).
 * If the host is localhost (only for dev purpose), we need to use http , otherwise we need to use https
 */
export const getBaseHost = (isReplaceTrailingSlash = true) => {
	if (typeof window !== 'undefined') {
		return window.location.origin
	}

	let baseHost =
		process.env.NEXT_PUBLIC_SITE_URL ||
		`https://${process.env.NEXT_PUBLIC_VERCEL_URL}` ||
		'http://localhost:3000'

	if (isReplaceTrailingSlash) {
		baseHost = baseHost.replace(/\/$/, '')
	}
	return baseHost
}
