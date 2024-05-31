import clsx from 'clsx'
import { forwardRef, HTMLProps } from 'react'
import sanitizeHtml from 'sanitize-html'

export interface SanitisedHTMLContainerProps extends HTMLProps<HTMLDivElement> {
	className?: string
	children: string
	allowedTags?: string[]
	allowedAttributes?: false | Record<string, sanitizeHtml.AllowedAttribute[]>
}

const SanitisedHTMLContainer = (
	{
		children,
		className,
		allowedTags = sanitizeHtml.defaults.allowedTags,
		allowedAttributes = sanitizeHtml.defaults.allowedAttributes,
		...others
	}: SanitisedHTMLContainerProps,
	ref,
) => {
	const sanitisedChildren = sanitizeHtml(children, {
		allowedTags,
		allowedAttributes,
	})
	return (
		// eslint-disable-next-line react/no-danger
		<div
			ref={ref}
			{...others}
			className={clsx('richtext', className)}
			dangerouslySetInnerHTML={{ __html: sanitisedChildren }}
		/>
	)
}

export default forwardRef(SanitisedHTMLContainer)
