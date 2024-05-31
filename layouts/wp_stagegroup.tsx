import NonFullWidthWrapper from '@/components/NonFullWidthWrapper'
import RichText from '@/components/RichText'
import UnknownComponent from '@/components/UnknownComponent'
import { CommonCopyUrlWrapper } from '@/components/ui/copy-to-clipboard/CommonCopyUrlWrapper'
import { useCleanPathDefault } from '@/hooks/useCleanPathDefault'
import type { WpStagegroup as WpStageGroupModel } from '@/kontent/content-types/wp_stagegroup'
import type { CommonPageProps } from '@/types'

function WpStageGroup(props: CommonPageProps<WpStageGroupModel, any>) {
	const currentUrl = useCleanPathDefault()
	const { pageResponse } = props.data
	const page = pageResponse.item

	if (!page) {
		return (
			<UnknownComponent>
				Page {page.system.codename} does not have any content!
			</UnknownComponent>
		)
	}

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
					className="w-full"
					mappings={props.mappings}
					linkedItems={pageResponse.linkedItems}
					richTextElement={page.elements.web_content_rtb__content}
				/>
			</NonFullWidthWrapper>
		</>
	)
}

export default WpStageGroup
