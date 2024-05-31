import Icon from '@/components/Icon'
import { useKontentHomeConfig } from '@/components/contexts/KontentHomeConfigProvider'
import Checkbox from '@/components/nsw/Checkbox'
import Pagination from '@/components/nsw/Pagination'
import { Tooltip } from '@/components/tooltip/Tooltip'
import { CommonCopyUrlWrapper } from '@/components/ui/copy-to-clipboard/CommonCopyUrlWrapper'
import {
	UiVideoTile,
	Weblinkext,
	Weblinkint,
	Weblinkvideo,
} from '@/kontent/content-types'
import { UrlLink } from '@/legacy-ported/utilities/frontendTypes'
import { stringCompare } from '@/legacy-ported/utilities/functions'
import type {
	AssetWithRawElements,
	FileTypeClassification,
	IPropWithClassName,
	Mapping,
} from '@/types'
import { WebLinkTeachingadviceExtended } from '@/types/customKontentTypes'
import {
	getFileTypeClassification,
	getFilesizeFormatter,
	getTagFromYears,
	getUrlFromMapping,
} from '@/utils'
import {
	getVideoLinkOrExtLinkOrAssetLastModified,
	getVideoLinkOrExtLinkOrAssetStageTags,
} from '@/utils/assets'
import {
	isAssetWithRawElement,
	isUiVideoTile,
	isWebLinkTeachingadviceExtended,
	isWebLinkVideo,
	isWebLinkVideoOrExtOrTeachingAdviceExtended,
	isWebLinkext,
	isWebLinkint,
} from '@/utils/type_predicates'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles/createTheme'
import { SxProps } from '@mui/system/styleFunctionSx/styleFunctionSx'
import {
	DataGrid,
	DataGridProps,
	GridColDef,
	GridColumnVisibilityModel,
	GridRenderCellParams,
	GridRowParams,
	GridSelectionModel,
	GridSortItem,
	GridSortModel,
	gridPageCountSelector,
	gridPageSelector,
	useGridApiContext,
	useGridSelector,
} from '@mui/x-data-grid'
import clsx from 'clsx'
import format from 'date-fns/format'
import JsFileDownloader from 'js-file-downloader'
import { Button } from 'nsw-ds-react'
import {
	Fragment,
	MouseEvent,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react'
import VideoModal, { useVideoModal } from '../base/VideoModal'

const fileSize = getFilesizeFormatter()

export type DownloadListField =
	| 'fileName'
	| 'syllabus'
	| 'fileType'
	| 'stage'
	| 'fileSize'
	| 'resourceType'
	| 'year'
	| 'download'
	| 'date'
	| 'info'

export type TDownloadListFile =
	| AssetWithRawElements
	| UiVideoTile
	| Weblinkext
	| Weblinkvideo
	| Weblinkint
	| WebLinkTeachingadviceExtended

// Set onPageChange when `page` is set
export interface DownloadListProps
	extends IPropWithClassName,
		Omit<DataGridProps, 'rows' | 'columns'> {
	page?: number
	pageSize?: number

	/**
	 * List of files
	 */
	files: TDownloadListFile[]

	onSelectedFiles?: (_selectionModel: GridSelectionModel) => void

	hideCheckbox?: boolean

	hiddenFields?: DownloadListField[]

	showSelectAllCheckbox?: boolean

	isIncludeCopyUrlOnTitle?: boolean

	columnSettings?: Partial<Record<DownloadListField, Partial<GridColDef>>>

	showNextToTitleTooltip?: boolean

	showFileSizeUnderTitle?: boolean

	initialSortModel?: (GridSortItem & {
		field: DownloadListField
	})[]
}

const renderAsSmall = (params) => <small>{params.value}</small>

export const handleResourceDownload = (e: MouseEvent<HTMLAnchorElement>) => {
	e.preventDefault()
	new JsFileDownloader({
		url: e.currentTarget.href,
		autoStart: true,
		forceDesktopMode: true,
	})
}

const stylesGrid: SxProps<Theme> = {
	'&': {
		border: 0,
	},
	'* + p': {
		marginTop: 0,
	},
	'.MuiDataGrid-columnHeaders': {
		borderBottom: '2px solid var(--nsw-grey-01)',
	},
	'.MuiDataGrid-cell': {
		whiteSpace: 'normal !important',
		wordWrap: 'break-word !important',
		'&:focus': {
			outline: 'none',
		},
	},
	'.MuiDataGrid-columnHeaderTitle': {
		fontWeight: 'bold',
	},
	'.MuiDataGrid-columnSeparator': {
		display: 'none',
	},
	'.Mui-disabled': {
		'&.MuiCheckbox-root': {
			pointerEvents: 'none',
			cursor: 'not-allowed',

			'svg rect': {
				fill: '#F2F2F2',
				stroke: '#CDD3D6',
				'&:nth-child(2)': {
					stroke: '#F2F2F2',
				},
			},
			'svg path': {
				display: 'none',
			},
		},
	},
	'.MuiDataGrid-iconButtonContainer.mui-style-ltf0zy-MuiDataGrid-iconButtonContainer':
		{
			width: '20px !important',
		},

	'.MuiDataGrid-cell--withRenderer.MuiDataGrid-cell.MuiDataGrid-cell--textLeft:focus-within':
		{
			outline: 'none !important',
		},
	'.MuiDataGrid-row': {
		borderBottom: '1px solid var(--nsw-grey-01)',
	},
	'.MuiDataGrid-selectedRowCount': {
		display: 'none',
	},
	'.MuiDataGrid-footerContainer': {
		justifyContent: 'center',
		marginTop: '2rem',
		borderTop: '0',
	},
	'.MuiDataGrid-columnHeader:focus, .MuiDataGrid-cell:focus,.MuiDataGrid-columnHeader.MuiDataGrid-columnHeaderCheckbox:focus, .MuiDataGrid-columnHeader.MuiDataGrid-columnHeaderCheckbox:focus-within, .MuiDataGrid-columnHeader[data-field=download]:focus, .MuiDataGrid-columnHeader[data-field=info]:focus':
		{
			outline: 'none',
		},
	'.MuiDataGrid-columnHeader:focus-within, .MuiDataGrid-cell:focus-within': {
		outline: 'solid 3px var(--nsw-focus)',
		outlineOffset: '-4px',
	},
}

const getFilenameFromFileObj = (file: TDownloadListFile) => {
	if (isAssetWithRawElement(file))
		return (file.title || file.fileName || '').trim()
	return (file.elements.title.value || '').trim()
}

const getUrlFromFileObj = (file: TDownloadListFile, mappings: Mapping[]) => {
	if (isAssetWithRawElement(file)) return file.url
	if (isWebLinkext(file)) return file.elements.link_url.value
	if (isWebLinkint(file))
		return getUrlFromMapping(mappings, file.system.codename)
	if (isWebLinkTeachingadviceExtended(file)) {
		return file.link
	}

	return file.elements.video_url.value
}

const getUrlLinkFromFileObj = (
	file: TDownloadListFile,
	mappings: Mapping[],
): UrlLink => {
	const title = getFilenameFromFileObj(file)
	const url = getUrlFromFileObj(file, mappings)

	return {
		title,
		url,
	}
}

const getFileTypeFromFileObj = (file: TDownloadListFile) => {
	if (isWebLinkext(file) || isWebLinkint(file)) {
		return 'Online resource'
	}
	if (isUiVideoTile(file) || isWebLinkVideo(file)) {
		return 'Video'
	}
	if (isWebLinkTeachingadviceExtended(file)) {
		return 'Teaching advice'
	}
	return getFileTypeClassification(file.type)
}

const FILE_TYPES_DISABLE_SELECTION: (
	| FileTypeClassification
	| 'Online resource'
	| 'Teaching advice'
)[] = ['Online resource', 'Video', 'Teaching advice']

const DEFAULT_SORTING_ORDER = ['asc', 'desc']

export const DEFAULT_HIDDENS_FOR_DOWNLOAD_LIST: DownloadListField[] = [
	'syllabus',
	'date',
	'info',
]

const INITIAL_SORT_MODEL: DownloadListProps['initialSortModel'] = [
	{
		field: 'fileName',
		sort: 'asc',
	},
]

const sortComparatorByFilename = (
	a: TDownloadListFile,
	b: TDownloadListFile,
) => {
	return stringCompare(getFilenameFromFileObj(a), getFilenameFromFileObj(b))
}

const getSizeFromFile = (item: TDownloadListFile) => {
	if (isAssetWithRawElement(item)) {
		return item.size || ''
	}

	return ''
}

const getResourceTypeFromFile = (item: TDownloadListFile) => {
	if (isAssetWithRawElement(item)) {
		return item.resource_type?.map((rt) => rt.name).join(', ')
	}

	if (isWebLinkVideo(item) || isWebLinkext(item)) {
		return item.elements.resource_type.value
			?.map((rt) => rt.name)
			.join(', ')
	}

	return ''
}

const getStageFromFile = (item: TDownloadListFile) => {
	if (isAssetWithRawElement(item)) {
		return item.stage?.length > 1
			? 'Multiple'
			: item.stage?.map((item) => item.name)?.[0] || ''
	}

	if (isWebLinkVideoOrExtOrTeachingAdviceExtended(item)) {
		const stages = getVideoLinkOrExtLinkOrAssetStageTags(item)
		return stages?.length > 1 ? 'Multiple' : stages?.[0]?.text || ''
	}

	return ''
}

const getSyllabusFromFile = (item: TDownloadListFile): string => {
	if (isAssetWithRawElement(item)) {
		const syllabus = item.syllabus
		const isMultipleSyllabus = syllabus.length > 1
		if (isMultipleSyllabus) return 'Multiple'
		return item.syllabus?.[0]?.name || ''
	}

	if (isWebLinkVideoOrExtOrTeachingAdviceExtended(item)) {
		const syllabus = item.elements.syllabus.value.map((item) => item.name)
		const isMultipleSyllabus = syllabus.length > 1
		if (isMultipleSyllabus) return 'Multiple'
		return syllabus[0]
	}

	return ''
}

function CustomPagination() {
	const apiRef = useGridApiContext()
	const page = useGridSelector(apiRef, gridPageSelector)
	const pageCount = useGridSelector(apiRef, gridPageCountSelector)

	// if pageCount is 1, don't show pagination
	if (pageCount === 1) return null

	return (
		<Pagination
			count={pageCount}
			page={page + 1}
			onChange={(_ev, value) => apiRef.current.setPage(value - 1)}
		/>
	)
}

/**
 * A list of files to download
 * @param props
 * @constructor
 */
export const DownloadList = (props: DownloadListProps): JSX.Element => {
	const { mappings } = useKontentHomeConfig()
	const {
		page,
		pageSize = 100,
		className,
		files,
		onSelectedFiles,
		hideCheckbox = false,
		hiddenFields = DEFAULT_HIDDENS_FOR_DOWNLOAD_LIST,
		showSelectAllCheckbox = false,
		isIncludeCopyUrlOnTitle = false,
		onPageChange,
		columnSettings,
		showNextToTitleTooltip = false,
		showFileSizeUnderTitle = false,
		initialSortModel = INITIAL_SORT_MODEL,
		...dataGridProps
	} = props

	const [sortModel, setSortModel] = useState<GridSortModel>(initialSortModel)

	const isFilesIncludeWebLinkExternalOrInternal = files.some(
		(file) => isWebLinkext(file) || isWebLinkint(file),
	)

	// video modal
	const {
		currentVideoIframeUrl,
		openVideoModal,
		currentVideoLabel,
		openVideo,
		hideVideo,
	} = useVideoModal()

	const rows = files.map((item: TDownloadListFile) => {
		if (isAssetWithRawElement(item)) {
			return {
				id: item.id,
				fileName: item,
				syllabus: getSyllabusFromFile(item),
				fileType: getFileTypeFromFileObj(item),
				fileSize: getSizeFromFile(item),
				stage: getStageFromFile(item),
				resourceType: getResourceTypeFromFile(item),
				year: getTagFromYears(item.stage_year),
				date: getVideoLinkOrExtLinkOrAssetLastModified(item),
				info: item,
				download: item,
			}
		}

		if (isWebLinkVideoOrExtOrTeachingAdviceExtended(item)) {
			return {
				id: item.system.id,
				fileName: item,
				syllabus: getSyllabusFromFile(item),
				fileType: getFileTypeFromFileObj(item),
				fileSize: getSizeFromFile(item),
				stage: getStageFromFile(item),
				resourceType: getResourceTypeFromFile(item),
				year: getTagFromYears(item.elements.stages__stage_years.value),
				date: getVideoLinkOrExtLinkOrAssetLastModified(item),
				info: item,
				download: item,
			}
		}

		return {
			id: item.system.id,
			fileName: item,
			syllabus: getSyllabusFromFile(item),
			fileType: getFileTypeFromFileObj(item),
			fileSize: getSizeFromFile(item),
			stage: getStageFromFile(item),
			resourceType: getResourceTypeFromFile(item),
			year: '',
			date: item.system.lastModified,
			info: item,
			download: item,
		}
	})
	// .sort((a, b) => sortComparatorByFilename(a.fileName, b.fileName))

	const getRowHeight = useCallback(() => 'auto', [])
	const filesLessThenPageSize =
		(dataGridProps.rowCount ?? files.length) <= pageSize

	const handleVideoClick = useCallback(
		(ev: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
			ev.preventDefault()
			const { videourl, videolabel } = ev.currentTarget.dataset
			openVideo(videourl, videolabel)
		},
		[openVideo],
	)

	const handleSelectionModelChange = (selectionModel: GridSelectionModel) => {
		if (onSelectedFiles) {
			onSelectedFiles(selectionModel)
		}
	}

	const columns = useMemo(
		() =>
			[
				{
					field: 'fileName',
					headerName: 'Item',
					flex: 1,
					sortComparator: sortComparatorByFilename,
					renderCell: (
						params: GridRenderCellParams<AssetWithRawElements>,
					) => {
						const _file: TDownloadListFile = params.value
						const { title, url } = getUrlLinkFromFileObj(
							params.value,
							mappings,
						)
						const isFileAsset = isAssetWithRawElement(_file)
						const isFileExternalLink = isWebLinkext(_file)
						const isWeblinkTAExtended =
							isWebLinkTeachingadviceExtended(_file)
						const isFileVideo = isWebLinkVideo(_file)

						let onClick = undefined
						if (isFileVideo) onClick = handleVideoClick
						if (isFileAsset) onClick = handleResourceDownload
						const _fileSize = getSizeFromFile(_file)
						const fileSizeStr = _fileSize ? fileSize(_fileSize) : ''

						let excludeOrigin: boolean | undefined =
							isIncludeCopyUrlOnTitle || undefined
						if (isWeblinkTAExtended && isIncludeCopyUrlOnTitle) {
							excludeOrigin = false
						}
						const CompWrapper = isIncludeCopyUrlOnTitle
							? CommonCopyUrlWrapper
							: Fragment

						return (
							<div className="flex items-center justify-between gap-2 w-full py-2.5">
								<span>
									<CompWrapper
										url={
											isIncludeCopyUrlOnTitle
												? url
												: undefined
										}
										excludeOrigin={excludeOrigin}
									>
										<span>
											{/* eslint-disable-next-line react/jsx-no-target-blank */}
											<a
												href={url}
												className="no-underline download-list__link no-icon"
												download={
													isFileAsset
														? true
														: undefined
												}
												onClick={onClick}
												target={
													isFileExternalLink
														? '_blank'
														: undefined
												}
												rel={`noopener noreferrer ${
													isFileAsset
														? 'noindex nofollow'
														: ''
												}`.trim()}
												data-videourl={
													isFileVideo
														? url
														: undefined
												}
												data-videolabel={
													isFileVideo
														? title
														: undefined
												}
											>
												{title}
											</a>
										</span>
									</CompWrapper>

									{showFileSizeUnderTitle && fileSizeStr && (
										<div>
											<small>{fileSizeStr}</small>
										</div>
									)}
								</span>
							</div>
						)
					},
					hideable: false,
					disableColumnMenu: true,
					sortingOrder: DEFAULT_SORTING_ORDER,
				} as GridColDef<any, TDownloadListFile>,

				{
					field: 'fileType',
					headerName: 'File type',
					width: isFilesIncludeWebLinkExternalOrInternal ? 150 : 120,
					align: 'left',
					headerAlign: 'left',
					renderCell: renderAsSmall,
					hideable: false,
					disableColumnMenu: true,
					sortingOrder: DEFAULT_SORTING_ORDER,
				} as GridColDef,
				{
					field: 'fileSize',
					headerName: 'File size',
					width: 120,
					align: 'left',
					headerAlign: 'left',
					renderCell: (params) => {
						if (!params?.value) return '-'
						return <small>{fileSize(params.value)}</small>
					},
					hideable: false,
					disableColumnMenu: true,
					sortingOrder: DEFAULT_SORTING_ORDER,
				} as GridColDef,
				{
					field: 'date',
					headerName: 'Updated',
					width: 120,
					align: 'left',
					headerAlign: 'left',
					renderCell: (params) => {
						if (!params?.value) return '-'
						return (
							<small>
								{format(new Date(params.value), 'MMM yyyy')}
							</small>
						)
					},
					hideable: false,
					disableColumnMenu: true,
					sortingOrder: DEFAULT_SORTING_ORDER,
				} as GridColDef,
				{
					field: 'resourceType',
					headerName: 'Resource Type',
					width: 176,
					align: 'left',
					headerAlign: 'left',
					sortable: true,
					renderCell: renderAsSmall,
					hideable: false,
					disableColumnMenu: true,
				} as GridColDef,
				{
					field: 'stage',
					headerName: 'Stage',
					width: 106,
					align: 'left',
					headerAlign: 'left',
					sortable: true,
					renderCell: renderAsSmall,
					hideable: false,
					disableColumnMenu: true,
				} as GridColDef,
				{
					field: 'year',
					headerName: 'Year',
					width: 106,
					align: 'left',
					headerAlign: 'left',
					sortable: false,
					renderCell: renderAsSmall,
					hideable: false,
					disableColumnMenu: true,
				} as GridColDef,
				{
					field: 'syllabus',
					headerName: 'Syllabus',
					width: 185,
					align: 'left',
					headerAlign: 'left',
					renderCell: renderAsSmall,
					hideable: false,
					disableColumnMenu: true,
					sortingOrder: DEFAULT_SORTING_ORDER,
				} as GridColDef,
				{
					field: 'info',
					headerName: '',
					width: 24,
					sortable: false,
					renderCell: (
						params: GridRenderCellParams<AssetWithRawElements>,
					) => {
						const _file: TDownloadListFile = params.value
						const syllabus = getSyllabusFromFile(_file)
						const resourceType = getResourceTypeFromFile(_file)
						const stage = getStageFromFile(_file)
						const date =
							getVideoLinkOrExtLinkOrAssetLastModified(_file)
						const dateStr = date
							? format(new Date(date), 'MMM yyyy')
							: '-'

						return (
							showNextToTitleTooltip && (
								<Tooltip
									iconSizeInTooltip={20}
									iconSizeInButton={24}
									text={
										<div className="font-normal grid gap-1">
											{dateStr && (
												<div>
													<strong>Updated:</strong>{' '}
													{dateStr}
												</div>
											)}
											{resourceType && (
												<div>
													<strong>
														Resource type:
													</strong>{' '}
													{getResourceTypeFromFile(
														_file,
													)}
												</div>
											)}
											{stage && (
												<div>
													<strong>Stage:</strong>{' '}
													{getStageFromFile(_file)}
												</div>
											)}
											{syllabus && (
												<div>
													<strong>Syllabus:</strong>{' '}
													{syllabus}
												</div>
											)}
										</div>
									}
									disableTouchListener
								/>
							)
						)
					},
					hideable: false,
					disableColumnMenu: true,
					sortingOrder: DEFAULT_SORTING_ORDER,
				} as GridColDef<any, TDownloadListFile>,
				{
					field: 'download',
					headerName: '',
					width: 56,
					align: 'left',
					headerAlign: 'left',
					sortable: false,
					renderCell: (params) => {
						const _file: TDownloadListFile = params.value
						const { url, title } = getUrlLinkFromFileObj(
							_file,
							mappings,
						)
						const isFileAsset = isAssetWithRawElement(_file)
						const isFileExternalLink = isWebLinkext(_file)
						const isFileInternalLink = isWebLinkint(_file)
						const isWeblinkTAExtended =
							isWebLinkTeachingadviceExtended(_file)

						if (
							isFileAsset ||
							isFileExternalLink ||
							isFileInternalLink
						) {
							return (
								<Button
									linkComponent="a"
									link={url}
									onClick={
										isFileAsset
											? handleResourceDownload
											: undefined
									}
									target={
										isFileExternalLink
											? '_blank'
											: undefined
									}
									className="!min-w-0 w-9 h-9 p-0 flex items-center justify-center no-icon"
									aria-label={
										isFileAsset ? 'Download' : 'Open link'
									}
									rel={`noopener noreferrer ${
										isFileAsset ? 'noindex nofollow' : ''
									}`.trim()}
								>
									{isFileAsset ? (
										<Icon
											icon={'mdi:download'}
											width={20}
											height={20}
										/>
									) : (
										<Icon
											icon={'mdi:external-link'}
											width={20}
											height={20}
										></Icon>
									)}
								</Button>
							)
						}
						if (isWeblinkTAExtended) {
							return (
								<Button
									linkComponent="a"
									link={url}
									className="!min-w-0 w-9 h-9 p-0 flex items-center justify-center no-icon"
								>
									<Icon
										icon={'mdi:arrow-right'}
										width={20}
										height={20}
									/>
								</Button>
							)
						}
						return (
							<Button
								onClick={handleVideoClick}
								className="!min-w-0 w-9 h-9 p-0 flex items-center justify-center no-icon"
								aria-label="Show Video"
								data-videourl={url}
								data-videolabel={title}
							>
								<Icon
									icon={'mdi:arrow-right'}
									width={20}
									height={20}
								/>
							</Button>
						)
					},
					hideable: false,
					disableColumnMenu: true,
				} as GridColDef,
			].map((column) => {
				if (columnSettings?.[column.field as DownloadListField]) {
					return {
						...column,
						...columnSettings[column.field as DownloadListField],
					}
				}
				return column
			}),
		[
			columnSettings,
			handleVideoClick,
			isFilesIncludeWebLinkExternalOrInternal,
			isIncludeCopyUrlOnTitle,
			mappings,
			showFileSizeUnderTitle,
			showNextToTitleTooltip,
		],
	)

	const columnVisibilityModel = useMemo(() => {
		const _columnVisibilityModel: GridColumnVisibilityModel =
			columns.reduce((acc, column) => {
				return {
					...acc,
					[column.field]: !hiddenFields.includes(
						column.field as DownloadListField,
					),
				}
			}, {})
		return _columnVisibilityModel

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hiddenFields.join(',')])

	const [pageNumber, setPage] = useState(page)
	useEffect(() => {
		if (pageNumber !== undefined) {
			setPage(page)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page])

	return (
		<>
			<div className={clsx('w-full h-auto overflow-auto', className)}>
				<DataGrid
					{...dataGridProps}
					className="leading-normal"
					page={pageNumber}
					pageSize={pageSize}
					rowsPerPageOptions={[pageSize]}
					sortModel={sortModel}
					columns={columns}
					rows={rows}
					checkboxSelection={!hideCheckbox}
					autoHeight
					disableColumnFilter
					components={{
						BaseCheckbox: Checkbox,
						NoRowsOverlay: () => {
							return (
								<Stack
									height="100%"
									alignItems="center"
									justifyContent="center"
								>
									No results found.
								</Stack>
							)
						},
						Pagination: CustomPagination,
					}}
					getRowHeight={getRowHeight}
					hideFooter={
						dataGridProps.hideFooter ?? filesLessThenPageSize
					}
					hideFooterPagination={
						dataGridProps.hideFooterPagination ??
						filesLessThenPageSize
					}
					sx={[
						stylesGrid,
						{
							'.MuiDataGrid-columnHeaderCheckbox > *': {
								display: showSelectAllCheckbox
									? undefined
									: 'none',
							},
						},
					]}
					onSelectionModelChange={handleSelectionModelChange}
					onSortModelChange={setSortModel}
					disableSelectionOnClick
					isRowSelectable={(params: GridRowParams<any>) => {
						return isAssetWithRawElement(params.row.fileName)
					}}
					onPageChange={onPageChange}
					columnVisibilityModel={columnVisibilityModel}
					pagination
				></DataGrid>
			</div>
			{openVideoModal && currentVideoIframeUrl && (
				<VideoModal
					ariaLabel={currentVideoLabel}
					modalStatus={openVideoModal}
					onCancel={hideVideo}
					video={currentVideoIframeUrl}
				/>
			)}
		</>
	)
}

export default DownloadList
