import { Syllabus, Weblinkext, Weblinkvideo } from '@/kontent/content-types'
import { contentTypes } from '@/kontent/project/contentTypes'
import { byTaxoCodename, getWebLinkWithoutAce } from '@/utils'
import { commonFetch } from '@/utils/fetchUtils'
import { Responses } from '@kontent-ai/delivery-sdk'
import { useQuery } from '@tanstack/react-query'
import { ReactNode, useEffect } from 'react'
import { Loading } from './Loading'
import SyllabusView, { SyllabusViewProps } from './SyllabusView'
import { useKontentHomeConfig } from './contexts/KontentHomeConfigProvider'

interface AsyncSyllabusViewProps
	extends Omit<SyllabusViewProps, 'syllabus' | 'linkedItems'> {
	syllabusCodename: string
	slotBefore?: ReactNode
}

const fetchSyllabusCustom = async (codename: string) => {
	const [{ json, ok }] = await Promise.all([
		commonFetch<Responses.IViewContentItemResponse<Syllabus>, any>(
			`/api/item?codename=${codename}&depth=1`,
			undefined,
			{
				method: 'GET',
			},
		),
	])

	if (!ok) {
		throw new Error(
			'AsyncSyllabusView fetch: Network error on fetching syllabus',
		)
	}
	const { ok: okVideo, json: jsonVideo } = await commonFetch<
		Responses.IListContentItemsResponse<Weblinkvideo>,
		any
	>(
		`/api/items?type=${
			contentTypes.weblinkvideo.codename
		}&contains.element=elements.${
			contentTypes.weblinkvideo.elements.syllabus.codename
		}&contains.value=${json.item.elements.syllabus.value.map(
			byTaxoCodename,
		)}`,
	)
	if (!okVideo) {
		throw new Error(
			'AsyncSyllabusView fetch: Network error on fetching weblink videos',
		)
	}

	const { ok: okExternalLink, json: jsonExternalLink } = await commonFetch<
		Responses.IListContentItemsResponse<Weblinkext>,
		any
	>(
		`/api/items?type=${
			contentTypes.weblinkext.codename
		}&contains.element=elements.${
			contentTypes.weblinkext.elements.syllabus.codename
		}&contains.value=${json.item.elements.syllabus.value.map(
			byTaxoCodename,
		)}`,
	)
	if (!okExternalLink) {
		throw new Error(
			'AsyncSyllabusView fetch: Network error on fetching weblink external',
		)
	}

	return {
		syllabusResponse: json,
		webLinkVideosResponse: getWebLinkWithoutAce(jsonVideo),
		webLinkExternalLinks: getWebLinkWithoutAce(jsonExternalLink),
	}
}

export const AsyncSyllabusView = ({
	syllabusCodename,
	allAssets,
	allGlossaries,
	allStageGroups,
	allStages,
	currentOptions,
	currentTabs,
	currentStages,
	initialStageCodename,
	initialTab,
	enableContentCurrentlyViewing = false,
	slotBefore,
}: AsyncSyllabusViewProps) => {
	const { data, isFetched } = useQuery(
		[`AsyncSyllabusView_${syllabusCodename}`, syllabusCodename],
		() => fetchSyllabusCustom(syllabusCodename),
		{
			staleTime: Infinity,
		},
	)
	const { pageResponseLinkedItems, setPageResponseLinkedItems } =
		useKontentHomeConfig()
	const { syllabusResponse, webLinkVideosResponse, webLinkExternalLinks } =
		data || {}

	useEffect(() => {
		if (isFetched) {
			setPageResponseLinkedItems({
				...pageResponseLinkedItems,
				...syllabusResponse.linkedItems,
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isFetched, syllabusResponse?.item.system.id])

	if (!isFetched) {
		return <Loading />
	}

	return (
		<>
			{slotBefore}
			<SyllabusView
				allAssets={allAssets}
				allGlossaries={allGlossaries}
				allStageGroups={allStageGroups}
				allStages={allStages}
				currentOptions={currentOptions}
				currentStages={currentStages}
				currentTabs={currentTabs}
				linkedItems={syllabusResponse.linkedItems}
				syllabus={syllabusResponse.item}
				initialStageCodename={initialStageCodename}
				initialTab={initialTab}
				enableContentCurrentlyViewing={enableContentCurrentlyViewing}
				allWebLinkVideos={webLinkVideosResponse.items}
				allWebLinkExternals={webLinkExternalLinks.items}
				showCurrentStagesTags
				isParentCustomView
			></SyllabusView>
		</>
	)
}
