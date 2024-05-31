require('dotenv').config()
const {
	generateModelsAsync,
	textHelper,
} = require('@kontent-ai/model-generator')
const fs = require('fs')

const process = require('process')
const args = require('minimist')(process.argv.slice(2))
const path = `./${args.outputFolder}`

// Check if the directory exists
if (fs.existsSync(path)) {
	// If it exists, change to that directory
	process.chdir(path)
	console.log(`Changed working directory to ${path}`)
} else {
	// If it doesn't exist, create it and change to that directory
	fs.mkdirSync(path)
	process.chdir(path)
	console.log(`Created and changed working directory to ${path}`)
}

async function test() {
	await generateModelsAsync({
		sdkType: 'delivery',
		projectId: process.env.NEXT_PUBLIC_KONTENT_PROJECT_ID,
		apiKey: process.env.KONTENT_MANAGEMENT_API_KEY,
		addTimestamp: false,
		contentTypeResolver: (type) =>
			`${textHelper.toPascalCase(type.codename)}`,
		taxonomyTypeResolver: (type) =>
			`Taxo${textHelper.toPascalCase(type.codename)}`,
		exportProjectSettings: {
			exportCollections: false,
			exportWebhooks: false,
			exportWorkflows: false,
			exportRoles: false,
			exportLanguages: false,
			exportAssetFolders: false,
		},
	})
}

test()
