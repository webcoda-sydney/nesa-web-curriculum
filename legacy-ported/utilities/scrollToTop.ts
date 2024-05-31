import { useEffect } from 'react'
// import { useLocation } from 'react-router-dom'

const ScrollToTop = () => {
	/*
	This component watches for routePath,
	when it changes it always make sure the page scroll is at 0
  */

	// const routePath = useLocation()
	const onTop = () => {
		window.scrollTo({
			left: 0,
			top: 0,
			behavior: 'smooth',
		})
	}
	useEffect(() => {
		onTop()
	}, [])

	return null
}

export default ScrollToTop
