import TreePicker, {
	TreePickerProps,
} from '@/legacy-ported/components/custom/TreePicker'
import { TreeElement } from '@/legacy-ported/components/custom/treeUtils'
import { ChangeEvent, useId } from 'react'
import { NswFilter } from './nsw/filters/NswFilter'
import { NswFilterItem } from './nsw/filters/NswFilterItem'
import { NswFilterList } from './nsw/filters/NswFilterList'
import { NswFormFieldset } from './nsw/filters/NswFormFieldset'

export interface ResourceListFilterProps {
	title?: string
	filterItems: {
		id: string
		title: string
		filterTree: TreeElement[]
		selected: TreePickerProps['selected']
	}[]
	// eslint-disable-next-line no-unused-vars
	onChange: (filterItemsId: string, selectedIds: string[]) => void
}

export type ResourceSortSelectOption = 'relevance' | 'title' | 'date'
export interface ResourceSortSelectProps {
	// eslint-disable-next-line no-unused-vars
	onChange: (e: ChangeEvent<HTMLSelectElement>) => void
}
export const ResourceSortSelect = ({ onChange }: ResourceSortSelectProps) => {
	const selectId = useId()
	return (
		<>
			<label
				className="nsw-form__label"
				htmlFor={`results-sort-${selectId}`}
			>
				Sort by:
			</label>
			<select
				className="nsw-form__select"
				id={`results-sort-${selectId}`}
				onChange={onChange}
				autoComplete="off"
			>
				<option value="relevance">Relevance</option>
				<option value="title">Title A-Z</option>
				<option value="date">Publication date</option>
			</select>
		</>
	)
}

const ResourceListFilter = (props: ResourceListFilterProps) => {
	const { title = 'Filter results', filterItems, onChange } = props

	const handleChange = (id, selectedIds) => {
		onChange(id, selectedIds)
	}

	return (
		<NswFilter title={title}>
			<NswFilterList>
				{filterItems.map((item, index) => {
					return (
						<NswFilterItem key={item.title + index}>
							<NswFormFieldset title={item.title}>
								<TreePicker
									className="-ml-2"
									rootElements={item.filterTree}
									onChange={(ids) =>
										handleChange(item.id, ids)
									}
									selected={item.selected}
								/>
							</NswFormFieldset>
						</NswFilterItem>
					)
				})}
			</NswFilterList>
		</NswFilter>
	)
}

export default ResourceListFilter
