import { SyllabusForRedirectResult } from '@/pages/page-api/syllabus-for-redirect/[syllabus]'
import { commonFetch } from '@/utils/fetchUtils'
import { CommonPageAPIType, PAGE_API_BASE_PATH } from '@/utils/page-api'

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
