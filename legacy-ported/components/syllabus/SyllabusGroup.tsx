import { GridCol } from '@/components/nsw/grid/GridCol'
import { GridWrapper } from '@/components/nsw/grid/GridWrapper'
import { getDataAttributesFromProps } from '@/utils'
import { ReactNode } from 'react'
import SyllabusCard, { SyllabusCardProps } from './SyllabusCard'

export type SyllabusGroupItem = Pick<
	SyllabusCardProps,
	'headline' | 'body' | 'url'
> & {
	kontentId?: string
}

export interface SyllabusGroupProps {
	heading?: ReactNode
	items: SyllabusGroupItem[]
}

const SyllabusGroup = (props: SyllabusGroupProps): JSX.Element => {
	const { heading, items } = props

	const dataAttributes = getDataAttributesFromProps(props)
	return (
		<>
			{typeof heading === 'string' && heading && (
				<h2
					className="mb-4 md:mb-8"
					data-kontent-item-id={
						dataAttributes?.['data-kontent-item-id']
					}
					data-kontent-element-codename="title"
				>
					{heading}
				</h2>
			)}
			{typeof heading !== 'string' && heading}
			<GridWrapper>
				{items.map((s, index) => (
					<GridCol
						key={`syllabusCard-${index}`}
						lg={4}
						display="flex"
						flexDirection="column"
					>
						<SyllabusCard
							className="flex-1"
							kontentId={s.kontentId}
							{...s}
						/>
					</GridCol>
				))}
			</GridWrapper>
		</>
	)
}

export default SyllabusGroup
