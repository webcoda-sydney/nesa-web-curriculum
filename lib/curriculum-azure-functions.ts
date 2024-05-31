import { Syllabus } from '@/kontent/content-types'
import { TaxoStageWithLifeSkill } from '@/types'
import { commonFetch, CommonFetchResponse } from '@/utils/fetchUtils'
import { OrchestrationRuntimeStatus } from 'durable-functions'
import type { DurableOrchestrationStatus } from 'durable-functions/lib/src/durableorchestrationstatus'
import { HttpManagementPayload } from 'durable-functions/lib/src/httpmanagementpayload'
const fetchWithRetry = require('fetch-retry')(fetch)

export interface CommonAzureDurableResponse<TOutput> {
	ok: boolean
	message: string
	output: TOutput
}

export async function checkStatus(
	url: HttpManagementPayload['statusQueryGetUri'],
	abortSignal?: AbortSignal,
	retryDelay = 3000,
): Promise<CommonFetchResponse<DurableOrchestrationStatus>> {
	const response: Response = await fetchWithRetry(url, {
		signal: abortSignal,
		retryDelay,
		retryOn: async (
			attempt: number,
			error: TypeError,
			_response: Response,
		) => {
			// retry on any network error, or 4xx or 5xx status codes
			if (error !== null) {
				if (_response?.status >= 400) {
					console.log(`retrying, attempt number ${attempt + 1}`)
					return true
				}
				if (error.name) {
					throw Error(error.name)
				}
				throw Error(error?.message)
			}

			const status: DurableOrchestrationStatus = await _response
				.clone()
				.json()
			return ![
				OrchestrationRuntimeStatus.Completed,
				OrchestrationRuntimeStatus.Failed,
				OrchestrationRuntimeStatus.Terminated,
			].includes(status.runtimeStatus)
		},
	}).catch((err: TypeError) => {
		if (err.message === 'AbortError') {
			return {
				ok: false,
				status: 0,
				statusText: err.message,
				json: {
					output: '',
				},
			}
		}
		throw Error(err?.message)
	})
	if (response.ok) {
		const json = await response.json()
		return {
			ok: response.ok,
			status: response.status,
			statusText: response.statusText,
			json,
		}
	}
	return {
		ok: response.ok,
		status: response.status,
		statusText: response.statusText,
		json: (response.json ?? {}) as DurableOrchestrationStatus,
	}
}

export interface ICommonCurriculumFunctionParams {
	syllabuses: Syllabus['system']['id'][]
	stages: TaxoStageWithLifeSkill[]
	isPreviewMode?: boolean
}
export interface ICommonCurriculumFunctionOutput {
	/**
	 * Error / success code, e.g.: 200, 401, 500. etc
	 */
	code: number

	/**
	 * Blob data (deprecated)
	 */
	data: string | null

	/**
	 * Error / success message
	 */
	message: string

	/**
	 * File path
	 */
	path: string | null

	/**
	 * MIME Type
	 */
	mimeType: string | null

	/**
	 * File size
	 */
	size: number

	/**
	 * File name
	 */
	name: string | null
}

export function getApiDomain(isPreview: boolean) {
	if (isPreview) {
		return (
			process.env.NEXT_PUBLIC_DOWNLOAD_API_PREVIEW_DOMAIN ||
			process.env.NEXT_PUBLIC_DOWNLOAD_API_DOMAIN
		)
	}

	return process.env.NEXT_PUBLIC_DOWNLOAD_API_DOMAIN
}

export async function commonAzureDurableRequest<
	TParam extends { isPreviewMode?: boolean },
>(
	url: string,
	param: TParam,
	abortSignal?: AbortSignal,
): Promise<CommonAzureDurableResponse<ICommonCurriculumFunctionOutput>> {
	const {
		ok: initOk,
		statusText: initStatusText,
		json: initResponseJson,
	} = await commonFetch<HttpManagementPayload, TParam>(url, param)
	if (!initOk) {
		return {
			ok: initOk,
			message: initStatusText,
			output: null,
		}
	}

	let { statusQueryGetUri } = initResponseJson
	const statusQueryGetUriURL = new URL(statusQueryGetUri)
	statusQueryGetUri = statusQueryGetUri.replace(
		statusQueryGetUriURL.origin,
		getApiDomain(param.isPreviewMode),
	)

	try {
		const {
			ok: responseOk,
			json,
			statusText,
		} = await checkStatus(statusQueryGetUri, abortSignal)

		let ok =
			responseOk &&
			json.runtimeStatus === OrchestrationRuntimeStatus.Completed
		let message = ''
		if (ok) {
			const output = json.output as ICommonCurriculumFunctionOutput

			return {
				ok,
				message,
				output,
			}
		}

		// if error
		return {
			ok,
			message: (json.output as string) ?? 'Unknown error',
			output:
				statusText === 'AbortError'
					? {
							code: 0,
							message: '',
							data: null,
							mimeType: '',
							size: 0,
							name: 'AbortError',
							path: '',
					  }
					: undefined,
		}
	} catch (err) {
		return {
			ok: false,
			message: err?.message ?? 'Unknown error',
			output: undefined,
		}
	}
}
