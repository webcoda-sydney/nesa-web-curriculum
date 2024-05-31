import { RTL_LANGUAGES } from '@/constants'
import { ContentLangexample } from '@/kontent/content-types'
import { TaxoLanguage } from '@/kontent/taxonomies'
import { IPropWithClassName, Mapping } from '@/types'
import { byTaxoCodename, isIntersect } from '@/utils'
import { Elements, IContentItemsContainer } from '@kontent-ai/delivery-sdk'
import clsx from 'clsx'
import { TagList } from 'nsw-ds-react'
import { TagProps } from 'nsw-ds-react/dist/component/tags/tags'
import { useMemo } from 'react'
import RichText from '../RichText'
import { getLinkedItems } from '../contexts/KontentHomeConfigProvider'

export interface OutcomeExampleLangProps extends IPropWithClassName {
	examplesLang: Elements.LinkedItemsElement<ContentLangexample>
	linkedItems: IContentItemsContainer
	activeLanguages: TaxoLanguage[]
	mappings: Mapping[]
}
export function getActiveExampleLangs(
	examplesLang: Elements.LinkedItemsElement<ContentLangexample>,
	linkedItems: IContentItemsContainer,
	activeLanguages: TaxoLanguage[],
): ContentLangexample[] {
	const examples = getLinkedItems(examplesLang, linkedItems)
	return (
		examples?.filter((example) =>
			isIntersect(
				example.elements.language.value.map(byTaxoCodename),
				activeLanguages,
			),
		) ?? []
	)
}

export const OutcomeExampleLang = ({
	examplesLang,
	linkedItems,
	activeLanguages,
	mappings,
	className,
}: OutcomeExampleLangProps) => {
	const _examplesLang = useMemo(
		() => getActiveExampleLangs(examplesLang, linkedItems, activeLanguages),
		[examplesLang, linkedItems, activeLanguages],
	)

	return (
		<div className={clsx(className, 'OutcomesExampleLang')}>
			{_examplesLang.map((example) => {
				const intersectLanguages =
					example.elements.language.value.filter((lang) =>
						activeLanguages.includes(lang.codename),
					)
				const languageTags = intersectLanguages.map<TagProps>(
					(lang) => {
						return {
							text: lang.name,
						}
					},
				)

				const intersectLanguagesRTL = intersectLanguages.some((lang) =>
					RTL_LANGUAGES.includes(lang.codename),
				)
				const attr = {
					dir: intersectLanguagesRTL ? 'rtl' : undefined,
				}
				return (
					<div key={example.system.id} className="space-y-1">
						<TagList tags={languageTags} />
						<RichText
							{...attr}
							data-kontent-element-id={example.system.id}
							data-kontent-element-codename={
								example.system.codename
							}
							linkedItems={linkedItems}
							mappings={mappings}
							richTextElement={example.elements.content}
							className={
								intersectLanguagesRTL ? 'text-right' : undefined
							}
						/>
					</div>
				)
			})}
		</div>
	)
}
