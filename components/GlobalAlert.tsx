import RichText from '@/components/RichText'
import { STYLES } from '@/constants/styles'
import { useToggle } from '@/hooks/useToggle'
import { UiGlobalalert } from '@/kontent/content-types'
import DESIGN from '@/legacy-ported/constants/designConstants'
import type { Mapping } from '@/types'
import { IContentItemsContainer } from '@kontent-ai/delivery-sdk'
import clsx from 'clsx'
import Link from 'next/link'
import { Button } from 'nsw-ds-react'
import Icon from './Icon'

export interface GlobalAlertDetailsProps {
	alertData: UiGlobalalert
	mappings: Mapping[]
	linkedItems: IContentItemsContainer
}

const renderButtons = (alertData: GlobalAlertDetailsProps['alertData']) => {
	const isPrimaryButtonExist =
		!!alertData.elements.btn_primary_url.value &&
		!!alertData.elements.btn_primary_text.value
	const isPrimarySecondaryExist =
		!!alertData.elements.btn_secondary_url.value &&
		!!alertData.elements.btn_secondary_text.value

	return (
		<>
			{isPrimaryButtonExist && (
				<Link href={alertData.elements.btn_primary_url.value} passHref>
					<Button
						linkComponent="a"
						link={alertData.elements.btn_primary_url.value}
						style="white"
						className="w-full md:w-auto"
						target="_blank"
					>
						{alertData.elements.btn_primary_text.value}
					</Button>
				</Link>
			)}
			{isPrimarySecondaryExist && (
				<Link
					href={alertData.elements.btn_secondary_url.value}
					passHref
				>
					<Button
						linkComponent="a"
						link={alertData.elements.btn_secondary_url.value}
						style="white"
						className="w-full md:w-auto mt-4 md:mt-0 md:ml-2.5"
						target="_blank"
					>
						{alertData.elements.btn_secondary_text.value}
					</Button>
				</Link>
			)}
		</>
	)
}

const GlobalAlert = (props: GlobalAlertDetailsProps) => {
	const { linkedItems, alertData, mappings } = props
	const [expanded, toggle] = useToggle(false)

	return (
		<div
			className="py-6 text-white"
			css={{
				backgroundColor: DESIGN.COLOR_NOTIFICATION_INFO_BLUE,
			}}
		>
			<div className="nsw-container">
				<div className="flex items-center w-full">
					<h4 className="flex-1">{alertData.elements.intro.value}</h4>
					<div
						className={clsx('mx-4 hidden', !expanded && 'lg:block')}
					>
						{renderButtons(alertData)}
					</div>

					<button type="button" onClick={toggle} className="w-6 h-6">
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
				<div className={clsx('mt-4 md:pr-6', !expanded && 'hidden')}>
					<RichText
						mappings={mappings}
						linkedItems={linkedItems}
						richTextElement={alertData.elements.content}
						css={STYLES.DARK_BACKGROUND_RTE}
					/>
					<div className="mt-6">{renderButtons(alertData)}</div>
				</div>
			</div>
		</div>
	)
}

export default GlobalAlert
