import Icon from '@/components/Icon'
import { RadioBox } from '@/components/nsw/Checkbox'
import { GridCol } from '@/components/nsw/grid/GridCol'
import { Syllabus } from '@/kontent/content-types'
import { TaxoLanguage } from '@/kontent/taxonomies'
import { sleep } from '@/utils'
import { ElementModels } from '@kontent-ai/delivery-sdk'
import FormControlLabel, {
	FormControlLabelProps,
} from '@mui/material/FormControlLabel'
import { Alert, Button } from 'nsw-ds-react'
import {
	MouseEvent,
	ReactNode,
	useCallback,
	useEffect,
	useId,
	useState,
} from 'react'
import { useImmer } from 'use-immer'
import CustomModal, { CustomModalProps } from '../base/CustomModal'
import SearchBar from '../base/SearchBar'

export type LanguagePickerProps = Omit<
	CustomModalProps,
	'children' | 'handleConfirm' | 'title' | 'showChangeLogButton'
> & {
	languages: ElementModels.TaxonomyTerm<TaxoLanguage>[]
	syllabuses: Syllabus[]
	initialSelectedLanguages?: Record<string, TaxoLanguage[]>
	children?: ReactNode
	onChange?: (
		_languages: Record<string, TaxoLanguage[]>,
		_target: HTMLInputElement,
	) => void
	handleConfirm?: (_languages: Record<string, TaxoLanguage[]>) => void
	resetSelectedLanguagesOnClose?: boolean
	title?: string
	slotBeforeSearch?: ReactNode
	showClearFilterButton?: boolean
	isValidationNotRequired?: boolean
}

export const LanguagePicker = ({
	languages,
	syllabuses,
	children,
	onChange,
	initialSelectedLanguages = {},
	handleConfirm: _handleConfirm,
	resetSelectedLanguagesOnClose = true,
	confirmButtonText = 'Done',
	title,
	slotBeforeSearch,
	showClearFilterButton = false,
	isValidationNotRequired = false,
	...customModalProps
}: LanguagePickerProps) => {
	const uuid = useId()
	const [step, setStep] = useState(0)
	const [showError, setShowError] = useState(false)
	const [selectedLanguages, setSelectedLanguages] = useImmer<
		Record<string, TaxoLanguage[]>
	>(initialSelectedLanguages)
	const [searchText, setSearchText] = useState('')

	const stepSyllabus = syllabuses[step]
	const stepSyllabusTaxoSyllabusCodename =
		stepSyllabus?.elements.syllabus?.value[0].codename || ''
	const notLastStep = step !== syllabuses.length - 1

	const filteredLanguages = stepSyllabus?.elements.languages.value.filter(
		(lang) => {
			if (searchText) {
				return lang.name
					.toLowerCase()
					.includes(searchText.toLowerCase())
			}
			return true
		},
	)

	const handleChange: FormControlLabelProps['onChange'] = (ev, checked) => {
		const { id: _id } = ev.target as HTMLInputElement
		const id = _id.split('@@')[1]
		if (checked) {
			setShowError(false)
			setSelectedLanguages((draft) => {
				draft[stepSyllabusTaxoSyllabusCodename] = [id] as TaxoLanguage[]
			})
		} else {
			setSelectedLanguages((draft) => {
				const filteredNonSelected = draft[
					stepSyllabusTaxoSyllabusCodename
				].filter((lang) => lang !== id)

				draft[stepSyllabusTaxoSyllabusCodename] = filteredNonSelected
			})
		}
		if (onChange) {
			onChange(selectedLanguages, ev.currentTarget as HTMLInputElement)
		}
	}

	const validate = () => {
		if (isValidationNotRequired) return true

		const anySelected =
			selectedLanguages?.[stepSyllabusTaxoSyllabusCodename]?.length
		if (!anySelected) {
			setShowError(true)
			return false
		}
		return true
	}

	const reset = useCallback(() => {
		setStep(0)
		setShowError(false)
		setSearchText('')
		if (resetSelectedLanguagesOnClose) {
			setSelectedLanguages({})
		}
	}, [setSelectedLanguages, resetSelectedLanguagesOnClose])

	const handleConfirm = async () => {
		const isValid = validate()
		if (!isValid) {
			return
		}
		_handleConfirm(selectedLanguages)
		await sleep(500)
		reset()
	}

	const handleBack = () => {
		setStep((prev) => prev - 1)
	}
	const handleNext = () => {
		const isValid = validate()
		if (!isValid) {
			return
		}
		setStep((prev) => prev + 1)
		setShowError(false)
	}
	const handleCancel = async (_event: MouseEvent<HTMLButtonElement>) => {
		if (customModalProps.handleCancel) {
			customModalProps.handleCancel(_event)
		}
		await sleep(500)
		setSelectedLanguages(initialSelectedLanguages)
		reset()
	}

	useEffect(() => {
		setSelectedLanguages(initialSelectedLanguages)
	}, [initialSelectedLanguages, setSelectedLanguages])

	useEffect(() => {
		// when unmounted
		return () => {
			reset()
		}
	}, [reset])

	// Reset search text when step changes
	useEffect(() => {
		setSearchText('')
	}, [step])

	return (
		<CustomModal
			{...customModalProps}
			css={{
				'.CustomModal__title': {
					display: 'flex',
					width: '100%',
					alignItems: 'center',
					gap: '1.5rem',

					'&>:first-child': {
						flex: 1,
					},
				},
				'.MuiDialog-paper': {
					maxWidth: '37.5rem',
					height: 'min(46.875rem, 100vh)',
				},
				// change the order of the back button
				'.MuiDialogActions-root .MuiGrid-container .MuiGrid-item:nth-child(2)':
					{
						order:
							syllabuses.length > 1 && !notLastStep
								? 1
								: undefined,
					},
			}}
			handleCancel={handleCancel}
			title={title || syllabuses[step]?.elements.title.value}
			handleConfirm={handleConfirm}
			hideConfirmButton={notLastStep}
			confirmButtonText={confirmButtonText}
			slotBeforeActions={
				showClearFilterButton && (
					<GridCol xs="auto" className="mr-auto self-center">
						<button
							type="reset"
							className="underline bold nsw-text--brand-dark"
							onClick={() => {
								reset()
								setSelectedLanguages({})
							}}
						>
							Clear all filters
						</button>
					</GridCol>
				)
			}
			slotActions={
				syllabuses.length > 1 && (
					<GridCol xs="auto">
						<Button
							style="dark"
							onClick={notLastStep ? handleNext : handleBack}
						>
							{notLastStep ? 'Next' : 'Back'}
						</Button>
					</GridCol>
				)
			}
			slotAfterTitle={
				<>
					{syllabuses.length > 1 && (
						<div
							className="bold"
							css={{
								fontSize: '1rem',
							}}
						>
							({step + 1} / {syllabuses.length})
						</div>
					)}
					<button
						type="button"
						aria-label="Close dialog"
						onClick={handleCancel}
					>
						<Icon icon="ic:baseline-close" width={30} height={30} />
					</button>
				</>
			}
		>
			<div className="grid gap-6">
				{slotBeforeSearch}
				<SearchBar
					className="mt-0"
					initialSearchText={searchText}
					onSearch={setSearchText}
					autoFocus
				/>
				{showError && (
					<Alert as="error" className="mt-0" compact>
						<strong>Please select a language.</strong>
					</Alert>
				)}
				<div className="grid">
					{filteredLanguages?.length > 0 ? (
						filteredLanguages.map((lang) => {
							const htmlId = `${
								stepSyllabusTaxoSyllabusCodename + uuid
							}@@${lang.codename}`
							const checked =
								selectedLanguages?.[
									stepSyllabusTaxoSyllabusCodename
								]?.includes(lang.codename) ?? false
							return (
								<FormControlLabel
									key={htmlId}
									htmlFor={htmlId}
									className="mx-0"
									control={<RadioBox id={htmlId} />}
									label={lang.name}
									onChange={handleChange}
									checked={checked}
								/>
							)
						})
					) : (
						<div className="text-center mt-3.5">
							No results found
						</div>
					)}
				</div>
				{children}
			</div>
		</CustomModal>
	)
}
