import { commonFetch } from '@/utils/fetchUtils'
import {
	TCurriculumConnectionLinkItemWithUrl,
	getAllCurriculumConnectionLinks,
} from '@/utils/overarching-chps'
import { CommonPageAPIType, PAGE_API_BASE_PATH } from '@/utils/page-api'
import { GetStaticProps } from 'next'
import { ParsedUrlQuery } from 'querystring'

export interface AllCurriculumConnectionLinksParams extends ParsedUrlQuery {
	syllabus: string
}

export default function Page() {
	return null
}

export interface AllCurriculumConnectionLinksResult {
	links: TCurriculumConnectionLinkItemWithUrl[]
}
export const fetchAllCurriculumConnectionLinks = async (baseUrl?: string) => {
	let url = `${PAGE_API_BASE_PATH}/page-api/all-curriculum-connection-links.json`
	if (baseUrl) {
		url = new URL(url, baseUrl).href
	}
	const { ok, json } = await commonFetch<
		CommonPageAPIType<AllCurriculumConnectionLinksResult>,
		null
	>(url, null, {
		method: 'GET',
	})

	if (ok) {
		return json
	}
}

export const getStaticProps: GetStaticProps<
	AllCurriculumConnectionLinksResult
> = async ({ preview }) => {
	const links = await getAllCurriculumConnectionLinks(preview)

	return {
		props: {
			links,
		},
	}
}
