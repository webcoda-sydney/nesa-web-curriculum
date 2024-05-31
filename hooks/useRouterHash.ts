import { useRouter } from 'next/router'
import { useEffect, useMemo, useRef } from 'react'

export const useRouterHash = () => {
	const router = useRouter()
	const urlRouterPath = useMemo(() => {
		return new URL(router.asPath, 'https://curriculum.nsw.edu.au')
	}, [router.asPath])
	const refUrlHash = useRef(urlRouterPath?.hash || '')
	useEffect(() => {
		refUrlHash.current = urlRouterPath?.hash || ''
	}, [urlRouterPath?.hash])

	return {
		urlRouterPath,
		refUrlHash,
	}
}
