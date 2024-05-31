import getReleaseNotes, {
	ReleaseNotesDownloadParams,
} from '@/lib/getReleaseNotes'
import JsFileDownloader from 'js-file-downloader'

export async function downloadReleaseNotes(
	param: ReleaseNotesDownloadParams,
	abortSignal?: AbortSignal,
): Promise<[boolean, string]> {
	const { ok, output, message } = await getReleaseNotes(param, abortSignal)

	if (ok && output && output.code === 200) {
		new JsFileDownloader({
			url: output.path,
			filename: output.name,
			autoStart: true,
			forceDesktopMode: true,
		})
		return [ok, '']
	}
	return [
		false,
		(output?.message || message) ??
			'No resource found. Please adjust the filters to get correct release notes.',
	]
}
