import Image from '@/components/Image'
import type { Contentblock } from '@/kontent/content-types/contentblock'
import type { UiHerobanner } from '@/kontent/content-types/ui_herobanner'
import type { Weblinkext } from '@/kontent/content-types/weblinkext'
import Banner from '@/legacy-ported/components/base/Banner'
import VideoModal from '@/legacy-ported/components/base/VideoModal'
import { getLinkFromLinkUI } from '@/utils/getLinkFromLinkUI'
import { Fragment, useState } from 'react'
import type { RichtextSectionProps } from '.'
import {
	getLinkedItems,
	useKontentHomeConfig,
} from '../contexts/KontentHomeConfigProvider'

export const HomepageBanner = (props: RichtextSectionProps<UiHerobanner>) => {
	const [openVideoModal, setOpenVideoModal] = useState(false)
	const { linkedItem, mappings } = props
	const { pageResponseLinkedItems } = useKontentHomeConfig()

	const handleOnClick = (e) => {
		e.preventDefault()
		setOpenVideoModal(true)
	}

	const handleVideoModalCancel = () => {
		setOpenVideoModal(false)
	}

	return (
		<section data-kontent-item-id={linkedItem.system.id} className="module">
			{getLinkedItems(
				linkedItem.elements.items,
				pageResponseLinkedItems,
			).map((item: Contentblock) => {
				const moreInfoLinkLinkedItems = getLinkedItems(
					item.elements.more_info_link,
					pageResponseLinkedItems,
				)[0] as Weblinkext

				let url = ''
				if (moreInfoLinkLinkedItems) {
					const { url: _url } = getLinkFromLinkUI(
						moreInfoLinkLinkedItems,
						mappings,
						pageResponseLinkedItems,
					)
					url = _url
				}

				const image = item.elements.image.value?.[0]
				return (
					<Fragment key={item.system.id}>
						<Banner
							title={item.elements.title.value}
							description={
								item.elements.content.value ||
								item.elements.sub_title.value
							}
							image={
								<div className="w-full h-full relative">
									<Image
										alt={image.description || ''}
										asset={image}
										layout="fill"
										priority
										objectFit="cover"
									/>
								</div>
							}
							buttonLabel={
								moreInfoLinkLinkedItems?.elements.title.value
							}
							buttonUrl={url}
							onClick={handleOnClick}
						/>
						{openVideoModal && url && (
							<VideoModal
								ariaLabel={
									moreInfoLinkLinkedItems?.elements.title
										.value
								}
								modalStatus={openVideoModal}
								onCancel={handleVideoModalCancel}
								video={url}
							/>
						)}
					</Fragment>
				)
			})}
		</section>
	)
}

export default HomepageBanner
