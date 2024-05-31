import { Glossary } from '@/kontent/content-types'
import { getAllItemsByType } from '@/lib/api'
import { commonFetch } from '@/utils/fetchUtils'
import { CommonPageAPIType, PAGE_API_BASE_PATH } from '@/utils/page-api'
import { Responses } from '@kontent-ai/delivery-sdk'
import { GetStaticProps } from 'next'
import { ParsedUrlQuery } from 'querystring'

export interface AllGlossariesParams extends ParsedUrlQuery {
	syllabus: string
}

export default function Page() {
	return null
}

export interface AllGlossariesResult {
	glossaries: Responses.IListContentItemsResponse<Glossary>
}
export const fetchAllGlossaries = async (baseUrl?: string) => {
	let url = `${PAGE_API_BASE_PATH}/page-api/all-glossaries.json`
	if (baseUrl) {
		url = new URL(url, baseUrl).href
	}
	const { ok, json } = await commonFetch<
		CommonPageAPIType<AllGlossariesResult>,
		null
	>(url, null, {
		method: 'GET',
	})

	if (ok) {
		return json
	}
}

export const getStaticProps: GetStaticProps<AllGlossariesResult> = async ({
	preview,
}) => {
	const glossaries = await getAllItemsByType<Glossary>({
		type: 'glossary',
		preview,
		depth: 0,
	})

	return {
		props: {
			glossaries,
		},
	}
}
