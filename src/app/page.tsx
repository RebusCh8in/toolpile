"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface Tool {
  name: string;
  description: string;
  href: string;
  icon: string;
  category: string;
}

const tools: Tool[] = [
  { name: "Video Watermark Remover", description: "Remove watermarks from videos of any length. No time limits, no upload, free forever.", href: "/tools/video-watermark-remover", icon: "\uD83C\uDFAC", category: "Design" },
  { name: "Photo Watermark Remover", description: "Remove watermarks from photos for free. No signup, no limits, 100% private.", href: "/tools/photo-watermark-remover", icon: "\u2702", category: "Design" },
  { name: "QR Code Generator", description: "Generate customizable QR codes from any text or URL", href: "/tools/qr-code-generator", icon: "\u25A3", category: "Utility" },
  { name: "Color Palette Generator", description: "Create beautiful random color palettes with lock and export", href: "/tools/color-palette-generator", icon: "\u25D0", category: "Design" },
  { name: "CSS Gradient Generator", description: "Build linear, radial, and conic CSS gradients visually", href: "/tools/css-gradient-generator", icon: "\u25C8", category: "Design" },
  { name: "Box Shadow Generator", description: "Design CSS box shadows with a live visual editor", href: "/tools/box-shadow-generator", icon: "\u25FB", category: "Design" },
  { name: "Password Generator", description: "Generate strong, secure passwords with customizable options", href: "/tools/password-generator", icon: "\u26BF", category: "Utility" },
  { name: "JSON Formatter", description: "Prettify, minify, and validate JSON with syntax highlighting", href: "/tools/json-formatter", icon: "{}", category: "Developer" },
  { name: "Base64 Encoder", description: "Encode and decode text and files to and from Base64", href: "/tools/base64-encoder", icon: "\u29C9", category: "Developer" },
  { name: "Lorem Ipsum Generator", description: "Generate placeholder text in paragraphs, sentences, or words", href: "/tools/lorem-ipsum-generator", icon: "\u00B6", category: "Text" },
  { name: "UUID Generator", description: "Generate random UUID v4 identifiers, single or in bulk", href: "/tools/uuid-generator", icon: "\u2B22", category: "Developer" },
  { name: "Word Counter", description: "Count words, characters, sentences, and analyze text", href: "/tools/word-counter", icon: "\u2263", category: "Text" },
  { name: "Image Color Picker", description: "Upload an image and pick any color with an eyedropper", href: "/tools/image-color-picker", icon: "\u2740", category: "Design" },
  { name: "Aspect Ratio Calculator", description: "Calculate and visualize aspect ratios with presets", href: "/tools/aspect-ratio-calculator", icon: "\u25AD", category: "Design" },
  { name: "Unit Converter", description: "Convert between length, weight, temperature, data, and time units", href: "/tools/unit-converter", icon: "\u21C4", category: "Utility" },
  { name: "Regex Tester", description: "Test regular expressions with live highlighting and match info", href: "/tools/regex-tester", icon: ".*", category: "Developer" },
  { name: "Markdown Preview", description: "Write and preview Markdown with a live split-pane editor", href: "/tools/markdown-preview", icon: "\u24DC", category: "Text" },
  { name: "Fancy Text Generator", description: "Convert text into stylish Unicode fonts for Instagram, TikTok, and Twitter bios", href: "/tools/fancy-text-generator", icon: "\u2728", category: "Text" },
  { name: "Image Compressor", description: "Compress images by up to 90% with adjustable quality. No upload, runs in your browser.", href: "/tools/image-compressor", icon: "\uD83D\uDCE6", category: "Design" },
  { name: "Image Resizer", description: "Resize images with social media presets for Instagram, YouTube, Facebook, and more.", href: "/tools/image-resizer", icon: "\uD83D\uDCD0", category: "Design" },
  { name: "Image Format Converter", description: "Convert between 20+ image formats: JPG, PNG, WebP, SVG, HEIC, GIF, BMP, TIFF, ICO. Free and instant.", href: "/tools/convert", icon: "\uD83D\uDD04", category: "Design" },
  { name: "Background Remover", description: "Remove image backgrounds instantly with AI. 100% free, no upload, runs in your browser.", href: "/tools/background-remover", icon: "\u2702\uFE0F", category: "Design" },
  { name: "Diff Checker", description: "Compare two blocks of text and see differences highlighted. Free online diff tool.", href: "/tools/diff-checker", icon: "\u2194", category: "Developer" },
  { name: "Glassmorphism Generator", description: "Create frosted glass CSS effects with a live visual editor. Adjust blur, transparency, borders.", href: "/tools/glassmorphism-generator", icon: "\u25C7", category: "Developer" },
  { name: "CSS Clip Path Generator", description: "Create CSS clip-path shapes visually with preset shapes and custom polygons.", href: "/tools/css-clip-path", icon: "\u2B23", category: "Developer" },
  { name: "CSS Loader Generator", description: "Generate pure CSS loading spinners and animations. Customize and copy HTML + CSS.", href: "/tools/css-loader-generator", icon: "\u27F3", category: "Developer" },
  { name: "HTML Minifier", description: "Minify HTML code by removing whitespace and comments. Free and instant.", href: "/tools/html-minifier", icon: "&lt;&gt;", category: "Developer" },
  { name: "CSS Minifier", description: "Minify CSS code by removing whitespace and comments. Free and instant.", href: "/tools/css-minifier", icon: "{}", category: "Developer" },
  { name: "JS Minifier", description: "Minify JavaScript code by removing whitespace and comments. Free and instant.", href: "/tools/js-minifier", icon: "fn", category: "Developer" },
  { name: "Favicon Generator", description: "Generate favicons from text, emoji, or image. All standard sizes for browsers and PWA.", href: "/tools/favicon-generator", icon: "\u2B22", category: "Design" },
  { name: "Color Contrast Checker", description: "Check WCAG color contrast ratios. Verify AA and AAA accessibility compliance.", href: "/tools/color-contrast-checker", icon: "\u25D1", category: "Design" },
  { name: "Text Case Converter", description: "Convert text between UPPERCASE, lowercase, camelCase, snake_case, and more.", href: "/tools/text-case-converter", icon: "Aa", category: "Text" },
  { name: "Unix Timestamp Converter", description: "Convert Unix timestamps to dates and vice versa. Live current timestamp display.", href: "/tools/timestamp-converter", icon: "\u23F0", category: "Developer" },
  { name: "Hash Generator", description: "Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes. Uses native Web Crypto API.", href: "/tools/hash-generator", icon: "#", category: "Developer" },
  { name: "JWT Decoder", description: "Decode JSON Web Tokens. View header, payload, and expiration status instantly.", href: "/tools/jwt-decoder", icon: "\u26BF", category: "Developer" },
  { name: "URL Encoder / Decoder", description: "Encode and decode URLs and query parameters. Supports component and full URI modes.", href: "/tools/url-encoder", icon: "%", category: "Developer" },
  { name: "Cron Expression Generator", description: "Build cron expressions with presets, plain-English descriptions, and next run times.", href: "/tools/cron-generator", icon: "\u23F1", category: "Developer" },
  { name: "SVG Blob Generator", description: "Generate organic SVG blob shapes with custom gradient colors. Free and instant.", href: "/tools/svg-blob-generator", icon: "\u25CF", category: "Design" },
  { name: "SVG Wave Generator", description: "Generate layered SVG wave section dividers with custom colors and complexity.", href: "/tools/svg-wave-generator", icon: "\u223F", category: "Design" },
  { name: "Image to Base64", description: "Convert images to Base64 for embedding in HTML, CSS, or JSON. Instant and private.", href: "/tools/image-to-base64", icon: "\u29C9", category: "Developer" },
  { name: "Barcode Generator", description: "Generate Code 128 barcodes from any text. Download as PNG. Free and instant.", href: "/tools/barcode-generator", icon: "\u2758", category: "Utility" },
  { name: "HTML Entity Encoder", description: "Encode and decode HTML entities. Convert special characters to HTML entities and back.", href: "/tools/html-entity-encoder", icon: "&amp;", category: "Developer" },
  { name: "Chmod Calculator", description: "Calculate Unix file permissions visually. Convert between octal and symbolic notation.", href: "/tools/chmod-calculator", icon: "\u26BF", category: "Developer" },
  { name: "Color Shades Generator", description: "Generate Tailwind-style color palettes with 11 shades from any color.", href: "/tools/color-shades-generator", icon: "\u25D0", category: "Design" },
  { name: "Image Crop Tool", description: "Crop images to any aspect ratio. Presets for Instagram, YouTube, Facebook, Twitter, LinkedIn.", href: "/tools/image-crop", icon: "\u2702", category: "Design" },
  { name: "Meta Tag Generator", description: "Generate SEO meta tags, Open Graph, and Twitter Cards. Preview Google and social appearance.", href: "/tools/meta-tag-generator", icon: "\u2630", category: "Developer" },
  { name: "Robots.txt Generator", description: "Generate robots.txt files. Control search engine and AI bot access with a visual builder.", href: "/tools/robots-txt-generator", icon: "\uD83E\uDD16", category: "Developer" },
  { name: "Neumorphism Generator", description: "Create soft UI / neumorphic CSS effects. Flat, concave, convex, and pressed shapes.", href: "/tools/neumorphism-generator", icon: "\u25CB", category: "Developer" },
  { name: "JSON to CSV Converter", description: "Convert between JSON and CSV formats. Bidirectional with download support.", href: "/tools/json-to-csv", icon: "\u21C4", category: "Developer" },
  { name: "Placeholder Image Generator", description: "Generate custom placeholder images for web mockups. Any size, color, and text.", href: "/tools/placeholder-image", icon: "\u25A1", category: "Design" },
  { name: "CSS Text Shadow Generator", description: "Create CSS text-shadow effects. Multiple layers, neon glow, 3D, fire presets.", href: "/tools/css-text-shadow", icon: "T\u0336", category: "Developer" },
  { name: "CSS Flexbox Generator", description: "Build CSS Flexbox layouts visually. Direction, alignment, wrapping, gap with live preview.", href: "/tools/css-flexbox", icon: "\u2B1C", category: "Developer" },
  { name: "CSS Grid Generator", description: "Build CSS Grid layouts visually. Customize columns, rows, gaps, and alignment.", href: "/tools/css-grid", icon: "\u2B1C", category: "Developer" },
  { name: "Invoice Generator", description: "Create professional invoices for free. No signup, no watermark. Print or save as PDF.", href: "/tools/invoice-generator", icon: "\uD83D\uDCCB", category: "Utility" },
  { name: "URL Slug Generator", description: "Convert text to URL-friendly slugs. Handles accented characters, bulk conversion.", href: "/tools/url-slug-generator", icon: "/", category: "Developer" },
  { name: "EXIF Data Viewer", description: "View photo metadata — camera settings, date, GPS location, device info. Private.", href: "/tools/exif-viewer", icon: "\uD83D\uDCF7", category: "Design" },
  { name: "Noise Texture Generator", description: "Generate seamless noise and grain textures for backgrounds. Download PNG or copy CSS.", href: "/tools/noise-generator", icon: "\u2591", category: "Design" },
  { name: "Open Graph Preview", description: "Preview how your page looks on Google, Facebook, Twitter, Slack, and Discord.", href: "/tools/og-preview", icon: "\uD83D\uDD17", category: "Developer" },
  { name: "CSS Border Radius Generator", description: "Create fancy shapes with 8-value border-radius. Organic blobs, leaves, and asymmetric corners.", href: "/tools/css-border-radius", icon: "\u25CF", category: "Developer" },
  { name: "Color Converter", description: "Convert colors between HEX, RGB, HSL, HSV, and CMYK instantly.", href: "/tools/color-converter", icon: "\u25D0", category: "Design" },
  { name: "HTML Table Generator", description: "Create tables with a spreadsheet editor. Export as HTML, Markdown, or CSV.", href: "/tools/html-table-generator", icon: "\u2637", category: "Developer" },
  { name: "CSS Cubic Bezier Generator", description: "Create custom animation easing curves. Drag control points, preview animations.", href: "/tools/css-cubic-bezier", icon: "\u223F", category: "Developer" },
  { name: "Bionic Reading Converter", description: "Convert text to Bionic Reading format. Bold word beginnings for faster, focused reading.", href: "/tools/bionic-reading", icon: "B", category: "Text" },
  { name: "CSS Background Pattern", description: "Generate pure CSS background patterns — dots, grids, stripes, checkerboards, and more.", href: "/tools/css-background-pattern", icon: "\u2593", category: "Developer" },
  { name: "Image Filter Effects", description: "Apply Instagram-style filters — vintage, sepia, noir, and 13 more. Free and private.", href: "/tools/image-filters", icon: "\uD83C\uDFA8", category: "Design" },
  { name: "JSON Validator", description: "Validate JSON syntax with error messages and line numbers. Prettify and minify.", href: "/tools/json-validator", icon: "\u2713", category: "Developer" },
  { name: "Pixel Art Converter", description: "Convert images to pixel art with adjustable pixel size and color palette.", href: "/tools/pixel-art", icon: "\uD83D\uDC7E", category: "Design" },
  { name: "Mortgage Calculator", description: "Calculate monthly mortgage payments with taxes, insurance, PMI, and amortization schedule.", href: "/tools/mortgage-calculator", icon: "\uD83C\uDFE0", category: "Finance" },
  { name: "Compound Interest Calculator", description: "See how your money grows with compound interest and regular contributions over time.", href: "/tools/compound-interest-calculator", icon: "\uD83D\uDCC8", category: "Finance" },
  { name: "Loan Calculator", description: "Calculate monthly payments, total interest, and see a full payment schedule for any loan.", href: "/tools/loan-calculator", icon: "\uD83D\uDCB3", category: "Finance" },
  { name: "Percentage Calculator", description: "Calculate percentages — find percent of a number, percentage change, increase, and decrease.", href: "/tools/percentage-calculator", icon: "%", category: "Math" },
  { name: "Tip Calculator", description: "Calculate tip amount and split the bill between friends with preset and custom percentages.", href: "/tools/tip-calculator", icon: "\uD83D\uDCB5", category: "Finance" },
  { name: "Salary Calculator", description: "Convert between annual salary and hourly wage with tax estimates and pay breakdown.", href: "/tools/salary-calculator", icon: "\uD83D\uDCBC", category: "Finance" },
  { name: "Auto Loan Calculator", description: "Calculate car payments with down payment, trade-in, sales tax, and term comparison.", href: "/tools/auto-loan-calculator", icon: "\uD83D\uDE97", category: "Finance" },
  { name: "Retirement Calculator", description: "Project retirement savings growth with contributions, inflation, and withdrawal income.", href: "/tools/retirement-calculator", icon: "\uD83C\uDFD6", category: "Finance" },
  { name: "Savings Calculator", description: "Calculate savings growth over time with regular deposits and compound interest.", href: "/tools/savings-calculator", icon: "\uD83D\uDCB0", category: "Finance" },
  { name: "Investment Calculator", description: "Project investment growth with regular contributions. See nominal and inflation-adjusted returns.", href: "/tools/investment-calculator", icon: "\uD83D\uDCCA", category: "Finance" },
  { name: "BMI Calculator", description: "Calculate your Body Mass Index with imperial or metric units. See BMI category and healthy weight ranges.", href: "/tools/bmi-calculator", icon: "\u2696", category: "Health" },
  { name: "Calorie Calculator", description: "Calculate daily calorie needs based on age, sex, height, weight, and activity level.", href: "/tools/calorie-calculator", icon: "\uD83C\uDF4E", category: "Health" },
  { name: "TDEE Calculator", description: "Calculate Total Daily Energy Expenditure with multiple formulas and macro split suggestions.", href: "/tools/tdee-calculator", icon: "\uD83D\uDD25", category: "Health" },
  { name: "Body Fat Calculator", description: "Estimate body fat percentage using the US Navy method with waist, neck, and hip measurements.", href: "/tools/body-fat-calculator", icon: "\uD83D\uDCCF", category: "Health" },
  { name: "Macro Calculator", description: "Calculate daily protein, carb, and fat targets based on your goals. Multiple diet splits available.", href: "/tools/macro-calculator", icon: "\uD83E\uDD69", category: "Health" },
  { name: "Profit Margin Calculator", description: "Calculate profit margin, markup, and profit from cost and revenue. Three calculation modes.", href: "/tools/profit-margin-calculator", icon: "\uD83D\uDCCA", category: "Finance" },
  { name: "Discount Calculator", description: "Calculate sale price after discount. Supports double discounts, tax, and shows total savings.", href: "/tools/discount-calculator", icon: "\uD83C\uDFF7", category: "Finance" },
  { name: "Sales Tax Calculator", description: "Calculate sales tax on any purchase. Add tax or extract tax from total. State rate presets.", href: "/tools/sales-tax-calculator", icon: "\uD83E\uDDFE", category: "Finance" },
  { name: "ROI Calculator", description: "Calculate return on investment and annualized return from initial and final values.", href: "/tools/roi-calculator", icon: "\uD83D\uDCC8", category: "Finance" },
  { name: "Age Calculator", description: "Calculate exact age in years, months, days, hours. Zodiac sign and next birthday countdown.", href: "/tools/age-calculator", icon: "\uD83C\uDF82", category: "Utility" },
  { name: "Payment Calculator", description: "Calculate monthly loan payments for any amount, rate, and term. Rate comparison table.", href: "/tools/payment-calculator", icon: "\uD83D\uDCB3", category: "Finance" },
  { name: "Paycheck Calculator", description: "Estimate take-home pay per paycheck. Federal tax, FICA, state tax, 401k deductions.", href: "/tools/paycheck-calculator", icon: "\uD83D\uDCB5", category: "Finance" },
  { name: "Interest Calculator", description: "Calculate simple and compound interest. Year-by-year breakdown and APY comparison.", href: "/tools/interest-calculator", icon: "\uD83D\uDCB0", category: "Finance" },
  { name: "Inflation Calculator", description: "See how inflation affects purchasing power over time. Future and past value modes.", href: "/tools/inflation-calculator", icon: "\uD83D\uDCC9", category: "Finance" },
  { name: "401(k) Calculator", description: "Project 401k growth with employer match, contributions, and investment returns.", href: "/tools/401k-calculator", icon: "\uD83C\uDFE6", category: "Finance" },
  { name: "Amortization Calculator", description: "Generate full amortization schedule with principal/interest breakdown. See extra payment savings.", href: "/tools/amortization-calculator", icon: "\uD83D\uDCC5", category: "Finance" },
  { name: "Income Tax Calculator", description: "Estimate federal income tax with 2026 brackets. Marginal and effective rate breakdown.", href: "/tools/income-tax-calculator", icon: "\uD83C\uDFDB", category: "Finance" },
  { name: "Debt Payoff Calculator", description: "Calculate how long to pay off debt and total interest. Compare extra payment scenarios.", href: "/tools/debt-payoff-calculator", icon: "\u26D3", category: "Finance" },
  { name: "Hourly to Salary Calculator", description: "Convert hourly wage to annual salary and vice versa. Accounts for vacation time.", href: "/tools/hourly-to-salary-calculator", icon: "\u23F1", category: "Finance" },
  { name: "Budget Calculator", description: "Plan your monthly budget with expense categories. Compare with the 50/30/20 rule.", href: "/tools/budget-calculator", icon: "\uD83D\uDCCB", category: "Finance" },
  { name: "Simple Interest Calculator", description: "Calculate simple interest with formula breakdown. Compare with compound interest.", href: "/tools/simple-interest-calculator", icon: "\uD83D\uDCB2", category: "Finance" },
  { name: "Net Worth Calculator", description: "Calculate net worth by adding assets and subtracting liabilities. Debt-to-asset ratio.", href: "/tools/net-worth-calculator", icon: "\uD83D\uDCB8", category: "Finance" },
  { name: "Stock Profit Calculator", description: "Calculate stock trading profit, ROI, and break-even price with commission fees.", href: "/tools/stock-profit-calculator", icon: "\uD83D\uDCC8", category: "Finance" },
  { name: "Credit Card Payoff Calculator", description: "Calculate credit card payoff time and interest. Compare monthly payment scenarios.", href: "/tools/credit-card-payoff-calculator", icon: "\uD83D\uDCB3", category: "Finance" },
  { name: "Down Payment Calculator", description: "Calculate down payment and see impact on mortgage, monthly payment, and PMI.", href: "/tools/down-payment-calculator", icon: "\uD83C\uDFE0", category: "Finance" },
  { name: "Dividend Calculator", description: "Calculate dividend income and project growth with reinvestment and contributions.", href: "/tools/dividend-calculator", icon: "\uD83C\uDF31", category: "Finance" },
  { name: "FIRE Calculator", description: "Calculate your Financial Independence number and years to early retirement.", href: "/tools/fire-calculator", icon: "\uD83D\uDD25", category: "Finance" },
  { name: "VAT Calculator", description: "Calculate Value Added Tax. Add or extract VAT with country rate presets.", href: "/tools/vat-calculator", icon: "\uD83C\uDF10", category: "Finance" },
  { name: "Break Even Calculator", description: "Find your break-even point — units to sell to cover fixed and variable costs.", href: "/tools/break-even-calculator", icon: "\u2696", category: "Finance" },
  { name: "Mortgage Affordability Calculator", description: "Find how much house you can afford based on income and debts. 28/36 DTI rule.", href: "/tools/mortgage-affordability-calculator", icon: "\uD83C\uDFE1", category: "Finance" },
  { name: "APR Calculator", description: "Calculate the true APR of a loan including fees. Compare APR vs stated interest rate.", href: "/tools/apr-calculator", icon: "%", category: "Finance" },
  { name: "Student Loan Calculator", description: "Calculate student loan payments and total interest. See extra payment impact.", href: "/tools/student-loan-calculator", icon: "\uD83C\uDF93", category: "Finance" },
  { name: "Capital Gains Tax Calculator", description: "Calculate capital gains tax on investments. Short-term vs long-term rates.", href: "/tools/capital-gains-tax-calculator", icon: "\uD83D\uDCC9", category: "Finance" },
  { name: "GPA Calculator", description: "Calculate semester and cumulative GPA. Add courses with grades and credits.", href: "/tools/gpa-calculator", icon: "\uD83C\uDF93", category: "Utility" },
  { name: "Grade Calculator", description: "Calculate your class grade with weighted or points-based grading.", href: "/tools/grade-calculator", icon: "\uD83D\uDCDD", category: "Utility" },
  { name: "Random Number Generator", description: "Generate random numbers within a range. Single or bulk, with or without duplicates.", href: "/tools/random-number-generator", icon: "\uD83C\uDFB2", category: "Utility" },
  { name: "Countdown Timer", description: "Free online countdown timer with presets. Set hours, minutes, seconds.", href: "/tools/countdown-timer", icon: "\u23F3", category: "Utility" },
  { name: "Stopwatch", description: "Online stopwatch with lap times. Accurate to centiseconds.", href: "/tools/stopwatch", icon: "\u23F1", category: "Utility" },
  { name: "Scientific Calculator", description: "Free scientific calculator with trig, logs, powers, memory, and deg/rad modes.", href: "/tools/scientific-calculator", icon: "\uD83E\uDDEE", category: "Utility" },
  { name: "Fraction Calculator", description: "Add, subtract, multiply, divide fractions. Simplify and convert decimals.", href: "/tools/fraction-calculator", icon: "\u00BD", category: "Utility" },
  { name: "Character Counter", description: "Count characters, words, sentences, paragraphs. Social media limits and reading time.", href: "/tools/character-counter", icon: "\uD83D\uDD24", category: "Text" },
  { name: "Text Repeater", description: "Repeat any text multiple times with custom separators.", href: "/tools/text-repeater", icon: "\uD83D\uDD01", category: "Text" },
  { name: "Number Base Converter", description: "Convert between decimal, binary, octal, and hexadecimal instantly.", href: "/tools/binary-converter", icon: "01", category: "Developer" },
  { name: "Color Mixer", description: "Mix two colors together at any ratio and generate smooth color gradients.", href: "/tools/color-mixer", icon: "\uD83C\uDFA8", category: "Design" },
  { name: "CSS Transform Generator", description: "Build CSS transforms visually. Translate, rotate, scale, and skew.", href: "/tools/css-transform-generator", icon: "\u21BB", category: "Developer" },
  { name: "Pregnancy Due Date Calculator", description: "Estimate your due date from last period. Trimester tracking and milestones.", href: "/tools/pregnancy-calculator", icon: "\uD83D\uDC76", category: "Health" },
  { name: "Pace Calculator", description: "Calculate running pace, finish time, or distance with race presets.", href: "/tools/pace-calculator", icon: "\uD83C\uDFC3", category: "Health" },
  { name: "BMR Calculator", description: "Calculate basal metabolic rate with three formulas and activity multipliers.", href: "/tools/bmr-calculator", icon: "\u2665", category: "Health" },
  { name: "Waist-to-Hip Ratio Calculator", description: "Assess health risk with WHO waist-to-hip ratio guidelines.", href: "/tools/waist-to-hip-ratio-calculator", icon: "\u229A", category: "Health" },
  { name: "Water Intake Calculator", description: "Calculate daily water intake based on weight, activity, and climate.", href: "/tools/water-intake-calculator", icon: "\uD83D\uDCA7", category: "Health" },
  { name: "Calorie Deficit Calculator", description: "Calculate how many calories to eat for weight loss based on your TDEE.", href: "/tools/calorie-deficit-calculator", icon: "\u2796", category: "Health" },
  { name: "Protein Calculator", description: "Calculate daily protein needs based on weight, goal, and activity level.", href: "/tools/protein-calculator", icon: "\uD83E\uDD69", category: "Health" },
  { name: "Ideal Weight Calculator", description: "Find your ideal body weight using four scientific formulas.", href: "/tools/ideal-weight-calculator", icon: "\u2696", category: "Health" },
  { name: "Sleep Calculator", description: "Calculate ideal bedtimes and wake times based on 90-minute sleep cycles.", href: "/tools/sleep-calculator", icon: "\uD83D\uDCA4", category: "Health" },
  { name: "1RM Calculator", description: "Estimate your one rep max from any weight and rep count.", href: "/tools/one-rep-max-calculator", icon: "\uD83C\uDFCB", category: "Health" },
  { name: "Heart Rate Zone Calculator", description: "Calculate five heart rate training zones with Karvonen method.", href: "/tools/heart-rate-zone-calculator", icon: "\u2764", category: "Health" },
  { name: "Keto Calculator", description: "Calculate keto macros — fat, protein, and net carbs for ketogenic diet.", href: "/tools/keto-calculator", icon: "\uD83E\uDD51", category: "Health" },
  { name: "Square Root Calculator", description: "Calculate square roots, cube roots, and nth roots with radical simplification.", href: "/tools/square-root-calculator", icon: "\u221A", category: "Utility" },
  { name: "Mean, Median, Mode Calculator", description: "Calculate mean, median, mode, range, and standard deviation from data.", href: "/tools/mean-median-mode-calculator", icon: "\u03BC", category: "Utility" },
  { name: "Standard Deviation Calculator", description: "Calculate standard deviation, variance, z-scores, and confidence intervals.", href: "/tools/standard-deviation-calculator", icon: "\u03C3", category: "Utility" },
  { name: "Ovulation Calculator", description: "Predict ovulation date and fertile window based on your cycle. Calendar view.", href: "/tools/ovulation-calculator", icon: "\uD83C\uDF38", category: "Health" },
  { name: "Weight Loss Calculator", description: "Calculate daily calories and timeline to reach your goal weight safely.", href: "/tools/weight-loss-calculator", icon: "\u2696", category: "Health" },
  { name: "Period Calculator", description: "Predict your next 6 periods, fertile windows, and ovulation dates.", href: "/tools/period-calculator", icon: "\uD83D\uDCC5", category: "Health" },
  { name: "Refinance Calculator", description: "Compare current vs refinanced mortgage. Break-even point and total savings.", href: "/tools/refinance-calculator", icon: "\uD83C\uDFE6", category: "Finance" },
  { name: "Blood Alcohol Calculator", description: "Estimate BAC using the Widmark formula. Time until sober and legal limits.", href: "/tools/blood-alcohol-calculator", icon: "\uD83C\uDF7A", category: "Health" },
  { name: "Square Footage Calculator", description: "Calculate area for rooms, flooring, and projects. Multiple shapes and cost estimator.", href: "/tools/square-footage-calculator", icon: "\u25A3", category: "Utility" },
  { name: "Concrete Calculator", description: "Calculate cubic yards of concrete for slabs, columns, walls, and stairs. Bag counts included.", href: "/tools/concrete-calculator", icon: "\u2593", category: "Utility" },
  { name: "Paint Calculator", description: "Calculate how many gallons of paint you need. Multi-room support with door/window subtraction.", href: "/tools/paint-calculator", icon: "\uD83C\uDFA8", category: "Utility" },
  { name: "Tile Calculator", description: "Calculate tiles needed with grout gaps, layout patterns, waste factor, and cost estimate.", href: "/tools/tile-calculator", icon: "\u25A6", category: "Utility" },
  { name: "Markup Calculator", description: "Calculate markup, margin, and selling price. Batch mode for multiple products.", href: "/tools/markup-calculator", icon: "\uD83D\uDCB2", category: "Finance" },
  { name: "CD Calculator", description: "Calculate CD interest and maturity value. CD ladder strategy and early withdrawal penalties.", href: "/tools/cd-calculator", icon: "\uD83D\uDCB0", category: "Finance" },
  { name: "Car Lease Calculator", description: "Calculate monthly lease payments, money factor to APR, and lease vs buy comparison.", href: "/tools/lease-calculator", icon: "\uD83D\uDE97", category: "Finance" },
  { name: "Calorie Burn Calculator", description: "Calculate calories burned by activity with MET values. 30+ activities and daily log.", href: "/tools/calorie-burn-calculator", icon: "\uD83D\uDD25", category: "Health" },
  { name: "Dog Age Calculator", description: "Convert dog years to human years using modern science. Size-based calculation, not the 7x myth.", href: "/tools/dog-age-calculator", icon: "\uD83D\uDC36", category: "Health" },
  { name: "Ohm's Law Calculator", description: "Calculate voltage, current, resistance, and power. Series/parallel resistor calculator.", href: "/tools/ohms-law-calculator", icon: "\u26A1", category: "Utility" },
  { name: "Future Value Calculator", description: "Calculate future value of investments with contributions and compounding.", href: "/tools/future-value-calculator", icon: "📈", category: "Finance" },
  { name: "Annuity Calculator", description: "Calculate annuity growth and payout. Fixed vs variable comparison.", href: "/tools/annuity-calculator", icon: "💰", category: "Finance" },
  { name: "EMI Calculator", description: "Calculate equated monthly installments. Prepayment impact and loan comparison.", href: "/tools/emi-calculator", icon: "💳", category: "Finance" },
  { name: "Walking Calorie Calculator", description: "Calculate calories burned walking by speed, distance, and incline.", href: "/tools/walking-calorie-calculator", icon: "🚶", category: "Health" },
  { name: "Debt-to-Income Calculator", description: "Calculate your DTI ratio. See loan qualification and lender guidelines.", href: "/tools/debt-to-income-calculator", icon: "📊", category: "Finance" },
  { name: "JPG to PDF Converter", description: "Convert JPG images to PDF. Multiple images, custom page size, reorder pages.", href: "/tools/jpg-to-pdf", icon: "📄", category: "Utility" },
  { name: "Merge PDF", description: "Combine multiple PDF files into one. Reorder, preview page counts. Free and private.", href: "/tools/merge-pdf", icon: "📑", category: "Utility" },
  { name: "Compress PDF", description: "Reduce PDF file size by up to 90%. Three quality presets. Free and private.", href: "/tools/compress-pdf", icon: "📦", category: "Utility" },
  { name: "Split PDF", description: "Split PDFs by page range, every N pages, or into equal parts. Free and private.", href: "/tools/split-pdf", icon: "✂️", category: "Utility" },
  { name: "PNG to PDF Converter", description: "Convert PNG images to PDF. Multiple images, custom page size, transparency support.", href: "/tools/png-to-pdf", icon: "📄", category: "Utility" },
  { name: "Resume Builder", description: "Build a professional resume with live preview. Multiple templates, PDF download. Free and private.", href: "/tools/resume-builder", icon: "📝", category: "Utility" },
  { name: "Video Compressor", description: "Compress videos by up to 90%. Adjust quality, resolution, and codec. Runs in your browser.", href: "/tools/video-compressor", icon: "🎬", category: "Utility" },
  { name: "Image Upscaler", description: "Enlarge images up to 4x with smooth, sharp, and pixel art modes. Free and private.", href: "/tools/image-upscaler", icon: "🔍", category: "Design" },
  { name: "Image to Text (OCR)", description: "Extract text from images using Tesseract OCR. 7 languages supported. Runs in your browser.", href: "/tools/image-to-text", icon: "🔤", category: "Utility" },
  { name: "PDF to Word Converter", description: "Convert PDF files to editable Word documents. No upload, runs in your browser.", href: "/tools/pdf-to-word", icon: "📄", category: "Utility" },
  { name: "Screen Recorder", description: "Record your screen, webcam, or browser tab with audio. No watermark, no time limit.", href: "/tools/screen-recorder", icon: "🖥", category: "Utility" },
  { name: "Text to Speech", description: "Convert text to natural speech with multiple voices, languages, speed and pitch controls.", href: "/tools/text-to-speech", icon: "🔊", category: "Utility" },
  { name: "Video to GIF Converter", description: "Convert any video to an animated GIF. Trim, resize, adjust frame rate. Free and private.", href: "/tools/video-to-gif", icon: "🎞", category: "Design" },
  { name: "Digital Signature Creator", description: "Create a digital signature by drawing, typing, or uploading. Download as PNG or SVG.", href: "/tools/digital-signature", icon: "✍", category: "Utility" },
  { name: "Meme Generator", description: "Create memes with custom text, fonts, and colors. No watermark, no signup required.", href: "/tools/meme-generator", icon: "😂", category: "Design" },
];

const categories = ["All", "Developer", "Design", "Text", "Utility", "Finance", "Health"];

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = useMemo(() => {
    return tools.filter((t) => {
      const matchesSearch =
        search === "" ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        activeCategory === "All" || t.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      {/* Hero */}
      <div className="mb-14 text-center">
        <h1 className="mb-4 font-display text-6xl tracking-tight text-zinc-100 sm:text-7xl">
          <span className="text-blue-500">&#9670;</span> ToolPile
        </h1>
        <p className="mx-auto max-w-lg text-lg text-zinc-400 leading-relaxed">
          Free online tools &amp; calculators, right in your browser.
          <br />
          <span className="text-zinc-500">No signup. No data stored. Ever.</span>
        </p>
      </div>

      {/* Search */}
      <div className="mx-auto mb-8 max-w-xl">
        <input
          type="text"
          placeholder="Search tools..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-5 py-3.5 text-zinc-100 placeholder-zinc-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-sm"
        />
      </div>

      {/* Category filters */}
      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
              activeCategory === cat
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tool grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group rounded-xl border border-zinc-700 bg-zinc-900 p-6 transition-all hover:border-blue-400/40 hover:shadow-md"
          >
            <div className="mb-3 text-2xl">{tool.icon}</div>
            <h2 className="mb-1.5 text-lg font-semibold text-zinc-100 group-hover:text-blue-500 transition-colors">
              {tool.name}
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">{tool.description}</p>
            <span className="mt-3 inline-block rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-500 group-hover:bg-blue-600/10 group-hover:text-blue-500 transition-colors">
              {tool.category}
            </span>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-16 text-center text-zinc-500">
          No tools found. Try a different search or category.
        </p>
      )}
    </div>
  );
}
