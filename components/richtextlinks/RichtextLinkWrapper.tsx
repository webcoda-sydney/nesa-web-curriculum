import { Glossary } from '@/kontent/content-types'
import { contentTypes } from '@/kontent/project/contentTypes'
import { Mapping } from '@/types'
import { getUrlFromMapping } from '@/utils'
import { getSyllabusUrlFromMappingBySyllabusCodename } from '@/utils/getSyllabusUrlFromMapping'
import type {
	IContentItemsContainer,
	ILink,
	Responses,
} from '@kontent-ai/delivery-sdk'
import { LinkProps } from 'next/link'
import { Dispatch, ReactNode, SetStateAction } from 'react'
import { RichTextProps } from '../RichText'
import { RichtextLinkGlossary } from './RichtextLinkGlossary'
import { RichtextLinkTeachingAdvice } from './RichtextLinkTeachingAdvice'
import { RichtextLinkWeblinkCC } from './RichtextLinkWeblinkCc'
import { RichtextLinkWeblinkContentgroup } from './RichtextLinkWeblinkContentgroup'
import { RichtextLinkWeblinkExternal } from './RichtextLinkWeblinkExternal'
import { RichtextLinkWeblinkFocusarea } from './RichtextLinkWeblinkFocusarea'
import { RichtextLinkWeblinkTeachingadvice } from './RichtextLinkWeblinkTeachingadvice'

export interface LinkPropsExtended extends LinkProps {
	target?: string
}
export interface RichtextLinkWrapperProps {
	link: ILink
	linkedItems: IContentItemsContainer
	mappings: Mapping[]
	currentPath?: string
	currentStage?: RichTextProps['currentStage']
	currentYear?: RichTextProps['currentYear']
	currentSyllabus?: RichTextProps['currentSyllabus']
	children: (_params: LinkPropsExtended) => ReactNode
	rootGlossaryPopoverData?: Responses.IViewContentItemResponse<Glossary>
	setGlossaryPopoverParentData?: Dispatch<
		SetStateAction<Responses.IViewContentItemResponse<Glossary>>
	>
}

export const RichtextLinkWrapper = ({
	link,
	linkedItems,
	mappings,
	currentStage,
	currentYear,
	currentSyllabus,
	rootGlossaryPopoverData,
	setGlossaryPopoverParentData,
	children,
}: RichtextLinkWrapperProps) => {
	if (!link) {
		return (
			<>
				{children({
					href: undefined,
				})}
			</>
		)
	}

	if (link.type === contentTypes.teachingadvice.codename) {
		return (
			<RichtextLinkTeachingAdvice
				link={link}
				currentStage={currentStage}
				currentYear={currentYear}
				currentSyllabus={currentSyllabus}
			>
				{children}
			</RichtextLinkTeachingAdvice>
		)
	}

	if (link.type === contentTypes.weblinkext.codename) {
		return (
			<RichtextLinkWeblinkExternal link={link}>
				{children}
			</RichtextLinkWeblinkExternal>
		)
	}
	if (link.type === contentTypes.web_link_contentgroup.codename) {
		return (
			<RichtextLinkWeblinkContentgroup link={link}>
				{children}
			</RichtextLinkWeblinkContentgroup>
		)
	}
	if (link.type === contentTypes.web_link_focusarea.codename) {
		return (
			<RichtextLinkWeblinkFocusarea link={link}>
				{children}
			</RichtextLinkWeblinkFocusarea>
		)
	}
	if (link.type === contentTypes.web_link_teachingadvice.codename) {
		return (
			<RichtextLinkWeblinkTeachingadvice link={link}>
				{children}
			</RichtextLinkWeblinkTeachingadvice>
		)
	}

	if (link.type === contentTypes.glossary.codename) {
		return (
			<RichtextLinkGlossary
				link={link}
				rootGlossaryPopoverData={rootGlossaryPopoverData}
				setGlossaryPopoverParentData={setGlossaryPopoverParentData}
			>
				{children}
			</RichtextLinkGlossary>
		)
	}

	if (
		[
			contentTypes.web_link_cc_contentgroup.codename,
			contentTypes.web_link_cc_focusarea.codename,
			contentTypes.web_link_cc_teachingadvice.codename,
		].includes(link.type)
	) {
		return (
			<RichtextLinkWeblinkCC link={link}>
				{children}
			</RichtextLinkWeblinkCC>
		)
	}

	const _linkedItem = link?.codename ? linkedItems[link.codename] : undefined
	if (_linkedItem) {
		const isTypeWebLinkSyllabus =
			link.type === contentTypes.web_link_syllabus.codename
		if (
			link.type === contentTypes.syllabus.codename ||
			isTypeWebLinkSyllabus
		) {
			const syllabusPath = getSyllabusUrlFromMappingBySyllabusCodename(
				mappings,
				link?.codename,
				true,
			)

			return (
				<>
					{children({
						href: syllabusPath,
					})}
				</>
			)
		}

		return (
			<>
				{children({
					href: getUrlFromMapping(mappings, link?.codename),
				})}
			</>
		)
	}

	return (
		<>
			{children({
				href: getUrlFromMapping(mappings, link?.codename),
			})}
		</>
	)
}
