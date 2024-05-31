import WebPage from '@/layouts/web_page'
import { UrlLink } from '@/legacy-ported/utilities/frontendTypes'
import {
	getItemByCodename,
	getSiteMappings,
	loadWebsiteConfig,
} from '@/lib/api'
import { CommonPageProps } from '@/types'
import { isShowPublished } from '@/utils'
import { cleanJson } from '@/utils/cleanJson'
import { GetStaticProps, InferGetStaticPropsType } from 'next'
import Head from 'next/head'

export const getStaticProps: GetStaticProps<
	CommonPageProps<any, any> & { breadcrumbLinks: UrlLink[] }
> = async ({ preview = false, previewData = {}, params }) => {
	const isGetPreviewContent = !isShowPublished(previewData) && preview

	let [config, mappings, page] = await Promise.all([
		loadWebsiteConfig(isGetPreviewContent),
		getSiteMappings(isGetPreviewContent),
		getItemByCodename({
			codename: 'error_404',
			depth: 3, //to make the link list works
			preview: isGetPreviewContent,
		}),
	])

	/** This breadcrumbLinks is to be passed to NavPage for breadcrumb to work */
	const breadcrumbLinks: UrlLink[] = [
		{
			title: 'Home',
			url: '/',
		},
		{
			title: 'Page not found',
			url: undefined,
		},
	]

	const _props: InferGetStaticPropsType<typeof getStaticProps> = {
		mappings,
		preview,
		previewData,
		data: {
			pageResponse: page,
			config,
			stages: null,
			stageGroups: null,
			keyLearningAreas: null,
			assets: null,
			glossaries: null,
			syllabuses: null,
		},
		params: {
			...params,
			pageTitle: '404',
			isCanonical: true,
			slug: [],
		},
		breadcrumbLinks,
		rootLayoutClassName: 'max-w-none mx-0 px-0 !pt-0',
	}

	return {
		props: {
			...cleanJson(_props),
		},
	}
}
export default function Custom404({
	data,
	mappings,
	preview,
	className,
	rootLayoutClassName,
}: InferGetStaticPropsType<typeof getStaticProps>) {
	return (
		<>
			<Head>
				<meta key="robots" name="robots" content="noindex,nofollow" />
			</Head>
			<WebPage
				data={data}
				mappings={mappings}
				preview={preview}
				previewData={null}
				className={className}
				rootLayoutClassName={rootLayoutClassName}
			/>
		</>
	)
}
