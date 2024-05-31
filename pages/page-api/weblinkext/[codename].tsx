import { Weblinkext } from '@/kontent/content-types'
import { contentTypes } from '@/kontent/project/contentTypes'
import { getAllItemsByType, getItemByCodename } from '@/lib/api'
import { fnExist, redirectToHome } from '@/utils'
import { commonFetch } from '@/utils/fetchUtils'
import { CommonPageAPIType, PAGE_API_BASE_PATH } from '@/utils/page-api'
import { GetStaticPaths, GetStaticPathsResult, GetStaticProps } from 'next'
import { ParsedUrlQuery } from 'querystring'

export interface PageApiWebLinkExtResult {
	url: string
}

export interface PageApiWebLinkExtParams extends ParsedUrlQuery {
	codename: string
}

export default function PageApiWebLinkExtPage() {
	return null
}

export const fetchPageApiWebLinkExt = async ({
	codename,
}: {
	codename: string
}) => {
	let paths = [codename].filter(fnExist).join('/')

	const { ok, json } = await commonFetch<
		CommonPageAPIType<PageApiWebLinkExtResult>,
		null
	>(`${PAGE_API_BASE_PATH}/page-api/weblinkext/${paths}.json`, null, {
		method: 'GET',
	})

	if (ok) {
		return json
	}
}

export const getStaticPaths: GetStaticPaths<
	PageApiWebLinkExtParams
> = async () => {
	const response = await getAllItemsByType<Weblinkext>({
		type: contentTypes.weblinkext.codename,
		depth: 0,
		preview: false,
	})

	const paths: GetStaticPathsResult<PageApiWebLinkExtParams>['paths'] =
		response.items.map((item) => {
			return {
				params: {
					codename: item.system.codename,
				},
			}
		})

	return {
		paths: [],
		fallback: 'blocking',
	}
}

export const getStaticProps: GetStaticProps<
	PageApiWebLinkExtResult,
	PageApiWebLinkExtParams
> = async ({ params, preview }) => {
	const { codename } = params

	const response = await getItemByCodename<Weblinkext>({
		codename,
		depth: 0,
		elementsParameter: [contentTypes.weblinkext.elements.link_url.codename],
		preview,
	})

	if (!response?.item) {
		return redirectToHome()
	}

	return {
		props: {
			url: response.item.elements.link_url.value,
		},
	}
}
