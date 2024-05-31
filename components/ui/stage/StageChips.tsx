import { IPropWithClassName, TaxoStageWithLifeSkill } from '@/types'
import { ElementModels } from '@kontent-ai/delivery-sdk'
import clsx from 'clsx'
import { TagList } from 'nsw-ds-react'
import { TagProps } from 'nsw-ds-react/dist/component/tags/tags'

export interface StageChipsProps extends IPropWithClassName {
	stages: ElementModels.TaxonomyTerm<TaxoStageWithLifeSkill>[]
}

export const StagesChips = ({ stages, className }: StageChipsProps) => {
	const tags: TagProps[] = stages.map((stage) => {
		return {
			text: stage.name,
		}
	})

	return <TagList className={clsx(className)} tags={tags}></TagList>
}
