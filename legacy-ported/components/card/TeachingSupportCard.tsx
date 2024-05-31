import type { RichTextProps } from '@/components/RichText'
import { getDataAttributesFromProps, isRichtextElementEmpty } from '@/utils'
import { TOverarchingLinkProps } from '@/utils/getLinksFromOverarchingLinks'
import type { Elements } from '@kontent-ai/delivery-sdk'
import Paper from '@mui/material/Paper'
import clsx from 'clsx'
import { ReactNode } from 'react'
import { ContentOverarchingLinks } from '../syllabus/ContentOverarchingLinks'
import SyllabusContentSection from '../syllabus/SyllabusContentSection'

export interface TeachingSupportCardProps
	extends Omit<RichTextProps, 'richTextElement'> {
	/**
	 * Card title
	 */
	title?: ReactNode

	/**
	 * Syllabus Content
	 */
	content: Elements.RichTextElement

	/**
	 * Used by Content tab whether the "View life skills" toggle is selected or not
	 */
	isLifeSkillMode?: boolean

	/**
	 * Anything inside
	 */
	children?: ReactNode

	/**
	 * All overaching links
	 */
	overarchingLinks?: TOverarchingLinkProps[]
}

export default function TeachingSupportCard(props: TeachingSupportCardProps) {
	const {
		title,
		content,
		linkedItems,
		mappings,
		children,
		currentPath,
		currentStage,
		currentSyllabus,
		currentYear,
		isLifeSkillMode = false,
		overarchingLinks,
		className,
		...rest
	} = props
	const dataAttributes = getDataAttributesFromProps(rest)

	return (
		<Paper
			{...dataAttributes}
			className={clsx(
				'p-6 md:p-8 bg-nsw-off-white TeachingSupportCard sdf',
				className,
			)}
			variant="outlined"
		>
			{title || <div className="nsw-h3 mb-8">{'Teaching advice'}</div>}

			{!isRichtextElementEmpty(content) && (
				<SyllabusContentSection
					className="mt-8"
					data-kontent-element-codename="content"
					richTextElement={content}
					linkedItems={linkedItems}
					mappings={mappings}
					currentStage={currentStage}
					currentYear={currentYear}
					isLifeSkillMode={isLifeSkillMode}
					currentSyllabus={currentSyllabus}
					disableCopyUrl
				/>
			)}
			{overarchingLinks?.length > 0 && (
				<ContentOverarchingLinks
					className="mt-8"
					links={overarchingLinks}
				/>
			)}
			{children}
		</Paper>
	)
}
