import fs from 'fs'

export const writeJSONTOFile = (json: unknown, path) => {
	fs.writeFileSync(path, JSON.stringify(json))
}
