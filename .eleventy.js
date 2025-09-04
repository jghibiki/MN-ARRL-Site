import fs from 'fs';
import path from 'path';
import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';
import { HtmlBasePlugin } from "@11ty/eleventy";


export default async function (eleventyConfig) {
	const env = process.env.APP_BUILD_ENV;
	let outputPath = '_site'
	let pathPrefix = undefined
	if (env === "production") {
		outputPath = 'docs'
		pathPrefix = '/MN-ARRL-Site'
	}

	eleventyConfig.setInputDirectory("src")

	eleventyConfig.on('eleventy.before', async () => {
		const tailwindInputPath = path.resolve('./src/styles/index.css');
		const tailwindOutputPath = `./${outputPath}/styles/index.css`;
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

	eleventyConfig.addPlugin(HtmlBasePlugin);

	eleventyConfig.addNunjucksFilter("multi_attribute_sort", (array, attributes, reverse = false) => {
		return array.sort((a, b) => {
			for (let attr of attributes) {
				if (a[attr] < b[attr]) return reverse ? 1 : -1;
				if (a[attr] > b[attr]) return reverse ? -1 : 1;
			}
			return 0;
		});
	})

	return {
		dir: {
			output: outputPath,
		},
		pathPrefix: pathPrefix
	}
};


