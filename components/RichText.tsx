import Image from '@/components/Image'
import Link from '@/components/Link'
import rteSections from '@/components/sections'
import { Glossary, Syllabus } from '@/kontent/content-types'
import { contentTypes } from '@/kontent/project/contentTypes'
import { TaxoKeyLearningArea } from '@/kontent/taxonomies'
import type {
	Mapping,
	TaxoStageWithLifeSkill,
	TaxoStageYearWithLifeSkill,
} from '@/types'
import type {
	ElementModels,
	Elements,
	IContentItemsContainer,
	ILink,
	IRichTextImage,
	Responses,
} from '@kontent-ai/delivery-sdk'
import clsx from 'clsx'
import { Dispatch, SetStateAction, useMemo } from 'react'
import RichTextComponent, { RichTextComponentProps } from './RichTextComponent'
import { RichtextLinkWrapper } from './richtextlinks/RichtextLinkWrapper'

export interface RichTextProps {
	className?: string
	richTextElement: Elements.RichTextElement
	linkedItems: IContentItemsContainer
	mappings: Mapping[]

	/** To create unique id for heading */
	suffixForHeading?: string

	renderFnBefore?: RichTextComponentProps['renderFnBefore']

	/**
	 * For focus area purpose (e.g. teaching advice page)
	 */

	currentPath?: string
	currentSyllabus?: Syllabus
	currentKeyLearningAreas?: ElementModels.TaxonomyTerm<TaxoKeyLearningArea>[]
	currentStage?: TaxoStageWithLifeSkill
	currentYear?: TaxoStageYearWithLifeSkill
	isLifeSkillMode?: boolean
	rootGlossaryPopoverData?: Responses.IViewContentItemResponse<Glossary>
	setGlossaryPopoverParentData?: Dispatch<
		SetStateAction<Responses.IViewContentItemResponse<Glossary>>
	>
	resolveFootnotesLink?: RichTextComponentProps['resolveLink']

	/**
	 * Disable copy-url on headings
	 */
	disableCopyUrl?: boolean

	/**
	 * Copy URL prefix
	 */
	copyUrlPrefix?: string
}

type ImageOrientation = 'square' | 'landscape' | 'portrait'

const getImageOrientation = (
	width: number,
	height: number,
): ImageOrientation => {
	const ratio = width / height
	const min = 7 / 10
	const max = 1 / min
	if (ratio < min) return 'portrait'
	if (ratio > max) return 'landscape'
	return 'square'
}

function RichText(props: RichTextProps) {
	const {
		richTextElement,
		linkedItems,
		mappings,
		currentPath,
		suffixForHeading,
		currentSyllabus,
		currentStage,
		currentYear,
		currentKeyLearningAreas,
		isLifeSkillMode = false,
		rootGlossaryPopoverData,
		setGlossaryPopoverParentData,
		resolveFootnotesLink,
		renderFnBefore,
		disableCopyUrl = false,
		copyUrlPrefix,
		...rest
	} = props

	const _copyUrlPrefix = useMemo(() => {
		if (copyUrlPrefix) return copyUrlPrefix
		if (currentPath) {
			const url = new URL(currentPath, 'https://curriculum.nsw.edu.au')
			return url.pathname + url.search
		}
	}, [copyUrlPrefix, currentPath])

	return (
		<RichTextComponent
			{...rest}
			className={clsx('richtext', props.className)}
			richTextElement={richTextElement}
			linkedItems={linkedItems}
			mappings={mappings}
			resolveLinkedItem={(linkedItem, domNode, domToReact) => {
				if (process.env.NODE_ENV === 'development') {
					console.log(
						'🚀 ~ file: RichText.tsx ~ line 37 ~ RichText ~ linkedItem',
						linkedItem?.system?.type,
					)
				}
				if (!linkedItem) return domToReact([domNode])
				const RichtextSectionComponent =
					rteSections[linkedItem.system.type]

				if (RichtextSectionComponent) {
					return (
						<RichtextSectionComponent
							currentPath={currentPath}
							currentStage={currentStage}
							currentYear={currentYear}
							currentSyllabus={currentSyllabus}
							currentKeyLearningAreas={currentKeyLearningAreas}
							isLifeSkillMode={isLifeSkillMode}
							data-kontent-item-id={linkedItem.system.id}
							linkedItem={linkedItem}
							mappings={mappings}
							linkedItems={linkedItems}
							resolveFootnotesLink={resolveFootnotesLink}
						/>
					)
				}
				return domToReact([domNode])
			}}
			resolveImage={(image: IRichTextImage, _domNode, _domToReact) => {
				return (
					<div
						className={clsx(
							'RichText__img-wrapper',
							`RichText__img-wrapper--${getImageOrientation(
								image.width,
								image.height,
							)}`,
						)}
					>
						<Image
							width={image.width}
							asset={image}
							alt={image.description}
						/>
					</div>
				)
			}}
			resolveLink={(link: ILink, mappings, domNode, domToReact) => {
				if (process.env.NODE_ENV === 'development') {
					console.log(
						'🚀 ~ file: RichText.tsx ~ line 71 ~ RichText ~ link',
						link,
					)
				}
				if (link?.type === contentTypes.ace_footnote.codename) {
					if (resolveFootnotesLink) {
						return resolveFootnotesLink(
							link,
							mappings,
							domNode,
							domToReact,
						)
					}
				}

				return (
					<RichtextLinkWrapper
						link={link}
						linkedItems={linkedItems}
						mappings={mappings}
						currentSyllabus={currentSyllabus}
						currentStage={currentStage}
						currentYear={currentYear}
						rootGlossaryPopoverData={rootGlossaryPopoverData}
						setGlossaryPopoverParentData={
							setGlossaryPopoverParentData
						}
					>
						{(linkProps) => {
							if (linkProps.href) {
								if (
									linkProps.target === '_blank' ||
									(linkProps.href as string)?.includes('#')
								) {
									return (
										<a
											href={linkProps.href as string}
											target={linkProps.target}
										>
											{domToReact(domNode.children)}
										</a>
									)
								}
								return (
									<Link {...linkProps}>
										{domToReact(domNode.children)}
									</Link>
								)
							}
							return <del>{domToReact([domNode])}</del>
						}}
					</RichtextLinkWrapper>
				)
			}}
			resolveDomNode={(domNode, _domToReact) => domNode}
			suffixForHeading={suffixForHeading}
			renderFnBefore={renderFnBefore}
			disableCopyUrl={disableCopyUrl}
			copyUrlPrefix={_copyUrlPrefix}
		></RichTextComponent>
	)
}

export default RichText
