import NonFullWidthWrapper from '@/components/NonFullWidthWrapper'
import UnknownComponent from '@/components/UnknownComponent'
import { useKontentHomeConfig } from '@/components/contexts/KontentHomeConfigProvider'
import { ReleaseNoteAccordionBody } from '@/components/release-notes/ReleaseNoteAccordion'
import { CommonCopyUrlWrapper } from '@/components/ui/copy-to-clipboard/CommonCopyUrlWrapper'
import { WpReleaseNoteResponseData } from '@/databuilders/releasenote'
import { CombinedReleaseNote } from '@/databuilders/wp_dc_recentchanges'
import { useCleanPathDefault } from '@/hooks/useCleanPathDefault'
import { CommonPageProps } from '@/types'
import { getReleaseNoteTitle } from '@/utils/ace/getReleaseNoteTitle'
import {
	isReleasenoteAceKla,
	isReleasenoteAceSyllabus,
} from '@/utils/type_predicates'
import { css } from '@emotion/css'
import clsx from 'clsx'
import format from 'date-fns/format'
import { scrollMarginIfTheresGlobalAlert } from './web_page'
import { GlobalAlertAce } from './wp_ace_landing'
import { useSyllabusTaxoUrls } from './wp_dc_recentchanges'

export default function ReleasenoteGeneralPage(
	props: CommonPageProps<CombinedReleaseNote, WpReleaseNoteResponseData>,
) {
	const currentUrl = useCleanPathDefault()
	const { mappings } = useKontentHomeConfig()
	const { pageResponse, config, syllabuses } = props.data

	const page = pageResponse.item
	const syllabusTaxoSyllabusUrls = useSyllabusTaxoUrls(mappings, syllabuses)

	const hasAceGlobalAlert =
		/^ace_/gi.test(page.system.codename) &&
		config.item.elements.global_alert_ace.value.length > 0 &&
		(isReleasenoteAceKla(page) || isReleasenoteAceSyllabus(page))

	const releaseDate = new Date(page.elements.releasedate.value)

	if (!page) {
		return (
			<UnknownComponent>
				Page {page.system.codename} does not have any content!
			</UnknownComponent>
		)
	}

	return (
		<>
			{
				// if the page codename starts with ace_, show global alert ace
				hasAceGlobalAlert && (
					<GlobalAlertAce config={config} mappings={mappings} />
				)
			}
			<div key={page.system.id} className="nsw-container lg:px-4 pt-8">
				<time
					dateTime={page.elements.releasedate.value}
					className="nsw-small"
				>
					{format(releaseDate, 'dd MMM yyyy')}
				</time>
				<CommonCopyUrlWrapper url={currentUrl} className="mb-8">
					<h1
						data-kontent-item-id={page.system.id}
						data-kontent-element-codename="title"
					>
						{page.elements.title.value ||
							getReleaseNoteTitle(page, pageResponse.linkedItems)}
					</h1>
				</CommonCopyUrlWrapper>

				<NonFullWidthWrapper>
					<div className="space-y-8">
						<ReleaseNoteAccordionBody
							linkedItems={pageResponse.linkedItems}
							mappings={props.mappings}
							releaseNote={page}
							syllabusTaxoSyllabusUrls={syllabusTaxoSyllabusUrls}
							richtextClassName={clsx(
								'w-full cms-content-formatting',
								css(
									hasAceGlobalAlert &&
										scrollMarginIfTheresGlobalAlert(
											props.preview,
										),
									{
										'.module:first-child': {
											marginTop: '-2rem',
										},
									},
								),
							)}
						/>
					</div>
				</NonFullWidthWrapper>
			</div>
		</>
	)
}
