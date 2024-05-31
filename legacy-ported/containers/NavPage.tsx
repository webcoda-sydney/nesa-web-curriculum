import type { CommonPageProps, LinkType, Mapping } from '@/types'
// import { useHistory } from 'react-router-dom'
// import { frontendPages } from '../utilities/hooks/useNavGroups'
// import CustomModal from '../components/base/CustomModal'
import GlobalAlert from '@/components/GlobalAlert'
import Icon from '@/components/Icon'
import Link, { LinkNoPrefetch } from '@/components/Link'
import RichText from '@/components/RichText'
import SanitisedHTMLContainer from '@/components/SanitisedHTMLContainer'
import {
	getLinkedItems,
	useKontentHomeConfig,
} from '@/components/contexts/KontentHomeConfigProvider'
import { GridCol } from '@/components/nsw/grid/GridCol'
import { GridWrapper } from '@/components/nsw/grid/GridWrapper'
import NextMuiLink from '@/components/ui/NextMuiLink'
import { useDisabledTaxoStages } from '@/hooks/useDisabledLearningAreasAndStages'
import { Weblinkext, WpHomepage } from '@/kontent/content-types'
import type { CollectionWeblink } from '@/kontent/content-types/collection_weblink'
import type { UiMenu } from '@/kontent/content-types/ui_menu'
import { getBreadcrumb, isShowPublished } from '@/utils'
import { flattenCollectionWebLinks } from '@/utils/collectionWebLinks'
import { getLinkFromLinkUI } from '@/utils/getLinkFromLinkUI'
import {
	IContentItem,
	IContentItemElements,
	IContentItemsContainer,
} from '@kontent-ai/delivery-sdk'
import clsx from 'clsx'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import {
	Breadcrumbs,
	Footer,
	FooterLinks,
	FooterLower,
	FooterSectionGroup,
	FooterUpper,
	Header,
	MainNav,
	Masthead,
	GlobalAlert as NswGlobalAlert,
} from 'nsw-ds-react'
import { GlobalAlertProps } from 'nsw-ds-react/dist/component/global-alert/globalAlert'
import { NavItem } from 'nsw-ds-react/dist/component/main-nav/mainNav'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { useCookies } from 'react-cookie'
import { UrlLink } from '../utilities/frontendTypes'

export interface NavPageProps
	extends CommonPageProps<IContentItem<IContentItemElements>, any> {
	children?: ReactNode
	mappings: Mapping[]
	breadcrumbLinks?: UrlLink[]
}

interface IFooterNavCol {
	id: string
	nav: UiMenu[]
}

const ReactJson = dynamic(() => import('react-json-view'), {
	ssr: false,
}) as any

export const createNavItem = (
	item: UiMenu,
	mappings: Mapping[],
	disabledStages = [],
	linkedItems: IContentItemsContainer,
	preview = false,
): NavItem => {
	const { url = '/', isExternal } = getLinkFromLinkUI(
		item,
		mappings,
		linkedItems,
		preview,
	)
	const subNav = getLinkedItems(item.elements?.subitems, linkedItems).map(
		(_item: UiMenu) =>
			createNavItem(
				_item,
				mappings,
				disabledStages,
				linkedItems,
				preview,
			),
	)

	const internalLink = preview ? LinkNoPrefetch : Link

	return {
		description: item.elements.subtitle.value,
		id: item.system.codename,
		subNav,
		subNavHeader:
			item.elements.titlelong.value || item.elements.title.value,
		text: item.elements.title.value,
		url,
		target: isExternal ? '_blank' : undefined,
		linkComponent: isExternal ? 'a' : internalLink,
	} as NavItem
}

const closeSubNav = () => {
	/**
	 * Remove active subnav when going to another route
	 */
	document.querySelector('#main-nav').classList.remove('active', 'no-scroll')
	document
		.querySelectorAll('#main-nav .active')
		.forEach((el) => el.classList.remove('active'))
	document
		.querySelectorAll('#main-nav [aria-expanded]:not(button)')
		.forEach((el) => el.setAttribute('aria-expanded', 'false'))

	/**
	 * Mobile: Close menu
	 */
	document.querySelector('body').classList.remove('main-nav-active')
}

const Copyright = () => {
	const { config, mappings } = useKontentHomeConfig()
	const itemLink = getLinkedItems(
		config.item.elements.copyright_link,
		config.linkedItems,
	)[0]

	const { url, isExternal } = getLinkFromLinkUI(
		itemLink,
		mappings,
		config.linkedItems,
	)

	return (
		<NextMuiLink href={url} target={isExternal ? '_blank' : undefined}>
			Copyright &copy; {new Date().getFullYear()}
		</NextMuiLink>
	)
}

/**
 * Basic page container with navigation functionality. Includes a header with primary links,
 * a footer with secondary links and a breadcrumb showing current page hierarchy
 * @param props
 * @constructor
 */
const NavPage = (props: NavPageProps) => {
	const router = useRouter()
	const [keyMenu, setKeyMenu] = useState(0)
	const {
		children,
		className,
		rootLayoutClassName,
		mappings,
		preview,
		breadcrumbLinks = props.params?.slug?.length
			? getBreadcrumb(props.params.slug, props.mappings)
			: [],
		...headerProps
	} = props
	const [hidden, setHidden] = useState(true)
	const [cookies, setCookie] = useCookies(['hideglobalinfo'])
	const [showGlobalInfo, setShowGlobalInfo] = useState(false)

	const config = props.data?.config?.item as WpHomepage
	const configLinkedItems = props.data?.config?.linkedItems

	// Global Info - appears above Masthead
	const globalInfoData = config?.elements?.global_info
	const globalInfoDataLinkedItems = getLinkedItems(
		globalInfoData,
		configLinkedItems,
	)
	const globalInfoLastModifieds =
		globalInfoDataLinkedItems
			?.map((item) => {
				return item.system.lastModified
			})
			.join(',') || ''

	// Global Alert - appears below Masthead
	const globalAlertData = config?.elements?.global_alert

	const handleScroll = () => {
		// Show scroll to top button only when not at the top
		const scroll = window.pageYOffset

		if (scroll) {
			setHidden(false)
		} else {
			setHidden(true)
		}
	}

	const handleScrollToTop = () => {
		window.scrollTo({
			left: 0,
			top: 0,
			behavior: 'smooth',
		})
	}

	const handleGlobalInfoClose = () => {
		setCookie('hideglobalinfo', globalInfoLastModifieds)
	}

	useEffect(() => {
		// Detect scroll up/down
		window.addEventListener('scroll', handleScroll)
		return () => window.removeEventListener('scroll', handleScroll)
	})

	useEffect(() => {
		setShowGlobalInfo(cookies.hideglobalinfo !== globalInfoLastModifieds)
	}, [cookies.hideglobalinfo, globalInfoLastModifieds])

	// Computed
	const disabledStages = useDisabledTaxoStages(props.data?.config)

	const navItems = useMemo(() => {
		if (!config) return []

		const initialNavs = flattenCollectionWebLinks(
			getLinkedItems(
				config.elements.main_menu,
				configLinkedItems,
			) as CollectionWeblink[],
			configLinkedItems,
		)
		return initialNavs.map((item: UiMenu) =>
			createNavItem(
				item,
				mappings,
				disabledStages,
				configLinkedItems,
				preview,
			),
		)
	}, [config, configLinkedItems, disabledStages, mappings, preview])

	useEffect(() => {
		const routeChangeComplete = () => {
			const _keyMenu = +new Date()
			// to force re-render on route change
			setKeyMenu(_keyMenu)
			closeSubNav()
		}
		router.events.on('routeChangeComplete', routeChangeComplete)
		return () => {
			router.events.off('routeChangeComplete', routeChangeComplete)
		}
	}, [router])

	return (
		<div
			className={clsx(
				'min-h-screen flex flex-col w-full',
				preview && 'is-preview',
			)}
		>
			<a
				className="absolute -translate-y-full outline-0 focus:relative focus:translate-y-0 bg-black text-white py-3 font-bold focus:underline text-center block"
				href="#content"
			>
				Skip to content
			</a>
			{preview && (
				<div className="sticky z-10 top-0 text-right bg-black">
					<div className="flex items-center justify-between nsw-container">
						<div className="flex items-center gap-3 py-1">
							<div className="site-footer__link font-bold">
								Preview mode
							</div>
							{isShowPublished(props.previewData) && (
								<div className="site-footer__link font-bold text-yellow">
									<span className="text-yellow-400">
										Showing published content
									</span>
								</div>
							)}
						</div>
						{/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
						<a
							href="/api/exit-preview"
							className="site-footer__link font-bold"
							css={{
								'&&': {
									color: '#fff',
								},
							}}
						>
							Exit preview
						</a>
					</div>
				</div>
			)}
			{showGlobalInfo &&
				globalInfoDataLinkedItems?.map((globalInfoData) => {
					return (
						<NswGlobalAlert
							key={globalInfoData.system.id}
							title={globalInfoData.elements.intro.value}
							content={
								<RichText
									className="mt-4"
									linkedItems={configLinkedItems}
									mappings={mappings}
									richTextElement={
										globalInfoData.elements.content
									}
								/>
							}
							as={
								globalInfoData.elements.type.value[0]
									.codename as GlobalAlertProps['as']
							}
							onClose={handleGlobalInfoClose}
						/>
					)
				})}

			<Masthead />

			{getLinkedItems(globalAlertData, configLinkedItems).map(
				(globalAlertObj, key) => {
					return (
						<GlobalAlert
							key={key}
							linkedItems={configLinkedItems}
							mappings={mappings}
							alertData={globalAlertObj}
						/>
					)
				},
			)}
			<Header
				headerUrl="/"
				siteTitle={
					headerProps?.data.config.item.elements.site_prefix.value
				}
				siteDescriptor={
					headerProps?.data.config.item.elements.descriptor.value
				}
				onSubmit={undefined}
				search={false}
				linkComponent={Link}
			/>

			<MainNav key={keyMenu} navItems={navItems} megaMenu />

			{!!breadcrumbLinks?.length && (
				<div
					css={{
						'.nsw-breadcrumbs': {
							marginTop: 0,
						},
					}}
					className="nsw-container w-full py-4"
				>
					<Breadcrumbs
						className="w-full"
						items={breadcrumbLinks.map((urlLink) => {
							return {
								link: urlLink.url,
								href: urlLink.url,
								text: urlLink.title,
								linkComponent: preview ? LinkNoPrefetch : Link,
							}
						})}
						css={{
							'li:last-child a': {
								color: 'var(--nsw-text-dark)',
								pointerEvents: 'none',
								textDecoration: 'none',
							},
							'&.nsw-breadcrumbs li:before': {
								content: '""',
								background:
									'url(https://api.iconify.design/ic/baseline-keyboard-arrow-right.svg) no-repeat center center / contain',
								backgroundSize: '20px 20px',
								width: 20,
								height: 20,
							},
						}}
					/>
				</div>
			)}

			<main
				id="content"
				className={clsx(
					'flex-auto nsw-container w-full py-8 lg:pb-16',
					rootLayoutClassName,
				)}
			>
				{!['production', 'preview'].includes(
					process.env.NEXT_PUBLIC_VERCEL_ENV,
				) && <ReactJson collapsed src={props} />}
				{children}
			</main>

			{!hidden && (
				<button
					onClick={handleScrollToTop}
					className="nav-page__scrollToTop"
					aria-label="Scroll to top"
				>
					<Icon
						icon="ic:baseline-expand-less"
						width={30}
						height={30}
					/>
				</button>
			)}

			<Footer data-kontent-item-id={config.system.id}>
				<FooterUpper>
					<div className="w-full px-4 pb-6 mb-6">
						<GridWrapper spacing={{ xs: 8 }}>
							<GridCol xs="auto" flexShrink={0}>
								<RichText
									data-kontent-element-codename="footer_top_content"
									linkedItems={configLinkedItems}
									className="flex items-center space-y-0"
									mappings={mappings}
									richTextElement={
										config.elements.footer_top_content
									}
									css={{
										a: {
											fontWeight: 400,
											fontSize: '.875rem',
										},
										'& > p:not(:last-child)': {
											marginRight: '2rem',
										},
									}}
								/>
							</GridCol>
							<GridCol xs="auto">
								<div
									data-kontent-element-codename="social_links"
									css={{
										display: 'flex',
										'& > *:not(:last-child)': {
											marginRight: '1rem',
										},
										'& a': {
											color: 'var(--nsw-text-dark)',
											'&:hover, &:focus': {
												color: 'var(--nsw-brand-dark)',
											},
										},
									}}
								>
									{getLinkedItems(
										config.elements.social_links,
										configLinkedItems,
									).map((item: Weblinkext) => {
										const { isExternal, url } =
											getLinkFromLinkUI(
												item,
												mappings,
												configLinkedItems,
												preview,
											)

										return (
											<NextMuiLink
												key={item.system.id}
												href={url}
												target={
													isExternal
														? '_blank'
														: undefined
												}
												className="no-icon"
												title={
													item.elements.title.value
												}
												aria-label={
													item.elements.title.value
												}
												prefetch={!preview}
											>
												<Icon
													icon={`fa-brands:${item.elements.title.value.toLowerCase()}`}
													width={24}
													height={24}
												/>
											</NextMuiLink>
										)
									})}
								</div>
							</GridCol>
						</GridWrapper>
					</div>
					<div className="w-full overflow-hidden">
						<GridWrapper spacing={{ xs: 8 }}>
							{getLinkedItems(
								config.elements.footer_menu_links,
								configLinkedItems,
							).flatMap((col, _index, _footerMenuCols) => {
								const footerNavItems: IFooterNavCol[] =
									getLinkedItems(
										col.elements.items,
										configLinkedItems,
									).reduce((acc, current) => {
										if (
											current.system.codename.includes(
												'syllabus_support',
											)
										) {
											const theParent = acc.find(
												(parent) =>
													parent.nav.some((navItem) =>
														navItem.system.codename.includes(
															'teaching',
														),
													),
											)

											if (theParent) {
												theParent.nav.push(current)
											}

											return acc
										}

										return [
											...acc,
											{
												id: `footer-nav-${current.system.codename}`,
												nav: [current],
											} as IFooterNavCol,
										]
									}, [])
								return (
									<GridCol
										key={col.system.id}
										md={6}
										lg={
											12 /
											Math.min(_footerMenuCols.length, 4)
										}
									>
										{footerNavItems.flatMap((item) => {
											return item.nav.map((_item) => {
												const link = getLinkFromLinkUI(
													_item,
													mappings,
													configLinkedItems,
													preview,
												)
												return (
													<FooterSectionGroup
														key={
															_item.system
																.codename
														}
														className={clsx(
															'flex-shrink-0 max-w-full',
														)}
														heading={{
															...link,
															text: _item.elements
																.title.value,
														}}
														sectionLinks={getLinkedItems(
															(_item as UiMenu)
																.elements
																?.subitems,
															configLinkedItems,
														).map((subitem) => {
															const {
																isExternal,
																..._link
															} = getLinkFromLinkUI(
																subitem,
																mappings,
																configLinkedItems,
																preview,
															)
															return {
																..._link,
																text: subitem
																	.elements
																	.title
																	.value,
															}
														})}
													/>
												)
											})
										})}
									</GridCol>
								)
							})}
						</GridWrapper>
					</div>
				</FooterUpper>
				<FooterLower>
					<div className="nsw-container">
						<SanitisedHTMLContainer>
							{config.elements.acknowledgement.value}
						</SanitisedHTMLContainer>
						<hr />
						<FooterLinks
							footerLinks={getLinkedItems(
								config.elements.secondary_links,
								configLinkedItems,
							).flatMap((item) =>
								getLinkedItems(
									item.elements.items,
									configLinkedItems,
								).map((link: LinkType) => {
									const { isExternal, ..._link } =
										getLinkFromLinkUI(
											link,
											mappings,
											configLinkedItems,
											preview,
										)
									return {
										..._link,
										text: link.elements.title.value,
									}
								}),
							)}
						/>

						<p>
							<Copyright />
						</p>
					</div>
				</FooterLower>
			</Footer>
		</div>
	)
}

export default NavPage
