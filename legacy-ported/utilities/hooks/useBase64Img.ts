import { useState } from 'react'
import { escapeRegExp } from '../functions'

export default function useBase64Img(): [
	(_content: string) => string,
	Record<string, string | null>,
] {
	const [encodingMap, setEncodingMap] = useState<
		Record<string, string | null>
	>({})

	return [
		(content: string) => {
			// Replace any known images with encoded version
			const replaced = Object.entries(encodingMap).reduce(
				(acc, [urlRegex, encoding]) => {
					if (encoding) {
						const replacement = acc.replace(
							new RegExp(urlRegex, 'gi'),
							encoding,
						)
						// console.log('Encoding Replacement', {
						//   urlRegex,
						//   encoding,
						//   replacement,
						// });
						return replacement
					}
					return acc
				},
				content,
			)

			const matches = replaced.matchAll(
				/<img .*?src=['"]((?!data)[^"]+)['"]/g,
			)
			if (matches) {
				const encodingCopy = { ...encodingMap }
				let change = false

				// eslint-disable-next-line no-restricted-syntax
				for (const match of matches) {
					const url = match[1]
					const urlRegex = escapeRegExp(url)
					// console.log('Encoding Match', {
					//   url,
					//   urlRegex,
					//   encoded: encodingCopy[urlRegex],
					// });

					if (encodingCopy[urlRegex] === undefined) {
						encodingCopy[urlRegex] = null
						change = true

						fetch(url)
							.then((resp) => resp.blob())
							.then(
								(blob) =>
									new Promise<string>((resolve, reject) => {
										const reader = new FileReader()
										reader.readAsDataURL(blob)
										reader.onload = () =>
											resolve(
												reader.result?.toString() ??
													'error',
											)
										reader.onerror = (error) =>
											reject(error)
									}),
							)
							.then((encoded) =>
								setEncodingMap((map) => ({
									...map,
									[urlRegex]: encoded,
								})),
							)
					}
				}

				if (change) {
					setEncodingMap(encodingCopy)
				}
			}
			return replaced
		},
		encodingMap,
	]
}
