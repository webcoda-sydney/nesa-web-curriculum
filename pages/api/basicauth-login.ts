import { loginHandler } from '@storyofams/next-password-protect'

export default loginHandler(process.env.PREVIEW_SECRET, {
	// Options go here (optional)
	cookieName: 'next-password-protect',
})
