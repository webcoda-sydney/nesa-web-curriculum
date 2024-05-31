import { STAGE_YEARS, YEARS } from '@/constants'
import { useIsScreenDown } from '@/hooks/useIsScreenDown'
import { Syllabus } from '@/kontent/content-types'
import { taxonomies } from '@/kontent/project/taxonomies'
import {
	TaxoResourceType,
	TaxoStage,
	TaxoStageYear,
	TaxoSyllabustype,
} from '@/kontent/taxonomies'
import { filterAssetSelectedStages } from '@/layouts/wp_resources'
import CustomModal from '@/legacy-ported/components/base/CustomModal'
import GeneratingOverlayCommon from '@/legacy-ported/components/document/overlay/GeneratingOverlayCommon'
import DownloadList, {
	DEFAULT_HIDDENS_FOR_DOWNLOAD_LIST,
	DownloadListField,
} from '@/legacy-ported/components/syllabus/DownloadList'
import {
	AssetTaxo,
	TaxoStageWithLifeSkill,
	VideoLinkOrExtLinkOrAssetType,
} from '@/types'
import { byTaxoCodename } from '@/utils'
import {
	getVideoLinkOrExtLinkOrAssetHeadline,
	getVideoLinkOrExtLinkOrAssetResourceTypeTaxoCodenames,
	getVideoLinkOrExtLinkOrAssetStageTaxoCodenames,
	getVideoLinkOrExtLinkOrAssetStageYearTaxoCodenames,
} from '@/utils/assets'
import { downloadCustomResource } from '@/utils/downloadCustomResource'
import { isStage6Syllabus } from '@/utils/syllabus'
import {
	isAssetWithRawElement,
	isWebLinkTeachingadviceExtended,
	isWebLinkVideoOrExtOrTeachingAdviceExtended,
} from '@/utils/type_predicates'
import { ElementModels } from '@kontent-ai/delivery-sdk'
import { GridSelectionModel } from '@mui/x-data-grid'
import { Alert, Button, FormGroupSelect, FormGroupText } from 'nsw-ds-react'
import {
	ChangeEvent,
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from 'react'
import Icon from './Icon'
import { GridCol } from './nsw/grid/GridCol'
import { GridWrapper } from './nsw/grid/GridWrapper'

interface SyllabusTeachingLearningSupportProps {
	className?: string
	files: VideoLinkOrExtLinkOrAssetType[]
	allStages: ElementModels.TaxonomyTerm<TaxoStageWithLifeSkill>[]
	syllabus: Syllabus

	// For download resources
	isPreviewMode?: boolean
	fileSizeLimitInMB?: number
}

interface IResourceTypeOption {
	text: string
	value: TaxoResourceType
}

/***
 * All resource type except web_resource, same as the logic to get the assets
 * in SyllabusView. See variable `teachingSupportAssets`
 */
export const RESOURCE_TYPE_OPTIONS: IResourceTypeOption[] = Object.entries(
	taxonomies.resource_type.terms,
)
	.map(([key, value]) => {
		return {
			text: value.name,
			value: key as IResourceTypeOption['value'],
		}
	})
	.filter(
		(opt) => opt.value !== 'web_resource' && !opt.value.includes('ace_'),
	)

const getFnTaxo =
	(selectedTaxo, key: keyof AssetTaxo) =>
	(file: VideoLinkOrExtLinkOrAssetType) => {
		if (!selectedTaxo) return true

		let taxos: any[] = []
		switch (key) {
			case 'stage':
				taxos = getVideoLinkOrExtLinkOrAssetStageTaxoCodenames(file)
				break
			case 'resource_type':
				taxos =
					getVideoLinkOrExtLinkOrAssetResourceTypeTaxoCodenames(file)
				break
			case 'stage_year':
				taxos = getVideoLinkOrExtLinkOrAssetStageYearTaxoCodenames(file)
				break
		}

		return taxos?.some((taxo) => taxo === selectedTaxo)
	}

const SyllabusTeachingLearningSupport = (
	props: SyllabusTeachingLearningSupportProps,
) => {
	const isScreenDownMd = useIsScreenDown('md')
	const isScreenDownLg = useIsScreenDown('lg')

	const {
		files,
		allStages,
		syllabus,
		isPreviewMode,
		fileSizeLimitInMB = 25,
	} = props
	const [searchText, setSearch] = useState('')
	const [selectedStage, setSelectedStage] = useState<TaxoStage | undefined>()
	const [selectedResourceType, setSelectedResourceType] = useState<
		TaxoResourceType | undefined
	>()
	const [selectedYear, setSelectedYear] = useState<
		TaxoStageYear | undefined
	>()
	const [selectedAssetIds, setSelectedAssetIds] =
		useState<GridSelectionModel>([])
	const [generatingStatus, setGenerating] = useState(false)
	const [errorPopupMessage, setErrorPopupMessage] = useState('')
	const [maxFileReachedState, setMaxFileReachedState] = useState(false)
	const fileAlert = useRef(null)
	const uuid = useId()
	const refAbortController = useRef<AbortController>(null)

	const handleSearchTextChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSearch(e.target.value)
	}

	const filteredItems = useMemo(() => {
		return files
			.filter((item) => {
				if (!searchText) return true

				return (getVideoLinkOrExtLinkOrAssetHeadline(item) || '')
					.toLowerCase()
					.includes(searchText.toLowerCase())
			})
			.filter((item) => {
				if (!selectedStage) return true
				const stages =
					getVideoLinkOrExtLinkOrAssetStageTaxoCodenames(item)

				let syllabusType: TaxoSyllabustype[] = []
				if (isAssetWithRawElement(item)) {
					syllabusType = item.syllabustype.map(byTaxoCodename)
				} else {
					if (isWebLinkTeachingadviceExtended(item)) {
						syllabusType =
							item.elements.syllabus_type__items.value.map(
								byTaxoCodename,
							)
					} else {
						syllabusType =
							item.elements.syllabus_type.value.map(
								byTaxoCodename,
							)
					}
				}

				return filterAssetSelectedStages(
					[selectedStage],
					stages,
					syllabusType,
				)
			})
			.filter(getFnTaxo(selectedResourceType, 'resource_type'))
			.filter(getFnTaxo(selectedYear, 'stage_year'))
	}, [files, searchText, selectedResourceType, selectedStage, selectedYear])

	/**
	 * Computed
	 */
	const selectedFiles = filteredItems.filter((asset) =>
		selectedAssetIds.includes(
			isWebLinkVideoOrExtOrTeachingAdviceExtended(asset)
				? asset.system.id
				: asset.id,
		),
	)
	const totalSizeSelectedFiles = selectedFiles.reduce((acc, file) => {
		acc += isWebLinkVideoOrExtOrTeachingAdviceExtended(file) ? 0 : file.size
		return acc
	}, 0)

	// maxFileReached if more than 1 file selected and total size > fileSizeLimitInMB
	const maxFileReached =
		selectedFiles.length > 1 &&
		totalSizeSelectedFiles > fileSizeLimitInMB * 1024 * 1024

	const isStage6Syl = isStage6Syllabus(syllabus)

	const hiddenFieldsForDownloadList = useMemo<DownloadListField[]>(() => {
		const hiddenOnDownLg: DownloadListField[] = [
			'resourceType',
			'stage',
			'year',
		]
		const _hiddenFields: DownloadListField[] = [
			...DEFAULT_HIDDENS_FOR_DOWNLOAD_LIST,
			isStage6Syl ? 'stage' : 'year',
		]

		if (isScreenDownMd) {
			return [..._hiddenFields, ...hiddenOnDownLg, 'fileSize', 'fileType']
		}
		if (isScreenDownLg) {
			return [..._hiddenFields, ...hiddenOnDownLg]
		}
		return _hiddenFields
	}, [isStage6Syl, isScreenDownMd, isScreenDownLg])

	const stageOptions = useMemo(() => {
		return [
			...allStages,
			{
				name: 'Life Skills',
				codename: 'life_skills@stage_4___stage_5',
			},
		].map((stage) => {
			return {
				text: stage.name,
				value: stage.codename,
			}
		})
	}, [allStages])

	/**
	 * Methods
	 */
	const handleDownloadSelected = async () => {
		refAbortController.current = new AbortController()
		setGenerating(true)
		const [_, errorMessage] = await downloadCustomResource(
			{
				fileIds: selectedAssetIds as string[],
				syllabusName: 'resources',
				stages: selectedStage ? [selectedStage] : [],
				syllabuses:
					syllabus.elements.syllabus.value.map(byTaxoCodename),
				isPreviewMode,
			},
			refAbortController.current.signal,
		)
		if (refAbortController.current?.signal?.aborted) return
		if (errorMessage) {
			setErrorPopupMessage(errorMessage)
		}
		setGenerating(false)
	}
	const handleStageChange = (ev: ChangeEvent<HTMLSelectElement>) => {
		setSelectedStage(ev.target.value as TaxoStage)
	}
	const handleResourceTypeChange = (ev: ChangeEvent<HTMLSelectElement>) => {
		setSelectedResourceType(ev.target.value as TaxoResourceType)
	}
	const handleYearChange = (ev: ChangeEvent<HTMLSelectElement>) => {
		setSelectedYear(ev.target.value as TaxoStageYear)
	}
	const handleCancelGeneratingResource = () => {
		setGenerating(false)
		refAbortController.current.abort()
		refAbortController.current = null
	}

	const handleSelectFiles = useCallback(() => {
		if (maxFileReached && !maxFileReachedState) {
			fileAlert.current.scrollIntoView({ behavior: 'smooth' })
			setMaxFileReachedState(true)
			return
		}
		if (!maxFileReached) {
			setMaxFileReachedState(false)
			return
		}
	}, [maxFileReached, maxFileReachedState])

	useEffect(() => {
		handleSelectFiles()
	}, [handleSelectFiles, maxFileReached])

	return (
		<>
			<GridWrapper
				spacing={{ xs: 4, md: 3 }}
				flexDirection={{ xs: 'column-reverse', lg: 'row' }}
			>
				<GridCol lg="auto">
					<Button
						onClick={handleDownloadSelected}
						disabled={!selectedAssetIds.length || maxFileReached}
						className="w-full lg:w-auto"
					>
						<span className="mr-2">Download selected</span>
						<Icon icon="bxs:download" />
					</Button>
				</GridCol>
				{/* Filters */}
				<GridCol xs="auto" flex={{ xs: '1 1 0%' }}>
					<GridWrapper
						spacing={{ xs: 4, md: 3 }}
						sx={{
							'.nsw-form__helper': {
								display: 'none',
							},
						}}
					>
						<GridCol md={12} lg="auto" flex={{ lg: '1 1 0%' }}>
							<FormGroupText
								className="relative"
								htmlId={'searchtext' + uuid}
								label="Search"
								placeholder="Search"
								value={searchText || ''}
								onChange={handleSearchTextChange}
								hideLabel
								isInputGroupIcon
								autoComplete="off"
							>
								{searchText.length > 0 && (
									<button
										className="absolute mr-20 right-0 top-1/2 -translate-y-1/2 font-bold"
										type="button"
										onClick={() => setSearch('')}
									>
										<span className="sr-only">
											Clear search
										</span>
										<Icon icon="ic:baseline-close" />
									</button>
								)}
								<Button
									type="button"
									className="nsw-button--flex"
									style="white"
								>
									<Icon icon="mdi:search" />
								</Button>
							</FormGroupText>
						</GridCol>
						<GridCol md={6} lg="auto">
							<FormGroupSelect
								htmlId={'resourcetype' + uuid}
								label="Resource type"
								placeholder="Resource type"
								options={RESOURCE_TYPE_OPTIONS}
								hideLabel
								onChange={handleResourceTypeChange}
								autoComplete="off"
							/>
						</GridCol>
						<GridCol md={6} lg={'auto'}>
							{isStage6Syl ? (
								<FormGroupSelect
									htmlId={'year' + uuid}
									label="All years"
									placeholder="All years"
									options={STAGE_YEARS.stage_6.map((year) => {
										const yObj = YEARS.find(
											(y) => y.codename === year,
										)
										return {
											text: yObj.name,
											value: yObj.codename,
										}
									})}
									hideLabel
									onChange={handleYearChange}
									autoComplete="off"
								/>
							) : (
								<FormGroupSelect
									htmlId={'stage' + uuid}
									label="All stages"
									placeholder="All stages"
									options={stageOptions}
									hideLabel
									onChange={handleStageChange}
									autoComplete="off"
								/>
							)}
						</GridCol>
					</GridWrapper>
				</GridCol>
			</GridWrapper>
			{maxFileReached && (
				<>
					<span ref={fileAlert}></span>
					<Alert title="Warning" as="warning">
						<p>Maximum of {fileSizeLimitInMB} MB reached</p>
					</Alert>
				</>
			)}
			<div className="mt-8">
				<DownloadList
					files={filteredItems}
					onSelectedFiles={(ids) => {
						setSelectedAssetIds(ids)
					}}
					hiddenFields={hiddenFieldsForDownloadList}
				/>
			</div>
			<GeneratingOverlayCommon
				modalStatus={generatingStatus}
				handleCancel={handleCancelGeneratingResource}
			/>
			{errorPopupMessage && (
				<CustomModal
					title="Error"
					modalStatus={!!errorPopupMessage}
					handleCancel={() => setErrorPopupMessage('')}
					hideConfirmButton
				>
					<p>{errorPopupMessage}</p>
				</CustomModal>
			)}
		</>
	)
}

export default SyllabusTeachingLearningSupport
