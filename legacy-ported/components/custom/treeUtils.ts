export interface TreeElement {
	/**
	 * Unique element name
	 */
	id: string

	/**
	 * ancestor labels, split by "|"
	 */
	ancestorLabels?: string

	/**
	 * Display label
	 */
	label: string

	/**
	 * Any Child Elements
	 */
	children?: this[]

	/**
	 * More information
	 */
	moreInfo?: string

	/**
	 * Disabled or not
	 */
	disabled?: boolean
}

export const patchTree = (
	root: TreeElement,
	name: TreeElement['id'],
	update: (_element: TreeElement) => TreeElement,
): { tree: TreeElement; updated: boolean } => {
	if (root.id === name) {
		// If this is the node, run the update and return.
		return { tree: update(root), updated: true }
	}

	if (root.children) {
		// Recursively check children
		for (let i = 0; i < root.children.length; i++) {
			const child = root.children[i]
			const { tree, updated } = patchTree(child, name, update)

			if (updated) {
				// This child was updated
				const copy = [...root.children]
				copy[i] = tree

				return {
					tree: {
						...root,
						children: copy,
					},
					updated: true,
				}
			}
		}
	}

	return { tree: root, updated: false }
}

export const filterTree = (
	root: TreeElement,
	filter: (_e: TreeElement) => boolean,
): TreeElement | null => {
	let children: TreeElement[] | undefined
	if (root.children?.length) {
		children = root.children.flatMap((e) => filterTree(e, filter) ?? [])
	}

	if (children?.length || filter(root)) {
		return {
			...root,
			children,
		}
	}
	return null
}

export const getNode = (
	elements: TreeElement[],
	id: TreeElement['id'],
): TreeElement | null => {
	for (let i = 0; i < elements.length; i++) {
		const root = elements[i]
		if (root.id === id) {
			return root
		}
		if (root.children) {
			const child = getNode(root.children, id)
			if (child) {
				return child
			}
		}
	}

	return null
}

export const getNodes = (
	elements: TreeElement[],
	discriminator: (_node: TreeElement) => boolean,
): TreeElement[] => {
	const nodes: TreeElement[] = []

	for (let i = 0; i < elements.length; i++) {
		const node = elements[i]

		if (discriminator(node)) {
			nodes.push(node)
		}

		if (node.children?.length) {
			nodes.push(...getNodes(node.children, discriminator))
		}
	}

	return nodes
}

export const getLeaves = (elements: TreeElement[]) =>
	getNodes(elements, (n) => !n.children?.length)
