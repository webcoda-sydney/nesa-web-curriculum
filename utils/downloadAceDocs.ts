import getAceDocsFile, { AceDownloadParams } from '@/lib/getAceDocsFile'
import JsFileDownloader from 'js-file-downloader'

export async function downloadAceDocs(
	param: AceDownloadParams,
	abortSignal?: AbortSignal,
): Promise<[boolean, string]> {
	const { ok, output, message } = await getAceDocsFile(param, abortSignal)
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
