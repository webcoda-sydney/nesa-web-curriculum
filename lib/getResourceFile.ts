import { TaxoSyllabus } from '@/kontent/taxonomies'
import type {
	ExtendedResourceTypes,
	LanguagesPayload,
} from '@/layouts/wp_custom_view'
import {
	ICommonCurriculumFunctionParams,
	commonAzureDurableRequest,
	getApiDomain,
} from './curriculum-azure-functions'

export interface IDownloadResourcesParams
	extends ICommonCurriculumFunctionParams {
	syllabuses: TaxoSyllabus[]
	resourcetypes: ExtendedResourceTypes[]
	contenttypes: ExtendedResourceTypes[]
	languages: LanguagesPayload[]
}

export async function getResourceFile(
	params: IDownloadResourcesParams,
	abortSignal?: AbortSignal,
) {
	return await commonAzureDurableRequest<IDownloadResourcesParams>(
		getApiDomain(params.isPreviewMode) +
			process.env.NEXT_PUBLIC_DOWNLOAD_RESOURCE_PATH,
		params,
		abortSignal,
	)
}

export default getResourceFile
