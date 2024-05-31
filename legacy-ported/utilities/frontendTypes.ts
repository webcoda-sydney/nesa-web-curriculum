/* eslint-disable camelcase */
import type { ReactNode } from 'react'

export interface UrlLink {
	url: string
	title: string
	pageTitle?: string
	pageDesc?: string
	icon?: ReactNode
	external?: boolean
	isDisabled?: boolean
}

export interface UrlLinkWithChildrenFlag extends UrlLink {
	hasChildren?: boolean
}

export interface UserSelect {
	id: number
	title: string
	imgUrl: string
	description: string
}

export const alphabet = [
	'a',
	'b',
	'c',
	'd',
	'e',
	'f',
	'g',
	'h',
	'i',
	'j',
	'k',
	'l',
	'm',
	'n',
	'o',
	'p',
	'q',
	'r',
	's',
	't',
	'u',
	'v',
	'w',
	'x',
	'y',
	'z',
] as const
export type AlphabetChar = typeof alphabet[number]

export interface IFile {
	id: number
	type: string
	name: string
	url: string
	size?: string
}

export interface ImageSize {
	width: number
	height: number
}
