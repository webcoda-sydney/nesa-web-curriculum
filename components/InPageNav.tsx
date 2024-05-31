import clsx from 'clsx'
import { useRouter } from 'next/router'
import { InPageNavLinks } from 'nsw-ds-react'
import {
	Dispatch,
	MutableRefObject,
	SetStateAction,
	useEffect,
	useRef,
	useState,
} from 'react'

type THeading = 'h2' | 'h3' | 'h4' | 'h5'

export interface InPageNavProps {
	/**
	 * Title of component
	 */
	title?: string
	className?: string
	richTextElement?: Element
	richTextElements?: JSX.Element[]
	headingEl?: THeading
}

const ACCEPTED_HEADINGS = ['h2', 'h3', 'h4', 'h5'] as const

const getHeadings = (
	nodes: JSX.Element | JSX.Element[],
	indexToFind = 0,
): JSX.Element[] => {
	if (indexToFind < 0) return []
	const headingEl = ACCEPTED_HEADINGS[indexToFind]
	let headings = []
	if (Array.isArray(nodes)) {
		headings = nodes.filter((item) => {
			return item.props?.as === headingEl
		})
	} else {
		if (nodes.props?.as === headingEl) {
			headings = [nodes]
		}
	}
	if (!headings.length) {
		const nextIndex = indexToFind + 1
		if (nextIndex <= ACCEPTED_HEADINGS.length - 1) {
			return getHeadings(nodes, nextIndex)
		}
		return []
	}
	return headings
}

export const useInPageNav = (): [
	Element,
	MutableRefObject<any>,
	Dispatch<SetStateAction<Element>>,
] => {
	const router = useRouter()
	const [rteEl, setRteEl] = useState<Element>(null)
	const refWrapper = useRef<any>()

	useEffect(() => {
		setRteEl(refWrapper.current?.querySelector('.richtext'))
	}, [router.asPath])

	return [rteEl, refWrapper, setRteEl]
}

const InPageNav = (props: InPageNavProps): JSX.Element => {
	const {
		title = 'On this page',
		className,
		richTextElements,
		headingEl = 'h2',
	} = props

	const headings = richTextElements
		? getHeadings(
				richTextElements,
				ACCEPTED_HEADINGS.findIndex((h) => h === headingEl),
		  )
		: []

	if (!headings.length) return null

	return (
		<div className={clsx('mt-8 mb-12', className)}>
			<InPageNavLinks
				className="nsw-page-nav"
				title={title}
				links={headings.map((item) => {
					return {
						title: item.props.children,
						url: '#' + item.props.id,
					}
				})}
			/>
		</div>
	)
}

export default InPageNav
