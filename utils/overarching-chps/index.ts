import {
	Contentgroup,
	Focusarea,
	Syllabus,
	WebLinkCcContentgroup,
	WebLinkCcFocusarea,
	WebLinkCcTeachingadvice,
	WebLinkContentgroup,
	WebLinkFocusarea,
	WebLinkTeachingadvice,
} from '@/kontent/content-types'
import { contentTypes } from '@/kontent/project/contentTypes'
import { getAllItemsByType, getAllItemsByTypeV2, getItemsFeed } from '@/lib/api'
import { byTaxoCodename, isIntersect } from '..'
import { getFocusareaPath } from '../page-api/getFocusareaPath'

export type TOverachingLinkItemWithUrl = {
	item: WebLinkFocusarea | WebLinkContentgroup | WebLinkTeachingadvice
	url: string
}

export type TCurriculumConnectionLinkItemWithUrl = {
	item: WebLinkCcFocusarea | WebLinkCcContentgroup | WebLinkCcTeachingadvice
	url: string
}

const getSyllabusBasedOnItem = (syllabuses: Syllabus[], item) => {
	return syllabuses.find((s) => {
		return isIntersect(
			s.elements.syllabus.value.map(byTaxoCodename),
			item.elements.syllabus.value.map(byTaxoCodename),
		)
	})
}

export async function getAllOverarchingLinks<T = TOverachingLinkItemWithUrl>(
	preview = false,
	linksCodenames = {
		focusArea: contentTypes.web_link_focusarea.codename,
		contentGroup: contentTypes.web_link_contentgroup.codename,
		teachingAdvice: contentTypes.web_link_teachingadvice.codename,
	},
) {
	const { items: syllabuses } = await getAllItemsByType<Syllabus>({
		type: contentTypes.syllabus.codename,
		preview,
		depth: 0,
		elementsParameter: [
			contentTypes.syllabus.elements.key_learning_area_default.codename,
			contentTypes.syllabus.elements.key_learning_area__items.codename,
			contentTypes.syllabus.elements.syllabus.codename,
			contentTypes.syllabus.elements.syllabus_type__items.codename,
		],
	})

	const { items: focusAreas } =
		await getAllItemsByType<Focusarea>({
			type: contentTypes.focusarea.codename,
			preview,
			depth: 0,
			elementsParameter: [
				contentTypes.focusarea.elements.teachingadvice.codename,
				contentTypes.focusarea.elements.contentgroups.codename,
			],
		})
	// get all content groups
	const { items: contentGroups } = await getItemsFeed<Contentgroup>({
		type: contentTypes.contentgroup.codename,
		preview,
		elementsParameter: [
			contentTypes.contentgroup.elements.title.codename,
		],
	})

	// get all focus area links
	const { items: linksFocusArea } = await getAllItemsByTypeV2<WebLinkFocusarea>(
		{
			type: linksCodenames.focusArea,
			preview,
			depth: 0,
			moreQueryFn: (query) => {
				return query
					.notEmptyFilter(`elements.${contentTypes.web_link_focusarea.elements.title.codename}`)
					.notEmptyFilter(`elements.${contentTypes.web_link_focusarea.elements.item.codename}`)
					.notEmptyFilter(`elements.${contentTypes.web_link_focusarea.elements.syllabus.codename}`)
					.notEmptyFilter(`elements.${contentTypes.web_link_focusarea.elements.stages__stage_years.codename}`)
					.notEmptyFilter(`elements.${contentTypes.web_link_focusarea.elements.stages__stages.codename}`)
					.notEmptyFilter(`elements.${contentTypes.web_link_focusarea.elements.syllabus_type__items.codename}`)
			}
		},
	)
	// get all content group links
	const { items: linksContentGroup } =
		await getAllItemsByTypeV2<WebLinkContentgroup>({
			type: linksCodenames.contentGroup,
			preview,
			depth: 0,
			moreQueryFn: (query) => {
				return query
					.notEmptyFilter(`elements.${contentTypes.web_link_contentgroup.elements.title.codename}`)
					.notEmptyFilter(`elements.${contentTypes.web_link_contentgroup.elements.item.codename}`)
					.notEmptyFilter(`elements.${contentTypes.web_link_contentgroup.elements.syllabus.codename}`)
					.notEmptyFilter(`elements.${contentTypes.web_link_contentgroup.elements.stages__stage_years.codename}`)
					.notEmptyFilter(`elements.${contentTypes.web_link_contentgroup.elements.stages__stages.codename}`)
					.notEmptyFilter(`elements.${contentTypes.web_link_contentgroup.elements.syllabus_type__items.codename}`)
			}
		})
	// get all teaching advice links
	const { items: linksTeachingAdvice } =
		await getAllItemsByTypeV2<WebLinkTeachingadvice>({
			type: linksCodenames.teachingAdvice,
			preview,
			depth: 0,
			moreQueryFn: (query) => {
				return query
					.notEmptyFilter(`elements.${contentTypes.web_link_teachingadvice.elements.title.codename}`)
					.notEmptyFilter(`elements.${contentTypes.web_link_teachingadvice.elements.item.codename}`)
					.notEmptyFilter(`elements.${contentTypes.web_link_teachingadvice.elements.syllabus.codename}`)
					.notEmptyFilter(`elements.${contentTypes.web_link_teachingadvice.elements.stages__stage_years.codename}`)
					.notEmptyFilter(`elements.${contentTypes.web_link_teachingadvice.elements.stages__stages.codename}`)
					.notEmptyFilter(`elements.${contentTypes.web_link_teachingadvice.elements.syllabus_type__items.codename}`)
			}
		})

	const faLinks = linksFocusArea.map((item) => {
		const syllabus = getSyllabusBasedOnItem(syllabuses, item)
		const focusArea = focusAreas.find((f) =>
			item.elements.item.value.includes(f.system.codename),
		)

		return {
			item,
			url: getFocusareaPath(item, syllabus, focusArea),
		} as unknown as T
	})

	const cgLinks = linksContentGroup.map((weblinkCG) => {
		const syllabus = getSyllabusBasedOnItem(syllabuses, weblinkCG)
		const focusArea = focusAreas.find((f) =>
			isIntersect(
				f.elements.contentgroups.value,
				weblinkCG.elements.item.value,
			),
		)

		const contentGroup = contentGroups.find(cg => cg.system.codename === weblinkCG.elements.item.value[0])
		const focusAreaPath = getFocusareaPath(weblinkCG, syllabus, focusArea)
		return contentGroup ? {
			item: weblinkCG,
			url: focusAreaPath + `#cg-${contentGroup.system.id}`,
		} as unknown as T : null
	}).filter(Boolean)

	const taLinks = linksTeachingAdvice.map((item) => {
		const syllabus = getSyllabusBasedOnItem(syllabuses, item)
		const focusArea = focusAreas.find((f) =>
			isIntersect(
				f.elements.teachingadvice.value,
				item.elements.item.value,
			),
		)
		const focusAreaPath = getFocusareaPath(item, syllabus, focusArea)
		return {
			item,
			url: `${focusAreaPath}?show=advice`,
		} as unknown as T
	})

	return [...faLinks, ...cgLinks, ...taLinks]
}

export async function getAllCurriculumConnectionLinks(preview = false) {
	return getAllOverarchingLinks<TCurriculumConnectionLinkItemWithUrl>(
		preview,
		{
			teachingAdvice: contentTypes.web_link_cc_teachingadvice.codename,
			focusArea: contentTypes.web_link_cc_focusarea.codename,
			contentGroup: contentTypes.web_link_cc_contentgroup.codename,
		},
	)
}
