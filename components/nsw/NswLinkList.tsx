import clsx from 'clsx'
import { LinkList } from 'nsw-ds-react'
import { LinkListProps } from 'nsw-ds-react/dist/component/link-list/linkList'
export const NswLinkList = (props: LinkListProps) => {
	return (
		<LinkList
			{...props}
			css={{
				'&& a[target=_blank]': {
					'&:after': {
						content: 'none',
					},
				},
			}}
			className={clsx(
				String.raw`[&_.nsw-link-list\_\_item]:border-nsw-grey-04`,
				String.raw`[&_.nsw-link-list\_\_icon]:shrink-0`,
				props.className,
			)}
		/>
	)
}
