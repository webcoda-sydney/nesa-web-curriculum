import { CustomSyllabusTab } from '@/types'
import { HTMLProps, ReactNode } from 'react'

export interface TabPanelProps extends HTMLProps<HTMLDivElement> {
	panelId: string
	tabId: string
	hidden?: boolean
	children: ReactNode
}

const TabPanel = (props: TabPanelProps) => {
	const { children, panelId, tabId, hidden, ...other } = props

	return (
		<div
			role="tabpanel"
			hidden={hidden}
			id={panelId}
			aria-label={tabId}
			{...other}
		>
			{!hidden && children}
		</div>
	)
}

export default TabPanel

export interface SyllabusTabPanelProps {
	/**
	 * Id of tab panel
	 */
	id: CustomSyllabusTab

	/**
	 * Tab value
	 */
	tabValue: string

	/**
	 * Children components
	 */
	children: ReactNode

	/**
	 * ClassName prop for TabPanel element
	 */
	className?: string

	/**
	 * Id of panel - should match controls
	 */
	panelId?: string
}

export const SyllabusTabPanel = ({
	id,
	tabValue,
	children,
	className,
	panelId,
}: SyllabusTabPanelProps) => (
	<TabPanel
		panelId={panelId ? `${panelId}` : `tab-panel-${id}`}
		tabId={id}
		hidden={tabValue !== id}
		className={className}
	>
		<div className="px-4 pt-8">{children}</div>
	</TabPanel>
)
