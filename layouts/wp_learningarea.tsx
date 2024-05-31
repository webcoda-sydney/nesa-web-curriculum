import RichText from '@/components/RichText'
import UnknownComponent from '@/components/UnknownComponent'
import { CommonCopyUrlWrapper } from '@/components/ui/copy-to-clipboard/CommonCopyUrlWrapper'
import { useCleanPathDefault } from '@/hooks/useCleanPathDefault'
import type { WpLearningarea as WpLearningareaModel } from '@/kontent/content-types/wp_learningarea'
import type { CommonPageProps } from '@/types'
import { useRouter } from 'next/router'

function WpLearningArea(props: CommonPageProps<WpLearningareaModel>) {
	const { pageResponse } = props.data
	const page = pageResponse.item
	const router = useRouter()
	const currentUrl = useCleanPathDefault()

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
			<RichText
				className="w-full"
				currentPath={router.asPath}
				mappings={props.mappings}
				linkedItems={pageResponse.linkedItems}
				richTextElement={page.elements.web_content_rtb__content}
				currentKeyLearningAreas={
					page.elements.key_learning_area__items.value
				}
			/>
		</>
	)
}

export default WpLearningArea
