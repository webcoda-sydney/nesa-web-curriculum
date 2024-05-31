import { commonFetch } from '@/utils/fetchUtils'
import {
	TOverachingLinkItemWithUrl,
	getAllOverarchingLinks,
} from '@/utils/overarching-chps'
import { CommonPageAPIType, PAGE_API_BASE_PATH } from '@/utils/page-api'
import { GetStaticProps } from 'next'
import { ParsedUrlQuery } from 'querystring'

export interface AllOverarchingLinksParams extends ParsedUrlQuery {
	syllabus: string
}

export default function Page() {
	return null
}

export interface AllOverarchingLinksResult {
	links: TOverachingLinkItemWithUrl[]
}
export const fetchAllOverarchingLinks = async (baseUrl?: string) => {
	let url = `${PAGE_API_BASE_PATH}/page-api/all-overarching-links.json`
	if (baseUrl) {
		url = new URL(url, baseUrl).href
	}
	const { ok, json } = await commonFetch<
		CommonPageAPIType<AllOverarchingLinksResult>,
		null
	>(url, null, {
		method: 'GET',
	})

	if (ok) {
		return json
	}
}

export const getStaticProps: GetStaticProps<
	AllOverarchingLinksResult
> = async ({ preview }) => {
	const links = await getAllOverarchingLinks(preview)

	return {
		props: {
			links,
		},
	}
}
