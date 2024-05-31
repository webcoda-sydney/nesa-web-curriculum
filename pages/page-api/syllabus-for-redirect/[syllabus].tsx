import { Redirectrule, Syllabus } from '@/kontent/content-types'
import { contentTypes } from '@/kontent/project/contentTypes'
import {
	getAllItemsByType,
	getAllItemsByTypeV2,
	getItemByCodename,
} from '@/lib/api'
import {
	getCodenameBySlug,
	getSlugByCodename,
	isAllowPreviewExternalSyllabus,
} from '@/utils'
import { commonFetch } from '@/utils/fetchUtils'
import { CommonPageAPIType, PAGE_API_BASE_PATH } from '@/utils/page-api'
import { GetStaticPaths, GetStaticPathsResult, GetStaticProps } from 'next'
import { ParsedUrlQuery } from 'querystring'

export interface SyllabusForRedirectParams extends ParsedUrlQuery {
	syllabus: string
}

export default function Page() {
	return null
}

export interface SyllabusForRedirectResult {
	syllabus: Syllabus
	redirectRules: Redirectrule[]
}
export const fetchSyllabusForRedirect = async (
	syllabusSlug: string,
	baseUrl?: string,
) => {
	let url = `${PAGE_API_BASE_PATH}/page-api/syllabus-for-redirect/${syllabusSlug}.json`
	if (baseUrl) {
		url = new URL(url, baseUrl).href
	}
	const { ok, json } = await commonFetch<
		CommonPageAPIType<SyllabusForRedirectResult>,
		null
	>(url, null, {
		method: 'GET',
	})

	if (ok) {
		return json
	}
}

export const getStaticPaths: GetStaticPaths<
	SyllabusForRedirectParams
> = async () => {
	const syllabusResponse = await getAllItemsByType<Syllabus>({
		type: contentTypes.syllabus.codename,
		depth: 0,
		elementsParameter: [contentTypes.syllabus.elements.title.codename],
		allFilter: isAllowPreviewExternalSyllabus()
			? null
			: {
					element: `elements.${contentTypes.syllabus.elements.doredirect.codename}`,
					value: ['no'],
			  },
		preview: false,
	})

	const paths: GetStaticPathsResult<SyllabusForRedirectParams>['paths'] =
		syllabusResponse.items.map((syllabus) => {
			return {
				params: {
					syllabus: getSlugByCodename(syllabus.system.codename),
				},
			}
		})

	return {
		paths: [],
		fallback: 'blocking',
	}
}

export const getStaticProps: GetStaticProps<
	SyllabusForRedirectResult
> = async ({ params }) => {
	const { syllabus: syllabusSlug } = params

	const [syllabusResponse, redirectRulesResponse] = await Promise.all([
		getItemByCodename<Syllabus>({
			codename: getCodenameBySlug(syllabusSlug as string),
			depth: 0,
			elementsParameter: [
				contentTypes.syllabus.elements.key_learning_area__items
					.codename,
				contentTypes.syllabus.elements.key_learning_area_default
					.codename,
				contentTypes.syllabus.elements.doredirect.codename,
				contentTypes.syllabus.elements.allowpreview.codename,
			],
		}),
		getAllItemsByTypeV2<Redirectrule>({
			type: contentTypes.redirectrule.codename,
			depth: 0,
			moreQueryFn: (query) => {
				return query.allFilter('elements.type', ['focus_area_codename'])
			},
			preview: false,
		}),
	])

	return {
		props: {
			syllabus: syllabusResponse.item,
			redirectRules: redirectRulesResponse.items,
		},
	}
}
