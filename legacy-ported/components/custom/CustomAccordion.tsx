import { Icon } from '@iconify/react'
import Accordion, { AccordionProps } from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import clsx from 'clsx'
import { HTMLProps, ReactNode, useEffect, useState } from 'react'
import sanitizeHtml from 'sanitize-html'
export interface CustomAccordionProps
	extends Omit<HTMLProps<HTMLDivElement>, 'onChange'> {
	title: string
	subTitle?: string
	startOpen?: boolean
	externalUrl?: string
	titleNote?: string
	disabled?: boolean
	overrideExpand?: boolean
	expanded?: boolean

	/**
	 * if renderFn is specified, it'll use renderFn instead of children
	 */
	renderFn?: (_expandedStatus) => ReactNode
	onChange?: AccordionProps['onChange']
	TransitionProps?: AccordionProps['TransitionProps']
	slotAfter?: ReactNode
}

const getIcon = (
	disabled: CustomAccordionProps['disabled'],
	externalUrl: CustomAccordionProps['externalUrl'],
) => {
	if (disabled) {
		if (externalUrl)
			return <Icon icon="octicon:link-external-16" color="#002664" />
		return null
	}
	return (
		<Icon
			icon="ic:baseline-expand-more"
			className="nesa-accordion__icon"
			width={30}
			height={30}
		/>
	)
}

const CustomAccordion = (props: CustomAccordionProps): JSX.Element => {
	const {
		title,
		subTitle,
		startOpen = false,
		externalUrl = '',
		children,
		renderFn,
		onChange,
		titleNote = '',
		disabled = false,
		TransitionProps,
		slotAfter,
		expanded = false,
		...others
	} = props
	const [expandStatus, setExpandStatus] = useState(startOpen)

	const handleChange = (_, expanded: boolean) => {
		if (!disabled) {
			setExpandStatus(expanded)
		}
		if (onChange) {
			onChange(_, expanded)
		}
	}

	const handleClick = () => {
		if (disabled && !!externalUrl) {
			window.open(externalUrl, '_blank')
		}
		return
	}

	useEffect(() => {
		setExpandStatus(startOpen)
	}, [startOpen])

	return (
		<div className="w-full" {...others}>
			<Accordion
				className="nesa-accordion"
				expanded={expanded || expandStatus}
				onChange={handleChange}
				TransitionProps={TransitionProps}
			>
				<AccordionSummary
					sx={{
						'.MuiAccordionSummary-content.Mui-expanded': {
							marginTop: '.75rem',
							marginBottom: '.75rem',
						},
					}}
					expandIcon={getIcon(disabled, externalUrl)}
					className={clsx('nesa-accordion__header', {
						'nesa-accordion__active': expanded || expandStatus,
						'Mui-disabled ': disabled,
						'Mui-disabled--with-external-icon': !!externalUrl,
					})}
					disabled={disabled}
					onClick={handleClick}
				>
					<div className="flex flex-col">
						{subTitle && (
							<p className="!text-sm !font-normal">{subTitle}</p>
						)}
						{disabled ? (
							<p className={subTitle ? '!mt-1' : 'mt-0'}>
								{`${title} ${
									titleNote ? `(${titleNote})` : ''
								}`.trim()}
							</p>
						) : (
							// eslint-disable-next-line react/no-danger
							<p
								className={subTitle ? '!mt-1' : 'mt-0'}
								dangerouslySetInnerHTML={{
									__html: sanitizeHtml(title),
								}}
							/>
						)}
					</div>
				</AccordionSummary>
				{!disabled && (
					<AccordionDetails className="nesa-accordion__content">
						{renderFn
							? renderFn(expanded || expandStatus)
							: children}
					</AccordionDetails>
				)}
			</Accordion>
			{slotAfter}
		</div>
	)
}

export default CustomAccordion
