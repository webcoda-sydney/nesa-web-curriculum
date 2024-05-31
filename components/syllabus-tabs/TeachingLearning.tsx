import { Syllabus } from '@/kontent/content-types'
import { CommonContentTab } from '@/pages/learning-areas/[learningarea]/[syllabus]/[tab]'
import { CommonPageProps, TaxoStageWithLifeSkill } from '@/types'
import { byTaxoCodename, isIntersect } from '@/utils'
import {
	getVideoLinkOrExtLinkOrAssetResourceTypeTaxoCodenames,
	getVideoLinkOrExtLinkOrAssetStageTaxoCodenames,
} from '@/utils/assets'
import { isLifeSkillSyllabus } from '@/utils/syllabus'
import { isAssetWithRawElement } from '@/utils/type_predicates'
import { useMemo } from 'react'
import SyllabusTeachingLearningSupport from '../SyllabusTeachingLearningSupport'
import { getLinkedItems } from '../contexts/KontentHomeConfigProvider'
import { SyllabusTabsTitle } from '../ui/syllabus-tabs/SyllabusTabsTitle'

export const TeachingLearning = ({
	data,
	mappings,
	preview,
}: CommonPageProps<Syllabus, CommonContentTab<Syllabus>>) => {
	const {
		syllabus: syllabusResponse,
		stages: allStages,
		assets: allAssets,
		webLinkExternals: webLinkExternalsResponse,
		webLinkVideos: webLinkVideosResponse,
	} = data
	const syllabus = syllabusResponse.item
	const currentStages: TaxoStageWithLifeSkill[] =
		syllabus.elements.stages__stages.value.map(byTaxoCodename)
	// current taxo term of taxo stages
	const currentTaxoTermStages = allStages.filter((s) =>
		currentStages.includes(s.codename),
	)

	// Computed
	const isLifeSkillsSyl = isLifeSkillSyllabus(syllabus)

	const taxoSyllabusCodenamesOfCurrentSyllabus = useMemo(() => {
		return syllabus.elements.syllabus.value.map((t) => t.codename)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [syllabus.system.codename])

	const taxoSyllabusCodenamesOfCurrentSyllabusAndRelatedLSSyllabus =
		useMemo(() => {
			const relatedLS = getLinkedItems(
				syllabus.elements.relatedlifeskillssyllabus,
				syllabusResponse.linkedItems,
			)
			return [
				...taxoSyllabusCodenamesOfCurrentSyllabus,
				...relatedLS.flatMap((syl) =>
					syl.elements.syllabus.value.map(byTaxoCodename),
				),
			]
		}, [
			syllabus.elements.relatedlifeskillssyllabus,
			syllabusResponse.linkedItems,
			taxoSyllabusCodenamesOfCurrentSyllabus,
		])

	const syllabusAssets = useMemo(() => {
		return [
			...(allAssets?.filter((asset) => {
				const assetSyllabus = asset.syllabus.map(byTaxoCodename)

				return isIntersect(
					assetSyllabus,
					taxoSyllabusCodenamesOfCurrentSyllabusAndRelatedLSSyllabus,
				)
			}) || []),
			...webLinkExternalsResponse.items,
			...webLinkVideosResponse.items,
		]
	}, [
		allAssets,
		taxoSyllabusCodenamesOfCurrentSyllabusAndRelatedLSSyllabus,
		webLinkExternalsResponse.items,
		webLinkVideosResponse.items,
	])

	const teachingSupportAssets = useMemo(() => {
		const currentStagesForAssets = currentStages.reduce(
			(acc, currentStage) => {
				if (currentStage === 'life_skills' && isLifeSkillsSyl) {
					return [...acc, 'stage_6']
				}
				return [...acc, currentStage]
			},
			[],
		)

		return (
			syllabusAssets
				// strictly only for the syllabus (excluding the related syllabus)
				.filter((asset) => {
					const assetSyllabus = isAssetWithRawElement(asset)
						? asset.syllabus.map(byTaxoCodename)
						: asset.elements.syllabus.value.map(byTaxoCodename)

					return isIntersect(
						assetSyllabus,
						taxoSyllabusCodenamesOfCurrentSyllabus,
					)
				})
				.filter((asset) => {
					const assetStageTaxos =
						getVideoLinkOrExtLinkOrAssetStageTaxoCodenames(asset)
					const assetResourceTypeTaxos =
						getVideoLinkOrExtLinkOrAssetResourceTypeTaxoCodenames(
							asset,
						)
					return (
						assetResourceTypeTaxos.length &&
						!assetResourceTypeTaxos.some(
							(t) => t === 'web_resource',
						) &&
						(!assetStageTaxos.length ||
							isIntersect(
								currentStagesForAssets,
								assetStageTaxos,
							))
					)
				})
		)
	}, [
		currentStages,
		isLifeSkillsSyl,
		syllabusAssets,
		taxoSyllabusCodenamesOfCurrentSyllabus,
	])

	return (
		<div className="px-4 pt-8">
			<SyllabusTabsTitle
				tabId="teaching-and-learning"
				mappings={mappings}
				syllabusCodename={syllabus.system.codename}
			/>
			<SyllabusTeachingLearningSupport
				files={teachingSupportAssets}
				allStages={currentTaxoTermStages.filter((stage) => {
					return stage.codename !== 'life_skills'
				})}
				className="mt-8"
				syllabus={syllabus}
				isPreviewMode={preview}
			/>
		</div>
	)
}

export default TeachingLearning
