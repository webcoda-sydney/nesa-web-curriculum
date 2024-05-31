import { useKontentHomeConfig } from '@/components/contexts/KontentHomeConfigProvider'
import Icon from '@/components/Icon'
import RichText from '@/components/RichText'
import clsx from 'clsx'
import { AceFootnote } from 'kontent/content-types'
import { Button } from 'nsw-ds-react'
import React, { useEffect, useRef } from 'react'

interface FootnotesProps {
	footnotes: AceFootnote[]
	idPrefix?: string
}

let timeoutId
export const Footnotes = (props: FootnotesProps) => {
	const { footnotes, idPrefix = '' } = props
	const { mappings, pageResponseLinkedItems } = useKontentHomeConfig()
	const refRoot = useRef<HTMLOListElement>(null)
	// const timeoutId = useRef(null)

	const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		const selectedContentLink = document.querySelector(
			`a[href="#${e.currentTarget.dataset.target}"]`,
		)
		selectedContentLink?.scrollIntoView({
			behavior: 'smooth',
		})
	}

	useEffect(() => {
		const highlightFootnoteOnContentClick = (e) => {
			refRoot.current
				.querySelectorAll('.active')
				.forEach((el) => el.classList.remove('active'))
			const noteItem = document.querySelector(
				`li[id="${(e.currentTarget as HTMLAnchorElement)
					.getAttribute('href')
					.replace('#', '')}"]`,
			)
			if (noteItem) {
				if (timeoutId) {
					clearTimeout(timeoutId)
				}
				noteItem.classList.add('active')
				timeoutId = setTimeout(() => {
					noteItem.classList.remove('active')
				}, 5000)
			}
		}

		footnotes.forEach((_f, index) => {
			const link = document.querySelector(
				`a[href="#${idPrefix + (index + 1)}"]`,
			)
			if (link) {
				link.removeEventListener(
					'click',
					highlightFootnoteOnContentClick,
				)
				link.addEventListener('click', highlightFootnoteOnContentClick)
			}
		})
	}, [footnotes, idPrefix])

	return (
		<ol className="list-decimal" ref={refRoot}>
			{footnotes.map((footnote, index) => {
				return (
					<li
						key={footnote.system.id}
						id={idPrefix + (index + 1)}
						className={clsx(
							'relative group py-2 ml-[1.125rem] mt-0 before:absolute before:inset-0 before:-left-[30px] before:-right-3 before:bg-[rgba(0,0,0,0.04)] before:opacity-0 before:z-0 before:transition before:duration-500 hover:before:opacity-100',
							'scroll-mt-20 [.is-preview_&]:scroll-mt-[6.5rem]',
							'lg:scroll-mt-[calc(var(--global-alert-ace-height)+5rem)] [.is-preview_&]:lg:scroll-mt-[calc(var(--global-alert-ace-height)+6.5rem)]',
						)}
						css={{
							'&.active:before': {
								opacity: '1',
							},
						}}
					>
						<div className="flex items-center gap-8 relative [r">
							<RichText
								className="flex-1"
								richTextElement={footnote.elements.content}
								mappings={mappings}
								linkedItems={pageResponseLinkedItems}
							/>
							<Button
								type="button"
								data-target={idPrefix + (index + 1)}
								aria-label="Show content"
								className="!min-w-0 w-9 h-9 p-0 flex flex-shrink-0 items-center justify-center no-icon"
								onClick={onClick}
							>
								<Icon
									icon="mdi:chevron-up"
									width={16}
									height={16}
									className="text-nsw-primary"
								/>
							</Button>
						</div>
					</li>
				)
			})}
		</ol>
	)
}
