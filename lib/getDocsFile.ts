import { LanguagesPayload } from '@/layouts/wp_custom_view'
import { CustomSyllabusTab } from '@/types'
import {
	commonAzureDurableRequest,
	getApiDomain,
	ICommonCurriculumFunctionParams,
} from './curriculum-azure-functions'

export interface IDownloadDocsParams extends ICommonCurriculumFunctionParams {
	pdf: boolean
	tabs: CustomSyllabusTab[]
	tags: string[]
	languages: LanguagesPayload[]
}

export async function getDocsFile(
	params: IDownloadDocsParams,
	abortSignal?: AbortSignal,
) {
	return await commonAzureDurableRequest<IDownloadDocsParams>(
		getApiDomain(params.isPreviewMode) +
			process.env.NEXT_PUBLIC_DOWNLOAD_DOCS_PATH,
		params,
		abortSignal,
	)
}

export default getDocsFile
