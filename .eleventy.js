import fs from 'fs';
import path from 'path';
import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';
import { HtmlBasePlugin } from "@11ty/eleventy";
import { DateTime } from 'luxon';
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import markdownIt from "markdown-it";

export default async function (eleventyConfig) {
	const env = process.env.APP_BUILD_ENV;
	let outputPath = '_site'
	let pathPrefix = undefined
	if (env === "production") {
		outputPath = 'docs'
		// if hosting via github pages with no custom domain the below is needed
		//pathPrefix = '/MN-ARRL-Site'
	}

	eleventyConfig.setInputDirectory("src")

	// Add a collection for news posts (markdown files in src/news/)
	eleventyConfig.addCollection("news", function (collectionApi) {
		return collectionApi.getFilteredByGlob("src/news/*.md").sort((a, b) => {
			// Sort newest first by date (from front matter or file name)
			return b.date - a.date;
		});
	});

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

	eleventyConfig.addNunjucksFilter("date", (dateObj, format = 'yyyy-MM-dd') => {
		if (dateObj instanceof Date) {
			return DateTime.fromJSDate(dateObj, {
				zone: 'utc',
				locale: "en"
			}).toFormat(format);
		} else {
			return DateTime.fromISO(dateObj, {
				zone: "utc",
				locale: "en"
			}).toFormat(format);
		}
	})

	eleventyConfig.addPlugin(feedPlugin, {
		type: "atom", // or "rss", "json"
		outputPath: "/feed.xml",
		collection: {
			name: "news", // iterate over `collections.news`
			limit: 10,     // 0 means no limit
		},
		metadata: {
			language: "en",
			title: "Minnesota ARRL Section News",
			subtitle: "Latest news from the Minnesota ARRL Section",
			base: "https://mnarrl.org",
			author: {
				name: "MN ARRL",
				email: "", // Optional
			}
		}
	});

	eleventyConfig.setLibrary("md", markdownIt({
		html: true,
		breaks: true,
		linkify: true,
	}))

	return {
		dir: {
			output: outputPath,
		},
		pathPrefix: pathPrefix,
		markdownTemplateEngine: "njk",
	}
};


