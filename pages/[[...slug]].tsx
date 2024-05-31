import { Loading } from '@/components/Loading'
import { shouldSlugBeRedirected } from '@/utils'
import { cleanJson } from '@/utils/cleanJson'
import type { GetStaticPaths, GetStaticProps } from 'next'
import Error from 'next/error'
import { useRouter } from 'next/router'
import UnknownComponent from '../components/UnknownComponent'
import pageLayouts from '../layouts'
import { getPageStaticPropsForPath, getSiteMappings } from '../lib/api'

function Page(props) {
	const router = useRouter()

	// If the page is not yet generated, this will be displayed
	// initially until getStaticProps() finishes running
	if (router.isFallback) {
		return <Loading />
	}

	if (!props) return null

	if (props.errorCode || !props?.data?.pageResponse?.item?.system?.type) {
		return <Error statusCode={props.errorCode} />
	}

	// every page can have different layout, pick the layout based on content type
	const contentType = props.data.pageResponse.item.system.type

	const PageLayout = pageLayouts[contentType]

	if (process.env.NODE_ENV === 'development' && !PageLayout) {
		return (
			<UnknownComponent {...props} useLayout={true}>
				<p>
					Unknown Layout component for page content type:{' '}
					{contentType}
				</p>
			</UnknownComponent>
		)
	}

	return <PageLayout {...props} />
}

export const getStaticPaths: GetStaticPaths = async () => {
	const allPaths = await getSiteMappings()

	// Exclude the redirected-to-home paths
	const paths = allPaths
		.filter((path) => {
			// render if
			return (
				path.params.slug &&
				// it's not should be redirected
				!shouldSlugBeRedirected(path.params.slug) &&
				// not excluded in sitemap
				!path.params.excludeInSitemap &&
				// not syllabus (since syllabus has its own page render)
				path.params.navigationItem?.type !== 'syllabus' &&
				// not the ones that have no layout
				!!pageLayouts[path.params.navigationItem.type]
			)
		})
		.map((path) => {
			const params = {
				slug: path.params.slug,
			}

			return {
				params,
			}
		})

	// https://nextjs.org/docs/messages/ssg-fallback-true-export

	return {
		paths: [],
		// Set to false when exporting to static site
		fallback: 'blocking',
	}
}

export const getStaticProps: GetStaticProps = async ({
	params,
	preview = false,
	previewData = {},
}) => {
	const _props = await getPageStaticPropsForPath(params, preview, previewData)
	const requestedPageType = _props?.data?.pageResponse?.item?.system?.type

	// Remove all ace_ mappings if the page is not an ace page, except ace_group
	if (
		requestedPageType &&
		!requestedPageType.startsWith('wp_ace_') &&
		!requestedPageType.startsWith('ace_')
	) {
		_props.mappings = _props.mappings.filter((mapping) => {
			const pageType = mapping?.params?.navigationItem?.type
			return pageType === 'ace_group' || !pageType.startsWith('ace_')
		})
	}

	if (params.slug) {
		const slug = Array.isArray(params.slug) ? params.slug : [params.slug]

		if (!_props || !pageLayouts?.[requestedPageType]) {
			return {
				redirect: {
					destination: `/404?path=${slug.join('/')}`,
					permanent: false,
				},
			}
		}

		if (shouldSlugBeRedirected(slug)) {
			return {
				redirect: {
					destination: '/',
					permanent: false,
				},
			}
		}
	}

	const props = _props ? cleanJson(_props) : {}
	return {
		props: {
			...props,
			params,
			preview,
			previewData,
		},
	}
}

export default Page
