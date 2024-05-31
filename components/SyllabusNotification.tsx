import { useToggle } from '@/hooks/useToggle'
import clsx from 'clsx'
import { ReactNode } from 'react'
import sanitize from 'sanitize-html'
import Icon from './Icon'

export interface SyllabusNotificationProps {
	title: ReactNode
	summary: ReactNode
	children?: ReactNode
}

const LINE_BREAK_REPLACEMENT = '<br/>'

const SyllabusNotificationSummary = ({
	summary,
}: {
	summary: SyllabusNotificationProps['summary']
}) => {
	const isSummaryString = typeof summary === 'string'
	//replace all line breaks with <br/> for richtext
	const _summary = isSummaryString
		? summary.replace(/(\n|\r)/g, LINE_BREAK_REPLACEMENT)
		: undefined

	{
		/* Summary */
	}
	if (_summary) {
		return (
			<div
				className={clsx('mt-4')}
				dangerouslySetInnerHTML={{ __html: sanitize(_summary) }}
			></div>
		)
	}

	return !isSummaryString && <div className={clsx('mt-4')}>{summary}</div>
}

const SyllabusNotification = (props: SyllabusNotificationProps) => {
	const { title, summary, children } = props
	const [expanded, toggle] = useToggle(false)
	const isSummaryString = typeof summary === 'string'
	const _summary = isSummaryString
		? summary.replace('\r\n', '<br/>').replace('\n', '<br/>')
		: undefined

	return (
		<section
			className="relative text-white py-6 transition"
			css={{
				background: 'var(--nsw-status-info)',
				'&:hover': {
					background: '#4364A3',
				},
			}}
		>
			<div className="nsw-container">
				<div className="nsw-h4 relative flex gap-8">
					<div className="flex-1">{title}</div>
					<button
						type="button"
						className="u-link-cover"
						onClick={toggle}
					>
						{expanded ? (
							<span className="sr-only">Collapse</span>
						) : (
							<span className="sr-only">Expand</span>
						)}
						<Icon
							icon={
								expanded ? 'mdi:chevron-up' : 'mdi:chevron-down'
							}
						/>
					</button>
				</div>
				{/* Summary */}
				{!expanded && <SyllabusNotificationSummary summary={summary} />}

				{/* Content */}
				<div className={clsx('mt-4', !expanded && 'hidden')}>
					{children}
				</div>
			</div>
		</section>
	)
}

export default SyllabusNotification
