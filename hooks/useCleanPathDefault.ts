import { useRouter } from 'next/router'
import { useCleanPath } from './useCleanPath'

export const useCleanPathDefault = (callback?: (_path: URL) => URL) => {
	const { asPath } = useRouter()
	const url = useCleanPath(asPath, callback)
	return url.pathname
}
