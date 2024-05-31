import { FormGroupSelect } from 'nsw-ds-react'
import React from 'react'
export interface ISelectOption {
	text: string
	value: string
	available?: boolean
}

export interface CustomSelectProps {
	/**
	 * Name of Select component
	 */
	name: string

	/**
	 * Label of Select component
	 */
	label: string

	/**
	 * List of options
	 */
	options: ISelectOption[]

	/**
	 * Fire callback when option is selected
	 */
	onChange: (
		_event: React.ChangeEvent<{ name: string; value: string }>,
	) => void
}

/**
 * Custom Select component with NSW css
 * @param props
 * @constructor
 */
const CustomSelect = (props: CustomSelectProps): JSX.Element => {
	const { name, label, options, onChange } = props

	return (
		<FormGroupSelect
			name={name}
			label={label}
			options={options}
			aria-label={name}
			onBlur={onChange}
			onChange={onChange}
			hideLabel
			autoComplete="off"
		>
			{/* <p className="nsw-form-label">{label}</p>
			<select className="nsw-form-select" name={name}>
				<option value="">Please select</option>
				{options.map((opt) => {
					if (opt.available ?? true) {
						return (
							<option key={opt.value} value={opt.value}>
								{opt.text}
							</option>
						)
					}
					return null
				})}
			</select> */}
		</FormGroupSelect>
	)
}

export default CustomSelect
