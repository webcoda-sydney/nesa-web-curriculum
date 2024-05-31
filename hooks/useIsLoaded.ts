import { useEffect, useState } from 'react'

/**
 * To indicate whether page has been loaded/mounted or not.
 * Just as initial load
 */
export const useIsLoaded = () => {
	const [loaded, setLoaded] = useState(false)
	useEffect(() => {
		if (!loaded) {
			setLoaded(true)
		}
	}, [loaded])
	return [loaded, setLoaded]
}
