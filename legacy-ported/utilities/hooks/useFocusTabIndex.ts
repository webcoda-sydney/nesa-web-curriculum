import { useEffect, useRef } from 'react'

/**
 * Setting focus to current HTMLElement or HTMLButtonElement when popover is closed
 * Not setting focus on first render
 */
const useFocusTabIndex = function (
	popoverStatus: boolean,
	buttonElement: HTMLElement | HTMLButtonElement | null,
) {
	const firstUpdate = useRef(true)

	useEffect(() => {
		if (firstUpdate.current) {
			firstUpdate.current = false
		} else if (!popoverStatus && buttonElement) {
			buttonElement.focus()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [firstUpdate, buttonElement, popoverStatus])
}

export const useFocusTabIndexV2 = (
	popoverStatus: boolean,
	elementSelector: string,
) => {
	const firstUpdate = useRef(true)

	useEffect(() => {
		if (elementSelector && elementSelector) {
			const buttonElement = document.querySelector(
				elementSelector,
			) as HTMLElement
			if (firstUpdate.current) {
				firstUpdate.current = false
			} else if (!popoverStatus && buttonElement) {
				buttonElement.focus()
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [elementSelector, popoverStatus])
}

export default useFocusTabIndex
