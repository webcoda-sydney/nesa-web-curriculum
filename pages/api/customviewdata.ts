import { Syllabus } from '@/kontent/content-types'
import { contentTypes } from '@/kontent/project/contentTypes'
import { getAllItemsByType, getItemByCodename } from '@/lib/api'
import { CustomSyllabusTab, TaxoStageWithLifeSkill } from '@/types'
import {
	getApiDataQuery,
	getSyllabusElements,
	isAllowPreviewExternalSyllabus,
	isRichtextEmpty,
	isYes,
} from '@/utils'
import { cleanJson } from '@/utils/cleanJson'
import orderBy from 'lodash.orderby'
import type { NextApiRequest, NextApiResponse } from 'next'
export interface CustomViewDataQuery {
	stages: TaxoStageWithLifeSkill[]
	syllabuses: string[]
	tabs: CustomSyllabusTab[]
}
const getFnIsComingSoon =
	(isComingSoon = true) =>
	(syllabus: Syllabus) => {
		const condition =
			isYes(syllabus.elements.doredirect) ||
			isRichtextEmpty(syllabus.elements.web_content_rtb__content.value)
		return isComingSoon ? condition : !condition
	}

export default async function customviewdata(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== 'POST') return

	const { syllabuses, tabs, stages } = getApiDataQuery<CustomViewDataQuery>(
		req.body,
	)

	if (tabs.includes('outcomes') && stages.includes('life_skills')) {
		stages.push('stage_4', 'stage_5')
	}

	// get level 0 data first
	const level0Syllabuses = await getAllItemsByType<Syllabus>({
		type: contentTypes.syllabus.codename,
		depth: 0,
		preview: req.preview,
		elementsParameter: getSyllabusElements(tabs),
		anyFilter: {
			element: `elements.${contentTypes.syllabus.elements.stages__stages.codename}`,
			value: stages as string[],
		},
		inFilter:
			syllabuses?.length > 0
				? {
						element: 'system.codename',
						value: syllabuses.filter((item) => !!item),
				  }
				: undefined,
	})

	const responses = await Promise.all(
		level0Syllabuses.items.map(async (syllabus) => {
			const response = await getItemByCodename({
				codename: syllabus.system.codename,
				depth: 3,
				preview: req.preview,
				elementsParameter: getSyllabusElements(tabs),
			})
			return response
		}),
	)

	const syllabusesResult = {
		items: responses.map((response) => response.item),
		linkedItems: responses.reduce((acc, response) => {
			return {
				...acc,
				...response.linkedItems,
			}
		}, {}),
	}

	// syllabusesResult.linkedItems = getOnlyNecessaryLinkedItems(
	// 	syllabusesResult.linkedItems,
	// )

	syllabusesResult.items = isAllowPreviewExternalSyllabus()
		? orderBy(syllabusesResult.items, ['elements.title.value'], ['asc'])
		: [
				...orderBy(
					syllabusesResult.items.filter(getFnIsComingSoon(false)),
					['elements.title.value'],
					['asc'],
				),
				...orderBy(
					syllabusesResult.items.filter(getFnIsComingSoon(true)),
					['elements.title.value'],
					['asc'],
				),
		  ]

	return res.json(cleanJson(syllabusesResult))
}
