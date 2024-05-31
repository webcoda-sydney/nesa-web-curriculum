export const getAceSearchParamFromUrlHash = (
	fullUrl: string,
	searchParamKey: string,
): string => {
	const fakeOrigin = 'https://xyz.xyz' as const
	const { hash } = new URL(fullUrl)
	if (!hash) return ''

	const urlObj = new URL(hash.replace('#', '?'), fakeOrigin)
	const value = urlObj.searchParams.get(searchParamKey)

	return value || ''
}
