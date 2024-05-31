import NonFullWidthWrapper from '@/components/NonFullWidthWrapper'
import RichText from '@/components/RichText'
import UnknownComponent from '@/components/UnknownComponent'
import UiCards from '@/components/sections/ui_cards'
import { useCleanPathDefault } from '@/hooks/useCleanPathDefault'
import { WpLearningareas, WpStages } from '@/kontent/content-types'
import { CommonPageProps } from '@/types'
import {
	getLinkedItems,
	useKontentHomeConfig,
} from '../contexts/KontentHomeConfigProvider'
import { CommonCopyUrlWrapper } from '../ui/copy-to-clipboard/CommonCopyUrlWrapper'

const ListingLanding = <
	TProps extends CommonPageProps<WpLearningareas | WpStages>,
>(
	props: TProps,
) => {
	const currentUrl = useCleanPathDefault()
	const { data, mappings } = props || {}
	const { pageResponse } = data
	const page = pageResponse.item
	const { pageResponseLinkedItems } = useKontentHomeConfig()

	if (!page) {
		return (
			<UnknownComponent>
				Page {page.system.codename} does not have any content!
			</UnknownComponent>
		)
	}

	const linkCards = getLinkedItems(
		page.elements.links,
		pageResponseLinkedItems,
	)

	return (
		<>
			{page.elements.title.value && (
				<CommonCopyUrlWrapper url={currentUrl} className="mb-8">
					<h1
						data-kontent-item-id={page.system.id}
						data-kontent-element-codename="title"
					>
						{page.elements.title.value}
					</h1>
				</CommonCopyUrlWrapper>
			)}
			<NonFullWidthWrapper>
				<RichText
					className="w-full cms-content-formatting"
					mappings={mappings}
					linkedItems={pageResponse.linkedItems}
					richTextElement={page.elements.web_content_rtb__content}
				/>
			</NonFullWidthWrapper>

			{linkCards?.map((linkCard) => {
				return (
					<UiCards
						key={linkCard.system.codename}
						linkedItem={linkCard}
						mappings={mappings}
					></UiCards>
				)
			})}
		</>
	)
}

export default ListingLanding
