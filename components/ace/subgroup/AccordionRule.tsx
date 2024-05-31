import Icon from '@/components/Icon'
import RichText from '@/components/RichText'
import { useAssetsFromAssetsElement } from '@/components/contexts/AssetsProvider'
import { CopyToClipboardButton } from '@/components/ui/copy-to-clipboard/CopyToClipboardButton'
import { AceRule, AceSubgroup } from '@/kontent/content-types'
import CustomAccordion from '@/legacy-ported/components/custom/CustomAccordion'
import DownloadList, {
	DEFAULT_HIDDENS_FOR_DOWNLOAD_LIST,
	DownloadListField,
} from '@/legacy-ported/components/syllabus/DownloadList'
import {
	IPropWithClassName,
	IPropWithClassNameChildren,
	Mapping,
} from '@/types'
import {
	getLinkedItems,
	getUrlFromMapping,
	isRichtextElementEmpty,
} from '@/utils'
import { ACE_RULE_HASH_PREFIX, getSubgroupUrl } from '@/utils/ace'
import { IContentItemsContainer } from '@kontent-ai/delivery-sdk'
import clsx from 'clsx'
import { InPageNavLinks, TagList } from 'nsw-ds-react'
import { InpageNavLinksItemProps } from 'nsw-ds-react/dist/component/in-page-navigation/inPageNavLinks'
import { TagProps } from 'nsw-ds-react/dist/component/tags/tags'
import { ElementType, useEffect, useMemo, useState } from 'react'

import { NswLinkList } from '@/components/nsw/NswLinkList'
import { useIsScreenDown } from '@/hooks/useIsScreenDown'
import { createFootnotesLinkResolver } from '@/layouts/ace_subgroup'
import { Footnotes } from './Footnotes'

const RULE_ONLINE_RESOURCES_HIDDEN = [
	...DEFAULT_HIDDENS_FOR_DOWNLOAD_LIST,
	'stage',
	'resourceType',
	'year',
] as DownloadListField[]

export interface IAccordionRuleProps {
	rule: AceRule
	startOpen: boolean
	allAceSubgroups: AceSubgroup[]
	mappings: Mapping[]
	linkedItems: IContentItemsContainer
}

export interface IRuleCategories {
	rule: AceRule
}

export interface IAccordionRuleSectionProps extends IPropWithClassNameChildren {
	title: string
	headingTag?: ElementType
	headingClassName?: string
	headingId?: string
	subgroupUrl: string
}

export const IconLink = ({ className }: IPropWithClassName) => (
	<Icon
		className={className}
		icon="ic:baseline-link"
		width={24}
		height={24}
	></Icon>
)

const AccordionRuleSection = ({
	title,
	className,
	children,
	headingTag: HeadingTag = 'h2',
	headingClassName = 'mb-5',
	headingId,
	subgroupUrl,
}: IAccordionRuleSectionProps) => {
	const COPY_TITLE = 'Copy link to heading'
	const hashUrl = headingId ? `#${headingId}` : undefined
	const [copied, setCopied] = useState(false)
	const leaveDelay = 2000
	const onCopy = () => {
		setCopied(true)
	}
	const handleMouseOut = () => {
		setTimeout(() => {
			setCopied(false)
		}, leaveDelay + 1000)
	}
	return (
		<div className={clsx('border-t py-8', className)}>
			<HeadingTag
				className={clsx('group', copied && 'active', headingClassName)}
			>
				{headingId && (
					<span
						id={headingId}
						className="scroll-mt-[calc(var(--global-alert-ace-height)+var(--ace-rules-prevnext-height)+24px)] [.is-preview_&]:scroll-mt-[calc(var(--global-alert-ace-height)+var(--ace-rules-prevnext-height)+50px)]"
					></span>
				)}
				<span>{title}</span>
				<CopyToClipboardButton
					textToCopy={subgroupUrl + hashUrl}
					defaultMessage={COPY_TITLE}
					leaveDelay={leaveDelay}
					onCopy={onCopy}
					renderButton={(onMouseOut) => {
						return (
							<button
								type="button"
								className="!text-inherit no-underline inline-block w-12 h-12"
								onMouseOut={() => {
									onMouseOut()
									handleMouseOut()
								}}
							>
								<IconLink className="opacity-0 group-hover:opacity-100 group-[.active]:opacity-100" />
							</button>
						)
					}}
				></CopyToClipboardButton>
			</HeadingTag>
			{children}
		</div>
	)
}

const SECTION_TITLES = {
	CATEGORIES: 'Categories',
	ONLINE_RESOURCES: 'Online resources',
	RELATED_RULES: 'Related ACE Rules',
	FURTHER_INFO: 'For further information',
	FOOTNOTES: 'Footnotes',
} as const

const getIdByTitleInPageNavLinks = (
	title: string,
	inPageNavLinks: InpageNavLinksItemProps[],
) => {
	return (
		inPageNavLinks
			.find((link) => link.title === title)
			?.url.replace('#', '') || ''
	)
}

const getFilterLinkFn =
	(urlSuffix: string, criteria: boolean) =>
	(link: { url: string; title: string }) => {
		if (link.url.includes(urlSuffix) && !criteria) {
			return false
		}
		return true
	}

export const AccordionRule = ({
	rule,
	startOpen,
	allAceSubgroups,
	mappings,
	linkedItems,
}: IAccordionRuleProps) => {
	const isScreenDownMd = useIsScreenDown('md')
	const [origin, setOrigin] = useState('')
	const ruleContentItems = getLinkedItems(rule.elements.items, linkedItems)
	const files = [
		...useAssetsFromAssetsElement(rule.elements.resources),
		...getLinkedItems(rule.elements.resources_other, linkedItems),
	]

	// Related rules
	const relatedRules = getLinkedItems(rule.elements.relatedrules, linkedItems)
	const relatedRulesLinkList = relatedRules.map((related) => {
		return {
			link: getUrlFromMapping(mappings, related.system.codename),
			text: related.elements.title.value,
		}
	})

	// Contact
	const contacts = getLinkedItems(rule.elements.contact, linkedItems)

	// Footnotes
	const footnotes = getLinkedItems(rule.elements.footnotes, linkedItems)

	// Check whether it has these elements
	const hasCategories = !!rule.elements.ace_category.value.length
	const hasIntroduction = !isRichtextElementEmpty(
		rule.elements.preamble_content,
	)
	const hasOnlineResource = files?.length > 0
	const hasRelatedRules = !!relatedRulesLinkList?.length
	const hasContacts = contacts?.length > 0
	const hasFootnotes = footnotes?.length > 0

	const subgroupUrl =
		origin + getSubgroupUrl(rule, allAceSubgroups, linkedItems, mappings)
	const ruleFullUrl =
		origin + getUrlFromMapping(mappings, rule.system.codename)

	const preambleTitle = rule.elements.preamble_title.value || 'Introduction'

	const INPAGE_LINK_PREFIX = `${ACE_RULE_HASH_PREFIX}${rule.system.codename}`

	// In page Links
	const inPageLinks: InpageNavLinksItemProps[] = [
		{
			title: SECTION_TITLES.CATEGORIES,
			url: `${INPAGE_LINK_PREFIX}&part=categories`,
		},
		{
			title: preambleTitle,
			url: `${INPAGE_LINK_PREFIX}&part=preamble`,
		},

		...ruleContentItems.map((ruleContentItem, index) => {
			return {
				title: ruleContentItem.elements.title.value,
				url: `${INPAGE_LINK_PREFIX}&part=content_${index}`,
			} as InpageNavLinksItemProps
		}),
		{
			title: SECTION_TITLES.ONLINE_RESOURCES,
			url: `${INPAGE_LINK_PREFIX}&part=resources`,
		},
		{
			title: SECTION_TITLES.RELATED_RULES,
			url: `${INPAGE_LINK_PREFIX}&part=relatedrules`,
		},
		{
			title: SECTION_TITLES.FURTHER_INFO,
			url: `${INPAGE_LINK_PREFIX}&part=furtherinfo`,
		},
		{
			title: SECTION_TITLES.FOOTNOTES,
			url: `${INPAGE_LINK_PREFIX}&part=footnotes`,
		},
	]
		.filter(getFilterLinkFn('&part=categories', hasCategories))
		.filter(getFilterLinkFn('&part=preamble', hasIntroduction))
		.filter(getFilterLinkFn('&part=resources', hasOnlineResource))
		.filter(getFilterLinkFn('&part=relatedrules', hasRelatedRules))
		.filter(getFilterLinkFn('&part=furtherinfo', hasContacts))
		.filter(getFilterLinkFn('&part=footnotes', hasFootnotes))

	const downloadListHiddenFields = useMemo<DownloadListField[]>(() => {
		if (isScreenDownMd) {
			return [...RULE_ONLINE_RESOURCES_HIDDEN, 'fileSize', 'fileType']
		}
		return RULE_ONLINE_RESOURCES_HIDDEN
	}, [isScreenDownMd])

	useEffect(() => {
		const urlObj = new URL(window.location.href)
		setOrigin(urlObj.origin)
	}, [])

	const resolveFootnotesLink = useMemo(
		() =>
			createFootnotesLinkResolver(footnotes, (footnoteOrderNumber) => {
				return `${INPAGE_LINK_PREFIX}&part=footnotes_${footnoteOrderNumber}`
			}),
		[INPAGE_LINK_PREFIX, footnotes],
	)

	return (
		<CustomAccordion
			key={rule.system.id}
			id={`acerule=${rule.system.codename}`}
			title={`${rule.elements.code.value} ${rule.elements.title.value}`.trim()}
			startOpen={startOpen}
			className="scroll-mt-[calc(var(--global-alert-ace-height)+var(--ace-rules-prevnext-height)+24px)] [.is-preview_&]:scroll-mt-[calc(var(--global-alert-ace-height)+var(--ace-rules-prevnext-height)+50px)]"
		>
			<div className="text-right">
				<CopyToClipboardButton
					textToCopy={ruleFullUrl}
					buttonStyle="dark-outline"
				>
					<span>Copy link to rule</span>
					<IconLink />
				</CopyToClipboardButton>
			</div>

			{inPageLinks?.length > 0 && (
				<InPageNavLinks
					className="nsw-page-nav mb-8"
					title="On this page"
					links={inPageLinks}
				/>
			)}

			{/* Categories */}
			{hasCategories && (
				<AccordionRuleSection
					subgroupUrl={subgroupUrl}
					title={SECTION_TITLES.CATEGORIES}
					headingId={getIdByTitleInPageNavLinks(
						SECTION_TITLES.CATEGORIES,
						inPageLinks,
					)}
				>
					<TagList
						tags={rule.elements.ace_category.value.map(
							(category) =>
								({
									text: category.name,
								} as TagProps),
						)}
					/>
				</AccordionRuleSection>
			)}

			{/* Introduction */}
			{hasIntroduction && (
				<AccordionRuleSection
					subgroupUrl={subgroupUrl}
					title={preambleTitle}
					headingId={getIdByTitleInPageNavLinks(
						preambleTitle,
						inPageLinks,
					)}
				>
					<RichText
						mappings={mappings}
						linkedItems={linkedItems}
						richTextElement={rule.elements.preamble_content}
						resolveFootnotesLink={resolveFootnotesLink}
						disableCopyUrl
					/>
				</AccordionRuleSection>
			)}

			{/* Rule content items */}
			{ruleContentItems.map((ruleContentItem) => {
				return (
					<AccordionRuleSection
						subgroupUrl={subgroupUrl}
						key={ruleContentItem.system.id}
						title={ruleContentItem.elements.title.value}
						headingId={getIdByTitleInPageNavLinks(
							ruleContentItem.elements.title.value,
							inPageLinks,
						)}
					>
						<RichText
							mappings={mappings}
							linkedItems={linkedItems}
							richTextElement={ruleContentItem.elements.content}
							resolveFootnotesLink={resolveFootnotesLink}
							disableCopyUrl
						/>
					</AccordionRuleSection>
				)
			})}

			{/* Online resources */}
			{hasOnlineResource && (
				<AccordionRuleSection
					subgroupUrl={subgroupUrl}
					title={SECTION_TITLES.ONLINE_RESOURCES}
					headingId={getIdByTitleInPageNavLinks(
						SECTION_TITLES.ONLINE_RESOURCES,
						inPageLinks,
					)}
				>
					<DownloadList
						className="mt-8"
						files={files}
						hideCheckbox
						hiddenFields={downloadListHiddenFields}
					/>
				</AccordionRuleSection>
			)}

			{/* Related ACE Rules */}
			{hasRelatedRules && (
				<AccordionRuleSection
					subgroupUrl={subgroupUrl}
					title={SECTION_TITLES.RELATED_RULES}
					headingId={getIdByTitleInPageNavLinks(
						SECTION_TITLES.RELATED_RULES,
						inPageLinks,
					)}
				>
					<NswLinkList items={relatedRulesLinkList} />
				</AccordionRuleSection>
			)}

			{/* Further info */}
			{hasContacts && (
				<AccordionRuleSection
					subgroupUrl={subgroupUrl}
					title={SECTION_TITLES.FURTHER_INFO}
					headingId={getIdByTitleInPageNavLinks(
						SECTION_TITLES.FURTHER_INFO,
						inPageLinks,
					)}
				>
					{contacts.map((contact) => (
						<RichText
							key={contact.system.id}
							mappings={mappings}
							linkedItems={linkedItems}
							richTextElement={contact.elements.content}
							resolveFootnotesLink={resolveFootnotesLink}
							disableCopyUrl
						/>
					))}
				</AccordionRuleSection>
			)}

			{/* Footnotes */}
			{hasFootnotes && (
				<AccordionRuleSection
					subgroupUrl={subgroupUrl}
					title={SECTION_TITLES.FOOTNOTES}
					headingTag="h3"
					headingId={getIdByTitleInPageNavLinks(
						SECTION_TITLES.FOOTNOTES,
						inPageLinks,
					)}
				>
					<Footnotes
						footnotes={footnotes}
						idPrefix={`${INPAGE_LINK_PREFIX.replace(
							'#',
							'',
						)}&part=footnotes_`}
					></Footnotes>
				</AccordionRuleSection>
			)}
		</CustomAccordion>
	)
}
