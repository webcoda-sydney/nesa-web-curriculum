import Icon from '@/components/Icon'
import Close from '@mui/icons-material/Close'
import clsx from 'clsx'
import { Button, FormGroupText } from 'nsw-ds-react'
import { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react'

export interface SearchBarProps {
	/**
	 * Callback fired when search is submitted, either via pressing return or clicking the magnifying
	 * glass icon
	 * @param text the text being searched
	 */
	// eslint-disable-next-line no-unused-vars
	onSearch?: (text: string) => void

	searchBarPlaceholder?: string

	value?: string

	/**
	 * Callback fired when needs to hide search bar
	 */
	onBlurEvent?: () => void

	/**
	 * Classname prop, forwarded to root element
	 */
	className?: string

	/**
	 * Classname prop, forwarded to root element
	 */
	placeholder?: string

	/**
	 * Autofocus prop, forwarded to input element.
	 */
	autoFocus?: boolean

	/**
	 * Callback fired when temp search is submitted
	 */
	onSavingTempSearchText?: (_text: string) => void

	variant?: 'with-icon' | 'with-inline-button'

	initialSearchText?: string

	disableResetSearchText?: boolean
}

/**
 * Input for dealing with text searching.
 * @param props
 * @constructor
 */
const SearchBar = (props: SearchBarProps): JSX.Element => {
	const {
		className,
		onSearch,
		autoFocus,
		onSavingTempSearchText,
		variant = 'with-icon',
		initialSearchText = '',
		disableResetSearchText: disableResetSearchTextOnLoad = false,
		searchBarPlaceholder = 'Search',
		value,
	} = props

	const [searchText, setSearchText] = useState(initialSearchText)

	const handleSearchTextChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchText(e.target.value)
		// if (onSavingTempSearchText) {
		// 	onSavingTempSearchText(e.target.value)
		// }
		if (onSearch) {
			onSearch(e.target.value)
		}
	}

	const handleKeypress = (_e: KeyboardEvent<HTMLInputElement>) => {
		if (onSearch) {
			onSearch(searchText)
		}
	}

	const handleSearchPress = () => {
		if (onSearch) {
			onSearch(searchText)
		}
	}
	const handleBlur = (e) => {
		handleSearchTextChange(e)
	}

	const clearSearch = () => {
		if (onSavingTempSearchText) {
			onSavingTempSearchText('')
		}
		setSearchText('')
		onSearch('')
	}

	useEffect(() => {
		setSearchText(value)
	}, [value])

	useEffect(() => {
		return () => {
			if (!disableResetSearchTextOnLoad && onSearch) {
				onSearch('')
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [disableResetSearchTextOnLoad])

	useEffect(() => {
		setSearchText(initialSearchText)
	}, [initialSearchText])

	if (variant === 'with-icon') {
		return (
			<FormGroupText
				className={clsx(className, 'relative')}
				htmlId="search"
				label="Search"
				placeholder={searchBarPlaceholder}
				value={searchText}
				onChange={handleSearchTextChange}
				hideLabel
				isInputGroupIcon
				autoComplete="off"
			>
				{searchText?.length > 0 && (
					<button
						className="absolute right-[4rem] top-1/2 -translate-y-1/2 font-bold"
						type="button"
						onClick={clearSearch}
					>
						<span className="sr-only">Clear search</span>
						<Close />
					</button>
				)}
				<Button
					type="button"
					className="nsw-button--flex"
					style="white"
					onClick={handleSearchPress}
				>
					<Icon icon="mdi:search" />
				</Button>
			</FormGroupText>
		)
	}

	return (
		<div className={clsx('relative', className)}>
			<div className="nsw-form__input-group">
				<div className="relative flex-1">
					<input
						className="nsw-form__input w-full"
						type="search"
						name="search-input"
						value={searchText}
						autoFocus={autoFocus}
						onChange={handleSearchTextChange}
						onKeyPress={handleKeypress}
						onBlur={handleBlur}
						aria-label="Search"
						placeholder={searchBarPlaceholder}
						autoComplete="off"
					/>
					{searchText?.length > 0 && (
						<button
							className="absolute right-3 top-1/2 -translate-y-1/2 font-bold"
							type="button"
							onClick={clearSearch}
						>
							<span className="sr-only">Clear search</span>
							<Close />
						</button>
					)}
				</div>
				<button
					className="nsw-button nsw-button--dark nsw-button--flex"
					type="submit"
					onClick={handleSearchPress}
				>
					Search
				</button>
			</div>
		</div>
	)
}

export default SearchBar
