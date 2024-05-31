import { AceParagraph } from '@/kontent/content-types'
import { RichtextSectionProps } from '.'
import RichText from '../RichText'

export const getAceCustomOrderedListCss = (
	counterKey: string,
	initialNumber = 0,
) => {
	const level2Key = counterKey + 'level2'
	const level3Key = counterKey + 'level3'
	const level4Key = counterKey + 'level4'

	return {
		'li::marker': {
			fontVariantNumeric: 'initial',
		},
		'& > ol': {
			counterSet: `${counterKey}${
				initialNumber ? ` ${initialNumber - 1}` : ''
			}`,
			'> li': {
				counterIncrement: counterKey,
				'&::marker': {
					content: `counters(${counterKey}, "", decimal) ". "`,
				},
			},
		},
		'& ol ol': {
			listStyle: 'lower-alpha',
			counterSet: `${level2Key} 0`,
			'> li': {
				counterIncrement: level2Key,
			},
		},
		'& ol ol ol': {
			listStyle: 'lower-roman',
			counterSet: `${level3Key} 0`,
			'> li': {
				counterIncrement: level3Key,
			},
		},
		'& ol ol ol ol': {
			listStyle: 'decimal',
			paddingLeft: '1.875rem',
			counterSet: level4Key,
			li: {
				counterIncrement: level4Key,
			},
			'li::marker': {
				content: `"(" counters(${level4Key}, "", decimal) ") "`,
			},
		},
	}
}

export default function AceParagraphComponent({
	linkedItem,
	mappings,
	linkedItems,
	currentPath,
	currentStage,
	currentYear,
	resolveFootnotesLink,
}: RichtextSectionProps<AceParagraph>) {
	return (
		<RichText
			css={getAceCustomOrderedListCss(
				linkedItem.system.codename,
				linkedItem.elements.orderedliststartfrom.value,
			)}
			richTextElement={linkedItem.elements.content}
			linkedItems={linkedItems}
			mappings={mappings}
			currentPath={currentPath}
			currentStage={currentStage}
			currentYear={currentYear}
			resolveFootnotesLink={resolveFootnotesLink}
		/>
	)
}
