import { TaxoSyllabus } from '@/kontent/taxonomies'
import { TaxoStageWithLifeSkill } from '@/types'
import {
	commonAzureDurableRequest,
	getApiDomain,
} from './curriculum-azure-functions'

export interface IDownloadCustomResourcesParams {
	/**
	 * The ids of the resource files that will be downloaded (and zipped)
	 */
	fileIds: string[]
	/** for filename: NSW Education Standards Authority -[syllabusName].zip.
	 *  If not specified, it'll produce NSW Education Standards Authority -custom resources.zip
	 */
	syllabusName?: string

	isPreviewMode?: boolean

	stages?: TaxoStageWithLifeSkill[]

	syllabuses?: TaxoSyllabus[]
}

export async function getCustomResourceFiles(
	params: IDownloadCustomResourcesParams,
	abortSignal?: AbortSignal,
) {
	return await commonAzureDurableRequest<IDownloadCustomResourcesParams>(
		getApiDomain(params.isPreviewMode) +
			process.env.NEXT_PUBLIC_DOWNLOAD_CUSTOM_RESOURCE_PATH,
		params,
		abortSignal,
	)
}

export default getCustomResourceFiles
