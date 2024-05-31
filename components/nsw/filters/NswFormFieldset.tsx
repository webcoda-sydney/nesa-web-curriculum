import { IPropWithClassNameChildren } from '@/types'
import clsx from 'clsx'

export interface INswFormFieldsetProps extends IPropWithClassNameChildren {
	title?: string
}

export const NswFormFieldset = ({
	title,
	children,
	className,
}: INswFormFieldsetProps) => {
	return (
		<fieldset className={clsx('nsw-nsw-form__fieldset', className)}>
			{!!title && <legend className="nsw-form__legend">{title}</legend>}
			{children}
		</fieldset>
	)
}
