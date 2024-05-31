import { MEDIA_QUERIES } from '@/constants'
import type { UiLinkList } from '@/kontent/content-types/ui_link_list'
import { getLinkFromLinkUI } from '@/utils/getLinkFromLinkUI'
import { css } from '@emotion/react'
import { Icon } from '@iconify/react'
import type { RichtextSectionProps } from '.'
import { ModuleSectionWrapper } from '../ModuleSectionWrapper'
import {
	getLinkedItems,
	useKontentHomeConfig,
} from '../contexts/KontentHomeConfigProvider'
import { NswLinkList } from '../nsw/NswLinkList'

export const PureUiLinkList = (props: RichtextSectionProps<UiLinkList>) => {
	const { linkedItem, mappings } = props
	const { pageResponseLinkedItems } = useKontentHomeConfig()
	const columns = parseInt(linkedItem.elements.columns.value?.[0].name || '1')
	return (
		<NswLinkList
			css={css(
				{
					['& .nsw-link-list__item:nth-child(n+2)']: {
						marginTop: -1,
					},
				},
				columns > 1
					? {
							columnGap: '2rem',
							[MEDIA_QUERIES.tablet]: {
								columnCount: columns,
							},
					  }
					: undefined,
			)}
			items={getLinkedItems(
				linkedItem.elements.items,
				pageResponseLinkedItems,
			).map((item) => {
				const { url, target, rel, linkComponent, isExternal } =
					getLinkFromLinkUI(item, mappings, pageResponseLinkedItems)
				return {
					link: url,
					href: url,
					text: (
						<>
							<span className="!no-underline">
								{item.elements.title.value}
							</span>
							{isExternal && (
								<Icon
									className="ml-[5px]"
									icon="fa-solid:external-link-alt"
									width="1em"
									height="1em"
								/>
							)}
						</>
					),
					target,
					rel,
					linkComponent,
				}
			})}
		/>
	)
}

export default function UiLinkListComponent(
	props: RichtextSectionProps<UiLinkList>,
) {
	const { linkedItem } = props
	const title = linkedItem.elements.title.value

	return (
		<ModuleSectionWrapper className="ui_link_list">
			{!!title && <h2 className="nsw-section-title">{title}</h2>}
			<PureUiLinkList {...props} />
		</ModuleSectionWrapper>
	)
}
