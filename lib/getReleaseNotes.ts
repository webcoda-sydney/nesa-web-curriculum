import {
	TaxoKeyLearningArea,
	TaxoStage,
	TaxoSyllabus,
} from '@/kontent/taxonomies'
import {
	commonAzureDurableRequest,
	getApiDomain,
} from './curriculum-azure-functions'

export interface ReleaseNotesDownloadParams {
	fromDate: Date
	toDate: Date
	syllabuses: TaxoSyllabus[]
	stages: TaxoStage[]
	keylearningareas?: TaxoKeyLearningArea[]

	/* Ace subgroup codenames */
	ace_subgroups: string[]

	isPreviewMode?: boolean
}

export async function getReleaseNotes(
	params: ReleaseNotesDownloadParams,
	abortSignal?: AbortSignal,
) {
	return await commonAzureDurableRequest<ReleaseNotesDownloadParams>(
		getApiDomain(params.isPreviewMode) +
			process.env.NEXT_PUBLIC_DOWNLOAD_RELEASENOTES_PATH,
		params,
		abortSignal,
	)
}

export default getReleaseNotes
