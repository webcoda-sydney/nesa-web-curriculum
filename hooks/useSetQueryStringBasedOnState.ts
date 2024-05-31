import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'
export const useSetQueryStringBasedOnState = (
	params: {
		queryKey: string
		state: string | string[]
	}[],
) => {
	const refIsLoaded = useRef(false)
	const router = useRouter()

	useEffect(() => {
		if (refIsLoaded.current) {
			const _url = new URL(router.asPath, window.location.origin)

			params.forEach(({ queryKey, state }) => {
				const _state = state.toString()

				if (_state) {
					_url.searchParams.set(queryKey, _state)
				} else {
					_url.searchParams.delete(queryKey)
				}
			})

			if (
				router.asPath !== _url.href.replace(window.location.origin, '')
			) {
				router.replace(_url.href, undefined, {
					shallow: true,
					scroll: false,
				})
			}
		}
		refIsLoaded.current = true
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [params.map((p) => p.queryKey + p.state?.toString())])
}
