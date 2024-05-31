// https://github.com/mui-org/material-ui/blob/master/examples/nextjs/src/Link.js

import { IPropWithClassNameChildren } from '@/types'
import clsx from 'clsx'
import NextLink, { LinkProps as NextLinkProps } from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'

export interface LinkProps extends IPropWithClassNameChildren, NextLinkProps {
	activeClassName?: string
	innerRef?: object //todo: not sure what it's supposed to
}

const NextComposed = React.forwardRef<HTMLAnchorElement, NextLinkProps>(
	function NextComposed(props, ref) {
		const { as, href, scroll, shallow, prefetch, ...other } = props

		return (
			<NextLink
				href={href}
				as={as}
				scroll={scroll}
				shallow={shallow}
				prefetch={prefetch}
			>
				<a ref={ref} {...other} />
			</NextLink>
		)
	},
)

// A styled version of the Next.js Link component:
// https://nextjs.org/docs/#with-link
function Link(props) {
	const {
		href,
		activeClassName = 'active',
		className: classNameProps,
		innerRef,
		...other
	} = props

	const router = useRouter()
	const pathname = typeof href === 'string' ? href : href?.pathname || '#'
	const className = clsx(classNameProps, {
		[activeClassName]: router.pathname === pathname && activeClassName,
	})

	return (
		<NextComposed
			className={className}
			ref={innerRef}
			href={href}
			{...other}
		/>
	)
}

export const LinkNoPrefetch = React.forwardRef<HTMLAnchorElement, LinkProps>(
	(props, ref) => {
		const { prefetch, ...other } = props
		return <Link {...other} prefetch={false} innerRef={ref} />
	},
)

export default React.forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => (
	<Link {...props} innerRef={ref} />
))
