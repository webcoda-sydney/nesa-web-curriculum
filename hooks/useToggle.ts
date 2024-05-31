import { useCallback, useState } from 'react'

export const useToggle = (initialState: boolean = false): [boolean, any] => {
	// Initialize the state
	const [state, setState] = useState<boolean>(initialState)
	// Define and memorize toggler function in case we pass down the comopnent,
	// This function change the boolean value to it's opposite value
	const toggle = useCallback((_state) => {
		return setState((state) => {
			return typeof _state !== 'boolean' ? !state : _state
		})
	}, [])
	return [state, toggle]
}
