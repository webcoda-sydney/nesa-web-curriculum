import { OutcomeExample, OutcomeExampleProps } from './OutcomeExample'

export interface OutcomeIncludingProps
	extends Omit<OutcomeExampleProps, 'example'> {
	includingStatement: OutcomeExampleProps['example']
}

export const OutcomeIncluding = ({
	includingStatement,
	...props
}: OutcomeIncludingProps) => {
	return (
		<OutcomeExample
			{...props}
			example={includingStatement}
			pretitle="Including:"
			pretitleClassName="mb-3"
			css={{
				'&&': {
					background: 'rgba(20,108,253,.1)',
					paddingTop: '.75rem',
					paddingBottom: '.75rem',
					paddingLeft: '.75rem',
					paddingRight: '.75rem',
					marginTop: '.5rem',
					marginBottom: '.5rem',
				},
				'&&& > .richtext-example > ul': {
					listStyle: 'initial',
					paddingLeft: 18,
				},
			}}
		></OutcomeExample>
	)
}
