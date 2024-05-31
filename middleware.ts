/**
 * Notes:
 * 1. url used in `fetch` API in middleware must be absolute
 */

import { NextResponse, type NextRequest } from 'next/server'
import { fetchSyllabusForRedirect } from './fetchers/fetchSyllabusForRedirect'
import { getSlugByCodename } from './utils/getSlugByCodename'
import { matchRoute } from './utils/routing'

export default async function middleware(request: NextRequest) {
	const { pathname, searchParams } = request.nextUrl
	const qTab = searchParams.get('tab')
	const qStage = searchParams.get('stage')
	const qFocusArea = searchParams.get('options[contentOrganiser]')
	const qTeachingAdvice = searchParams.get('options[teachingSupport]')

	const pathNameStartsWithSyllabuses = pathname.startsWith('/syllabuses/')
	const pathNameStartsWithLearningAreas =
		pathname.startsWith('/learning-areas/')

	const { params = {} } = matchRoute(pathname) || {}
	const syllabusSlug = params['syllabus']
	const learningAreaSlug = params['learningarea']

	// Redirect old teaching advice link
	// e.g. /syllabuses/english-k-10-2022?stage=early_stage_1&year=k&tab=content&options%5BcontentOrganiser%5D=e_1_2_3__oral_language_and_communication__copy__3a0a5fc&options%5BteachingSupport%5D=true
	if (
		(pathNameStartsWithSyllabuses || pathNameStartsWithLearningAreas) &&
		qFocusArea &&
		syllabusSlug
	) {
		let redirectUrl = '/'

		const json = await fetchSyllabusForRedirect(syllabusSlug, request.url)
		if (json) {
			const { syllabus, redirectRules } = json.pageProps
			const klaDefault =
				syllabus.elements.key_learning_area_default.value[0]
					?.codename ||
				syllabus.elements.key_learning_area__items.value[0]?.codename
			const _klaSlug = pathNameStartsWithLearningAreas
				? learningAreaSlug
				: getSlugByCodename(klaDefault)
			const _stageSlug = getSlugByCodename(qStage)

			// check whether the focus area is in the redirect rules
			const redirectRule = redirectRules.find(
				(rule) => rule.elements.from.value === qFocusArea,
			)
			const focusAreaSlug = getSlugByCodename(
				redirectRule ? redirectRule.elements.to.value : qFocusArea,
			)

			redirectUrl = `/learning-areas/${_klaSlug}/${syllabusSlug}/content/${_stageSlug}/${focusAreaSlug}`

			if (qTeachingAdvice) {
				redirectUrl += '?show=advice'
			}
		}
		console.log(
			'🚀 ~ file: middleware.ts:77 ~ middleware ~ redirectUrl:',
			redirectUrl,
		)
		return NextResponse.redirect(new URL(redirectUrl, request.url))
	}

	// Redirect to the /overview/?tab=[tab] to /learning-areas/:kla/:syl/[tab]
	if (
		pathNameStartsWithLearningAreas &&
		pathname.endsWith('/overview') &&
		qTab &&
		qTab != 'overview'
	) {
		let _qTab = qTab
		if (_qTab === 'course-overview') {
			_qTab = 'overview'
		}

		const newUrl = pathname.replace('/overview', `/${_qTab}`)
		console.log(
			'🚀 ~ file: middleware.ts:89 ~ middleware ~ newUrl:',
			newUrl,
		)
		return NextResponse.redirect(new URL(newUrl, request.url))
	}

	return NextResponse.next()
}
