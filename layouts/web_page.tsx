import InPageNav, { useInPageNav } from '@/components/InPageNav'
import Link from '@/components/Link'
import NonFullWidthWrapper from '@/components/NonFullWidthWrapper'
import RichText from '@/components/RichText'
import UnknownComponent from '@/components/UnknownComponent'
import { WrapperWithInView } from '@/components/WrapperWithInView'
import {
	getLinkedItems,
	useKontentHomeConfig,
} from '@/components/contexts/KontentHomeConfigProvider'
import { GridCol } from '@/components/nsw/grid/GridCol'
import {
	SideNav,
	SideNavItem,
	SideNavProps,
	getStickySideNavStyle,
} from '@/components/nsw/side-nav/SideNav'
import { CommonCopyUrlWrapper } from '@/components/ui/copy-to-clipboard/CommonCopyUrlWrapper'
import { useCleanPathDefault } from '@/hooks/useCleanPathDefault'
import { UiMenu } from '@/kontent/content-types'
import type { WebPage as WebPageModel } from '@/kontent/content-types/web_page'
import type { CommonPageProps, Mapping } from '@/types'
import { getUrlFromMapping, isYes } from '@/utils'
import { css } from '@emotion/react'
import { Responses } from '@kontent-ai/delivery-sdk'
import { useRouter } from 'next/router'
import { GlobalAlertAce } from './wp_ace_landing'

export const buildSideNavPropsFromLeftNavigation = (
	leftNavigation: UiMenu[],
	pageResponse: Responses.IViewContentItemResponse<WebPageModel>,
	mappings: Mapping[],
): SideNavProps[] => {
	const page = pageResponse.item
	return (
		leftNavigation?.map((navigation) => {
			const linkedNavItems = getLinkedItems(
				navigation.elements.subitems,
				pageResponse.linkedItems,
			)

			return {
				header: {
					text: navigation.elements.title.value,
					href: getUrlFromMapping(
						mappings,
						navigation.elements.item.value[0],
					),
					tag: Link,
					onClick: undefined,
				} as SideNavItem,
				items: linkedNavItems.map((linkedNavItem) => {
					const url = getUrlFromMapping(
						mappings,
						linkedNavItem.system.codename,
					)
					const nav = getLinkedItems(
						linkedNavItem.elements.item,
						pageResponse.linkedItems,
					)

					return {
						isActive: nav?.[0]?.system?.id == page.system.id,
						text: linkedNavItem.elements.title.value,
						href: url,
					}
				}) as SideNavItem[],
			}
		}) || []
	)
}

export const scrollMarginIfTheresGlobalAlert = (isPreview) => css`
	&&& h1[id],
	&&& h2[id],
	&&& h3[id],
	&&& h4[id],
	&&& h5[id],
	&&& h6[id] {
		scroll-margin-top: calc(
			var(--global-alert-ace-height) ${isPreview ? '+ 26px' : ''}
		);
	}
`

function WebPage(props: CommonPageProps<WebPageModel>) {
	const { mappings } = useKontentHomeConfig()
	const { pageResponse, config } = props.data
	const page = pageResponse.item
	const router = useRouter()
	const currentUrl = useCleanPathDefault()
	const [rteEl, refWrapper] = useInPageNav()

	const leftNavigation = getLinkedItems(
		page.elements.left_navigation,
		pageResponse.linkedItems,
	)

	const isShowLeftNavigation = !!leftNavigation?.length

	const mapLeftNav = buildSideNavPropsFromLeftNavigation(
		leftNavigation,
		pageResponse,
		mappings,
	)

	if (!page) {
		return (
			<UnknownComponent>
				Page {page.system.codename} does not have any content!
			</UnknownComponent>
		)
	}

	const isShowInPageNavigation = isYes(page.elements.show_in_page_navigation)

	const hasAceGlobalAlert =
		/^ace_/gi.test(page.system.codename) &&
		config.item.elements.global_alert_ace.value.length > 0

	return (
		<>
			{
				// if the page codename starts with ace_, show global alert ace
				hasAceGlobalAlert && (
					<GlobalAlertAce config={config} mappings={mappings} />
				)
			}
			<div
				ref={refWrapper}
				key={page.system.id}
				className="nsw-container lg:px-4 pt-8"
			>
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

				<NonFullWidthWrapper
					slotBefore={
						isShowLeftNavigation && (
							<GridCol lg={4}>
								<WrapperWithInView>
									{(isSticky) => {
										return mapLeftNav.map((nav, iNav) => (
											<SideNav
												key={iNav}
												header={nav.header}
												className="sticky top-0"
												css={css(
													getStickySideNavStyle(
														isSticky,
													),
													hasAceGlobalAlert &&
														css({
															'&&': {
																top: 'calc(var(--global-alert-ace-height) + 26px)',
															},
														}),
												)}
												items={nav.items}
											/>
										))
									}}
								</WrapperWithInView>
							</GridCol>
						)
					}
				>
					<RichText
						className="w-full cms-content-formatting"
						mappings={props.mappings}
						linkedItems={pageResponse.linkedItems}
						richTextElement={page.elements.web_content_rtb__content}
						data-kontent-item-id={page.system.id}
						data-kontent-element-codename="web_content_rtb__content"
						css={css(
							hasAceGlobalAlert &&
								scrollMarginIfTheresGlobalAlert(props.preview),
							{
								'.module:first-child': {
									marginTop: '-2rem',
								},
							},
						)}
						renderFnBefore={(nodes) => {
							if (!isShowInPageNavigation) return
							return (
								<InPageNav
									className="!mt-0"
									richTextElements={nodes as JSX.Element[]}
								/>
							)
						}}
					/>
				</NonFullWidthWrapper>
			</div>
		</>
	)
}

export default WebPage
