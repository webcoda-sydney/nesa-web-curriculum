import { Syllabus } from '@/kontent/content-types'
import { useGlossary } from '@/legacy-ported/components/base/Glossary'
import GlossaryBody from '@/legacy-ported/components/base/GlossaryBody'
import GlossaryHeader from '@/legacy-ported/components/base/GlossaryHeader'
import { CommonContentTab } from '@/pages/learning-areas/[learningarea]/[syllabus]/[tab]'
import { CommonPageProps } from '@/types'
import {
	convertGlossaryToIGlossary,
	getTaxoCodenames,
	isRichtextElementEmpty,
} from '@/utils'
import NonFullWidthWrapper from '../NonFullWidthWrapper'
import RichText from '../RichText'
import { SyllabusTabsTitle } from '../ui/syllabus-tabs/SyllabusTabsTitle'

export const Glossary = ({
	mappings,
	data,
}: CommonPageProps<Syllabus, CommonContentTab<Syllabus>>) => {
	const {
		config,
		syllabus: syllabusResponse,
		glossaries: allGlossaries,
	} = data
	const syllabus = syllabusResponse.item
	const terms = convertGlossaryToIGlossary(allGlossaries.items)
	const [glossaryHeaderProps, glossaryFilter] = useGlossary({
		sections: terms,
		syllabusFilter: getTaxoCodenames(syllabus.elements.syllabus),
	})

	return (
		<div className="px-4 pt-8">
			<SyllabusTabsTitle
				tabId="glossary"
				mappings={mappings}
				syllabusCodename={syllabus.system.codename}
			/>
			{!!config.item.elements.glossary_intro &&
				!isRichtextElementEmpty(
					config.item.elements.glossary_intro,
				) && (
					<NonFullWidthWrapper>
						<RichText
							mappings={mappings}
							linkedItems={config.linkedItems}
							className="w-full cms-content-formatting"
							richTextElement={
								config.item.elements.glossary_intro
							}
						/>
					</NonFullWidthWrapper>
				)}
			<div className="space-y-8">
				<GlossaryHeader {...glossaryHeaderProps} />
				<GlossaryBody
					sections={glossaryFilter(terms)}
					glossaryLinkedItems={allGlossaries.linkedItems}
				/>
			</div>
		</div>
	)
}

export default Glossary
