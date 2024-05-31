import Grid from '@mui/material/Grid'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { Sections } from '../../constants/pathConstants'

export default function BetaSiteBanner() {
	const location = useRouter()
	const currentLocation = location.pathname
	const homeURL = Sections.HOME.url

	const isHomePage = currentLocation === homeURL

	// keep the banner state in local storage to apply it to other pages
	const [isMinimised, setIsMinimised] = useState(true)

	const minimiseBtn = useRef(null)
	const maximiseBtn = useRef(null)

	const handleMinimiseMaximise = () => {
		setIsMinimised(!isMinimised)
		window.localStorage.setItem('bannerState', JSON.stringify(!isMinimised))
		// Timeout added as focus btn not rendered by this time
		setTimeout(() => {
			!isMinimised == true
				? minimiseBtn.current.focus()
				: maximiseBtn.current.focus()
		}, 1)
	}

	useEffect(() => {
		const bannerState = window.localStorage.getItem('bannerState')
		setIsMinimised(bannerState ? JSON.parse(bannerState) : !isHomePage)
	}, [isHomePage])

	const renderMaximum = (
		<div className="nsw-container beta-site-banner__container">
			<p className="beta-site-banner__beta-website-text">
				This is the first release of the Digital Curriculum, features
				will be developed and added. NESA is encouraging feedback to
				improve functionality and further refine the Digital Curriculum
				platform.
			</p>
			<Grid container direction="row">
				<div className="beta-site-banner__button-container beta-site-banner__button-container--maximize">
					<a
						href="mailto:curriculum@nesa.nsw.edu.au?subject=Feedback on NSW Curriculum website"
						target="_blank"
						className="button nsw-button nsw-button--secondary beta-site-banner__button"
						rel="noreferrer"
					>
						Give us your feedback
					</a>
				</div>
				<div className="beta-site-banner__button-container beta-site-banner__button-container--maximize">
					<a
						href="https://www.educationstandards.nsw.edu.au/wps/portal/nesa/home"
						target="_blank"
						className="button nsw-button nsw-button--dark beta-site-banner__button no-icon"
						rel="noreferrer"
					>
						Go to the NESA website
					</a>
				</div>
				<Grid
					container
					direction="column"
					alignItems="flex-end"
					className="beta-site-banner__maximize-minimize"
				>
					<div
						onKeyPress={handleMinimiseMaximise}
						role="button"
						tabIndex={0}
						onClick={handleMinimiseMaximise}
						className="beta-site-banner__minimize-link button--font-weight-100 button--font-size-14"
						ref={maximiseBtn}
					>
						<p>{isMinimised ? 'Maximise' : 'Minimise'}</p>
					</div>
				</Grid>
			</Grid>
		</div>
	)

	const renderMinimise = (
		<div className="nsw-container beta-site-banner__container beta-site-banner__container--minimize">
			<Grid
				container
				spacing={2}
				justifyContent="space-between"
				alignItems="center"
				direction="row"
				className="!flex-wrap md:!flex-nowrap"
			>
				<Grid
					item
					container
					direction="row"
					className="beta-site-banner__text-container"
				>
					<p className="beta-site-banner__beta-website-text">
						Welcome to the first release of the Digital Curriculum
					</p>
				</Grid>
				<Grid
					item
					container
					direction="row"
					alignItems="center"
					className="beta-site-banner__item-container !flex-wrap md:!flex-nowrap gap-2.5 !w-full md:!w-auto"
				>
					{!isMobile && (
						<>
							<div className="beta-site-banner__button-container beta-site-banner__button-container--first w-full">
								<a
									href="mailto:curriculum@nesa.nsw.edu.au?subject=Feedback on NSW Curriculum website"
									target="_blank"
									className="button nsw-button nsw-button--secondary beta-site-banner__button"
									rel="noreferrer"
								>
									Give us your feedback
								</a>
							</div>
							<div className="beta-site-banner__button-container w-full">
								<a
									href="https://www.educationstandards.nsw.edu.au/wps/portal/nesa/home"
									target="_blank"
									className="button nsw-button nsw-button--dark beta-site-banner__button no-icon"
									rel="noreferrer"
								>
									Go to the NESA website
								</a>
							</div>
						</>
					)}
					<div
						onKeyPress={handleMinimiseMaximise}
						role="button"
						tabIndex={0}
						onClick={handleMinimiseMaximise}
						className="beta-site-banner__minimize-link button--font-weight-100 button--font-size-14 ml-auto mr-2.5 md:mr-0"
						ref={minimiseBtn}
					>
						<p>{isMinimised ? 'Maximise' : 'Minimise'}</p>
					</div>
				</Grid>
			</Grid>
		</div>
	)

	return (
		<Grid className="beta-site-banner">
			{isMinimised ? renderMinimise : renderMaximum}
		</Grid>
	)
}
