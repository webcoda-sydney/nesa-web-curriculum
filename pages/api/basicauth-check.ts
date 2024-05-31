import { passwordCheckHandler } from '@storyofams/next-password-protect'

export default passwordCheckHandler(process.env.PREVIEW_SECRET, {
	// Options go here (optional)
	cookieName: 'next-password-protect',
})
