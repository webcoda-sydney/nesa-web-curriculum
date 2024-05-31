import { Syllabus, WebLinkFocusarea } from '@/kontent/content-types'
import { contentTypes } from '@/kontent/project/contentTypes'
import {
	getAllItemsByType,
	getAllItemsByTypeV2,
	getItemByCodename,
} from '@/lib/api'
import {
	byTaxoCodename,
	fnExist,
	getLinkedItems,
	redirectToHome,
} from '@/utils'
import { commonFetch } from '@/utils/fetchUtils'
import { CommonPageAPIType, PAGE_API_BASE_PATH } from '@/utils/page-api'
import { getFocusareaPath } from '@/utils/page-api/getFocusareaPath'
import { GetStaticPaths, GetStaticPathsResult, GetStaticProps } from 'next'
import { ParsedUrlQuery } from 'querystring'

export interface PageApiWebLinkFocusareaResult {
	url: string
}

export interface PageApiWebLinkFocusareaParams extends ParsedUrlQuery {
	codename: string
}

export default function PageApiWebLinkFocusareaPage() {
	return null
}

export const fetchPageApiWebLinkFocusarea = async ({
	codename,
}: {
	codename: string
}) => {
	let paths = [codename].filter(fnExist).join('/')

	const { ok, json } = await commonFetch<
		CommonPageAPIType<PageApiWebLinkFocusareaResult>,
		null
	>(`${PAGE_API_BASE_PATH}/page-api/web_link_focusarea/${paths}.json`, null, {
		method: 'GET',
	})

	if (ok) {
		return json
	}
}

export const getStaticPaths: GetStaticPaths<
	PageApiWebLinkFocusareaParams
> = async () => {
	const response = await getAllItemsByType<WebLinkFocusarea>({
		type: contentTypes.web_link_focusarea.codename,
		depth: 0,
		preview: false,
	})

	const paths: GetStaticPathsResult<PageApiWebLinkFocusareaParams>['paths'] =
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
	PageApiWebLinkFocusareaResult,
	PageApiWebLinkFocusareaParams
> = async ({ params, preview }) => {
	const { codename } = params

	const response = await getItemByCodename<WebLinkFocusarea>({
		codename,
		depth: 1,
		preview,
	})

	if (!response?.item) {
		return redirectToHome()
	}

	const { item } = response

	const focusAreas = getLinkedItems(
		response.item.elements.item,
		response.linkedItems,
	)
	const focusArea = focusAreas[0]

	const syllabusResponse = await getAllItemsByTypeV2<Syllabus>({
		preview,
		depth: 1,
		type: contentTypes.syllabus.codename,
		moreQueryFn: (query) => {
			query.elementsParameter([
				contentTypes.syllabus.elements.key_learning_area__items
					.codename,
				contentTypes.syllabus.elements.key_learning_area_default
					.codename,
				contentTypes.syllabus.elements.focus_areas.codename,
				contentTypes.syllabus.elements.syllabus.codename,
				contentTypes.focusarea.elements.contentgroups.codename,
				contentTypes.focusarea.elements.syllabus_type__items.codename,
			])
			query.allFilter(
				`elements.${contentTypes.syllabus.elements.syllabus.codename}`,
				focusArea.elements.syllabus.value
					.map(byTaxoCodename)
					.filter(Boolean),
			)

			return query
		},
	})

	const syllabus = syllabusResponse.items[0]

	const focusAreaPath = getFocusareaPath(item, syllabus, focusArea)

	return {
		props: {
			url: focusAreaPath,
		},
	}
}
