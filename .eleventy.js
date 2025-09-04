import fs from 'fs';
import path from 'path';
import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';


export default async function(eleventyConfig) {
	eleventyConfig.setInputDirectory("src")

	eleventyConfig.on('eleventy.before', async () => {
		const tailwindInputPath = path.resolve('./src/styles/index.css');
		const tailwindOutputPath = './_site/styles/index.css';
		const cssContent = fs.readFileSync(tailwindInputPath, 'utf8');
		const outputDir = path.dirname(tailwindOutputPath);
	
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true });
		}
	
		const result = await postcss([tailwindcss()]).process(cssContent, {
			from: tailwindInputPath,
			to: tailwindOutputPath,
		});
	
		fs.writeFileSync(tailwindOutputPath, result.css);
	});

};


