import Icon from '@/components/Icon'
import SanitisedHTMLContainer from '@/components/SanitisedHTMLContainer'
import type { Outcome } from '@/kontent/content-types/outcome'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import clsx from 'clsx'
import React from 'react'
import { isMobile } from 'react-device-detect'

export interface OutcomeCardProps {
	id?: string
	/*
	 * Title of the outcome
	 * */
	title: string
	/*
	 * List of the outcomes
	 * */
	outcomes?: Outcome[]
	/**
	 * Whether the card is currently selected
	 */
	selected?: boolean
	/**
	 * Whether the card is selectable
	 */
	isSelectable?: boolean
	/**
	 * Whether the card is selectable
	 */
	displayOutcome?: boolean
	/**
	 * Callback fired when card is pressed
	 */
	onClick?: (
		_event:
			| React.MouseEvent<HTMLDivElement, MouseEvent>
			| React.KeyboardEvent<HTMLDivElement>,
	) => void

	/**
	 * Content code
	 */
	code?: string[]
}

export default function OutcomeCard(props: OutcomeCardProps) {
	const {
		id,
		title,
		outcomes,
		selected,
		isSelectable,
		onClick,
		code,
		displayOutcome = true,
	} = props

	return (
		<Paper
			id={id}
			elevation={0}
			className={clsx(
				'outcome-card nsw-p-md cursor-auto',
				isSelectable && 'outcome-card--selectable',
				!onClick && 'nsw-p-bottom-lg',
				selected && 'outcome-card--selected',
			)}
			onClick={onClick}
			tabIndex={0}
			onKeyPress={onClick}
			variant="outlined"
		>
			<Grid
				container
				className="outcome-card__title"
				alignItems="center"
				item
				xs={12}
			>
				<div className="bold">
					{title}{' '}
					{onClick && <Icon icon="ic:baseline-chevron-right" />}
				</div>
			</Grid>
			{!!outcomes?.length &&
				outcomes.map((outcome, index) => (
					// eslint-disable-next-line react/no-array-index-key
					<Grid
						key={`outcome-${index}`}
						container
						item
						xs={12}
						className="outcome-card__outcome"
						data-kontent-item-id={outcome.system.id}
					>
						<Grid
							container
							item
							xs={12}
							sm={12}
							className="outcome-card__outcome-text"
							data-element-codename="code"
						>
							{code && !displayOutcome && (
								<p className="strong nsw-p-top-sm nsw-p-bottom-sm">
									{outcome.elements.code.value}
								</p>
							)}
							{displayOutcome && (
								<p className="strong nsw-p-top-sm nsw-p-bottom-sm">
									Outcome
								</p>
							)}
						</Grid>
						{!isMobile && <br />}
						<Grid container item xs={12} sm={12}>
							<SanitisedHTMLContainer data-kontent-element-codename="description">
								{outcome.elements.description.value}
							</SanitisedHTMLContainer>
						</Grid>
					</Grid>
				))}
		</Paper>
	)
}
