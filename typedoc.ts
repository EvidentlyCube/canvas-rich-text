module.exports = {
	entryPoints: ['./src/index.ts'],
	tsconfig: 'tsconfig.json',
	out: './docs',
	excludePrivate: true,
	excludeProtected: true,
	excludeExternals: true,
	readme: 'README.md',
	name: 'Canvas Rich Text library',
	listInvalidSymbolLinks: true,
};