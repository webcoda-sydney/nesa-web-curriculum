import { fetchItemByCodename } from '@/fetchers'
import { Glossary } from '@/kontent/content-types'
import { ILink, Responses } from '@kontent-ai/delivery-sdk'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import useTheme from '@mui/material/styles/useTheme'
import { useQuery } from '@tanstack/react-query'
import {
	Dispatch,
	MouseEvent,
	ReactNode,
	SetStateAction,
	useEffect,
	useState,
} from 'react'
import Icon from '../Icon'
import { Loading } from '../Loading'
import RichText from '../RichText'
import { useKontentHomeConfig } from '../contexts/KontentHomeConfigProvider'
import { LinkPropsExtended } from './RichtextLinkWrapper'

interface RichtextLinkGlossaryProps {
	link: ILink
	children: (_: LinkPropsExtended) => ReactNode
	rootGlossaryPopoverData?: Responses.IViewContentItemResponse<Glossary>
	setGlossaryPopoverParentData?: Dispatch<
		SetStateAction<Responses.IViewContentItemResponse<Glossary>>
	>
}

export const RichtextLinkGlossary = ({
	link,
	rootGlossaryPopoverData,
	setGlossaryPopoverParentData,
}: RichtextLinkGlossaryProps) => {
	const theme = useTheme()
	const { mappings } = useKontentHomeConfig()
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

	const { data, isFetched } = useQuery({
		queryKey: ['RichtextLinkGlossary', link.codename],
		queryFn: () => fetchItemByCodename<Glossary>(link.codename),
		staleTime: Infinity,
	})
	const [glossaryData, setGlossaryData] =
		useState<Responses.IViewContentItemResponse<Glossary>>(data)

	const handleClose = () => {
		setAnchorEl(null)
		if (setGlossaryPopoverParentData && rootGlossaryPopoverData) {
			setGlossaryPopoverParentData(rootGlossaryPopoverData)
		} else {
			setGlossaryData(data)
		}
	}

	const handleClick = (ev: MouseEvent<HTMLElement>) => {
		ev.preventDefault()
		if (setGlossaryPopoverParentData) {
			setGlossaryPopoverParentData(data)
			return
		}
		setAnchorEl(anchorEl ? null : ev.currentTarget)
	}

	useEffect(() => {
		if (isFetched) {
			setGlossaryData(data)
		}
	}, [data, isFetched])

	if (!isFetched || !glossaryData) {
		return <Loading />
	}
	const open = Boolean(anchorEl)
	const id = open ? `popper-${data.item.system.codename}` : undefined

	return (
		<ClickAwayListener onClickAway={handleClose}>
			<span className="relative">
				<button
					type="button"
					className="text-nsw-brand-dark font-bold underline underline-offset-4 decoration-dotted decoration-current cursor-pointer"
					aria-describedby={id}
					onClick={handleClick}
				>
					{!rootGlossaryPopoverData
						? data.item.elements.title.value
						: glossaryData.item.elements.title.value}
				</button>
				<Popper
					id={id}
					open={open}
					anchorEl={anchorEl}
					className="w-screen h-screen z-10 lg:z-auto lg:w-[416px] lg:h-auto"
					popperOptions={{
						modifiers: [
							{
								name: 'offset',
								options: {
									offset: [0, 14],
								},
							},
						],
					}}
					sx={{
						[theme.breakpoints.down('lg')]: {
							top: '0 !important',
							transform: 'none !important',
							position: 'fixed !important',
						},
						'&[data-popper-placement=top]': {
							zIndex: 10,
						},
					}}
				>
					<Paper
						elevation={8}
						className="p-8 w-full h-full"
						sx={{
							[theme.breakpoints.down('lg')]: {
								borderRadius: 0,
							},
						}}
					>
						<div className="flex gap-2 items-center mb-4">
							<div className="h4 text-nsw-dark bold flex-1">
								{glossaryData.item.elements.title.value}
							</div>
							<button
								className="text-nsw-brand-dark"
								type="button"
								aria-label="Close popup"
								onClick={handleClose}
							>
								<Icon icon="ic:baseline-close" />
							</button>
						</div>
						<RichText
							linkedItems={glossaryData.linkedItems}
							mappings={mappings}
							richTextElement={
								glossaryData.item.elements.description
							}
							rootGlossaryPopoverData={
								rootGlossaryPopoverData || glossaryData
							}
							setGlossaryPopoverParentData={setGlossaryData}
						/>
					</Paper>
				</Popper>
			</span>
		</ClickAwayListener>
	)
}
