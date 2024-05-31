import { CombinedReleaseNote } from '@/databuilders/wp_dc_recentchanges'
import { TaxoSyllabus } from '@/kontent/taxonomies'
import CustomAccordion, {
	CustomAccordionProps,
} from '@/legacy-ported/components/custom/CustomAccordion'
import { IPropWithClassNameChildren, Mapping } from '@/types'
import { getStageTags, getUrlFromMapping } from '@/utils'
import { getReleaseNoteTitle } from '@/utils/ace/getReleaseNoteTitle'
import {
	isReleasenoteAceKla,
	isReleasenoteAceSyllabus,
} from '@/utils/type_predicates'
import { IContentItemsContainer } from '@kontent-ai/delivery-sdk'
import clsx from 'clsx'
import format from 'date-fns/format'
import { TagList } from 'nsw-ds-react'
import { NavItem } from 'nsw-ds-react/dist/component/main-nav/mainNav'
import { ReactNode } from 'react'
import RichText from '../RichText'
import { getLinkedItems } from '../contexts/KontentHomeConfigProvider'
import { ReleaseNoteAffectedSyllabus } from './ReleaseNoteAffectedSyllabus'

export interface ReleaseNoteAccordionProps
	extends Pick<CustomAccordionProps, 'expanded'> {
	releaseNote: CombinedReleaseNote
	mappings: Mapping[]
	linkedItems: IContentItemsContainer
	syllabusTaxoSyllabusUrls: Record<TaxoSyllabus, NavItem>
	slotBeforeBodyContent?: ReactNode
}

export const getStageTagsForReleaseNoteAccordion = (
	releaseNote: CombinedReleaseNote,
) => {
	return getStageTags(releaseNote.elements.stages__stages)
}

export const getNavItemFromSyllabusTaxo = (
	syllabusTaxo: TaxoSyllabus,
	syllabusTaxoSyllabusUrls: Record<TaxoSyllabus, NavItem>,
) => {
	return syllabusTaxoSyllabusUrls[syllabusTaxo]
}

export const ReleaseNoteAccordionBody = (
	props: Omit<ReleaseNoteAccordionProps, 'expanded'> &
		IPropWithClassNameChildren & {
			richtextClassName?: string
			slotBeforeContent?: ReactNode
		},
) => {
	const {
		releaseNote,
		mappings,
		linkedItems,
		syllabusTaxoSyllabusUrls,
		richtextClassName,
		className,
		slotBeforeContent,
	} = props
	const _isReleaseNoteAce =
		isReleasenoteAceKla(releaseNote) ||
		isReleasenoteAceSyllabus(releaseNote)

	const aceSubgroupUrl = _isReleaseNoteAce
		? getUrlFromMapping(mappings, releaseNote.elements.subgroup.value[0])
		: null
	const stageTags = getStageTagsForReleaseNoteAccordion(releaseNote)

	const affecteds: NavItem[] = [
		_isReleaseNoteAce &&
		aceSubgroupUrl &&
		({
			id: 'ace-subgroup',
			text: getLinkedItems(
				releaseNote.elements.subgroup,
				linkedItems,
			)?.[0]?.elements.title.value,
			url: aceSubgroupUrl,
			target: undefined,
		} as NavItem),
	].filter(Boolean)

	return (
		<div className={clsx('space-y-8', className)}>
			{slotBeforeContent}

			<RichText
				className={richtextClassName}
				richTextElement={releaseNote.elements.content}
				mappings={mappings}
				linkedItems={linkedItems}
				data-kontent-item-id={releaseNote.system.id}
				data-kontent-element-codename="content"
			/>

			<TagList tags={stageTags}></TagList>

			<ReleaseNoteAffectedSyllabus
				title="Affects:"
				releaseNote={releaseNote}
				syllabusTaxoSyllabusUrls={syllabusTaxoSyllabusUrls}
				listItemsBeforeDefault={affecteds}
			/>
		</div>
	)
}

export const ReleaseNoteAccordion = (props: ReleaseNoteAccordionProps) => {
	const {
		releaseNote,
		expanded,
		mappings,
		linkedItems,
		syllabusTaxoSyllabusUrls,
		slotBeforeBodyContent,
	} = props

	const title = getReleaseNoteTitle(releaseNote, linkedItems)

	return (
		<CustomAccordion
			key={releaseNote.system.id}
			title={title}
			subTitle={format(
				new Date(releaseNote.elements.releasedate.value),
				'dd MMM yyyy',
			)}
			expanded={expanded}
		>
			<ReleaseNoteAccordionBody
				linkedItems={linkedItems}
				mappings={mappings}
				releaseNote={releaseNote}
				syllabusTaxoSyllabusUrls={syllabusTaxoSyllabusUrls}
				slotBeforeContent={slotBeforeBodyContent}
			/>
		</CustomAccordion>
	)
}
