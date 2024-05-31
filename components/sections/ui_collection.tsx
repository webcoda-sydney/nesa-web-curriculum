import type { CollectionSyllabus } from '@/kontent/content-types/collection_syllabus'
import type { CollectionWeblink } from '@/kontent/content-types/collection_weblink'
import type { UiCollection as TUiCollection } from '@/kontent/content-types/ui_collection'
import { SyllabusCardProps } from '@/legacy-ported/components/syllabus/SyllabusCard'
import SyllabusGroup from '@/legacy-ported/components/syllabus/SyllabusGroup'
import type { LinkType } from '@/types'
import {
	getSlugByCodename,
	getTagFromYears,
	getTaxoCodenames,
	isAllowPreviewExternalSyllabus,
	isIntersect,
	isYes,
} from '@/utils'
import { getLinkFromLinkUI } from '@/utils/getLinkFromLinkUI'
import { getSyllabusUrlFromMappingByTaxo } from '@/utils/getSyllabusUrlFromMapping'
import type { RichtextSectionProps } from '.'
import { ModuleSectionWrapper } from '../ModuleSectionWrapper'
import {
	getLinkedItems,
	useKontentHomeConfig,
} from '../contexts/KontentHomeConfigProvider'

export type UiCollectionCollectionTypes = CollectionSyllabus | CollectionWeblink

export default function UiCollection(
	props: RichtextSectionProps<TUiCollection>,
) {
	const { linkedItem, mappings, currentKeyLearningAreas } = props
	const { pageResponseLinkedItems } = useKontentHomeConfig()
	// const tileColor = (linkedItem.elements.tile_colour.value[0]?.codename ||
	// 	'primary') as SyllabusCardColor

	const renderCollectionSyllabus = (collection: CollectionSyllabus) => {
		const currentKeyLearningSlugs = currentKeyLearningAreas?.map((kla) =>
			getSlugByCodename(kla.codename),
		)

		const syllabusMappings = mappings
			.filter(
				(mapping) => mapping.params.navigationItem.type === 'syllabus',
			)
			.filter((mapping) => {
				// if there's key learning areas, only show those in current key learning area
				if (currentKeyLearningSlugs) {
					return isIntersect(
						currentKeyLearningSlugs,
						mapping.params.slug,
					)
				}
				// otherwise, it should return canonical syllabus link
				return mapping.params.isCanonical
			})

		const items = getLinkedItems(
			collection.elements.items,
			pageResponseLinkedItems,
		)
		return items?.map((syllabus) => {
			const isRedirect = isAllowPreviewExternalSyllabus()
				? isYes(syllabus.elements.doredirect) &&
				  !isYes(syllabus.elements.allowpreview)
				: isYes(syllabus.elements.doredirect)
			const url = getSyllabusUrlFromMappingByTaxo(
				syllabusMappings,
				getTaxoCodenames(syllabus.elements.syllabus)[0],
				false,
			)
			const year = getTagFromYears(
				syllabus.elements.stages__stage_years.value,
			)
			return {
				headline: syllabus.elements.title.value,
				body: `${year} Syllabus`,
				url: {
					title: syllabus.elements.title.value,
					external: isRedirect,
					url: isRedirect
						? syllabus.elements.redirecturl.value
						: url || '#',
				},
				highlight: !isRedirect,
				codenameHeadline: 'title',
				kontentId: syllabus.system.id,
				enablePopupOnExternalLink: isRedirect,
			} as SyllabusCardProps
		})
	}

	const renderCollectionWebLink = (collection: CollectionWeblink) => {
		return getLinkedItems(
			collection.elements.items,
			pageResponseLinkedItems,
		).map((menu: LinkType) => {
			const { url, isExternal } = getLinkFromLinkUI(
				menu,
				mappings,
				pageResponseLinkedItems,
			)
			return {
				headline: menu.elements.title.value,
				body: menu.elements.subtitle.value,
				url: {
					title: menu.elements.title.value,
					external: isExternal,
					url: url || '#',
				},
				// colour: tileColor,
				codenameTitle: 'title',
				codenameBody: 'subtitle',
				kontentId: menu.system.id,
			} as SyllabusCardProps
		})
	}

	const renderCollection = (collection: UiCollectionCollectionTypes) => {
		if (!collection) return []
		if (collection.system.type === 'collection_syllabus') {
			return renderCollectionSyllabus(collection as CollectionSyllabus)
		}
		return renderCollectionWebLink(collection as CollectionWeblink)
	}

	return (
		<ModuleSectionWrapper>
			{getLinkedItems(
				linkedItem.elements.items,
				pageResponseLinkedItems,
			).map((collection) => (
				<SyllabusGroup
					key={collection.system.codename}
					heading={linkedItem.elements.title.value}
					items={renderCollection(collection)}
				/>
			))}
		</ModuleSectionWrapper>
	)
}
