import getDocsFile, { IDownloadDocsParams } from '@/lib/getDocsFile'
import JsFileDownloader from 'js-file-downloader'

export async function downloadDocs(
	param: IDownloadDocsParams,
	abortSignal?: AbortSignal,
): Promise<[boolean, string]> {
	const { ok, output, message } = await getDocsFile(param, abortSignal)
	if (ok && output && output.code === 200) {
		new JsFileDownloader({
			url: output.path,
			filename: output.name,
			autoStart: true,
			forceDesktopMode: true,
		})
		return [true, '']
	}
	return [false, (output?.message || message) ?? 'No documents generated']
}
