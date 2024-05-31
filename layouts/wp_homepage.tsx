import RichText from '@/components/RichText'
import UnknownComponent from '@/components/UnknownComponent'
import { GridCol } from '@/components/nsw/grid/GridCol'
import { GridWrapper } from '@/components/nsw/grid/GridWrapper'
import UiCards from '@/components/sections/ui_cards'
import UiHeroBanner from '@/components/sections/ui_herobanner'
import UiLinkList, { PureUiLinkList } from '@/components/sections/ui_link_list'
import type { WpHomepage as WpHomepageModel } from '@/kontent/content-types/wp_homepage'
import type { CommonPageProps } from '@/types'
import { getLinkedItems } from '@/utils'

function WpHomepage(props: CommonPageProps<WpHomepageModel>) {
	const { mappings, data } = props
	const { pageResponse } = data
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
			{getLinkedItems(
				page.elements.hero_banner,
				pageResponse.linkedItems,
			).map((heroBanner) => {
				return (
					<UiHeroBanner
						key={heroBanner.system.codename}
						mappings={mappings}
						linkedItem={heroBanner}
					/>
				)
			})}
			{getLinkedItems(page.elements.stages, pageResponse.linkedItems).map(
				(stages) => {
					return (
						<div
							key={stages.system.codename}
							css={{
								'> .module': {
									backgroundColor: 'var(--nsw-brand-light)',
								},
							}}
						>
							<UiCards mappings={mappings} linkedItem={stages} />
						</div>
					)
				},
			)}
			{getLinkedItems(
				page.elements.learning_areas,
				pageResponse.linkedItems,
			).map((learningAreas) => (
				<div
					key={learningAreas.system.codename}
					css={{
						'& > .module > .nsw-container': {
							paddingTop: 16,
							paddingBottom: 16,
						},
					}}
				>
					<UiLinkList
						mappings={mappings}
						linkedItem={learningAreas}
					/>
				</div>
			))}

			{getLinkedItems(
				page.elements.teaching_and_learning,
				pageResponse.linkedItems,
			).map((teachingAndLearning) => (
				<div
					key={teachingAndLearning.system.codename}
					css={{
						'> .module': {
							backgroundColor: 'var(--nsw-off-white)',
						},
						'& > .module > .nsw-container': {
							paddingTop: 16,
							paddingBottom: 16,
						},
					}}
				>
					<UiCards
						mappings={mappings}
						linkedItem={teachingAndLearning}
					/>
				</div>
			))}

			{getLinkedItems(
				page.elements.ace_rules,
				pageResponse.linkedItems,
			).map((aceRules) => (
				<div
					key={aceRules.system.codename}
					css={{
						'> .module': {
							borderBottom: 'solid 1px #CDD3D6',
						},
						'& > .module > .nsw-container': {
							paddingTop: 16,
							paddingBottom: 16,
						},
					}}
				>
					<UiLinkList mappings={mappings} linkedItem={aceRules} />
				</div>
			))}

			<RichText
				className="w-full"
				mappings={mappings}
				linkedItems={pageResponse.linkedItems}
				richTextElement={page.elements.web_content_rtb__content}
			/>

			<section className="nsw-section">
				<GridWrapper>
					{getLinkedItems(
						page.elements.links,
						pageResponse.linkedItems,
					).map((homepageAdditionalLinkList) => (
						<GridCol
							key={homepageAdditionalLinkList.system.codename}
							lg={12}
						>
							<div className="p-4">
								<h3>
									{
										homepageAdditionalLinkList.elements
											.title.value
									}
								</h3>
								<div
									css={{
										'& .nsw-link-list.nsw-link-list': {
											marginTop: '1rem',
										},
									}}
								>
									<PureUiLinkList
										linkedItem={homepageAdditionalLinkList}
										mappings={mappings}
									></PureUiLinkList>
								</div>
							</div>
						</GridCol>
					))}

					{/* <GridCol lg={6}>
						<NewsletterSubscribeBox
							formAction="https://www.createsend.com/t/subscribeerror?description="
							createSendId="A61C50BEC994754B1D79C5819EC1255CCD2386443FB26FD42AF3FD1A3BBC639461D336C703F790384209E6460314264B9A4A6B927DB579AFC629F4679604D723"
						/>
					</GridCol> */}
				</GridWrapper>
			</section>
		</>
	)
}

export default WpHomepage
