import { useCleanPath } from '@/hooks/useCleanPath'
import { handleResourceDownload } from '@/legacy-ported/components/support/ResourceBody'
import type { Mapping } from '@/types'
import type { Elements, ILink } from '@kontent-ai/delivery-sdk'
import parseHTML, {
	DOMNode,
	Element,
	HTMLReactParserOptions,
	Text,
	attributesToProps,
	domToReact,
} from 'html-react-parser'
import { useRouter } from 'next/router'
import React, { ReactNode, forwardRef } from 'react'
import slugify from 'slugify'
import { CommonCopyUrlWrapper } from './ui/copy-to-clipboard/CommonCopyUrlWrapper'

const IMAGE_ID_ATTRIBUTE_IDENTIFIER = 'data-image-id'
const LINKED_ITEM_ID_ATTRIBUTE_IDENTIFIER = 'data-item-id'
const ASSET_ID_ATTRIBUTE_IDENTIFIER = 'data-asset-id'

function isLinkedItem(domNode) {
	return (
		domNode.name === 'object' &&
		domNode.attribs?.type === 'application/kenticocloud'
	)
}

function isImage(domNode) {
	return (
		domNode.name === 'figure' &&
		typeof domNode.attribs?.[IMAGE_ID_ATTRIBUTE_IDENTIFIER] !== 'undefined'
	)
}

function isLink(domNode) {
	return (
		domNode.name === 'a' &&
		typeof domNode.attribs?.[LINKED_ITEM_ID_ATTRIBUTE_IDENTIFIER] !==
			'undefined'
	)
}

function isLinkAsset(domNode: Element) {
	return (
		domNode.name === 'a' &&
		typeof domNode.attribs?.[ASSET_ID_ATTRIBUTE_IDENTIFIER] !== 'undefined'
	)
}

function isHeadingType(tagName) {
	return ['h2', 'h3', 'h4'].includes(tagName)
}

function allowCopyUrlHeadings(tagName) {
	return ['h1', 'h2', 'h3'].includes(tagName?.toLowerCase())
}

export function replaceNode(
	domNode,
	richTextElement: Elements.RichTextElement,
	linkedItems,
	mappings,
	resolveLinkedItem,
	resolveImage,
	resolveLink,
	resolveDomNode,
	headingIds = [],
	suffixForHeading = '',
	disableCopyUrl = false,
	copyUrlPrefix = '',
) {
	const { images, links } = richTextElement
	const attributes = attributesToProps(domNode.attribs)

	if (resolveLinkedItem && linkedItems) {
		if (isLinkedItem(domNode)) {
			const codeName = domNode.attribs?.['data-codename']
			const linkedItem = linkedItems[codeName]
			return resolveLinkedItem(linkedItem, domNode, domToReact)
		}
	}

	if (resolveImage && images) {
		if (isImage(domNode)) {
			const imageId = domNode.attribs?.[IMAGE_ID_ATTRIBUTE_IDENTIFIER]
			const image = images.find((image) => image.imageId === imageId)
			return resolveImage(image, domNode, domToReact)
		}
	}

	if (isLinkAsset(domNode)) {
		const customAssetBasePath = process.env.NEXT_PUBLIC_ASSETS_BASE_PATH
		let href = domNode.attribs?.href
		const url = new URL(href)
		if (customAssetBasePath && href) {
			// Replace with custom domain
			href = href?.replace(url.origin, customAssetBasePath)
		}

		return (
			<a
				onClick={handleResourceDownload}
				{...attributes}
				href={href}
				target="_blank"
				rel="noopener noreferrer noindex nofollow"
				download
			>
				{domToReact(domNode.children)}
			</a>
		)
	}

	if (resolveLink && links) {
		if (isLink(domNode)) {
			const linkId =
				domNode.attribs?.[LINKED_ITEM_ID_ATTRIBUTE_IDENTIFIER]
			const link = links.find((link) => link.linkId === linkId)
			return resolveLink(link, mappings, domNode, domToReact)
		}
	}

	if (domNode instanceof Element && isHeadingType(domNode.name)) {
		const text = domNode.children.map((item: Text) => item.data).join('')
		let id = slugify(
			text + (suffixForHeading ? '-' + suffixForHeading : ''),
			{ lower: true },
		)
		headingIds.push(id)
		const sameIds = headingIds.filter((heading) => heading === id)
		if (sameIds.length - 1) {
			id = id + '-' + (sameIds.length - 1).toString()
		}

		return (
			<HeadingComponent
				as={domNode.name}
				id={id}
				attributes={attributes}
				disableCopyUrl={
					disableCopyUrl || !allowCopyUrlHeadings(domNode.name)
				}
				copyUrlPrefix={copyUrlPrefix}
			>
				{domToReact(domNode.children)}
			</HeadingComponent>
		)
	}
	if (domNode instanceof Element && domNode.name === 'table') {
		const tBody = domNode.children[0] as Element
		const tRows = tBody.children.filter(
			(item: Element) => item.type === 'tag' && item.name === 'tr',
		) as Element[]

		return (
			<div className="nsw-table">
				<table {...attributes}>
					<thead>
						<tr>
							{tRows[0].children
								.filter(
									(tRowChild: Element) =>
										tRowChild.type === 'tag' &&
										tRowChild.name === 'td',
								)
								.map((tRowChild: Element, index) => (
									<th key={index}>
										{domToReact(
											tRowChild.children.map((node) =>
												replaceNode(
													node,
													richTextElement,
													linkedItems,
													mappings,
													resolveLinkedItem,
													resolveImage,
													resolveLink,
													resolveDomNode,
													headingIds,
													suffixForHeading,
												),
											),
										)}
									</th>
								))}
						</tr>
					</thead>
					<tbody>
						{domToReact(
							tRows
								.filter((_, index) => index > 0)
								.map((node) =>
									replaceNode(
										node,
										richTextElement,
										linkedItems,
										mappings,
										resolveLinkedItem,
										resolveImage,
										resolveLink,
										resolveDomNode,
										headingIds,
										suffixForHeading,
									),
								),
						)}
					</tbody>
				</table>
			</div>
		)
	}

	if (resolveDomNode) {
		return resolveDomNode(domNode, domToReact)
	}
}

export interface RichTextComponentProps {
	richTextElement: Elements.RichTextElement
	linkedItems?: any
	mappings?: Mapping[]
	resolveLinkedItem?: any
	resolveImage?: any
	resolveLink?: (
		_link: ILink,
		_mappings: Mapping[],
		_domNode: Element,
		_domToReact: (
			_nodes: DOMNode[],
			_options?: HTMLReactParserOptions,
		) => string | JSX.Element | JSX.Element[],
	) => ReactNode
	resolveDomNode?: any
	className?: string
	suffixForHeading?: string
	renderFnBefore?: (_e: string | JSX.Element | JSX.Element[]) => ReactNode
	disableCopyUrl?: boolean
	copyUrlPrefix?: string
}

export function getDomNode({
	richTextElement,
	linkedItems,
	mappings,
	resolveLinkedItem,
	resolveImage,
	resolveLink,
	resolveDomNode,
	suffixForHeading,
	disableCopyUrl,
	copyUrlPrefix,
}: RichTextComponentProps): string | JSX.Element | JSX.Element[] {
	const cleanedValue = richTextElement?.value?.replace(/(\n|\r)+/, '')
	const headingsStorage = []
	return parseHTML(cleanedValue, {
		replace: (domNode) => {
			return replaceNode(
				domNode,
				richTextElement,
				linkedItems,
				mappings,
				resolveLinkedItem,
				resolveImage,
				resolveLink,
				resolveDomNode,
				headingsStorage,
				suffixForHeading,
				disableCopyUrl,
				copyUrlPrefix,
			)
		},
	})
}

function RichTextComponent(props: RichTextComponentProps) {
	const {
		className,
		richTextElement,
		linkedItems,
		mappings,
		resolveDomNode,
		resolveImage,
		resolveLink,
		resolveLinkedItem,
		suffixForHeading,
		renderFnBefore,
		disableCopyUrl,
		copyUrlPrefix,
		...rest
	} = props
	const result = getDomNode(props)
	return (
		<>
			{renderFnBefore && renderFnBefore(result)}
			<div {...rest} className={className}>
				{result}
			</div>
		</>
	)
}

export interface HeadingProps {
	as?: string
	id: string
	attributes: any
	children: React.ReactNode
	disableCopyUrl?: boolean
	copyUrlPrefix?: string
}

export const HeadingComponent = forwardRef(
	(
		{
			as: Tag = 'h2',
			id,
			attributes,
			children,
			disableCopyUrl = false,
			copyUrlPrefix = '',
		}: HeadingProps,
		ref,
	) => {
		const { asPath } = useRouter()
		const path = useCleanPath(asPath, (_path) => {
			const p = _path
			p.hash = id
			return p
		})

		if (disableCopyUrl) {
			return (
				<Tag ref={ref} id={id} {...attributes}>
					{children}
				</Tag>
			)
		}

		const urlPrefix = copyUrlPrefix
			? copyUrlPrefix
			: path.pathname + path.search

		return (
			<CommonCopyUrlWrapper url={urlPrefix + path.hash}>
				<Tag ref={ref} id={id} {...attributes}>
					{children}
				</Tag>
			</CommonCopyUrlWrapper>
		)
	},
)

export default RichTextComponent
