import {
	commonAzureDurableRequest,
	getApiDomain,
} from './curriculum-azure-functions'

export interface AceDownloadParams {
	pdf: boolean
	subgroup: string
	rules: string[]
	includeGlossary?: boolean
	isPreviewMode?: boolean
}

export async function getAceDocsFile(
	params: AceDownloadParams,
	abortSignal?: AbortSignal,
) {
	return await commonAzureDurableRequest<AceDownloadParams>(
		getApiDomain(params.isPreviewMode) +
			process.env.NEXT_PUBLIC_DOWNLOAD_DOCS_PATH_ACE,
		params,
		abortSignal,
	)
}

export default getAceDocsFile
