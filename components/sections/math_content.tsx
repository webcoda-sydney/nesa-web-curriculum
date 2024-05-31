import { MATHML_TAGS } from '@/constants/mathml'
import { MathContent } from '@/kontent/content-types'
import Script from 'next/script'
import { useEffect } from 'react'
import sanitizeHtml from 'sanitize-html'
import type { RichtextSectionProps } from '.'
import SanitisedHTMLContainer from '../SanitisedHTMLContainer'
import { WrapperWithInView } from '../WrapperWithInView'

const ALLOWED_TAGS = sanitizeHtml.defaults.allowedTags.concat(...MATHML_TAGS)

const getMathJax = () => (window as any).MathJax

const Inner = ({ richtextValue }) => {
	useEffect(() => {
		const MathJax = getMathJax()
		if (MathJax) {
			MathJax.typesetClear()
			MathJax.typeset()
		}
	}, [richtextValue])

	return (
		<>
			<SanitisedHTMLContainer
				allowedTags={ALLOWED_TAGS}
				allowedAttributes={false}
				css={{
					'&&:not(:nth-child(-n+2))': {
						marginTop: '2.25rem',
					},
					'.TeachingSupportCard &&:not(:nth-child(-n+2))': {
						marginTop: '1rem',
					},
				}}
			>
				{richtextValue}
			</SanitisedHTMLContainer>
		</>
	)
}

export default function math_content({
	linkedItem,
}: RichtextSectionProps<MathContent>) {
	return linkedItem.elements.content.value ? (
		<>
			<WrapperWithInView
				inViewOptions={{
					triggerOnce: true,
				}}
			>
				{(inView) =>
					inView && (
						<Inner
							richtextValue={linkedItem.elements.content.value}
						/>
					)
				}
			</WrapperWithInView>
			<Script
				strategy="afterInteractive"
				src="https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-mml-svg.min.js"
			/>
		</>
	) : null
}
