import { OutcomeDetailCardProps } from '@/legacy-ported/components/card/OutcomeDetailCard'
import { IPropWithClassNameChildren } from '@/types'
import { isRichtextElementEmpty } from '@/utils'
import { Elements } from '@kontent-ai/delivery-sdk'
import clsx from 'clsx'
import { ReactNode } from 'react'
import RichText from '../RichText'

export interface OutcomeExampleProps extends IPropWithClassNameChildren {
	example: Elements.RichTextElement
	mappings: OutcomeDetailCardProps['mappings']
	linkedItems: OutcomeDetailCardProps['linkedItems']
	slotBefore?: ReactNode
	pretitle?: ReactNode
	pretitleClassName?: string
}
export const OutcomeExample = ({
	className,
	example,
	mappings,
	linkedItems,
	slotBefore,
	pretitle = 'Example(s):',
	pretitleClassName = '',
	children,
}: OutcomeExampleProps) => {
	return (
		<span
			className={clsx('block bg-nsw-brand-dark/5 p-3 pr-8', className)}
			data-kontent-element-codename="example"
		>
			{slotBefore}
			{pretitle && (
				<div className={clsx('bold mb-1', pretitleClassName)}>
					{pretitle}
				</div>
			)}
			{!isRichtextElementEmpty(example) && (
				<RichText
					className="cms-content-formatting richtext-example"
					css={{
						'&&& ul, &&& ol': {
							paddingLeft: '18px',
						},
						'&&& ul': {
							listStyle: 'none',
							paddingLeft: 0,
						},

						li: {
							marginTop: '1rem',
							// lineHeight: '1.2',
						},
						'&&& > p': {
							marginTop: '1rem',
							// lineHeight: '1.2',
						},
						'.RichText__img-wrapper': {
							paddingLeft: '1.2rem',
							paddingRight: '1.2rem',
							paddingTop: '0.6rem',
							'&--square': {
								img: {
									maxWidth: '5cm !important',
									maxHeight: '5cm !important',
								},
							},
							'&--landscape': {
								img: {
									maxHeight: '3.5cm !important',
								},
							},
							'&--portrait': {
								img: {
									maxWidth: '3.5cm !important',
								},
							},
						},
						'* + .RichText__img-wrapper': {
							paddingTop: 0,
						},
					}}
					linkedItems={linkedItems}
					mappings={mappings}
					richTextElement={example}
				/>
			)}
			{children}
		</span>
	)
}
