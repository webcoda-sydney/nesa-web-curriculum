import { CustomSyllabusPage } from '@/components/CustomSyllabusPage'
import { Loading } from '@/components/Loading'
import { SyllabusTabsToElement } from '@/constants'
import { WpStage as WpStageModel } from '@/kontent/content-types/wp_stage'
import { fetchAllGlossaries } from '@/pages/page-api/all-glossaries'
import {
	CommonPageProps,
	CustomSyllabusTab,
	KontentCurriculumCommonResultData,
	TaxoStageWithLifeSkill,
} from '@/types'
import {
	excludeAceGlossaries,
	excludeUnstagedSyllabusesTagsFromGlossaries,
	getTaxoCodenames,
} from '@/utils'
import { fetchPageApiAllAssets } from '@/utils/assets/fetchPageApiAllAssets'
import { useQuery } from '@tanstack/react-query'

export default function WpStage(
	props: CommonPageProps<
		WpStageModel,
		KontentCurriculumCommonResultData<WpStageModel>
	>,
) {
	const { data: glossariesAssetsResponse, isFetched: isFetchedGlossaries } =
		useQuery(
			[
				'WpStage_glossary',
				props.data.pageResponse.item.system.codename,
				props.preview,
			],
			async () => {
				const responseGlossaries = await fetchAllGlossaries()
				const filteredGlossaries =
					excludeUnstagedSyllabusesTagsFromGlossaries(
						excludeAceGlossaries(
							responseGlossaries.pageProps.glossaries,
						),
						props.data.syllabuses.items,
					)

				const responseAssets = await fetchPageApiAllAssets()
				return {
					glossaries: filteredGlossaries,
					assets: responseAssets.pageProps.assets.filter((asset) => {
						return (
							asset.resource_type.length &&
							asset.resource_type.every(
								(tag) => !tag.codename.includes('ace_'),
							)
						)
					}),
				}
			},
		)

	let initialSelectedStages: TaxoStageWithLifeSkill[] = getTaxoCodenames(
		props.data.pageResponse.item.elements.stages__stages,
	)
	if (initialSelectedStages.includes('stage_6')) {
		initialSelectedStages = [...initialSelectedStages, 'life_skills']
	}

	if (!isFetchedGlossaries) {
		return (
			<div className="nsw-container pt-8">
				<Loading />
			</div>
		)
	}

	return (
		<>
			<CustomSyllabusPage
				{...props}
				data={{
					...props.data,
					glossaries: glossariesAssetsResponse.glossaries,
					assets: glossariesAssetsResponse.assets,
				}}
				initialSelectedStages={initialSelectedStages}
				initialSelectedTabs={
					Object.keys(SyllabusTabsToElement) as CustomSyllabusTab[]
				}
			/>
		</>
	)
}
