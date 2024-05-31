import clsx from 'clsx'

export interface NewsletterSubscribeBoxProps {
	className?: string
	title?: string
	buttonLabel?: string
	inputLabel?: string
	formAction: string
	createSendId: string
}

const NewsletterSubscribeBox = (
	props: NewsletterSubscribeBoxProps,
): JSX.Element => {
	const {
		className,
		title = 'Subscribe to newsletter',
		inputLabel = 'Enter your email',
		buttonLabel = 'Subscribe',
		formAction,
		createSendId,
	} = props

	const handleInvalid = (e) =>
		(e.target as HTMLInputElement).setCustomValidity(
			'Please enter valid email address',
		)

	const handleInput = (e) =>
		(e.target as HTMLInputElement).setCustomValidity('')

	return (
		<div className={clsx('p-4', className)}>
			<h3 className="mb-4">{title}</h3>
			<form
				className="nsw-form !mt-0 js-cm-form"
				id="subForm"
				dir="ltr"
				action={formAction}
				method="post"
				data-id={createSendId}
			>
				<div className="nsw-form__group">
					<div className="nsw-form__input-group">
						<label className="sr-only" htmlFor="fieldEmail">
							{inputLabel}
						</label>
						<input
							name="cm-yuiuurk-yuiuurk"
							className="js-cm-email-input nsw-form__input"
							id="fieldEmail"
							type="email"
							pattern="^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+"
							aria-label={title}
							onInput={handleInput}
							onInvalid={handleInvalid}
							required
							placeholder={inputLabel}
							autoComplete="off"
						/>
						<button
							className="nsw-button nsw-button--dark nsw-button--flex"
							type="submit"
							data-kontent-element-codename="buttonLabel"
						>
							{buttonLabel}
						</button>
					</div>
				</div>
			</form>
		</div>
	)
}

export default NewsletterSubscribeBox
