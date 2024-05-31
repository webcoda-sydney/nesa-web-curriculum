import RichText, { RichTextProps } from '@/components/RichText'
import { getDataAttributesFromProps } from '@/utils'
import clsx from 'clsx'

const SyllabusContentSection = (props: RichTextProps): JSX.Element => {
	const {
		richTextElement,
		linkedItems,
		mappings,
		className,
		currentPath,
		currentStage,
		currentSyllabus,
		currentYear,
		isLifeSkillMode = false,
		disableCopyUrl = false,
		...rest
	} = props
	const dataAttributes = getDataAttributesFromProps(rest)
	return (
		<RichText
			{...dataAttributes}
			className={clsx('cms-content-formatting', className)}
			linkedItems={linkedItems}
			mappings={mappings}
			richTextElement={richTextElement}
			currentPath={currentPath}
			currentStage={currentStage}
			currentYear={currentYear}
			currentSyllabus={currentSyllabus}
			isLifeSkillMode={isLifeSkillMode}
			disableCopyUrl={disableCopyUrl}
		/>
	)
}

export default SyllabusContentSection
