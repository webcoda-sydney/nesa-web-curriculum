import { useKontentHomeConfig } from '@/components/contexts/KontentHomeConfigProvider'
import { TaxoSyllabus } from '@/kontent/taxonomies'
import { TaxoStageWithLifeSkill } from '@/types'
import { downloadCustomResource } from '@/utils/downloadCustomResource'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export interface ISimpleFile {
	id: string
	size: number
}

export const useDownloadSelectedFiles = ({
	maxFileSizeInMB = 25,
	files = [],
	alertEl,
	downloadCustomResourceSyllabusName = '',
	stages = [],
	syllabuses = [],
}: {
	maxFileSizeInMB?: number
	files?: ISimpleFile[]
	alertEl?: HTMLElement
	downloadCustomResourceSyllabusName?: string
	stages?: TaxoStageWithLifeSkill[]
	syllabuses?: TaxoSyllabus[]
}) => {
	const { preview } = useKontentHomeConfig()
	const refAbortController = useRef<AbortController>(null)
	const [selectedAssetIds, setSelectedAssetIds] = useState([])
	const [isDownloading, setIsDownloading] = useState(false)
	const [errorMessageOnDownload, setErrorMessageOnDownload] = useState('')

	// computed
	const maxFileSizeInBytes = maxFileSizeInMB * 1024 * 1024

	const selectedFiles = useMemo(() => {
		return files.filter((file) => selectedAssetIds.includes(file.id))
	}, [files, selectedAssetIds])

	const selectedFileIds = useMemo(() => {
		return selectedFiles.map((file) => file.id)
	}, [selectedFiles])

	const totalSizeOfFiles = useMemo(
		() =>
			selectedFiles.reduce((acc, file) => {
				acc += file.size
				return acc
			}, 0),
		[selectedFiles],
	)

	const maxFileReached = useMemo(() => {
		return selectedFiles.length > 1 && totalSizeOfFiles > maxFileSizeInBytes
	}, [selectedFiles.length, totalSizeOfFiles, maxFileSizeInBytes])

	const scrollToAlertOnMaxFileReached = useCallback(() => {
		if (maxFileReached && alertEl) {
			alertEl.scrollIntoView({ behavior: 'smooth' })
			return
		}
	}, [maxFileReached, alertEl])

	const handleDownloadSelected = async () => {
		refAbortController.current = new AbortController()
		setIsDownloading(true)
		const [_, errorMessage] = await downloadCustomResource(
			{
				fileIds: selectedFileIds,
				syllabusName: downloadCustomResourceSyllabusName,
				isPreviewMode: preview,
				syllabuses,
				stages,
			},
			refAbortController.current.signal,
		)
		if (refAbortController.current?.signal?.aborted) return
		if (errorMessage) {
			setErrorMessageOnDownload(errorMessage)
		}
		setIsDownloading(false)
	}

	const handleCancelDownloadSelected = () => {
		setIsDownloading(false)
		refAbortController.current.abort()
		refAbortController.current = null
	}

	useEffect(() => {
		scrollToAlertOnMaxFileReached()
	}, [scrollToAlertOnMaxFileReached])

	return {
		selectedAssetIds: selectedFileIds,
		maxFileReached,
		maxFileSizeInMB,
		maxFileSizeInBytes,
		totalSizeOfFiles,
		errorMessageOnDownload,
		isDownloading,
		setSelectedAssetIds,
		setErrorMessageOnDownload,
		handleDownloadSelected,
		handleCancelDownloadSelected,
	}
}
