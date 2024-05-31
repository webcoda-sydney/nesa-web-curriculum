import { ICommonCurriculumFunctionOutput } from '@/lib/curriculum-azure-functions'
import getResourceFile, {
	IDownloadResourcesParams,
} from '@/lib/getResourceFile'
import JsFileDownloader from 'js-file-downloader'

export async function downloadResource(
	param: IDownloadResourcesParams,
	abortSignal?: AbortSignal,
): Promise<[boolean, string, ICommonCurriculumFunctionOutput | undefined]> {
	const { ok, output, message } = await getResourceFile(param, abortSignal)

	if (ok && output && output.code === 200) {
		new JsFileDownloader({
			url: output.path,
			filename: output.name,
			autoStart: true,
			forceDesktopMode: true,
		})
		return [ok, '', output]
	}
	return [
		false,
		(output?.message || message) ??
			'No resource found. Please adjust the filters to get correct resources.',
		undefined,
	]
}
