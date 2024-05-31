import getCustomResourceFiles, {
	IDownloadCustomResourcesParams,
} from '@/lib/getCustomResourceFiles'
import JsFileDownloader from 'js-file-downloader'

export async function downloadCustomResource(
	param: IDownloadCustomResourcesParams,
	abortSignal?: AbortSignal,
): Promise<[boolean, string]> {
	const { ok, output, message } = await getCustomResourceFiles(
		param,
		abortSignal,
	)

	if (ok && output && output.code === 200) {
		new JsFileDownloader({
			url: output.path,
			filename: output.name,
			autoStart: true,
			forceDesktopMode: true,
		})
		return [ok, '']
	}
	return [false, (output?.message || message) ?? 'No resource found']
}
