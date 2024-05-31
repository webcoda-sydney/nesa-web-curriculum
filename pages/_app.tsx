import { Loading } from '@/components/Loading'
import { KontentHomeConfigProvider } from '@/components/contexts/KontentHomeConfigProvider'
import { WpHomepage } from '@/kontent/content-types'
import NavPage from '@/legacy-ported/containers/NavPage'
import '@/legacy-ported/sass/app.scss'
import type { CommonPageProps, KontentCurriculumResultBaseData } from '@/types'
import { getUrlFromMapping } from '@/utils'
import createEmotionCache from '@/utils/createEmotionCache'
import { EmotionCache } from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import KontentSmartLink from '@kentico/kontent-smart-link'
import type {
	Elements,
	IContentItem,
	Responses,
} from '@kontent-ai/delivery-sdk'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { withPasswordProtect } from '@storyofams/next-password-protect'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import get from 'lodash.get'
import { NextPage } from 'next'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Router } from 'next/router'
import Script from 'next/script'
import React, { ReactElement, ReactNode } from 'react'
import { CookiesProvider } from 'react-cookie'
import sanitizeHtml from 'sanitize-html'
import NextNProgress from 'webcoda-nextjs-progressbar'

// import "../styles/main.css";

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

export type NextPageGetLayout = (
	_page: ReactElement,
	_serverRouter: Router,
	_props?: any,
) => ReactNode
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
	getLayout?: NextPageGetLayout
}
interface MyAppProps extends AppProps {
	emotionCache?: EmotionCache
	pageProps: CommonPageProps<
		IContentItem,
		KontentCurriculumResultBaseData<IContentItem>
	>
	Component: NextPageWithLayout
}

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: Infinity,
			cacheTime: Infinity,
		},
	},
})

export const getTitleWithSuffix = (
	title: string,
	config: Responses.IViewContentItemResponse<WpHomepage>,
) => {
	let _title = title
	let siteDescriptor = config?.item?.elements?.descriptor?.value || ''
	if (_title) {
		_title += ' | '
	}
	_title += config?.item?.elements?.site_prefix?.value || ''
	if (siteDescriptor) {
		_title = _title + ' | ' + siteDescriptor
	}
	return _title
}

function MyApp({
	Component,
	pageProps,
	router,
	emotionCache = clientSideEmotionCache,
}: MyAppProps) {
	const { config, pageResponse } = pageProps?.data || {}

	const fontName = 'Public Sans'

	const seo = {
		title:
			get(pageResponse, 'item.elements.seo__title.value', '') ||
			get(pageResponse, 'item.elements.label.value', ''),
		description:
			get(pageResponse, 'item.elements.seo__description.value', '') ||
			sanitizeHtml(
				get(pageResponse, 'item.elements.description.value', ''),
				{ allowedTags: [] },
			),
		keywords: get(pageResponse, 'item.elements.seo__keywords.value', ''),
		canonicalUrl: get(
			pageResponse,
			'item.elements.seo__canonical_url.value',
			'',
		),
		noIndex: get(pageResponse, 'item.elements.seo__options.value', []).some(
			(item) => item.codename == 'no_index',
		),
	}

	const gtmId = process.env.NEXT_PUBLIC_GTM_ID

	let title =
		seo?.title ||
		pageProps?.data?.pageResponse?.item?.elements?.title?.value ||
		''
	let siteDescriptor = config?.item?.elements?.descriptor?.value || ''
	if (title) {
		title += ' | '
	}
	title += config?.item?.elements?.site_prefix?.value || ''
	if (siteDescriptor) {
		title = title + ' | ' + siteDescriptor
	}

	// const palette =
	// 	config?.item?.elements?.palette?.value?.[0]?.codename || null
	// const colors = {
	// 	primary: '#F05A22',
	// 	secondary: '#B72929',
	// }

	// switch (palette) {
	// 	case 'blue':
	// 		colors.primary = '#3553B8'
	// 		colors.secondary = '#81D4FA'
	// 		break
	// 	case 'cyan':
	// 		colors.primary = '#007C91'
	// 		colors.secondary = '#5DDEF4'
	// 		break
	// 	case 'green':
	// 		colors.primary = '#2C9E7E'
	// 		colors.secondary = '#4b830d'
	// 		break
	// 	case 'purple':
	// 		colors.primary = '#7D3F9C'
	// 		colors.secondary = '#7986cb'
	// 		break
	// 	case 'default':
	// 	default:
	// 		break
	// }

	const theme = createTheme({
		palette: {
			primary: {
				main: '#002664',
			},
		},
		spacing: 4, //match with tailwind
		typography: {
			fontFamily: [fontName, 'sans-serif'].join(', '),
			fontSize: 16,
		},
		components: {
			MuiButton: {
				defaultProps: {
					disableRipple: true,
				},
			},
			MuiTab: {
				styleOverrides: {
					root: {
						textTransform: 'initial',
						// fontSize: '1rem',
						fontWeight: 700,
						color: 'var(--nsw-brand-dark)',
					},
				},
			},
			MuiFormControlLabel: {
				styleOverrides: {
					label: {
						fontSize: '1rem',
					},
				},
			},
			MuiPaper: {
				styleOverrides: {
					root: {
						border: '1px solid var(--nsw-grey-03)',
					},
				},
			},
			MuiCheckbox: {
				styleOverrides: {
					root: {
						padding: 0,
						margin: '.5rem 1rem .5rem 0',
					},
				},
			},
			MuiLink: {
				styleOverrides: {
					root: {
						textDecorationColor: 'currentcolor',
					},
				},
			},
		},
		breakpoints: {
			values: {
				xs: 0,
				sm: 576,
				md: 768,
				lg: 992,
				xl: 1200,
			},
		},
	})

	const renderRobotTag = () => {
		if (process.env.NEXT_PUBLIC_VERCEL_ENV !== 'production') {
			return <meta name="robots" content="noindex,nofollow" />
		}
		const robotTags = pageResponse?.item?.elements
			?.seo__robots as Elements.MultipleChoiceElement

		let content = robotTags?.value
			?.map((t) => t.codename.replace(/_/g, ''))
			?.join(',')

		if (content) {
			if (content === 'noindex') {
				content = 'noindex,follow'
			}
			return <meta key="robots" name="robots" content={content} />
		}
		return null
	}

	const getLayout = Component.getLayout || ((_page) => _page)

	// https://material-ui.com/guides/server-rendering/#the-client-side
	// https://github.com/mui-org/material-ui/tree/master/examples/nextjs
	React.useEffect(() => {
		// Remove the server-side injected CSS.
		const jssStyles = document.querySelector('#jss-server-side')
		if (jssStyles) {
			jssStyles.parentElement.removeChild(jssStyles)
		}
		if (window.location.hash) {
			setTimeout(() => {
				router.scrollToHash(window.location.hash)
			}, 300)
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router])

	React.useEffect(() => {
		// This is just an example of SDK initialization inside ES6 module.
		// HTML markup should still contain all necessary data-attributes (e.g. PageSection component).
		const kontentSmartLink = KontentSmartLink.initialize({
			defaultDataAttributes: {
				projectId: process.env.NEXT_PUBLIC_KONTENT_PROJECT_ID,
				languageCodename: 'default',
			},
			queryParam: 'preview-mode',
		})

		return () => {
			kontentSmartLink.destroy()
		}
	}, [])

	if (!pageProps?.data) return <Loading />

	return (
		<CacheProvider value={emotionCache}>
			<Head>
				<title>{title}</title>
				<meta charSet="utf-8" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1.0"
				/>
				<meta name="google" content="notranslate" />
				{get(config, 'item.elements.favicon.value[0]', null) && (
					<link
						rel="icon"
						href={get(
							config,
							'item.elements.favicon.value[0].url',
							null,
						)}
					/>
				)}
				<meta name="description" content={seo.description} />
				{seo.keywords && (
					<meta name="keywords" content={seo.keywords} />
				)}
				{seo.canonicalUrl ? (
					<link
						key="canonical"
						rel="canonical"
						href={seo.canonicalUrl}
					/>
				) : (
					!!pageProps?.data?.pageResponse && (
						<link
							key="canonical"
							rel="canonical"
							href={getUrlFromMapping(
								pageProps.mappings,
								pageProps.data.pageResponse.item.system
									.codename,
							)}
						/>
					)
				)}
				{renderRobotTag()}
			</Head>
			<ThemeProvider theme={theme}>
				<NextNProgress showOnShallow={false} />
				<QueryClientProvider client={queryClient}>
					<KontentHomeConfigProvider
						config={config}
						mappings={pageProps.mappings}
						pageResponseLinkedItems={pageResponse?.linkedItems}
						preview={pageProps.preview}
					>
						<CookiesProvider>
							<NavPage {...pageProps}>
								{getLayout(
									<Component {...(pageProps as any)} />,
									router,
									pageProps,
								)}
							</NavPage>
						</CookiesProvider>
					</KontentHomeConfigProvider>
				</QueryClientProvider>
			</ThemeProvider>
			<Script id="scrollbar-width-setter">
				{`
								(function(){
									var $doc = document.documentElement;
									$doc.style.setProperty('--scrollbar-width', window.innerWidth - $doc.offsetWidth + 'px')
								})()
							`}
			</Script>
			{gtmId && (
				<>
					<noscript>
						<iframe
							aria-label="gtm"
							src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
							height="0"
							width="0"
							style={{
								display: 'none',
								visibility: 'hidden',
							}}
						/>
					</noscript>
					<Script id="google-analytics" strategy="afterInteractive">
						{`
									(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
									new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
									j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
									'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
									})(window,document,'script','dataLayer','${gtmId}');
								`}
					</Script>
				</>
			)}
		</CacheProvider>
	)
}
export default process.env.PASSWORD_PROTECT
	? withPasswordProtect(MyApp, {
			// Options go here (optional)
			loginApiUrl: '/api/basicauth-login',
			checkApiUrl: '/api/basicauth-check',
			bypassProtection(router) {
				return router.isPreview
			},
	  })
	: MyApp
