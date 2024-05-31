import { useEffect, useState } from 'react'

export const useOrigin = (initOrigin?: string) => {
	const [origin, setOrigin] = useState(
		initOrigin || 'https://curriculum.nsw.edu.au',
	)
	useEffect(() => {
		const urlObj = new URL(window.location.href)
		setOrigin(urlObj.origin)
	}, [])

	return origin
}
