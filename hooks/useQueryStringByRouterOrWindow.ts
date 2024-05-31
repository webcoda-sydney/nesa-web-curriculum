import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export const useQueryStringByRouterOrWindow = <TDefaultValue>(
	queryKey,
	defaultValue: TDefaultValue,
	isUseWindowHref = false,
) => {
	const router = useRouter()
	let qsVal = router?.query?.[queryKey] ?? defaultValue

	const [state, setState] = useState<TDefaultValue>(defaultValue)

	useEffect(() => {
		const url = new URL(window.location.href)
		const val = isUseWindowHref ? url.searchParams.get(queryKey) : qsVal
		setState(val as TDefaultValue)
	}, [isUseWindowHref, qsVal, queryKey])

	return {
		state,
		setState,
	}
}
