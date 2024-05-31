import { noop } from '@/utils'
import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { useRouter } from 'next/router'
import { ChangeEvent } from 'react'

export interface TabBarProps {
	value: string
	onChange: (_key: string) => void
	tabs?: {
		tabId: string
		panelId: string
		label: string
		className?: string
	}[]
	className?: string
	tabClassName?: string
	onPreviousClick?: () => void
	onNextClick?: () => void
	isModalTabBar?: boolean
	enableLinkTab?: boolean
}
const TabBar = (props: TabBarProps): JSX.Element => {
	const router = useRouter()
	const basePath = router.asPath.split('?')[0]
	const queries = Object.entries(router.query)
		.filter(([key]) => key !== 'slug')
		.reduce((acc, [key, val]) => {
			return {
				...acc,
				[key]: val,
			}
		}, {})
	const { value, onChange, tabs, className, tabClassName, enableLinkTab } =
		props

	const handleChange = (_event: ChangeEvent<{}>, changedValue: string) => {
		const selected = tabs?.find((t) => t.tabId === changedValue)

		if (selected && onChange) {
			onChange(selected.tabId)
		}
	}

	return (
		<Grid
			container
			sx={{
				flexGrow: 1,
				width: '100%',
				// backgroundColor: theme.palette.background.paper,
			}}
		>
			<Grid container item justifyContent="center">
				<Tabs
					value={value}
					onChange={handleChange}
					indicatorColor="secondary"
					variant="scrollable"
					aria-label="Scrollable detail header"
					className={className}
					sx={{
						'.MuiTabs-scroller:before': {
							content: '""',
							display: 'block',
							height: 2,
							background: 'var(--nsw-grey-04)',
							position: 'absolute',
							width: '100%',
							left: 0,
							bottom: 0,
						},
					}}
				>
					{tabs?.map((tab) => {
						return (
							<Tab
								key={tab.tabId}
								label={tab.label}
								value={tab.tabId}
								aria-controls={tab.panelId}
								className={`${tabClassName ?? ''} ${
									tab.className ?? ''
								}`}
								onClick={
									enableLinkTab
										? () => {
												router.push(
													{
														pathname: basePath,
														query: {
															...queries,
															tab: tab.tabId,
														},
													},
													undefined,
													{ shallow: true },
												)
										  }
										: noop
								}
							/>
						)
					})}
				</Tabs>
			</Grid>
		</Grid>
	)
}

export default TabBar
