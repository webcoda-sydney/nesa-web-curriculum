import { useOrigin } from './useOrigin'

export const useCleanPath = (
	path: string = 'https://curriculum.nsw.edu.au',
	callback?: (_path: URL) => URL,
): URL => {
	const origin = useOrigin()
	const url = new URL(path, origin)
	return callback ? callback(url) : url
}
