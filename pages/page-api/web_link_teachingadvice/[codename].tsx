import { getLinkedItems } from '@/components/contexts/KontentHomeConfigProvider'
import {
	Syllabus,
	WebLinkContentgroup,
	WebLinkTeachingadvice,
} from '@/kontent/content-types'
import { contentTypes } from '@/kontent/project/contentTypes'
import {
	getAllItemsByType,
	getAllItemsByTypeV2,
	getItemByCodename,
} from '@/lib/api'
import { byTaxoCodename, fnExist, redirectToHome } from '@/utils'
import { commonFetch } from '@/utils/fetchUtils'
import { CommonPageAPIType, PAGE_API_BASE_PATH } from '@/utils/page-api'
import { getFocusareaPath } from '@/utils/page-api/getFocusareaPath'
import { isFocusarea } from '@/utils/type_predicates'
import { GetStaticPaths, GetStaticPathsResult, GetStaticProps } from 'next'
import { ParsedUrlQuery } from 'querystring'

export interface PageApiWebLinkTeachingadviceResult {
	url: string
}

export interface PageApiWebLinkTeachingadvice extends ParsedUrlQuery {
	codename: string
}

export default function PageApiWebLinkTeachingadvicePage() {
	return null
}

export const fetchPageApiWebLinkTeachingadvice = async ({
	codename,
}: {
	codename: string
}) => {
	let paths = [codename].filter(fnExist).join('/')

	const { ok, json } = await commonFetch<
		CommonPageAPIType<PageApiWebLinkTeachingadviceResult>,
		null
	>(
		`${PAGE_API_BASE_PATH}/page-api/web_link_teachingadvice/${paths}.json`,
		null,
		{
			method: 'GET',
		},
	)

	if (ok) {
		return json
	}
}

export const getStaticPaths: GetStaticPaths<
	PageApiWebLinkTeachingadvice
> = async () => {
	const response = await getAllItemsByType<WebLinkContentgroup>({
		type: contentTypes.web_link_contentgroup.codename,
		depth: 0,
		preview: false,
	})

	const paths: GetStaticPathsResult<PageApiWebLinkTeachingadvice>['paths'] =
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
	PageApiWebLinkTeachingadviceResult,
	PageApiWebLinkTeachingadvice
> = async ({ params, preview }) => {
	const { codename } = params

	const [response] = await Promise.all([
		getItemByCodename<WebLinkTeachingadvice>({
			codename,
			depth: 1,
			preview,
		}),
	])

	if (!response?.item) {
		return redirectToHome()
	}

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
				contentTypes.focusarea.elements.teachingadvice.codename,
				contentTypes.focusarea.elements.syllabus_type__items.codename,
			])
			query.allFilter(
				`elements.${contentTypes.syllabus.elements.syllabus.codename}`,
				response.item.elements.syllabus.value
					.map(byTaxoCodename)
					.filter(Boolean),
			)

			return query
		},
	})

	const syllabus = syllabusResponse.items[0]

	const { item } = response

	// get the focus areas
	const focusAreas = getLinkedItems(
		syllabus.elements.focus_areas,
		syllabusResponse.linkedItems,
	)?.filter(isFocusarea)

	const focusArea = focusAreas.find((fa) =>
		fa.elements.teachingadvice.value.some((cg) =>
			item.elements.item.value.some((_linkCg) => _linkCg === cg),
		),
	)

	const focusAreaPath = getFocusareaPath(item, syllabus, focusArea)

	return {
		props: {
			url: `${focusAreaPath}?show=advice`,
		},
	}
}
